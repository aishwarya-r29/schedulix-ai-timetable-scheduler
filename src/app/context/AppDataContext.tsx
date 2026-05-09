import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Faculty, Student, Subject, Classroom, Group, Timetable,
  FACULTIES, STUDENTS, SUBJECTS, CLASSROOMS, GROUPS, TIMETABLES,
  deriveRoomType,
} from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Department {
  id: string; // 'CSE' | 'IT' | custom
  name: string;
  fullName: string;
}

interface AppDataContextType {
  // Data
  faculties: Faculty[];
  students: Student[];
  subjects: Subject[];
  classrooms: Classroom[];
  groups: Group[];
  departments: Department[];
  timetables: Timetable[];

  // Faculty CRUD
  addFaculty: (f: Omit<Faculty, 'id' | 'userId'>) => string | null; // returns error or null
  updateFaculty: (f: Faculty) => string | null;
  deleteFaculty: (id: string) => string | null;

  // Student CRUD
  addStudent: (s: Omit<Student, 'id' | 'userId'>) => string | null;
  updateStudent: (s: Student) => string | null;
  deleteStudent: (id: string) => string | null;

  // Subject CRUD
  addSubject: (s: Omit<Subject, 'id'>) => string | null;
  updateSubject: (s: Subject) => string | null;
  deleteSubject: (id: string) => string | null;

  // Classroom CRUD
  addClassroom: (c: Omit<Classroom, 'id'>) => string | null;
  updateClassroom: (c: Classroom) => string | null;
  deleteClassroom: (id: string) => string | null;

  // Group CRUD
  addGroup: (g: Omit<Group, 'id' | 'studentIds'>) => string | null;
  deleteGroup: (id: string) => string | null;

  // Department CRUD
  addDepartment: (d: Department) => string | null;
  deleteDepartment: (id: string) => string | null;

