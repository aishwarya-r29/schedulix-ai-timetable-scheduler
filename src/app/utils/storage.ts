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
