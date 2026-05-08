export const USERS = [
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
  {
    id: 'u_f1',
    name: 'Dr. Anu Kumar',
    email: 'anu@gmail.com',
    password: 'anu_2016',
    role: 'hod',
    department: 'CSE',
  },
  {
    id: 'u_f2',
    name: 'Dr. Arun Sharma',
    email: 'arun@gmail.com',
    password: 'arun_2017',
    role: 'faculty',
    department: 'CSE',
  },
  {
    id: 'u_24i2201',
    name: 'Rahul Kumar',
    email: '24i2201@student.edu',
    password: 'pass24i2201',
    role: 'student',
    department: 'IT',
  },
  {
    id: 'u_24z2201',
    name: 'Priya Reddy',
    email: '24z2201@student.edu',
    password: 'pass24z2201',
    role: 'student',
    department: 'CSE',
  },
];

export const SUBJECTS = [
  { id: 'CS401', subjectName: 'Data Structures and Algorithms', subjectCode: 'CS401', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['u_f1'], type: 'theory' },
  { id: 'CS402', subjectName: 'Database Management Systems', subjectCode: 'CS402', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['u_f1'], type: 'theory' },
  { id: 'CS406', subjectName: 'Web Technologies Lab', subjectCode: 'CS406', credits: 2, department: 'CSE', semester: 4, assignedFaculty: ['u_f2'], type: 'lab' },
  { id: 'IT401', subjectName: 'Information Security', subjectCode: 'IT401', credits: 4, department: 'IT', semester: 4, assignedFaculty: ['u_f1'], type: 'theory' },
  { id: 'IT406', subjectName: 'Cloud Computing Lab', subjectCode: 'IT406', credits: 2, department: 'IT', semester: 4, assignedFaculty: ['u_f2'], type: 'lab' },
];

export const CLASSROOMS = [
  { id: 'cr1', classroomNumber: 'CS-101', capacity: 60, status: 'available' },
  { id: 'cr2', classroomNumber: 'CS-102', capacity: 60, status: 'available' },
  { id: 'cr9', classroomNumber: 'LAB-301', capacity: 50, status: 'available' },
  { id: 'cr10', classroomNumber: 'LAB-302', capacity: 50, status: 'available' },
];
