// Mock Data for Schedulix - AI Timetable Scheduler
// This file contains all mock data for the frontend prototype

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student' | 'hod';
  department?: 'CSE' | 'IT';
}

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  name: string;
  semester: number;
  section: string;
  email: string;
  password: string;
  department: 'CSE' | 'IT';
}

export interface Faculty {
  id: string;
  userId: string;
  name: string;
  designation: string;
  department: 'CSE' | 'IT';
  email: string;
  password: string;
  subjects: string[];
  isHOD?: boolean;
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  department: 'CSE' | 'IT';
  semester: number;
  assignedFaculty: string[];
  type: 'theory' | 'lab';
}

export interface Classroom {
  id: string;
  classroomNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  entryType: 'theory' | 'lab';
  isCancelled: boolean;
  cancelledDate?: string;
}

export interface Timetable {
  id: string;
  department: 'CSE' | 'IT';
  semester: number;
  section: string;
  generatedBy: string;
  createdAt: string;
  entries: TimetableEntry[];
}

// Admin Credentials (passwords in plain text for frontend prototype)
export const ADMINS: User[] = [
  {
    id: 'admin1',
    name: 'Admin Schedulix 01',
    email: 'adminschedulix01@gmail.com',
    password: 'adminsch123',
    role: 'admin',
  },
  {
    id: 'admin2',
    name: 'Admin Schedulix 02',
    email: 'adminschedulix02@gmail.com',
    password: 'adminsch456',
    role: 'admin',
  },
];

// Faculty Data (20 faculties - 10 CSE, 10 IT)
export const FACULTIES: Faculty[] = [
  // CSE Faculty
  { id: 'f1', userId: 'u_f1', name: 'Dr. Anu Kumar', designation: 'Professor', department: 'CSE', email: 'anu@gmail.com', password: 'anu_2016', subjects: ['CS401', 'CS402'], isHOD: true },
  { id: 'f2', userId: 'u_f2', name: 'Dr. Arun Sharma', designation: 'Associate Professor', department: 'CSE', email: 'arun@gmail.com', password: 'arun_2017', subjects: ['CS403', 'CS404'] },
  { id: 'f3', userId: 'u_f3', name: 'Dr. Revathi Menon', designation: 'Assistant Professor', department: 'CSE', email: 'revathi@gmail.com', password: 'revathi_2018', subjects: ['CS405', 'CS406'] },
  { id: 'f4', userId: 'u_f4', name: 'Dr. Kavi Prasad', designation: 'Assistant Professor', department: 'CSE', email: 'kavi@gmail.com', password: 'kavi_2019', subjects: ['CS407', 'CS408'] },
  { id: 'f5', userId: 'u_f5', name: 'Priya Reddy', designation: 'Lecturer', department: 'CSE', email: 'priya@gmail.com', password: 'priya_2020', subjects: ['CS401', 'CS403'] },
  { id: 'f6', userId: 'u_f6', name: 'Dr. Ramesh Babu', designation: 'Professor', department: 'CSE', email: 'ramesh@gmail.com', password: 'ramesh_2015', subjects: ['CS402', 'CS404'] },
  { id: 'f7', userId: 'u_f7', name: 'Sneha Iyer', designation: 'Lecturer', department: 'CSE', email: 'sneha@gmail.com', password: 'sneha_2016', subjects: ['CS405', 'CS407'] },
  { id: 'f8', userId: 'u_f8', name: 'Vijay Krishnan', designation: 'Assistant Professor', department: 'CSE', email: 'vijay@gmail.com', password: 'vijay_2017', subjects: ['CS406', 'CS408'] },
  { id: 'f9', userId: 'u_f9', name: 'Divya Nair', designation: 'Lecturer', department: 'CSE', email: 'divya@gmail.com', password: 'divya_2018', subjects: ['CS401'] },
  { id: 'f10', userId: 'u_f10', name: 'Karthik Mohan', designation: 'Assistant Professor', department: 'CSE', email: 'karthik@gmail.com', password: 'karthik_2019', subjects: ['CS402'] },

  // IT Faculty
  { id: 'f11', userId: 'u_f11', name: 'Dr. Lakshmi Devi', designation: 'Professor', department: 'IT', email: 'lakshmi@gmail.com', password: 'lakshmi_2020', subjects: ['IT401', 'IT402'], isHOD: true },
  { id: 'f12', userId: 'u_f12', name: 'Mohan Rao', designation: 'Associate Professor', department: 'IT', email: 'mohan@gmail.com', password: 'mohan_2015', subjects: ['IT403', 'IT404'] },
  { id: 'f13', userId: 'u_f13', name: 'Nithya Priya', designation: 'Assistant Professor', department: 'IT', email: 'nithya@gmail.com', password: 'nithya_2016', subjects: ['IT405', 'IT406'] },
  { id: 'f14', userId: 'u_f14', name: 'Prakash Kumar', designation: 'Lecturer', department: 'IT', email: 'prakash@gmail.com', password: 'prakash_2017', subjects: ['IT407', 'IT408'] },
  { id: 'f15', userId: 'u_f15', name: 'Swetha Reddy', designation: 'Assistant Professor', department: 'IT', email: 'swetha@gmail.com', password: 'swetha_2018', subjects: ['IT401', 'IT403'] },
  { id: 'f16', userId: 'u_f16', name: 'Deepak Gupta', designation: 'Lecturer', department: 'IT', email: 'deepak@gmail.com', password: 'deepak_2019', subjects: ['IT402', 'IT404'] },
  { id: 'f17', userId: 'u_f17', name: 'Hari Shankar', designation: 'Assistant Professor', department: 'IT', email: 'hari@gmail.com', password: 'hari_2020', subjects: ['IT405', 'IT407'] },
  { id: 'f18', userId: 'u_f18', name: 'Meena Kumari', designation: 'Lecturer', department: 'IT', email: 'meena@gmail.com', password: 'meena_2015', subjects: ['IT406', 'IT408'] },
  { id: 'f19', userId: 'u_f19', name: 'Sanjay Verma', designation: 'Assistant Professor', department: 'IT', email: 'sanjay@gmail.com', password: 'sanjay_2016', subjects: ['IT401'] },
  { id: 'f20', userId: 'u_f20', name: 'Shalini Das', designation: 'Lecturer', department: 'IT', email: 'shalini@gmail.com', password: 'shalini_2017', subjects: ['IT402'] },
];

