import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Users,
  BookOpen,
  Building2,
  Calendar,
  BarChart3,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  X,
  Check,
  Sparkles,
  FileDown,
  Menu,
  Home,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  FACULTIES,
  STUDENTS,
  SUBJECTS,
  CLASSROOMS,
  Faculty,
  Student,
  Subject,
  Classroom,
  DAYS,
  PERIODS,
  PERIOD_TIMINGS,
  Timetable,
} from '../data/mockData';
import { generateTimetable, validateTimetable } from '../utils/timetableGenerator';
import { fetchFaculties, fetchSubjects, fetchClassrooms, fetchTimetableForSection, saveTimetable } from '../utils/api';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { useAppData } from '../context/AppDataContext';
import FacultyModule from './admin/FacultyModule';
import StudentModule from './admin/StudentModule';
import ClassroomModule from './admin/ClassroomModule';
import DepartmentModule from './admin/DepartmentModule';
import ConfirmDialog from './ui/ConfirmDialog';

type TabType = 'dashboard' | 'faculty' | 'students' | 'subjects' | 'classrooms' | 'timetable' | 'generate' | 'departments';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use AppDataContext for all live CRUD-able data
  const { 
    faculties = [], 
    students = [], 
    subjects = [], 
    classrooms = [], 
    groups = [], 
    departments = [], 
    timetables = [], 
    saveTimetableToStore, 
    addSubject, 
    updateSubject, 
    deleteSubject,
    loading
  } = useAppData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Initializing Dashboard Data...</p>
        </div>
      </div>
    );
  }

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Custom dialog states
  const [confirmTarget, setConfirmTarget] = useState<{ id: string, name: string, type: 'subject' } | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ title: string, message: string, variant: 'info' | 'danger' | 'warning' } | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    subjectName: '',
    subjectCode: '',
    credits: 4,
    department: departments[0]?.id || '' as string,
    semester: 4,
    assignedFaculty: [] as string[],
    type: 'theory' as 'theory' | 'lab',
  });

  const resetSubjectForm = () => setSubjectForm({
    id: '',
    subjectName: '',
    subjectCode: '',
    credits: 4,
    department: departments[0]?.id || '',
    semester: 4,
    assignedFaculty: [],
    type: 'theory',
  });

  const handleSaveSubject = () => {
    const trimmedName = subjectForm.subjectName.trim();
    const trimmedCode = subjectForm.subjectCode.trim();

    if (!trimmedName || !trimmedCode) {
      setAlertMessage({ title: 'Validation Error', message: 'Subject name and code are required.', variant: 'warning' });
      return;
    }

    const subjectPayload = {
      ...subjectForm,
      id: modalMode === 'add' ? trimmedCode : subjectForm.id,
      subjectName: trimmedName,
      subjectCode: trimmedCode,
      assignedFaculty: subjectForm.assignedFaculty || [],
    };

    if (modalMode === 'add') {
      const err = addSubject(subjectPayload);
      if (err) { setAlertMessage({ title: 'Error', message: err, variant: 'danger' }); return; }
    } else {
      const err = updateSubject(subjectPayload);
      if (err) { setAlertMessage({ title: 'Error', message: err, variant: 'danger' }); return; }
    }

    setShowModal(false);
    resetSubjectForm();
  };

  const executeDelete = () => {
    if (!confirmTarget) return;
    if (confirmTarget.type === 'subject') {
      const err = deleteSubject(confirmTarget.id);
      if (err) setAlertMessage({ title: 'Error', message: err, variant: 'danger' });
    }
    setConfirmTarget(null);
  };

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Timetable generation states
  const [genStep, setGenStep] = useState(1);
  const [genDept, setGenDept] = useState<string>(() => departments[0]?.id || '');
  const [genSem, setGenSem] = useState(4);
  const [genSection, setGenSection] = useState(() => groups[0]?.id || '');
  const [facultyAssignments, setFacultyAssignments] = useState<{ [key: string]: string }>({});

  // Timetable view states
  const [viewDept, setViewDept] = useState<string>(() => departments[0]?.id || '');
  const [viewSection, setViewSection] = useState(() => groups[0]?.id || '');
  const [viewTimetable, setViewTimetable] = useState<Timetable | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // All data (faculties, students, subjects, classrooms) is now managed by AppDataContext.
    // Just mark loading as complete.
    setLoadingData(false);
  }, []);

  // Sync genDept/genSection and viewDept/viewSection when data loads or changes
  useEffect(() => {
    if (!loading && departments.length > 0) {
      // Initialize genDept if not set
      if (!genDept) {
        setGenDept(departments[0].id);
      }
      
      // If genDept is set but genSection is empty or invalid, try to pick the first available group
      const deptGroups = groups.filter(g => g.department === genDept);
      if (genDept && deptGroups.length > 0 && (!genSection || !deptGroups.some(g => g.id === genSection))) {
        setGenSection(deptGroups[0].id);
      }

      // Same for view state
      if (!viewDept) {
        setViewDept(departments[0].id);
      }
      const viewDeptGroups = groups.filter(g => g.department === viewDept);
      if (viewDept && viewDeptGroups.length > 0 && (!viewSection || !viewDeptGroups.some(g => g.id === viewSection))) {
        setViewSection(viewDeptGroups[0].id);
      }
    }
  }, [loading, departments, groups, genDept, viewDept, genSection, viewSection]);

  const loadSectionTimetable = async (department: string, section: string) => {
    setViewLoading(true);
    const localTimetable = timetables.find(t => t.department === department && t.section === section);
    if (localTimetable) {
      setViewTimetable(localTimetable);
    } else {
      setViewTimetable(null);
    }

    try {
      const remoteTimetable = await fetchTimetableForSection(department, section);
      if (remoteTimetable) {
        setViewTimetable(remoteTimetable);
      } else {
        setViewTimetable(null);
      }
    } catch (error) {
      console.warn('Unable to fetch timetable from backend:', error);
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'timetable') {
      loadSectionTimetable(viewDept, viewSection);
    }
  }, [activeTab, viewDept, viewSection]);

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
    { id: 'faculty' as TabType, label: 'Faculty Management', icon: Users },
    { id: 'students' as TabType, label: 'Student Management', icon: BookOpen },
    { id: 'subjects' as TabType, label: 'Subject Management', icon: Brain },
    { id: 'classrooms' as TabType, label: 'Classroom Management', icon: Building2 },
    { id: 'timetable' as TabType, label: 'View Timetables', icon: Calendar },
    { id: 'generate' as TabType, label: 'Generate Timetable', icon: Sparkles },
    { id: 'departments' as TabType, label: 'Department Management', icon: Layers },
  ];

  // Filter functions
  const getFilteredFaculties = () => {
    return faculties.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredStudents = () => {
    return students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render functions for each tab
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome, Admin</h2>
        <p className="text-slate-300">Overview of Schedulix system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: students.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Faculty', value: faculties.length, icon: Users, color: 'from-violet-500 to-purple-500' },
          { label: 'Total Classrooms', value: classrooms.length, icon: Building2, color: 'from-indigo-500 to-blue-500' },
          { label: 'Total Subjects', value: subjects.length, icon: Brain, color: 'from-pink-500 to-rose-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Department Statistics</h3>
          <div className="space-y-4">
            {(departments || []).map(dept => (
              <div key={dept.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-xs">{dept.name}</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded uppercase">{dept.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Students</span>
                    <span className="text-lg font-bold text-white">{students.filter(s => s.department === dept.id).length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Faculty</span>
                    <span className="text-lg font-bold text-white">{faculties.filter(f => f.department === dept.id).length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Generated Timetables</h3>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-white mb-2">{timetables.length}</div>
            <p className="text-slate-400">Total Timetables Generated</p>
            <button
              onClick={() => setActiveTab('generate')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Generate New Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacultyManagement = () => <FacultyModule />;

  const renderStudentManagement = () => <StudentModule />;

  const renderSubjectManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Subject Management</h2>
          <p className="text-slate-300">Manage subjects and faculty assignments</p>
        </div>
        <button
          onClick={() => {
            resetSubjectForm();
            setModalMode('add');
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{dept.name} Subjects</h3>
            <div className="space-y-3">
              {subjects.filter(s => s.department === dept.id).map(subject => (
                <div key={subject.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-white">{subject.subjectName}</div>
                      <div className="text-sm text-slate-400">{subject.subjectCode} • {subject.credits} Credits</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      subject.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {subject.type}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setSelectedItem(subject);
                        setSubjectForm({
                          id: subject.id,
                          subjectName: subject.subjectName,
                          subjectCode: subject.subjectCode,
                          credits: subject.credits,
                          department: subject.department,
                          semester: subject.semester,
                          assignedFaculty: subject.assignedFaculty,
                          type: subject.type,
                        });
                        setShowModal(true);
                      }}
                      className="px-2 py-1 bg-white/10 text-white rounded-md text-xs hover:bg-white/20 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmTarget({ id: subject.id, name: subject.subjectName, type: 'subject' })}
                      className="px-2 py-1 bg-red-500/10 text-red-300 rounded-md text-xs hover:bg-red-500/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {subjects.filter(s => s.department === dept.id).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm italic">No subjects added.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClassroomManagement = () => <ClassroomModule />;

  const renderViewTimetables = () => {
    const sections = groups.filter(g => g.department === viewDept).map(g => g.id);
    const timetable = viewTimetable;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">View Timetables</h2>
          <p className="text-slate-300">View and export generated timetables</p>
        </div>

        {/* Selectors */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={viewDept}
            onChange={(e) => {
              const nextDept = e.target.value;
              setViewDept(nextDept);
              const firstGroup = groups.find(g => g.department === nextDept);
              setViewSection(firstGroup?.id || '');
            }}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={viewSection}
            onChange={(e) => setViewSection(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(groups || []).filter(g => g.department === viewDept).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {timetable && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={async () => {
                  console.log('Export PDF clicked');
                  console.log('Timetable to export:', timetable);
                  try {
                    await exportToPDF(timetable);
                  } catch (error) {
                    console.error('PDF export failed:', error);
                    alert('Failed to export PDF. Please try again.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={async () => {
                  console.log('Export Excel clicked');
                  try {
                    await exportToExcel(timetable);
                  } catch (error) {
                    console.error('Excel export failed:', error);
                    alert('Failed to export Excel. Please try again.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                <FileDown className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          )}
        </div>

        {viewLoading && !timetable && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-slate-300">
            Loading timetable...
          </div>
        )}

        {/* Timetable Display */}
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
                        const subject = entry ? (subjects.find(s => s.id === entry.subjectId)) : null;
                        const faculty = entry ? (faculties.find(f => f.id === entry.facultyId) || faculties.find(f => f.name === (entry as any).facultyName)) : null;
                        const classroom = entry ? (classrooms.find(c => c.id === entry.classroomId)) : null;

                        // Log what the UI displays
                        console.log(`UI Display - ${day} P${period}:`, {
                          entry: entry ? {
                            subjectId: entry.subjectId,
                            facultyId: entry.facultyId,
                            classroomId: entry.classroomId,
                            isCancelled: entry.isCancelled
                          } : null,
                          subject: subject?.subjectCode,
                          faculty: faculty?.name,
                          classroom: classroom?.classroomNumber
                        });

                        return (
                          <td key={period} className={`px-4 py-3 text-center text-sm ${
                            entry?.entryType === 'lab' ? 'bg-purple-500/10' : ''
                          }`}>
                            {entry && !entry.isCancelled ? (
                              <div>
                                <div className="font-semibold text-white text-xs">{subject?.subjectCode}</div>
                                <div className="text-[10px] text-slate-300">{subject?.subjectName}</div>
                                <div className="text-[10px] text-slate-400">{faculty?.name ? faculty.name.split(' ').pop() : 'N/A'}</div>
                                <div className="text-[10px] text-slate-500">{classroom?.classroomNumber}</div>
                              </div>
                            ) : entry?.isCancelled ? (
                              <div className="text-red-400 text-xs">Cancelled</div>
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
            <h3 className="text-xl font-semibold text-white mb-2">No Timetable Generated</h3>
            <p className="text-slate-400 mb-6">Generate a timetable for this section to view it here.</p>
            <button
              onClick={() => setActiveTab('generate')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Generate Timetable
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGenerateTimetable = () => {
    const handleGenerate = async () => {
      if (!genDept || !genSection) {
        setAlertMessage({ title: 'Missing Info', message: 'Please ensure Department and Section are selected in Step 1.', variant: 'warning' });
        return;
      }
      try {
        const sectionSubjects = subjects.filter(
          s => s.department === genDept && s.semester === genSem
        );

        if (sectionSubjects.length === 0) {
          setAlertMessage({ title: 'Validation Error', message: `No subjects found for ${genDept} Semester ${genSem}. Please add subjects first.`, variant: 'warning' });
          return;
        }
        // Validate all subjects have faculty assigned
        const unassignedSubjects = sectionSubjects.filter(s => !facultyAssignments[s.id]);
        if (unassignedSubjects.length > 0) {
          setAlertMessage({ title: 'Missing Faculty', message: `Cannot generate: Missing faculty assignment for ${unassignedSubjects.map(s => s.subjectCode).join(', ')}`, variant: 'warning' });
          return;
        }

        // Check for classrooms
        const theoryRooms = classrooms.filter(c => c.roomType === 'theory' && c.status === 'available');
        const labRooms = classrooms.filter(c => c.roomType === 'lab' && c.status === 'available');

        if (theoryRooms.length === 0 && sectionSubjects.some(s => s.type === 'theory')) {
          setAlertMessage({ title: 'Classroom Conflict', message: 'No available theory classrooms found. Please add classrooms in the Classroom Management module.', variant: 'danger' });
          return;
        }

        if (labRooms.length === 0 && sectionSubjects.some(s => s.type === 'lab')) {
          setAlertMessage({ title: 'Classroom Conflict', message: 'No available lab classrooms found. Please add lab classrooms in the Classroom Management module.', variant: 'danger' });
          return;
        }

        console.log('Generating timetable with faculty assignments:', facultyAssignments);

        // Aggregate ALL existing entries from ALL departments/sections for global resource locking
        // This ensures no faculty or classroom is double-booked across the entire institution.
        const existingTimetableEntries = timetables
          .filter(tt => tt.department !== genDept || tt.section !== genSection)
          .flatMap(tt => tt.entries || []);

        console.log(`Global locking enabled: ${existingTimetableEntries.length} existing entries considered.`);

        const facultyProfiles = faculties.reduce((map, faculty) => {
          map[faculty.id] = { 
            isHOD: !!faculty.isHOD, 
            maxDailySlots: faculty.maxDailySlots || (faculty.isHOD ? 3 : 5),
            offSlots: faculty.offSlots || []
          };
          return map;
        }, {} as Record<string, any>);

        const timetable = generateTimetable({
          department: genDept,
          semester: genSem,
          section: genSection,
          subjects: sectionSubjects,
          facultyAssignments,
          classrooms,
          existingTimetableEntries,
          facultyProfiles,
        });

        console.log('Generated timetable entries:', timetable.entries.length, 'entries');

        const validation = validateTimetable(timetable, sectionSubjects, existingTimetableEntries);

        const saved = await saveTimetableToStore(timetable);
        
        if (!validation.valid) {
          const hasFacultyConflict = validation.conflicts.some(c => c.toLowerCase().includes('faculty') || c.toLowerCase().includes('busy'));
          setAlertMessage({ 
            title: 'Resource Conflicts Detected', 
            message: 'Timetable generation had conflicts:\n' + validation.conflicts.join('\n') + 
              (hasFacultyConflict ? '\n\nIMPORTANT: Some faculty members are already slotted in other classes. Consider adding/assigning another faculty member to these subjects.' : '') +
              '\n\nThe timetable was saved locally but ' + (saved ? 'was also synced to DB.' : 'failed to sync to DB.'), 
            variant: 'danger' 
          });
        } else if (saved) {
          setAlertMessage({ title: 'Success', message: 'Timetable generated and saved successfully to database!', variant: 'info' });
        } else {
          setAlertMessage({ title: 'Sync Error', message: 'Timetable generated successfully but failed to save to the database. It is currently only available in your local session.', variant: 'danger' });
        }
        setViewTimetable(timetable); // Update the view immediately

        setGenStep(1);
        setFacultyAssignments({});
        setActiveTab('timetable');
        setViewDept(genDept);
        setViewSection(genSection);
      } catch (error: any) {
        console.error('Timetable generation error:', error);
        setAlertMessage({ title: 'Generation Failed', message: `Timetable generation failed: ${error?.message || 'Unknown error'}. Check browser console for details.`, variant: 'danger' });
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            AI Timetable Generation
          </h2>
          <p className="text-slate-300">Automatically generate conflict-free timetables using AI algorithms</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                genStep >= step ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white' : 'bg-white/10 text-slate-500'
              }`}>
                {step}
              </div>
              {step < 3 && <div className="w-12 h-0.5 bg-white/20"></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Select Section */}
        {genStep === 1 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Step 1: Select Section</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <select
                  value={genDept}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setGenDept(dept);
                    const filteredGroups = groups.filter(g => g.department === dept);
                    setGenSection(filteredGroups.length > 0 ? filteredGroups[0].id : '');
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.fullName || d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                <select
                  value={genSem}
                  onChange={(e) => setGenSem(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[4].map(s => (
                    <option key={s} value={s}>{s}th Semester</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Section</label>
                <select
                  value={genSection}
                  onChange={(e) => setGenSection(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {groups.filter(g => g.department === genDept).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (!genDept || !genSection) {
                    setAlertMessage({ 
                      title: 'Selection Required', 
                      message: 'Please select both a Department and a Section (Group) before proceeding. If no sections are available, please create one in the Department Management module.', 
                      variant: 'warning' 
                    });
                    return;
                  }
                  setGenStep(2);
                }}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Next: Assign Faculty
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Assign Faculty */}
        {genStep === 2 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Step 2: Assign Faculty to Subjects</h3>
            <div className="space-y-4">
              {subjects.filter(s => s.department === genDept && s.semester === genSem).map(subject => (
                <div key={subject.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{subject.subjectName}</div>
                      <div className="text-sm text-slate-400">{subject.subjectCode} • {subject.type}</div>
                    </div>
                    <select
                      value={facultyAssignments[subject.id] || ''}
                      onChange={(e) => setFacultyAssignments({ ...facultyAssignments, [subject.id]: e.target.value })}
                      className="w-64 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Faculty</option>
                      {faculties
                        .filter(f => f.department === genDept)
                        .sort((a, b) => {
                          const aAssigned = subject.assignedFaculty?.includes(a.id) ? 0 : 1;
                          const bAssigned = subject.assignedFaculty?.includes(b.id) ? 0 : 1;
                          return aAssigned - bAssigned;
                        })
                        .map(faculty => (
                          <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setGenStep(1)}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const unassignedSubjects = subjects
                      .filter(s => s.department === genDept && s.semester === genSem)
                      .filter(s => !facultyAssignments[s.id]);

                    if (unassignedSubjects.length > 0) {
                      setAlertMessage({ title: 'Missing Faculty', message: `Please assign faculty to: ${unassignedSubjects.map(s => s.subjectCode).join(', ')}`, variant: 'warning' });
                      return;
                    }

                    setGenStep(3);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Next: Generate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {genStep === 3 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Generate!</h3>
            <p className="text-slate-300 mb-2">Department: {genDept} | Section: {genSection}</p>
            <p className="text-slate-400 mb-8">The AI algorithm will create an optimized, conflict-free timetable.</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGenStep(2)}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Generate Timetable
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black/20 backdrop-blur-sm border-r border-white/10 transition-all duration-300 flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <h1 className="text-xl font-bold text-white">Schedulix</h1>}
          </div>
        </div>

        <nav className="flex-1 px-3">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchTerm('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
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
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'faculty' && renderFacultyManagement()}
          {activeTab === 'students' && renderStudentManagement()}
          {activeTab === 'subjects' && renderSubjectManagement()}
          {activeTab === 'classrooms' && renderClassroomManagement()}
          {activeTab === 'timetable' && renderViewTimetables()}
          {activeTab === 'generate' && renderGenerateTimetable()}
          {activeTab === 'departments' && <DepartmentModule />}
        </div>
      </main>
      {showModal && activeTab === 'subjects' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{modalMode === 'add' ? 'Add Subject' : 'Edit Subject'}</h2>
                <p className="text-slate-400 text-sm">Enter the subject details below.</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetSubjectForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Name</span>
                <input
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Code</span>
                <input
                  value={subjectForm.subjectCode}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Department</span>
                <select
                  value={subjectForm.department}
                  onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Type</span>
                <select
                  value={subjectForm.type}
                  onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as 'theory' | 'lab' })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Credits</span>
                <input
                  type="number"
                  min={1}
                  value={subjectForm.credits}
                  onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Semester</span>
                <select
                  value={subjectForm.semester}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value={4}>4</option>
                </select>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetSubjectForm();
                }}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubject}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:shadow-lg"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Record"
        message={`Are you sure you want to delete ${confirmTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        type="confirm"
        onConfirm={executeDelete}
        onCancel={() => setConfirmTarget(null)}
      />

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
