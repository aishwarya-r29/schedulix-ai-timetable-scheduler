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

export async function fetchTimetableForSection(department: string, section: string) {
  return apiRequest(`/api/timetables?department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}`);
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
