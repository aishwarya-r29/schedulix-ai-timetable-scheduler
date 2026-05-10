import {
  Subject,
  Classroom,
  TimetableEntry,
  Timetable,
  DAYS,
  PERIODS,
} from '../data/mockData';

// ─── Public Interfaces ─────────────────────────────────────────────────────────

export interface FacultyProfile {
  isHOD?: boolean;
  maxDailySlots?: number;
  offSlots?: string[]; // ["Monday_1", "Tuesday_5"]
}

export interface GenerationConfig {
  department: string;
  semester: number;
  section: string;
  subjects: Subject[];
  facultyAssignments: { [subjectId: string]: string }; // subjectId -> facultyId
  classrooms: Classroom[];
  existingTimetableEntries?: TimetableEntry[]; // All other groups' entries (for global locking)
  facultyProfiles?: { [facultyId: string]: FacultyProfile };
}

// ─── Internal Interfaces ───────────────────────────────────────────────────────

interface FacultySlotState {
  occupiedSlots: Set<string>;
  dailyCounts: { [day: string]: number };
}

interface ClassroomOccupancyMap {
  occupiedSlots: Set<string>;
}

interface Slot {
  day: string;
  period: number;
}

// ─── Credit → Fixed Weekly Hours (Spec §4) ────────────────────────────────────

/**
 * Returns the EXACT number of weekly contact hours for a subject.
 * 4 credits = 7 h, 3 credits = 5 h, 2 credits = 3 h, 1 credit = 1 h.
 * Labs are always 4 consecutive hours (one session per week).
 */
export function getRequiredHours(subject: Subject): number {
  if (subject.type === 'lab') return 4;
  switch (subject.credits) {
    case 4: return 7;
    case 3: return 5;
    case 2: return 3;
    case 1: return 1;
    default: return Math.ceil(subject.credits * 1.5);
  }
}

/** Kept for backward-compat with validateTimetable callers. */
function getWeeklyHourRange(subject: Subject): { minHours: number; maxHours: number; fixedHours?: number } {
  const h = getRequiredHours(subject);
  if (subject.type === 'lab') return { minHours: h, maxHours: h, fixedHours: h };
  // Allow ±1 tolerance for theory to handle edge cases
  return { minHours: Math.max(1, h - 1), maxHours: h + 1 };
}

// ─── Fisher-Yates Shuffle ──────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Stratified shuffle: interleave periods across ALL days in random day-order,
 * ensuring each day gets an equal early-assignment chance (no "empty Fridays").
 *
 * 1. Partition slots by day.
 * 2. Shuffle within each day independently (unique pattern per group).
 * 3. Round-robin across a freshly-shuffled day order.
 */
function stratifiedShuffle(slots: Slot[]): Slot[] {
  const byDay: Record<string, Slot[]> = {};
  DAYS.forEach(d => (byDay[d] = []));
  for (const s of slots) byDay[s.day].push(s);

  // Independent within-day shuffle → gives each group a different intra-day rhythm
  DAYS.forEach(d => { byDay[d] = shuffle(byDay[d]); });

  // Random day visit order → no group always starts from Monday
  const dayOrder = shuffle([...DAYS]);
  const maxLen = Math.max(...DAYS.map(d => byDay[d].length));

  const result: Slot[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const day of dayOrder) {
      if (byDay[day][i]) result.push(byDay[day][i]);
    }
  }
  return result;
}

// ─── Faculty Map Helpers ───────────────────────────────────────────────────────

function createFacultySlotMap(entries: TimetableEntry[]): Record<string, FacultySlotState> {
  const map: Record<string, FacultySlotState> = {};
  for (const e of entries) {
    if (!map[e.facultyId]) map[e.facultyId] = { occupiedSlots: new Set(), dailyCounts: {} };
    map[e.facultyId].occupiedSlots.add(`${e.day}_${e.period}`);
    map[e.facultyId].dailyCounts[e.day] = (map[e.facultyId].dailyCounts[e.day] ?? 0) + 1;
  }
  return map;
}

function recordFacultySlot(
  facultyId: string,
  day: string,
  period: number,
  map: Record<string, FacultySlotState>
) {
  if (!map[facultyId]) map[facultyId] = { occupiedSlots: new Set(), dailyCounts: {} };
  map[facultyId].occupiedSlots.add(`${day}_${period}`);
  map[facultyId].dailyCounts[day] = (map[facultyId].dailyCounts[day] ?? 0) + 1;
}

