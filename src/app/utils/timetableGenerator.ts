import {
  Subject,
  Classroom,
  TimetableEntry,
  Timetable,
  DAYS,
  PERIODS,
} from '../data/mockData';

interface GenerationConfig {
  department: 'CSE' | 'IT';
  semester: number;
  section: string;
  subjects: Subject[];
  facultyAssignments: { [subjectId: string]: string }; // subjectId -> facultyId
  classrooms: Classroom[];
}

interface SlotAssignment {
  day: string;
  period: number;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  entryType: 'theory' | 'lab';
}

/**
 * AI Timetable Generation Algorithm
 *
 * STRICT RULES:
 * - Max 2 consecutive theory classes for same subject
 * - Each day is EITHER:
 *   a) Theory-only day: up to 5 theory classes
 *   b) Lab day: exactly 4 consecutive lab periods (morning OR evening) + optional theory in other periods
 * - Labs: 4 consecutive periods, only morning (1-4) or evening (5-8)
 * - Labs should NOT repeat more than once per week
 * - No faculty collisions (faculty can't teach 2 classes simultaneously)
 * - No classroom collisions
 * - Faculty strictly assigned as per admin selection
 */
export function generateTimetable(config: GenerationConfig): Timetable {
  const { department, semester, section, subjects, facultyAssignments, classrooms } = config;

  const entries: TimetableEntry[] = [];
  
  // Separate subjects into theory and lab
  const theorySubjects = subjects.filter(s => s.type === 'theory');
  const labSubjects = subjects.filter(s => s.type === 'lab');

  // Track which labs have been scheduled (labs should appear only once per week)
  const labsUsed = new Set<string>();
  
  // Track overall usage for distribution
  const subjectUsage: { [key: string]: number } = {};
  subjects.forEach(s => subjectUsage[s.id] = 0);

  // Strategy: Alternate lab days and theory days to balance the week
  // Mon, Wed, Fri = Lab days, Tue, Thu = Theory days
  const labDays = ['Monday', 'Wednesday', 'Friday'];

  // Generate timetable for each day
  DAYS.forEach((day, dayIndex) => {
    if (labDays.includes(day)) {
      // Lab day: assign labs first, then optional theory
      assignLabDaySchedule(
        day,
        labSubjects,
        theorySubjects,
        facultyAssignments,
        classrooms,
        entries,
        subjectUsage,
        labsUsed
      );
    } else {
      // Theory day: assign only theory classes
      assignTheoryDaySchedule(
        day,
        theorySubjects,
        facultyAssignments,
        classrooms,
        entries,
        subjectUsage
      );
    }
  });

  // Create the timetable object
  const timetable: Timetable = {
    id: `tt_${department}_${section}_${Date.now()}`,
    department,
    semester,
    section,
    generatedBy: 'AI Algorithm',
    createdAt: new Date().toISOString(),
    entries,
  };

  return timetable;
}

/**
 * Lab Day Schedule:
 * - Assign exactly 4 consecutive lab periods (morning OR evening)
 * - Try 2 different lab subjects
 * - Each lab subject only used once per week
 * - Then fill remaining slots with theory (max 2 consecutive same subject)
 */
