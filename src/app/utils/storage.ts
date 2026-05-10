import type { Timetable } from '../data/mockData';

const TIMETABLE_STORAGE_PREFIX = 'schedulix_timetable_';

const getTimetableStorageKey = (department: string, section: string) =>
  `${TIMETABLE_STORAGE_PREFIX}${department}_${section}`;

export function saveLocalTimetable(timetable: Timetable) {
  try {
    localStorage.setItem(getTimetableStorageKey(timetable.department, timetable.section), JSON.stringify(timetable));
  } catch (error) {
    console.warn('Could not save timetable locally:', error);
  }
}

export function loadLocalTimetable(department: string, section: string): Timetable | null {
  try {
    const item = localStorage.getItem(getTimetableStorageKey(department, section));
    if (!item) return null;
    return JSON.parse(item) as Timetable;
  } catch (error) {
    console.warn('Could not load timetable locally:', error);
    return null;
  }
}

// ─── Generic Storage Helpers ──────────────────────────────────────────────────

export const KEYS = {
  faculties: 'schedulix_faculties',
  students: 'schedulix_students',
  subjects: 'schedulix_subjects',
  classrooms: 'schedulix_classrooms',
  groups: 'schedulix_groups',
  departments: 'schedulix_departments',
  timetables: 'schedulix_timetables',
};

export function load<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
    return defaultValue;
  }
}

export function persist<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to persist ${key} to storage`, e);
  }
}