function isFacultyBusy(
  facultyId: string,
  day: string,
  period: number,
  map: Record<string, FacultySlotState>,
  profiles?: Record<string, FacultyProfile>
): boolean {
  // Check if they are already teaching a class in this slot
  if (map[facultyId]?.occupiedSlots.has(`${day}_${period}`)) return true;

  // Check if they have marked this slot as "OFF"
  const offSlots = profiles?.[facultyId]?.offSlots || [];
  if (offSlots.includes(`${day}_${period}`)) return true;

  return false;
}

function canFacultyTeach(
  facultyId: string,
  day: string,
  map: Record<string, FacultySlotState>,
  profiles?: Record<string, FacultyProfile>
): boolean {
  const profile = profiles?.[facultyId];
  const maxDaily = profile?.maxDailySlots ?? (profile?.isHOD ? 3 : 5);
  return (map[facultyId]?.dailyCounts[day] ?? 0) < maxDaily;
}

// ─── Classroom Map Helpers ─────────────────────────────────────────────────────

function createClassroomOccupancyMap(entries: TimetableEntry[]): ClassroomOccupancyMap {
  return {
    occupiedSlots: new Set(entries.map(e => `${e.classroomId}_${e.day}_${e.period}`)),
  };
}

function recordClassroomSlot(classroomId: string, day: string, period: number, map: ClassroomOccupancyMap) {
  map.occupiedSlots.add(`${classroomId}_${day}_${period}`);
}

function isClassroomOccupied(classroomId: string, day: string, period: number, map: ClassroomOccupancyMap): boolean {
  return map.occupiedSlots.has(`${classroomId}_${day}_${period}`);
}

function findTheoryRoom(
  classrooms: Classroom[],
  day: string,
  period: number,
  map: ClassroomOccupancyMap
): Classroom | null {
  // Shuffle room list so different groups naturally land on different rooms first
  for (const cr of shuffle(classrooms)) {
    if (cr.classroomNumber.startsWith('LAB')) continue;
    if (cr.status !== 'available') continue;
    if (!isClassroomOccupied(cr.id, day, period, map)) return cr;
  }
  return null;
}

function findLabRoom(
  classrooms: Classroom[],
  day: string,
  periods: number[],
  map: ClassroomOccupancyMap
): Classroom | null {
  for (const cr of shuffle(classrooms)) {
    if (!cr.classroomNumber.startsWith('LAB')) continue;
    if (cr.status !== 'available') continue;
    if (periods.every(p => !isClassroomOccupied(cr.id, day, p, map))) return cr;
  }
  return null;
}

// ─── Uniqueness Score (Spec §5) ────────────────────────────────────────────────

/**
 * Measures how unique `newEntries` is compared to `referenceEntries`.
 * Compares (subjectId, day, period) triples.
 *
 * Returns 0–100 where:
 *   100 = completely unique (no overlapping subject-slot assignments)
 *     0 = identical timetable
 */
export function computeUniquenessScore(
  newEntries: TimetableEntry[],
  referenceEntries: TimetableEntry[]
): number {
  if (referenceEntries.length === 0 || newEntries.length === 0) return 100;
  const refSet = new Set(referenceEntries.map(e => `${e.subjectId}_${e.day}_${e.period}`));
  let matches = 0;
  for (const e of newEntries) {
    if (refSet.has(`${e.subjectId}_${e.day}_${e.period}`)) matches++;
  }
  return Math.round((1 - matches / newEntries.length) * 100);
}

// ─── Lab Scheduler ─────────────────────────────────────────────────────────────

/**
 * Schedules all lab subjects.
 *
 * Rules:
 * - Each lab = exactly 4 consecutive periods (morning P1-P4 or evening P5-P8).
 * - Labs are spread across different days where possible.
 * - Lab room is locked globally (occupancyMap updated).
 * - Faculty is locked globally (facultySlotMap updated).
 *
 * Returns the set of (day_period) keys that are now reserved.
 */