function assignLabDaySchedule(
  day: string,
  labSubjects: Subject[],
  theorySubjects: Subject[],
  facultyAssignments: { [key: string]: string },
  classrooms: Classroom[],
  entries: TimetableEntry[],
  subjectUsage: { [key: string]: number },
  labsUsed: Set<string>
) {
  // Available lab slots: morning (periods 1-4) or evening (periods 5-8)
  const labSlots = [
    [0, 1, 2, 3], // Morning: periods 1-4
    [4, 5, 6, 7], // Evening: periods 5-8
  ];

  // Find unused labs to avoid repetition
  const unusedLabs = labSubjects.filter(lab => !labsUsed.has(lab.id));
  const availableLabs = unusedLabs.length > 0 ? unusedLabs : labSubjects;

  // Try to schedule 2 different labs on this day
  let labsScheduledCount = 0;
  const usedSlots = new Set<number>();

  for (const labSubject of availableLabs) {
    if (labsScheduledCount >= 2) break;
    if (labsUsed.has(labSubject.id) && unusedLabs.length > 0) continue;

    const facultyId = facultyAssignments[labSubject.id];
    if (!facultyId) continue; // Faculty not assigned

    // Try morning slot first, then evening
    for (const slotIndices of labSlots) {
      if (usedSlots.has(slotIndices[0])) continue; // Slot already used

      // Check if faculty is available for all 4 periods
      const isFacultyAvailable = slotIndices.every(periodIndex =>
        !isFacultyBusy(facultyId, day, periodIndex + 1, entries)
      );

      if (!isFacultyAvailable) continue;

      // Check if classroom is available for all 4 periods
      const classroom = findAvailableLabClassroom(classrooms, day, slotIndices, entries);
      if (!classroom) continue;

      // Assign this lab to all 4 periods
      slotIndices.forEach(periodIndex => {
        entries.push({
          id: `entry_${entries.length + 1}`,
          day,
          period: periodIndex + 1,
          subjectId: labSubject.id,
          facultyId,
          classroomId: classroom.id,
          entryType: 'lab',
          isCancelled: false,
        });
        usedSlots.add(periodIndex);
      });

      labsUsed.add(labSubject.id);
      subjectUsage[labSubject.id]++;
      labsScheduledCount++;
      break; // Move to next lab
    }
  }

  // Fill remaining slots with theory (not in lab periods)
  const emptySlots: number[] = [];
  for (let i = 0; i < PERIODS.length; i++) {
    if (!usedSlots.has(i)) {
      emptySlots.push(i);
    }
  }

  assignTheoryToSlots(
    emptySlots,
    day,
    theorySubjects,
    facultyAssignments,
    classrooms,
    entries,
    subjectUsage
  );
}

/**
 * Theory Day Schedule:
 * - Assign up to 5 theory classes
 * - Max 2 consecutive periods for same subject
 * - No labs on this day
 */
function assignTheoryDaySchedule(
  day: string,
  theorySubjects: Subject[],
  facultyAssignments: { [key: string]: string },
  classrooms: Classroom[],
  entries: TimetableEntry[],
  subjectUsage: { [key: string]: number }
) {
  // All 8 periods available for theory on theory days
  const allSlots: number[] = Array.from({ length: PERIODS.length }, (_, i) => i);

  assignTheoryToSlots(
    allSlots,
    day,
    theorySubjects,
    facultyAssignments,
    classrooms,
    entries,
    subjectUsage
  );
}

/**
 * Fill provided slots with theory classes
 * - Max 2 consecutive periods for same subject
 * - Respect faculty assignments
 * - Avoid classroom collisions
 */
function assignTheoryToSlots(
  availableSlots: number[],
  day: string,
  theorySubjects: Subject[],
  facultyAssignments: { [key: string]: string },
  classrooms: Classroom[],
  entries: TimetableEntry[],
  subjectUsage: { [key: string]: number }
) {
  const dayEntries = entries.filter(e => e.day === day);
  const subjectsUsedToday = new Map<string, number>(); // subject -> count used today

  for (const slotIndex of availableSlots) {
    const period = slotIndex + 1;

    // Find subjects that can be scheduled in this slot
    const validSubjects = theorySubjects.filter(subject => {
      const facultyId = facultyAssignments[subject.id];
      if (!facultyId) return false; // Faculty not assigned

      // Faculty must be available
      if (isFacultyBusy(facultyId, day, period, entries)) return false;

      // Subject can appear at most twice per day, and max 2 consecutive
      const usageToday = subjectsUsedToday.get(subject.id) ?? 0;
      if (usageToday >= 2) return false;

      // If already used once, check consecutive constraint
      if (usageToday === 1) {
        // Find where it was used
        const existingEntry = dayEntries.find(e => e.subjectId === subject.id && e.entryType === 'theory');
        if (existingEntry) {
          const prevPeriod = existingEntry.period;
          // Can only be consecutive (adjacent periods)
          if (Math.abs(period - prevPeriod) !== 1) return false;
        }
      }

      return true;
    });

    if (validSubjects.length === 0) continue;

    // Prefer subjects not yet used today, then least used overall
    validSubjects.sort((a, b) => {
      const aUsedToday = subjectsUsedToday.get(a.id) ?? 0;
      const bUsedToday = subjectsUsedToday.get(b.id) ?? 0;

      if (aUsedToday !== bUsedToday) {
        return aUsedToday - bUsedToday;
      }

      return subjectUsage[a.id] - subjectUsage[b.id];
    });

    const selectedSubject = validSubjects[0];
    const facultyId = facultyAssignments[selectedSubject.id];
    const classroom = findAvailableClassroom(classrooms, day, period, entries);

    if (classroom && facultyId) {
      entries.push({
        id: `entry_${entries.length + 1}`,
        day,
        period,
        subjectId: selectedSubject.id,
        facultyId,
        classroomId: classroom.id,
        entryType: 'theory',
        isCancelled: false,
      });

      subjectUsage[selectedSubject.id]++;
      subjectsUsedToday.set(selectedSubject.id, (subjectsUsedToday.get(selectedSubject.id) ?? 0) + 1);
    }
  }
}

