import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Calendar,
  Users,
  LogOut,
  Download,
  X,
  AlertCircle,
  Eye,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import {
  FACULTIES,
  SUBJECTS,
  CLASSROOMS,
  DAYS,
  PERIODS,
  PERIOD_TIMINGS,
  TimetableEntry,
} from '../data/mockData';
import { exportFacultyToPDF } from '../utils/exportUtils';
import { fetchTimetableForFaculty, fetchAllTimetables } from '../utils/api';

import ConfirmDialog from './ui/ConfirmDialog';

type TabType = 'home' | 'my-timetable' | 'other-faculty' | 'class-timetable';

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const { 
    faculties = [], 
    departments = [], 
    groups = [], 
    subjects: liveSubjects = [], 
    classrooms: liveClassrooms = [], 
    timetables: contextTimetables = [], 
    refreshTimetables,
    loading: contextLoading 
  } = useAppData();

  const faculty = faculties.find(f => f.userId === user?.id);

  // States for viewing other faculty timetables
  const [selectedDept, setSelectedDept] = useState<string>(() => departments[0]?.id || '');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  // States for viewing class timetables
  const [selectedClassDept, setSelectedClassDept] = useState<string>(() => departments[0]?.id || '');
  const [selectedSection, setSelectedSection] = useState(() => groups.find(g => g.department === departments[0]?.id)?.id || '');

  // Cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [alertMessage, setAlertMessage] = useState<{ title: string, message: string, variant: 'info' | 'danger' | 'warning' } | null>(null);

  // Timetable loading state
  const [timetables, setTimetables] = useState<any[]>([]);
  const allTimetables = contextTimetables;
  const [loadingTimetable, setLoadingTimetable] = useState(true);

  // Local state to track cancellations
  const [cancelledClasses, setCancelledClasses] = useState<Set<string>>(new Set());

  const loadSchedules = async () => {
    if (!faculty) {
      setLoadingTimetable(false);
      return;
    }

    setLoadingTimetable(true);
    try {
      const fetchedTimetables = await fetchTimetableForFaculty(faculty.id);
      if (Array.isArray(fetchedTimetables)) {
        setTimetables(fetchedTimetables);
      }

      // If we are viewing other timetables, refresh the global list too
      if (activeTab === 'other-faculty' || activeTab === 'class-timetable') {
        await refreshTimetables();
      }
    } catch (error) {
      console.warn('Unable to load timetable data from backend:', error);
    } finally {
      setLoadingTimetable(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [faculty, activeTab, selectedFacultyId, selectedClassDept, selectedSection]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Synchronizing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-slate-400 mb-6">We couldn't find a faculty profile associated with your account. Please contact the administrator.</p>
          <button onClick={handleLogout} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Get faculty's timetable
  const getFacultyTimetable = () => {
    const entries: (TimetableEntry & { section: string })[] = [];
    const timetableSource = timetables.length > 0 ? timetables : allTimetables;

    timetableSource.forEach(tt => {
      if (tt && tt.entries) {
        tt.entries.forEach((entry: TimetableEntry) => {
          const isIdMatch = entry.facultyId === faculty.id;
          const isNameMatch = !isIdMatch && faculties.find(f => f.id === entry.facultyId)?.name === faculty.name;

          if (isIdMatch || isNameMatch) {
            entries.push({ ...entry, section: tt.section });
          }
        });
      }
    });

    return entries;
  };

  const myTimetable = getFacultyTimetable();

  // Handle class cancellation
  const handleCancelClass = () => {
    if (!selectedEntry || !cancelReason.trim()) {
      setAlertMessage({ title: 'Missing Information', message: 'Please provide a reason for cancellation', variant: 'warning' });
      return;
    }

    // Check if at least 1 hour prior
    const now = new Date();
    const today = DAYS[now.getDay() - 1]; // Adjust for Monday = 0
    const currentHour = now.getHours();

    // Simple validation (in production, this would be more sophisticated)
    if (selectedEntry.day === today) {
      const periodHour = 9 + (selectedEntry.period - 1); // Approximate
      if (currentHour >= periodHour - 1) {
        setAlertMessage({ title: 'Cancellation Rejected', message: 'Cancellation must be at least 1 hour before class', variant: 'danger' });
        setShowCancelModal(false);
        return;
      }
    }

    // Mark as cancelled
    const key = `${selectedEntry.day}_${selectedEntry.period}_${selectedEntry.subjectId}`;
    setCancelledClasses(new Set([...cancelledClasses, key]));
    setShowCancelModal(false);
    setCancelReason('');
    setAlertMessage({ title: 'Success', message: 'Class cancelled successfully!', variant: 'info' });
  };

  const isClassCancelled = (entry: TimetableEntry) => {
    const key = `${entry.day}_${entry.period}_${entry.subjectId}`;
    return cancelledClasses.has(key);
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome, {faculty.name}</h2>
        <p className="text-slate-300">{faculty.designation} • {departments.find(d => d.id === faculty.department)?.name || faculty.department} Department</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{myTimetable.length}</div>
          <div className="text-sm text-slate-400">Total Classes This Week</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{faculty.subjects.length}</div>
          <div className="text-sm text-slate-400">Subjects Teaching</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {new Set(myTimetable.map(e => e.section)).size}
          </div>
          <div className="text-sm text-slate-400">Sections Handling</div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Subjects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faculty.subjects.map(subId => {
            const subject = liveSubjects.find(s => s.id === subId) || SUBJECTS.find(s => s.id === subId);
            return subject ? (
              <div key={subId} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="font-semibold text-white">{subject.subjectName}</div>
                <div className="text-sm text-slate-400">{subject.subjectCode} • {subject.credits} Credits</div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    subject.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {subject.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('my-timetable')}
            className="p-4 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-left"
          >
            <Calendar className="w-6 h-6 mb-2" />
            <div className="font-semibold">View My Timetable</div>
            <div className="text-sm opacity-90">See your weekly schedule</div>
          </button>

          <button
            onClick={() => setActiveTab('other-faculty')}
            className="p-4 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-left"
          >
            <Users className="w-6 h-6 mb-2" />
            <div className="font-semibold">Other Faculty</div>
            <div className="text-sm text-slate-400">View colleague schedules</div>
          </button>

          <button
            onClick={() => setActiveTab('class-timetable')}
            className="p-4 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-left"
          >
            <Eye className="w-6 h-6 mb-2" />
            <div className="font-semibold">Class Timetables</div>
            <div className="text-sm text-slate-400">View section schedules</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMyTimetable = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Timetable</h2>
          <p className="text-slate-300">Your weekly schedule</p>
        </div>
        <button
          onClick={() => {
            const formattedEntries = myTimetable.map(e => {
            const subject = liveSubjects.find(s => s.id === e.subjectId) || SUBJECTS.find(s => s.id === e.subjectId);
            const classroom = liveClassrooms.find(c => c.id === e.classroomId) || CLASSROOMS.find(c => c.id === e.classroomId);
            return {
              ...e,
              subject: subject?.subjectCode,
              section: e.section,
              classroom: classroom?.classroomNumber,
            };
            });
            exportFacultyToPDF(faculty.name, formattedEntries, faculty.department);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Timetable */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Day / Period</th>
                {PERIODS.slice(0, 8).map(period => (
                  <th key={period} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                    <div>P{period}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{PERIOD_TIMINGS[period]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{day}</td>
                  {PERIODS.slice(0, 8).map(period => {
                    const entry = myTimetable.find(e => e.day === day && e.period === period);
                    const subject = entry ? (liveSubjects.find(s => s.id === entry.subjectId) || SUBJECTS.find(s => s.id === entry.subjectId)) : null;
                    const classroom = entry ? (liveClassrooms.find(c => c.id === entry.classroomId) || CLASSROOMS.find(c => c.id === entry.classroomId)) : null;
                    const cancelled = entry ? isClassCancelled(entry) : false;

                    return (
                      <td key={period} className={`px-4 py-3 text-center text-sm relative ${
                        entry?.entryType === 'lab' ? 'bg-purple-500/10' : ''
                      } ${cancelled ? 'bg-red-500/10' : ''}`}>
                        {entry ? (
                          cancelled ? (
                            <div className="text-red-400 font-semibold">CANCELLED</div>
                          ) : (
                            <div className="group">
                              <div className="font-semibold text-white text-xs">{subject?.subjectCode}</div>
                              <div className="text-[10px] text-slate-400">{entry.section}</div>
                              <div className="text-[10px] text-slate-500">{classroom?.classroomNumber}</div>
                              <button
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setShowCancelModal(true);
                                }}
                                className="mt-1 opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-300 transition-opacity"
                              >
                                Cancel
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="text-slate-600">---</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Cancel Class</h3>
                <p className="text-slate-400 text-sm">
                  {SUBJECTS.find(s => s.id === selectedEntry.subjectId)?.subjectName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  Classes can only be cancelled with at least 1 hour prior notice. Cancellation is valid for one day only.
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="Enter reason for cancelling this class..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelClass}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOtherFaculty = () => {
    const deptFaculties = faculties.filter(f => f.department === selectedDept);
    const selectedFaculty = faculties.find(f => f.id === selectedFacultyId);

    const getOtherFacultyTimetable = () => {
      if (!selectedFacultyId) return [];

      const entries: (TimetableEntry & { section: string })[] = [];
      contextTimetables.forEach(tt => {
        tt.entries.forEach((entry: TimetableEntry) => {
          // Robust matching: Try ID first, then fallback to name comparison if IDs are mismatched
          // This handles cases where a faculty record might have been re-created with a new ID
          const isIdMatch = entry.facultyId === selectedFacultyId;
          const isNameMatch = !isIdMatch && selectedFaculty && 
                            faculties.find(f => f.id === entry.facultyId)?.name === selectedFaculty.name;

          if (isIdMatch || isNameMatch) {
            entries.push({ ...entry, section: tt.section });
          }
        });
      });
      return entries;
    };

    const otherTimetable = getOtherFacultyTimetable();

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">View Other Faculty Timetable</h2>
          <p className="text-slate-300">Check schedules of your colleagues</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedFacultyId('');
            }}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} Dept</option>
            ))}
          </select>

          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Faculty</option>
            {deptFaculties.map(f => (
              <option key={f.id} value={f.id}>{f.name} - {f.designation}</option>
            ))}
          </select>
        </div>

        {selectedFaculty && otherTimetable.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">{selectedFaculty.name}</h3>
              <p className="text-sm text-slate-400">{selectedFaculty.designation} • {selectedFaculty.department}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Day / Period</th>
                    {PERIODS.slice(0, 8).map(period => (
                      <th key={period} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                        <div>P{period}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{PERIOD_TIMINGS[period]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {DAYS.map(day => (
                    <tr key={day} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">{day}</td>
                      {PERIODS.slice(0, 8).map(period => {
                        const entry = otherTimetable.find(e => e.day === day && e.period === period);
                        const subject = entry ? liveSubjects.find(s => s.id === entry.subjectId) : null;
                        const classroom = entry ? liveClassrooms.find(c => c.id === entry.classroomId) : null;

                        return (
                          <td key={period} className={`px-4 py-3 text-center text-sm ${
                            entry?.entryType === 'lab' ? 'bg-purple-500/10' : ''
                          }`}>
                            {entry ? (
                              <div>
                                <div className="font-semibold text-white text-xs">{subject?.subjectCode}</div>
                                <div className="text-[10px] text-slate-400">{entry.section}</div>
                                <div className="text-[10px] text-slate-500">{classroom?.classroomNumber}</div>
                              </div>
                            ) : (
                              <div className="text-slate-600">---</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedFacultyId ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No timetable available for this faculty</p>
          </div>
        ) : null}
      </div>
    );
  };

  const renderClassTimetable = () => {
    const timetable = allTimetables.find(tt => tt.department === selectedClassDept && tt.section === selectedSection);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">View Class Timetable</h2>
          <p className="text-slate-300">Check schedules for different sections</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedClassDept}
            onChange={(e) => {
              const dept = e.target.value;
              setSelectedClassDept(dept);
              const firstGroup = groups.find(g => g.department === dept);
              setSelectedSection(firstGroup?.id || '');
            }}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.id}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Section</option>
            {groups.filter(g => g.department === selectedClassDept).map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>

        {timetable ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Day / Period</th>
                    {PERIODS.slice(0, 8).map(period => (
                      <th key={period} className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                        <div>P{period}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{PERIOD_TIMINGS[period]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {DAYS.map(day => (
                    <tr key={day} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">{day}</td>
                      {PERIODS.slice(0, 8).map(period => {
                        const entry = timetable.entries.find(e => e.day === day && e.period === period);
                        const subject = entry ? liveSubjects.find(s => s.id === entry.subjectId) : null;
                        const faculty = entry ? faculties.find(f => f.id === entry.facultyId) : null;
                        const classroom = entry ? liveClassrooms.find(c => c.id === entry.classroomId) : null;
                        const cancelled = entry ? isClassCancelled(entry) : false;

                        return (
                          <td key={period} className={`px-4 py-3 text-center text-sm ${
                            entry?.entryType === 'lab' ? 'bg-purple-500/10' : ''
                          } ${cancelled ? 'bg-red-500/10' : ''}`}>
                            {entry ? (
                              cancelled ? (
                                <div className="text-red-400 font-semibold text-xs">CANCELLED</div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-white text-xs">{subject?.subjectCode}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {faculty?.name ? faculty.name.split(' ').pop() : 'N/A'}
                                  </div>
                                  <div className="text-[10px] text-slate-500">{classroom?.classroomNumber}</div>
                                </div>
                              )
                            ) : (
                              <div className="text-slate-600">---</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No timetable generated for this section</p>
          </div>
        )}
      </div>
    );
  };

  const menuItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'my-timetable' as TabType, label: 'My Timetable', icon: Calendar },
    { id: 'other-faculty' as TabType, label: 'Other Faculty', icon: Users },
    { id: 'class-timetable' as TabType, label: 'Class Timetables', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Schedulix</h1>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'my-timetable' && renderMyTimetable()}
          {activeTab === 'other-faculty' && renderOtherFaculty()}
          {activeTab === 'class-timetable' && renderClassTimetable()}
        </div>
      </main>

      {/* Alert Dialog */}
      <ConfirmDialog
        open={!!alertMessage}
        title={alertMessage?.title || 'Notification'}
        message={alertMessage?.message || ''}
        variant={alertMessage?.variant || 'info'}
        type="alert"
        onConfirm={() => setAlertMessage(null)}
        onCancel={() => setAlertMessage(null)}
      />
    </div>
  );
}