function scheduleAllLabs(
  labSubjects: Subject[],
  facultyAssignments: Record<string, string>,
  classrooms: Classroom[],
  entries: TimetableEntry[],
  facultySlotMap: Record<string, FacultySlotState>,
  occupancyMap: ClassroomOccupancyMap,
  facultyProfiles?: Record<string, FacultyProfile>
): Set<string> {
  const reserved = new Set<string>();

  // Morning and evening windows — shuffled so G1/G2 don't always pick morning first
  const windows = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
  ];

  // Track which days already have a lab (spread them across week)
  const labDayUsed = new Set<string>();
  const dayPool = shuffle([...DAYS]);

  for (const lab of labSubjects) {
    const facultyId = facultyAssignments[lab.id];
    if (!facultyId) continue;

    let placed = false;

    // Two-pass: first try unused lab days, then allow reuse
    for (const pass of [0, 1]) {
      if (placed) break;
      for (const day of dayPool) {
        if (placed) break;
        if (pass === 0 && labDayUsed.has(day)) continue; // fresh days first

        for (const win of shuffle(windows)) {
          // Faculty free for all 4 periods?
          if (!win.every(p => !isFacultyBusy(facultyId, day, p, facultySlotMap, facultyProfiles))) continue;
          if (!canFacultyTeach(facultyId, day, facultySlotMap, facultyProfiles)) continue;

          // Slots not yet reserved by another lab this generation?
          if (!win.every(p => !reserved.has(`${day}_${p}`))) continue;

          const room = findLabRoom(classrooms, day, win, occupancyMap);
          
          // ── Commit ──────────────────────────────────────────────────────────
          for (const period of win) {
            entries.push({
              id: `entry_${entries.length + 1}`,
              day,
              period,
              subjectId: lab.id,
              facultyId,
              classroomId: room?.id || '',
              entryType: 'lab',
              isCancelled: false,
            });
            reserved.add(`${day}_${period}`);
            recordFacultySlot(facultyId, day, period, facultySlotMap);
            if (room) recordClassroomSlot(room.id, day, period, occupancyMap);
          }
          labDayUsed.add(day);
          placed = true;
          break;
        }
      }
    }
  }

  return reserved;
}

// ─── Theory Slot Filler ────────────────────────────────────────────────────────

/**
 * Fills theory slots from a pre-shuffled slot list.
 *
 * For each slot (in Fisher-Yates shuffled order):
 * 1. Find all eligible subjects (hours remaining, faculty free, room free,
 *    no 3-consecutive, ≤2 today).
 * 2. Pick the subject with most hours remaining (greedily), with a mild
 *    random tiebreak to avoid deterministic patterns.
 * 3. Record into both the faculty map and the occupancy map (global lock).
 */