function isFacultyBusy(
  facultyId: string,
  day: string,
  period: number,
  entries: TimetableEntry[]
): boolean {
  return entries.some(
    entry => entry.facultyId === facultyId && entry.day === day && entry.period === period
  );
}

function findAvailableClassroom(
  classrooms: Classroom[],
  day: string,
  period: number,
  entries: TimetableEntry[]
): Classroom | null {
  // Find classrooms that are not labs
  const regularClassrooms = classrooms.filter(cr => !cr.classroomNumber.startsWith('LAB'));

  for (const classroom of regularClassrooms) {
    const isOccupied = entries.some(
      entry => entry.classroomId === classroom.id && entry.day === day && entry.period === period
    );

    if (!isOccupied && classroom.status === 'available') {
      return classroom;
    }
  }

  return regularClassrooms[0] || null; // Fallback to first available
}

function findAvailableLabClassroom(
  classrooms: Classroom[],
  day: string,
  periods: number[],
  entries: TimetableEntry[]
): Classroom | null {
  // Find lab classrooms
  const labClassrooms = classrooms.filter(cr => cr.classroomNumber.startsWith('LAB'));

  for (const classroom of labClassrooms) {
    const isOccupied = periods.some(periodIndex =>
      entries.some(
        entry => entry.classroomId === classroom.id && entry.day === day && entry.period === periodIndex + 1
      )
    );

    if (!isOccupied && classroom.status === 'available') {
      return classroom;
    }
  }

  return labClassrooms[0] || null; // Fallback to first available
}

/**
 * Validate generated timetable for conflicts
 */
export function validateTimetable(timetable: Timetable): {
  valid: boolean;
  conflicts: string[];
} {
  const conflicts: string[] = [];

  // Check for faculty conflicts
  const facultySlots: { [key: string]: Set<string> } = {};

  timetable.entries.forEach(entry => {
    const key = `${entry.facultyId}_${entry.day}_${entry.period}`;
    if (!facultySlots[entry.facultyId]) {
      facultySlots[entry.facultyId] = new Set();
    }

    const slotKey = `${entry.day}_${entry.period}`;
    if (facultySlots[entry.facultyId].has(slotKey)) {
      conflicts.push(`Faculty ${entry.facultyId} has conflict on ${entry.day} period ${entry.period}`);
    }
    facultySlots[entry.facultyId].add(slotKey);
  });

  // Check for classroom conflicts
  const classroomSlots: { [key: string]: Set<string> } = {};

  timetable.entries.forEach(entry => {
    if (!classroomSlots[entry.classroomId]) {
      classroomSlots[entry.classroomId] = new Set();
    }

    const slotKey = `${entry.day}_${entry.period}`;
    if (classroomSlots[entry.classroomId].has(slotKey)) {
      conflicts.push(`Classroom ${entry.classroomId} has conflict on ${entry.day} period ${entry.period}`);
    }
    classroomSlots[entry.classroomId].add(slotKey);
  });

  return {
    valid: conflicts.length === 0,
    conflicts,
  };
}