// Generate 200 students (50 per section)
const generateStudents = (): Student[] => {
  const students: Student[] = [];
  const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vijay', 'Divya', 'Karthik', 'Lakshmi', 'Arun', 'Meena', 'Ravi', 'Sita', 'Mohan', 'Geetha', 'Suresh', 'Kavita', 'Ramesh', 'Anita', 'Prakash', 'Neha', 'Vikram', 'Pooja', 'Arjun', 'Swati', 'Deepak'];
  const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Iyer', 'Nair', 'Menon', 'Patel', 'Singh', 'Krishnan', 'Rao', 'Gupta', 'Verma', 'Chopra', 'Malhotra', 'Agarwal', 'Joshi', 'Mehta', 'Kapoor', 'Bhat', 'Desai'];

  const sections = [
    { dept: 'IT' as const, section: 'IT G1', prefix: '24i2', start: 201, end: 250 },
    { dept: 'IT' as const, section: 'IT G2', prefix: '24i3', start: 301, end: 350 },
    { dept: 'CSE' as const, section: 'CSE G1', prefix: '24z2', start: 201, end: 250 },
    { dept: 'CSE' as const, section: 'CSE G2', prefix: '24z3', start: 301, end: 350 },
  ];

  sections.forEach(({ dept, section, prefix, start, end }) => {
    for (let i = start; i <= end; i++) {
      const rollNumber = `${prefix}${String(i).slice(-2)}`;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${rollNumber}@student.edu`;

      students.push({
        id: `s_${rollNumber}`,
        userId: `u_${rollNumber}`,
        rollNumber,
        name,
        semester: 4,
        section,
        email,
        password: `pass${rollNumber}`,
        department: dept,
      });
    }
  });

  return students;
};

export const STUDENTS: Student[] = generateStudents();

// CSE Subjects (4th Semester)
export const CSE_SUBJECTS: Subject[] = [
  { id: 'CS401', subjectName: 'Data Structures and Algorithms', subjectCode: 'CS401', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['f1', 'f5', 'f9'], type: 'theory' },
  { id: 'CS402', subjectName: 'Database Management Systems', subjectCode: 'CS402', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['f1', 'f6', 'f10'], type: 'theory' },
  { id: 'CS403', subjectName: 'Operating Systems', subjectCode: 'CS403', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f2', 'f5'], type: 'theory' },
  { id: 'CS404', subjectName: 'Computer Networks', subjectCode: 'CS404', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f2', 'f6'], type: 'theory' },
  { id: 'CS405', subjectName: 'Software Engineering', subjectCode: 'CS405', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f3', 'f7'], type: 'theory' },
  { id: 'CS406', subjectName: 'Web Technologies Lab', subjectCode: 'CS406', credits: 2, department: 'CSE', semester: 4, assignedFaculty: ['f3', 'f8'], type: 'lab' },
  { id: 'CS407', subjectName: 'DBMS Lab', subjectCode: 'CS407', credits: 2, department: 'CSE', semester: 4, assignedFaculty: ['f4', 'f7'], type: 'lab' },
  { id: 'CS408', subjectName: 'Python Programming', subjectCode: 'CS408', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f4', 'f8'], type: 'theory' },
];

// IT Subjects (4th Semester)
export const IT_SUBJECTS: Subject[] = [
  { id: 'IT401', subjectName: 'Information Security', subjectCode: 'IT401', credits: 4, department: 'IT', semester: 4, assignedFaculty: ['f11', 'f15', 'f19'], type: 'theory' },
  { id: 'IT402', subjectName: 'Cloud Computing', subjectCode: 'IT402', credits: 4, department: 'IT', semester: 4, assignedFaculty: ['f11', 'f16', 'f20'], type: 'theory' },
  { id: 'IT403', subjectName: 'Mobile Application Development', subjectCode: 'IT403', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f12', 'f15'], type: 'theory' },
  { id: 'IT404', subjectName: 'Data Analytics', subjectCode: 'IT404', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f12', 'f16'], type: 'theory' },
  { id: 'IT405', subjectName: 'Internet of Things', subjectCode: 'IT405', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f13', 'f17'], type: 'theory' },
  { id: 'IT406', subjectName: 'Cloud Computing Lab', subjectCode: 'IT406', credits: 2, department: 'IT', semester: 4, assignedFaculty: ['f13', 'f18'], type: 'lab' },
  { id: 'IT407', subjectName: 'Mobile App Development Lab', subjectCode: 'IT407', credits: 2, department: 'IT', semester: 4, assignedFaculty: ['f14', 'f17'], type: 'lab' },
  { id: 'IT408', subjectName: 'Machine Learning Fundamentals', subjectCode: 'IT408', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f14', 'f18'], type: 'theory' },
];

export const SUBJECTS = [...CSE_SUBJECTS, ...IT_SUBJECTS];

// Classrooms
export const CLASSROOMS: Classroom[] = [
  { id: 'cr1', classroomNumber: 'CS-101', capacity: 60, status: 'available' },
  { id: 'cr2', classroomNumber: 'CS-102', capacity: 60, status: 'available' },
  { id: 'cr3', classroomNumber: 'CS-103', capacity: 60, status: 'available' },
  { id: 'cr4', classroomNumber: 'CS-104', capacity: 60, status: 'available' },
  { id: 'cr5', classroomNumber: 'IT-201', capacity: 60, status: 'available' },
  { id: 'cr6', classroomNumber: 'IT-202', capacity: 60, status: 'available' },
  { id: 'cr7', classroomNumber: 'IT-203', capacity: 60, status: 'available' },
  { id: 'cr8', classroomNumber: 'IT-204', capacity: 60, status: 'available' },
  { id: 'cr9', classroomNumber: 'LAB-301', capacity: 50, status: 'available' },
  { id: 'cr10', classroomNumber: 'LAB-302', capacity: 50, status: 'available' },
  { id: 'cr11', classroomNumber: 'LAB-303', capacity: 50, status: 'available' },
  { id: 'cr12', classroomNumber: 'LAB-304', capacity: 50, status: 'available' },
];

// Timetable structure
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 periods per day

// Period timings
export const PERIOD_TIMINGS: { [key: number]: string } = {
  1: '9:00 - 9:40',
  2: '9:40 - 10:20',
  3: '10:20 - 11:00',
  4: '11:00 - 11:40', // Short break after
  5: '12:00 - 12:40',
  6: '12:40 - 1:20', // Lunch break after
  7: '2:00 - 2:40',
  8: '2:40 - 3:20',
};

// Initial empty timetables storage
export let TIMETABLES: Timetable[] = [];

// Function to add generated timetable
export const addTimetable = (timetable: Timetable) => {
  TIMETABLES.push(timetable);
};

// Function to get timetable for specific section
export const getTimetableForSection = (department: string, section: string): Timetable | undefined => {
  return TIMETABLES.find(tt => tt.department === department && tt.section === section);
};

// Function to get faculty timetable
export const getFacultyTimetable = (facultyId: string): TimetableEntry[] => {
  const entries: TimetableEntry[] = [];
  TIMETABLES.forEach(tt => {
    tt.entries.forEach(entry => {
      if (entry.facultyId === facultyId) {
        entries.push(entry);
      }
    });
  });
  return entries;
};

// Get all users (for authentication)
export const getAllUsers = (): User[] => {
  const users: User[] = [...ADMINS];

  // Add faculty as users
  FACULTIES.forEach(f => {
    users.push({
      id: f.userId,
      name: f.name,
      email: f.email,
      password: f.password,
      role: f.isHOD ? 'hod' : 'faculty',
      department: f.department,
    });
  });

  // Add students as users
  STUDENTS.forEach(s => {
    users.push({
      id: s.userId,
      name: s.name,
      email: s.email,
      password: s.password,
      role: 'student',
      department: s.department,
    });
  });

  return users;
};