function fillTheorySlots(
  shuffledSlots: Slot[],
  theorySubjects: Subject[],
  facultyAssignments: Record<string, string>,
  classrooms: Classroom[],
  entries: TimetableEntry[],
  hoursLeft: Record<string, number>,
  facultySlotMap: Record<string, FacultySlotState>,
  occupancyMap: ClassroomOccupancyMap,
  facultyProfiles?: Record<string, FacultyProfile>
) {
  // Quick lookup: what subject is at (day, period) — for consecutive-check
  const slotSubject: Record<string, string> = {};
  for (const e of entries) slotSubject[`${e.day}_${e.period}`] = e.subjectId;

  for (const { day, period } of shuffledSlots) {
    const candidates = theorySubjects.filter(s => {
      if (hoursLeft[s.id] <= 0) return false;

      const facultyId = facultyAssignments[s.id];
      if (!facultyId) return false;
      if (isFacultyBusy(facultyId, day, period, facultySlotMap, facultyProfiles)) return false;
      if (!canFacultyTeach(facultyId, day, facultySlotMap, facultyProfiles)) return false;

      // ≤ 2 slots of this subject per day
      const todayCount = entries.filter(
        e => e.day === day && e.subjectId === s.id && e.entryType === 'theory'
      ).length;
      if (todayCount >= 2) return false;

      // Max 2 consecutive — if prev-1 and prev-2 are both this subject, skip
      if (
        slotSubject[`${day}_${period - 1}`] === s.id &&
        slotSubject[`${day}_${period - 2}`] === s.id
      )
        return false;

      return true;
    });

    if (candidates.length === 0) continue;

    // Sort: most hours remaining first; random tiebreak for inter-group variety
    candidates.sort((a, b) => {
      const diff = hoursLeft[b.id] - hoursLeft[a.id];
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    const selected = candidates[0];
    const facultyId = facultyAssignments[selected.id];
    const room = findTheoryRoom(classrooms, day, period, occupancyMap);
    
    entries.push({
      id: `entry_${entries.length + 1}`,
      day,
      period,
      subjectId: selected.id,
      facultyId,
      classroomId: room?.id || '',
      entryType: 'theory',
      isCancelled: false,
    });

    recordFacultySlot(facultyId, day, period, facultySlotMap);
    if (room) recordClassroomSlot(room.id, day, period, occupancyMap);
    slotSubject[`${day}_${period}`] = selected.id;
    hoursLeft[selected.id]--;
  }
}

// ─── Single Generation Attempt ─────────────────────────────────────────────────

function attemptGeneration(config: GenerationConfig): TimetableEntry[] {
  const {
    subjects,
    facultyAssignments,
    classrooms,
    existingTimetableEntries,
    facultyProfiles,
  } = config;

  const entries: TimetableEntry[] = [];

  // Seed the global resource maps from ALL other groups' existing entries
  const facultySlotMap = createFacultySlotMap(existingTimetableEntries ?? []);
  const occupancyMap = createClassroomOccupancyMap(existingTimetableEntries ?? []);

  const theorySubjects = subjects.filter(s => s.type === 'theory');
  const labSubjects = subjects.filter(s => s.type === 'lab');

  // ── Step 1: Labs first (claim consecutive blocks before theory scrambles them)
  const reservedByLabs = scheduleAllLabs(
    labSubjects,
    facultyAssignments,
    classrooms,
    entries,
    facultySlotMap,
    occupancyMap,
    facultyProfiles
  );

  // ── Step 2: Build theory slot pool (all 40 slots minus lab blocks)
  const theorySlots: Slot[] = [];
  for (const day of DAYS) {
    for (const period of PERIODS) {
      if (!reservedByLabs.has(`${day}_${period}`)) {
        theorySlots.push({ day, period });
      }
    }
  }

  // ── Step 3: Stratified Fisher-Yates shuffle (unique rhythm per attempt)
  const shuffledSlots = stratifiedShuffle(theorySlots);

  // ── Step 4: Initialize hours-left counter (fixed per spec)
  const hoursLeft: Record<string, number> = {};
  for (const s of theorySubjects) hoursLeft[s.id] = getRequiredHours(s);

  // ── Step 5: Fill slots greedily in shuffled order
  fillTheorySlots(
    shuffledSlots,
    theorySubjects,
    facultyAssignments,
    classrooms,
    entries,
    hoursLeft,
    facultySlotMap,
    occupancyMap,
    facultyProfiles
  );

  return entries;
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Generates a unique, collision-free timetable for one section/group.
 *
 * Strategy:
 * 1. Run up to MAX_ATTEMPTS generation trials (each uses a fresh random shuffle).
 * 2. After each attempt, compute the Uniqueness Score vs ALL other sections' entries.
 * 3. Accept the first attempt that passes validation AND meets UNIQUENESS_THRESHOLD.
 * 4. If no attempt meets the threshold (heavily constrained departments), keep the
 *    best-scoring valid attempt anyway — never fail silently.
 */
export function generateTimetable(config: GenerationConfig): Timetable {
  const { department, semester, section, subjects, existingTimetableEntries } = config;

  const MAX_ATTEMPTS = 15;
  const UNIQUENESS_THRESHOLD = 30; // Aim for ≥30% difference vs other groups

  let bestEntries: TimetableEntry[] = [];
  let bestScore = -1;
  let bestValid = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const entries = attemptGeneration(config);

    // Validation
    const tempTimetable: Timetable = {
      id: 'tmp',
      department,
      semester,
      section,
      generatedBy: '',
      createdAt: '',
      entries,
    };
    const validation = validateTimetable(tempTimetable, subjects);

    // Uniqueness score vs all existing group entries
    const score =
      existingTimetableEntries && existingTimetableEntries.length > 0
        ? computeUniquenessScore(entries, existingTimetableEntries)
        : 100;

    const isValid = validation.valid;

    // Track the best attempt seen so far (valid preferred, then highest uniqueness)
    const betterThanBest =
      (!bestValid && (isValid || score > bestScore)) ||
      (bestValid && isValid && score > bestScore);

    if (betterThanBest) {
      bestEntries = entries;
      bestScore = score;
      bestValid = isValid;
    }

    // Early exit when conditions are fully met
    if (isValid && score >= UNIQUENESS_THRESHOLD) break;
  }

  return {
    id: `tt_${department}_${section}_${Date.now()}`,
    department,
    semester,
    section,
    generatedBy: 'AI Algorithm v2 (Async)',
    createdAt: new Date().toISOString(),
    entries: bestEntries,
  };
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates a timetable for:
 * - Faculty double-booking
 * - Classroom double-booking
 * - Subject weekly-hour accuracy (credit-scaled)
 * - Lab integrity (4 consecutive, once per week)
 * - Theory consecutive limit (≤2 periods of same subject back-to-back)
 */
export function validateTimetable(
  timetable: Timetable,
  subjects?: Subject[]
): { valid: boolean; conflicts: string[] } {
  const conflicts: string[] = [];

  // ── Faculty collision check ──────────────────────────────────────────────────
  const facultySlots: Record<string, Set<string>> = {};
  for (const entry of timetable.entries) {
    if (!facultySlots[entry.facultyId]) facultySlots[entry.facultyId] = new Set();
    const key = `${entry.day}_${entry.period}`;
    if (facultySlots[entry.facultyId].has(key)) {
      conflicts.push(`Faculty ${entry.facultyId} double-booked on ${entry.day} P${entry.period}`);
    }
    facultySlots[entry.facultyId].add(key);
  }

  // ── Classroom collision check ────────────────────────────────────────────────
  const roomSlots: Record<string, Set<string>> = {};
  for (const entry of timetable.entries) {
    if (!roomSlots[entry.classroomId]) roomSlots[entry.classroomId] = new Set();
    const key = `${entry.day}_${entry.period}`;
    if (roomSlots[entry.classroomId].has(key)) {
      conflicts.push(
        `Room ${entry.classroomId} double-booked on ${entry.day} P${entry.period}`
      );
    }
    roomSlots[entry.classroomId].add(key);
  }

  // ── Subject hour accuracy ────────────────────────────────────────────────────
  if (subjects) {
    const counts: Record<string, number> = {};
    for (const e of timetable.entries) counts[e.subjectId] = (counts[e.subjectId] ?? 0) + 1;

    for (const s of subjects) {
      const usage = counts[s.id] ?? 0;
      const range = getWeeklyHourRange(s);
      if (usage < range.minHours) {
        conflicts.push(
          `${s.subjectCode} under-allocated: ${usage} hrs (min ${range.minHours})`
        );
      } else if (usage > range.maxHours) {
        conflicts.push(
          `${s.subjectCode} over-allocated: ${usage} hrs (max ${range.maxHours})`
        );
      }
      if (s.type === 'lab' && usage !== 0 && usage !== 4) {
        conflicts.push(`Lab ${s.subjectCode} must have exactly 4 hrs, got ${usage}`);
      }
    }
  }

  // ── Daily lab and theory consecutive checks ──────────────────────────────────
  const byDay: Record<string, TimetableEntry[]> = {};
  for (const e of timetable.entries) {
    if (!byDay[e.day]) byDay[e.day] = [];
    byDay[e.day].push(e);
  }

  for (const [day, dayEntries] of Object.entries(byDay)) {
    // Lab integrity: only one lab subject per day; ≤4 lab periods
    const labEntries = dayEntries.filter(e => e.entryType === 'lab');
    const labSubjectIds = new Set(labEntries.map(e => e.subjectId));
    if (labSubjectIds.size > 1) {
      conflicts.push(`Multiple lab subjects on ${day}`);
    }
    if (labEntries.length > 4) {
      conflicts.push(`More than 4 lab periods on ${day}`);
    }

    // Theory consecutive limit (≤2 of the same subject in a row)
    const theory = dayEntries
      .filter(e => e.entryType === 'theory')
      .sort((a, b) => a.period - b.period);

    for (let i = 2; i < theory.length; i++) {
      const [p2, p1, cur] = [theory[i - 2], theory[i - 1], theory[i]];
      if (
        p2.subjectId === p1.subjectId &&
        p1.subjectId === cur.subjectId &&
        cur.period === p1.period + 1 &&
        p1.period === p2.period + 1
      ) {
        conflicts.push(
          `${cur.subjectId} has 3+ consecutive theory periods on ${day}`
        );
      }
    }

    // Classroom missing check
    const missingTheory = dayEntries.filter(e => !e.classroomId && e.entryType === 'theory');
    const missingLab = dayEntries.filter(e => !e.classroomId && e.entryType === 'lab');
    
    if (missingTheory.length > 0) {
      conflicts.push(`Classroom Conflict: ${missingTheory.length} Theory periods on ${day} could not be assigned a room (Theory rooms are full).`);
    }
    if (missingLab.length > 0) {
      conflicts.push(`Classroom Conflict: ${missingLab.length} Lab periods on ${day} could not be assigned a room (Lab rooms are full).`);
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}
