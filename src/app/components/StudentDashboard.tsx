import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Calendar,
  BookOpen,
  LogOut,
  Download,
  Clock,
  User,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import {
  SUBJECTS,
  FACULTIES,
  CLASSROOMS,
  DAYS,
  PERIODS,
  PERIOD_TIMINGS,
  getTimetableForSection,
} from '../data/mockData';
import { fetchTimetableForSection } from '../utils/api';
import { loadLocalTimetable } from '../utils/storage';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { students = [], departments = [], subjects = [], faculties = [], classrooms = [], loading: contextLoading } = useAppData();
  const student = students.find(s => s.userId === user?.id);
  const [sectionTimetable, setSectionTimetable] = useState<any>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(true);

  const dept = departments.find(d => d.id === student?.department);
  const displayName = student?.name || user?.name || 'Student';
  const displayRollNumber = student?.rollNumber || '---';
  const displayDepartment = dept ? dept.name : (student?.department || '---');
  const displaySemester = student?.semester || 4;
  const displaySection = student?.section || '---';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!student) return;

    setLoadingTimetable(true);
    const localTimetable = loadLocalTimetable(student.department, student.section);
    if (localTimetable) {
      setSectionTimetable(localTimetable);
    }

    fetchTimetableForSection(student.department, student.section)
      .then((result) => {
        if (result && result.entries && result.entries.length > 0) {
          setSectionTimetable(result);
        }
      })
      .catch(() => {
        // Keep local timetable if backend fetch fails
      })
      .finally(() => {
        setLoadingTimetable(false);
      });
  }, [student]);

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Synchronizing Student Profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Student Profile Not Found</h2>
          <p className="text-slate-400 mb-6">We couldn't find a student profile associated with your account. Please contact the administrator.</p>
          <button onClick={() => { logout(); navigate('/'); }} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const timetable = sectionTimetable || (student ? getTimetableForSection(student.department, student.section) : null);
  const sectionSubjects = student
    ? subjects.filter(s => s.department === student.department && s.semester === student.semester)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SCHEDULIX</h1>
              <p className="text-xs text-slate-400">Student Portal</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {displayName}</h2>
          <p className="text-slate-300">{displayRollNumber} • {displaySection} • {displayDepartment} Department</p>
        </div>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-slate-400 mb-1">Roll Number</div>
            <div className="text-xl font-bold text-white font-mono">{displayRollNumber}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-slate-400 mb-1">Semester</div>
            <div className="text-xl font-bold text-white">{displaySemester}th Semester</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-slate-400 mb-1">Department</div>
            <div className="text-xl font-bold text-white">{displayDepartment}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-slate-400 mb-1">Section</div>
            <div className="text-xl font-bold text-white">{displaySection}</div>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Your Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionSubjects.map(subject => (
              <div key={subject.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-white">{subject.subjectName}</div>
                    <div className="text-sm text-slate-400">{subject.subjectCode}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    subject.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {subject.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-slate-400">Credits: {subject.credits}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Your Timetable</h3>
              <p className="text-slate-400">Weekly class schedule for {displaySection}</p>
            </div>

            {timetable ? (
              <div className="flex gap-2">
                <button
                  onClick={() => exportToPDF(timetable)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => exportToExcel(timetable)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            ) : null}
          </div>

          {loadingTimetable ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading generated timetable...</p>
            </div>
          ) : timetable ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase sticky left-0 bg-white/10">
                      Day / Period
                    </th>
                    {PERIODS.slice(0, 8).map(period => (
                      <th key={period} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                        <div>Period {period}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{PERIOD_TIMINGS[period]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {DAYS.map(day => (
                    <tr key={day} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 font-semibold text-white sticky left-0 bg-slate-900/50 backdrop-blur-sm">
                        {day}
                      </td>
                      {PERIODS.slice(0, 8).map(period => {
                        const entry = timetable?.entries ? timetable.entries.find(e => e.day === day && e.period === period) : null;
                        const subject = entry ? subjects.find(s => s.id === entry.subjectId) : null;
                        const faculty = entry ? faculties.find(f => f.id === entry.facultyId) : null;
                        const classroom = entry ? classrooms.find(c => c.id === entry.classroomId) : null;

                        return (
                          <td
                            key={period}
                            className={`px-4 py-4 text-center text-sm transition-colors ${
                              entry?.entryType === 'lab'
                                ? 'bg-purple-500/10 border-l-2 border-r-2 border-purple-500/30'
                                : ''
                            }`}
                          >
                            {entry && !entry.isCancelled ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-white">{subject?.subjectCode}</div>
                                <div className="text-xs text-slate-300">{subject?.subjectName}</div>
                                <div className="text-xs text-slate-400">
                                  {faculty?.name ? faculty.name.split(' ').slice(-1) : 'N/A'}
                                </div>
                                <div className="text-xs text-slate-500">{classroom?.classroomNumber}</div>
                                {entry.entryType === 'lab' && (
                                  <div className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-medium">
                                    LAB
                                  </div>
                                )}
                              </div>
                            ) : entry?.isCancelled ? (
                              <div className="py-2">
                                <div className="text-red-400 font-semibold text-sm mb-1">CANCELLED</div>
                                <div className="text-xs text-slate-500">{subject?.subjectCode}</div>
                              </div>
                            ) : (
                              <div className="text-slate-600 py-4">---</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Timetable Available</h3>
              <p className="text-slate-400">Your timetable hasn't been generated yet. Please contact the admin.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        {timetable && (
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/30 rounded"></div>
                <span className="text-slate-300">Lab Session (4 consecutive periods)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/5 border border-white/10 rounded"></div>
                <span className="text-slate-300">Theory Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500/10 border border-red-500/30 rounded"></div>
                <span className="text-slate-300">Cancelled Class</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Brain className="w-4 h-4" />
            <span>Powered by Schedulix AI © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
