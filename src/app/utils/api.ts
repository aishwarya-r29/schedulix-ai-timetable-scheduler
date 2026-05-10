const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `API request failed: ${response.status}`);
  }

  return response.json();
}

export async function loginApi(email: string, password: string) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchUserById(userId: string) {
  return apiRequest(`/api/users/${encodeURIComponent(userId)}`);
}

export async function fetchFaculties(department?: string) {
  return apiRequest(`/api/faculties${department ? `?department=${encodeURIComponent(department)}` : ''}`);
}

export async function fetchStudents(department?: string, section?: string) {
  const query = [];
  if (department) query.push(`department=${encodeURIComponent(department)}`);
  if (section) query.push(`section=${encodeURIComponent(section)}`);
  return apiRequest(`/api/students${query.length ? `?${query.join('&')}` : ''}`);
}

export async function fetchTimetableForSection(department: string, section: string) {
  return apiRequest(`/api/timetables?department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}`);
}

export async function fetchTimetableForFaculty(facultyId: string) {
  return apiRequest(`/api/timetables?facultyId=${encodeURIComponent(facultyId)}`);
}

export async function fetchAllTimetables() {
  return apiRequest('/api/timetables');
}

export async function saveTimetable(timetable: unknown) {
  return apiRequest('/api/timetables', {
    method: 'POST',
    body: JSON.stringify(timetable),
  });
}

export async function fetchSubjects() {
  return apiRequest('/api/subjects');
}

export async function fetchClassrooms() {
  return apiRequest('/api/classrooms');
}

// ─── Faculty CRUD ──────────────────────────────────────────────────────────────

export async function createFaculty(faculty: any) {
  return apiRequest('/api/faculties', { method: 'POST', body: JSON.stringify(faculty) });
}

export async function updateFacultyApi(faculty: any) {
  return apiRequest(`/api/faculties/${encodeURIComponent(faculty.id)}`, { method: 'PUT', body: JSON.stringify(faculty) });
}

export async function deleteFacultyApi(id: string) {
  return apiRequest(`/api/faculties/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Student CRUD ──────────────────────────────────────────────────────────────

export async function createStudent(student: any) {
  return apiRequest('/api/students', { method: 'POST', body: JSON.stringify(student) });
}

export async function updateStudentApi(student: any) {
  return apiRequest(`/api/students/${encodeURIComponent(student.id)}`, { method: 'PUT', body: JSON.stringify(student) });
}

export async function deleteStudentApi(id: string) {
  return apiRequest(`/api/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Subject CRUD ──────────────────────────────────────────────────────────────

export async function createSubject(subject: any) {
  return apiRequest('/api/subjects', { method: 'POST', body: JSON.stringify(subject) });
}

export async function updateSubjectApi(subject: any) {
  return apiRequest(`/api/subjects/${encodeURIComponent(subject.id)}`, { method: 'PUT', body: JSON.stringify(subject) });
}

export async function deleteSubjectApi(id: string) {
  return apiRequest(`/api/subjects/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Classroom CRUD ────────────────────────────────────────────────────────────

export async function createClassroom(classroom: any) {
  return apiRequest('/api/classrooms', { method: 'POST', body: JSON.stringify(classroom) });
}

export async function updateClassroomApi(classroom: any) {
  return apiRequest(`/api/classrooms/${encodeURIComponent(classroom.id)}`, { method: 'PUT', body: JSON.stringify(classroom) });
}

export async function deleteClassroomApi(id: string) {
  return apiRequest(`/api/classrooms/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Department CRUD ───────────────────────────────────────────────────────────

export async function fetchDepartments() {
  return apiRequest('/api/departments');
}

export async function createDepartment(dept: any) {
  return apiRequest('/api/departments', {
    method: 'POST',
    body: JSON.stringify(dept),
  });
}

export async function deleteDepartmentApi(id: string) {
  return apiRequest(`/api/departments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Group CRUD ───────────────────────────────────────────────────────────────

export async function fetchGroups() {
  return apiRequest('/api/groups');
}

export async function createGroup(group: any) {
  return apiRequest('/api/groups', {
    method: 'POST',
    body: JSON.stringify(group),
  });
}

export async function deleteGroupApi(id: string) {
  return apiRequest(`/api/groups/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