  // Timetable store
  saveTimetableToStore: (tt: Timetable) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  faculties: 'schedulix_faculties',
  students: 'schedulix_students',
  subjects: 'schedulix_subjects',
  classrooms: 'schedulix_classrooms',
  groups: 'schedulix_groups',
  departments: 'schedulix_departments',
  timetables: 'schedulix_all_timetables',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

// ─── Default Departments ──────────────────────────────────────────────────────

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'CSE', name: 'CSE', fullName: 'Computer Science Engineering' },
  { id: 'IT',  name: 'IT',  fullName: 'Information Technology' },
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [faculties,    setFacultiesState]    = useState<Faculty[]>(() => load(KEYS.faculties,    FACULTIES));
  const [students,     setStudentsState]     = useState<Student[]>(() => load(KEYS.students,     STUDENTS));
  const [subjects,     setSubjectsState]     = useState<Subject[]>(() => load(KEYS.subjects,     SUBJECTS));
  const [classrooms,   setClassroomsState]   = useState<Classroom[]>(() => load(KEYS.classrooms, CLASSROOMS));
  const [groups,       setGroupsState]       = useState<Group[]>(() => load(KEYS.groups,         GROUPS));
  const [departments,  setDepartmentsState]  = useState<Department[]>(() => load(KEYS.departments, DEFAULT_DEPARTMENTS));
  const [timetables,   setTimetablesState]   = useState<Timetable[]>(() => load(KEYS.timetables,  TIMETABLES));

  // Sync helpers
  const setFaculties  = useCallback((v: Faculty[])    => { setFacultiesState(v);  persist(KEYS.faculties,  v); }, []);
  const setStudents   = useCallback((v: Student[])    => { setStudentsState(v);   persist(KEYS.students,   v); }, []);
  const setSubjects   = useCallback((v: Subject[])    => { setSubjectsState(v);   persist(KEYS.subjects,   v); }, []);
  const setClassrooms = useCallback((v: Classroom[])  => { setClassroomsState(v); persist(KEYS.classrooms, v); }, []);
  const setGroups     = useCallback((v: Group[])      => { setGroupsState(v);     persist(KEYS.groups,     v); }, []);
  const setDepts      = useCallback((v: Department[]) => { setDepartmentsState(v);persist(KEYS.departments,v); }, []);
  const setTimetables = useCallback((v: Timetable[])  => { setTimetablesState(v); persist(KEYS.timetables, v); }, []);

  // ── Faculty CRUD ─────────────────────────────────────────────────────────────

  const addFaculty = useCallback((f: Omit<Faculty, 'id' | 'userId'>): string | null => {
    if (!f.name.trim() || !f.email.trim()) return 'Name and email are required.';
    const exists = faculties.some(x => x.email.toLowerCase() === f.email.toLowerCase().trim());
    if (exists) return 'A faculty member with this email already exists.';
    const id = `f${Date.now()}`;
    const newF: Faculty = { ...f, id, userId: `u_${id}`, name: f.name.trim(), email: f.email.trim() };
    setFaculties([...faculties, newF]);
    return null;
  }, [faculties, setFaculties]);

  const updateFaculty = useCallback((f: Faculty): string | null => {
    if (!f.name.trim() || !f.email.trim()) return 'Name and email are required.';
    const dup = faculties.find(x => x.email.toLowerCase() === f.email.toLowerCase().trim() && x.id !== f.id);
    if (dup) return 'Another faculty member already has this email.';
    setFaculties(faculties.map(x => x.id === f.id ? { ...f, name: f.name.trim(), email: f.email.trim() } : x));
    return null;
  }, [faculties, setFaculties]);

  const deleteFaculty = useCallback((id: string): string | null => {
    setFaculties(faculties.filter(x => x.id !== id));
    return null;
  }, [faculties, setFaculties]);

  // ── Student CRUD ──────────────────────────────────────────────────────────────

  const addStudent = useCallback((s: Omit<Student, 'id' | 'userId'>): string | null => {
    if (!s.name.trim() || !s.rollNumber.trim()) return 'Name and roll number are required.';
    if (students.some(x => x.rollNumber === s.rollNumber.trim())) return 'Roll number already exists.';
    if (students.some(x => x.email.toLowerCase() === s.email.toLowerCase().trim())) return 'Email already exists.';
    // One-group rule: section encodes the group
    const id = `s_${s.rollNumber.trim()}`;
    const newS: Student = { ...s, id, userId: s.rollNumber.trim(), name: s.name.trim(), rollNumber: s.rollNumber.trim(), email: s.email.trim() };
    setStudents([...students, newS]);
    // Add to group
    setGroups(groups.map(g => g.id === s.section ? { ...g, studentIds: [...g.studentIds, id] } : g));
    return null;
  }, [students, groups, setStudents, setGroups]);

  const updateStudent = useCallback((s: Student): string | null => {
    if (!s.name.trim() || !s.rollNumber.trim()) return 'Name and roll number are required.';
    const old = students.find(x => x.id === s.id);
    if (!old) return 'Student not found.';
    const dup = students.find(x => x.email.toLowerCase() === s.email.toLowerCase().trim() && x.id !== s.id);
    if (dup) return 'Another student already has this email.';
    // If group changed, update group membership
    if (old.section !== s.section) {
      setGroups(groups.map(g => {
        if (g.id === old.section) return { ...g, studentIds: g.studentIds.filter(sid => sid !== s.id) };
        if (g.id === s.section)  return { ...g, studentIds: [...g.studentIds, s.id] };
        return g;
      }));
    }
    setStudents(students.map(x => x.id === s.id ? { ...s, name: s.name.trim(), email: s.email.trim() } : x));
    return null;
  }, [students, groups, setStudents, setGroups]);

  const deleteStudent = useCallback((id: string): string | null => {
    const s = students.find(x => x.id === id);
    if (s) setGroups(groups.map(g => g.id === s.section ? { ...g, studentIds: g.studentIds.filter(sid => sid !== id) } : g));
    setStudents(students.filter(x => x.id !== id));
    return null;
  }, [students, groups, setStudents, setGroups]);

  // ── Subject CRUD ──────────────────────────────────────────────────────────────

  const addSubject = useCallback((s: Omit<Subject, 'id'>): string | null => {
    if (!s.subjectName.trim() || !s.subjectCode.trim()) return 'Name and code are required.';
    if (subjects.some(x => x.subjectCode === s.subjectCode.trim())) return 'Subject code already exists.';
    const id = s.subjectCode.trim();
    setSubjects([...subjects, { ...s, id, subjectName: s.subjectName.trim(), subjectCode: s.subjectCode.trim() }]);
    return null;
  }, [subjects, setSubjects]);

  const updateSubject = useCallback((s: Subject): string | null => {
    if (!s.subjectName.trim() || !s.subjectCode.trim()) return 'Name and code are required.';
    setSubjects(subjects.map(x => x.id === s.id ? s : x));
    return null;
  }, [subjects, setSubjects]);

  const deleteSubject = useCallback((id: string): string | null => {
    setSubjects(subjects.filter(x => x.id !== id));
    return null;
  }, [subjects, setSubjects]);

  // ── Classroom CRUD ────────────────────────────────────────────────────────────

  const addClassroom = useCallback((c: Omit<Classroom, 'id'>): string | null => {
    if (!c.classroomNumber.trim()) return 'Room number is required.';
    if (classrooms.some(x => x.classroomNumber.toLowerCase() === c.classroomNumber.toLowerCase().trim()))
      return 'A classroom with this room number already exists.';
    const id = `cr${Date.now()}`;
    const roomType = c.roomType ?? deriveRoomType(c.classroomNumber);
    setClassrooms([...classrooms, { ...c, id, classroomNumber: c.classroomNumber.trim(), roomType }]);
    return null;
  }, [classrooms, setClassrooms]);

  const updateClassroom = useCallback((c: Classroom): string | null => {
    if (!c.classroomNumber.trim()) return 'Room number is required.';
    const dup = classrooms.find(x => x.classroomNumber.toLowerCase() === c.classroomNumber.toLowerCase().trim() && x.id !== c.id);
    if (dup) return 'Another classroom already has this room number.';
    setClassrooms(classrooms.map(x => x.id === c.id ? c : x));
    return null;
  }, [classrooms, setClassrooms]);

  const deleteClassroom = useCallback((id: string): string | null => {
    setClassrooms(classrooms.filter(x => x.id !== id));
    return null;
  }, [classrooms, setClassrooms]);

  // ── Group CRUD ────────────────────────────────────────────────────────────────

  const addGroup = useCallback((g: Omit<Group, 'id' | 'studentIds'>): string | null => {
    if (!g.name.trim()) return 'Group name is required.';
    const id = `${g.department} ${g.name.trim()}`;
    if (groups.some(x => x.id === id)) return `Group "${id}" already exists.`;
    setGroups([...groups, { ...g, id, name: g.name.trim(), studentIds: [] }]);
    return null;
  }, [groups, setGroups]);

  const deleteGroup = useCallback((id: string): string | null => {
    const g = groups.find(x => x.id === id);
    if (g && g.studentIds.length > 0) return `Cannot delete: ${g.studentIds.length} students are still assigned to this group.`;
    setGroups(groups.filter(x => x.id !== id));
    return null;
  }, [groups, setGroups]);

  // ── Department CRUD ───────────────────────────────────────────────────────────

  const addDepartment = useCallback((d: Department): string | null => {
    if (!d.name.trim()) return 'Department name is required.';
    if (departments.some(x => x.id === d.id)) return 'Department already exists.';
    setDepts([...departments, d]);
    return null;
  }, [departments, setDepts]);

  const deleteDepartment = useCallback((id: string): string | null => {
    if (id === 'CSE' || id === 'IT') return 'Core departments cannot be deleted.';
    setDepts(departments.filter(x => x.id !== id));
    return null;
  }, [departments, setDepts]);

  // ── Timetable Store ───────────────────────────────────────────────────────────

  const saveTimetableToStore = useCallback((tt: Timetable) => {
    setTimetables(prev => {
      const idx = prev.findIndex(x => x.department === tt.department && x.section === tt.section);
      const next = [...prev];
      if (idx >= 0) next[idx] = tt; else next.push(tt);
      return next;
    });
    persist(KEYS.timetables, timetables);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetables]);

  // Keep global TIMETABLES array in sync for legacy code that reads it directly
  useEffect(() => {
    TIMETABLES.length = 0;
    timetables.forEach(tt => TIMETABLES.push(tt));
  }, [timetables]);

  return (
    <AppDataContext.Provider value={{
      faculties, students, subjects, classrooms, groups, departments, timetables,
      addFaculty, updateFaculty, deleteFaculty,
      addStudent, updateStudent, deleteStudent,
      addSubject, updateSubject, deleteSubject,
      addClassroom, updateClassroom, deleteClassroom,
      addGroup, deleteGroup,
      addDepartment, deleteDepartment,
      saveTimetableToStore,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
};
