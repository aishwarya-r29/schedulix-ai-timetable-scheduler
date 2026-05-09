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
  TIMETABLES,
  Timetable,
  addTimetable,
  getTimetableForSection,
} from '../data/mockData';
import { generateTimetable, validateTimetable } from '../utils/timetableGenerator';
import { fetchFaculties, fetchSubjects, fetchClassrooms, fetchTimetableForSection, saveTimetable } from '../utils/api';
import { loadLocalTimetable, saveLocalTimetable } from '../utils/storage';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

type TabType = 'dashboard' | 'faculty' | 'students' | 'subjects' | 'classrooms' | 'timetable' | 'generate';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Local state for editable data
  const [faculties, setFaculties] = useState<Faculty[]>(FACULTIES);
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(CLASSROOMS);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    subjectName: '',
    subjectCode: '',
    credits: 4,
    department: 'CSE' as 'CSE' | 'IT',
    semester: 4,
    assignedFaculty: [] as string[],
    type: 'theory' as 'theory' | 'lab',
  });

  const resetSubjectForm = () => setSubjectForm({
    id: '',
    subjectName: '',
    subjectCode: '',
    credits: 4,
    department: 'CSE',
    semester: 4,
    assignedFaculty: [],
    type: 'theory',
  });

  const handleSaveSubject = () => {
    const trimmedName = subjectForm.subjectName.trim();
    const trimmedCode = subjectForm.subjectCode.trim();

    if (!trimmedName || !trimmedCode) {
      alert('Subject name and code are required.');
      return;
    }

    const newSubject = {
      ...subjectForm,
      id: modalMode === 'add' ? trimmedCode : subjectForm.id,
      subjectName: trimmedName,
      subjectCode: trimmedCode,
      assignedFaculty: subjectForm.assignedFaculty || [],
    };

    if (modalMode === 'add') {
      if (subjects.some(s => s.id === newSubject.id || s.subjectCode === newSubject.subjectCode)) {
        alert('A subject with this code already exists.');
        return;
      }
      setSubjects([...subjects, newSubject]);
    } else {
      setSubjects(subjects.map(s => (s.id === newSubject.id ? newSubject : s)));
    }

    setShowModal(false);
    resetSubjectForm();
  };

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Timetable generation states
  const [genStep, setGenStep] = useState(1);
  const [genDept, setGenDept] = useState<'CSE' | 'IT'>('CSE');
  const [genSem, setGenSem] = useState(4);
  const [genSection, setGenSection] = useState('CSE G1');
  const [facultyAssignments, setFacultyAssignments] = useState<{ [key: string]: string }>({});

  // Timetable view states
  const [viewDept, setViewDept] = useState<'CSE' | 'IT'>('CSE');
  const [viewSection, setViewSection] = useState('CSE G1');
  const [viewTimetable, setViewTimetable] = useState<Timetable | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [apiFaculties, apiSubjects, apiClassrooms] = await Promise.all([
          fetchFaculties(),
          fetchSubjects(),
          fetchClassrooms(),
        ]);

        if (apiFaculties?.length) setFaculties(apiFaculties);
        if (apiSubjects?.length) setSubjects(apiSubjects);
        if (apiClassrooms?.length) setClassrooms(apiClassrooms);
      } catch (error) {
        console.warn('Backend data fetch failed, using frontend mock data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBackendData();
  }, []);

  const loadSectionTimetable = async (department: 'CSE' | 'IT', section: string) => {
    setViewLoading(true);
    const localTimetable = loadLocalTimetable(department, section) || getTimetableForSection(department, section);
    if (localTimetable) {
      setViewTimetable(localTimetable);
    } else {
      setViewTimetable(null);
    }

    try {
      const remoteTimetable = await fetchTimetableForSection(department, section);
      if (remoteTimetable) {
        setViewTimetable(remoteTimetable);
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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">CSE Students</span>
              <span className="text-white font-semibold">{students.filter(s => s.department === 'CSE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">IT Students</span>
              <span className="text-white font-semibold">{students.filter(s => s.department === 'IT').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">CSE Faculty</span>
              <span className="text-white font-semibold">{faculties.filter(f => f.department === 'CSE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">IT Faculty</span>
              <span className="text-white font-semibold">{faculties.filter(f => f.department === 'IT').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Generated Timetables</h3>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-white mb-2">{TIMETABLES.length}</div>
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

  const renderFacultyManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Faculty Management</h2>
          <p className="text-slate-300">Manage faculty members and their assignments</p>
        </div>
        <button
          onClick={() => {
            setModalMode('add');
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search faculty by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Faculty Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {getFilteredFaculties().map((faculty) => (
                <tr key={faculty.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{faculty.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{faculty.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{faculty.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{faculty.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {faculty.subjects.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setSelectedItem(faculty);
                        setShowModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${faculty.name}?`)) {
                          setFaculties(faculties.filter(f => f.id !== faculty.id));
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Student Management</h2>
          <p className="text-slate-300">Manage student records and assignments</p>
        </div>
        <button
          onClick={() => {
            setModalMode('add');
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students by name, roll number, or email..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-white/10 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {getFilteredStudents().slice(0, 50).map((student) => (
                <tr key={student.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setSelectedItem(student);
                        setShowModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${student.name}?`)) {
                          setStudents(students.filter(s => s.id !== student.id));
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-white/5 text-sm text-slate-400">
          Showing {Math.min(50, getFilteredStudents().length)} of {getFilteredStudents().length} students
        </div>
      </div>
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSE Subjects */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">CSE Subjects</h3>
          <div className="space-y-3">
            {subjects.filter(s => s.department === 'CSE').map(subject => (
              <div key={subject.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-white">{subject.subjectName}</div>
                    <div className="text-sm text-slate-400">{subject.subjectCode} • {subject.credits} Credits</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    subject.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {subject.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Faculty: {subject.assignedFaculty.length} assigned
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
                    className="px-2 py-1 bg-white/10 text-white rounded-md text-xs hover:bg-white/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${subject.subjectName}?`)) {
                        setSubjects(subjects.filter(s => s.id !== subject.id));
                      }
                    }}
                    className="px-2 py-1 bg-red-500/10 text-red-300 rounded-md text-xs hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IT Subjects */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">IT Subjects</h3>
          <div className="space-y-3">
            {subjects.filter(s => s.department === 'IT').map(subject => (
              <div key={subject.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-white">{subject.subjectName}</div>
                    <div className="text-sm text-slate-400">{subject.subjectCode} • {subject.credits} Credits</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    subject.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {subject.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Faculty: {subject.assignedFaculty.length} assigned
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
                    className="px-2 py-1 bg-white/10 text-white rounded-md text-xs hover:bg-white/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${subject.subjectName}?`)) {
                        setSubjects(subjects.filter(s => s.id !== subject.id));
                      }
                    }}
                    className="px-2 py-1 bg-red-500/10 text-red-300 rounded-md text-xs hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClassroomManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Classroom Management</h2>
          <p className="text-slate-300">Manage classroom inventory and status</p>
        </div>
        <button
          onClick={() => {
            setModalMode('add');
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Classroom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map(classroom => (
          <div key={classroom.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                classroom.status === 'available' ? 'bg-green-500/20 text-green-300' :
                classroom.status === 'occupied' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {classroom.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{classroom.classroomNumber}</h3>
            <p className="text-slate-400 text-sm mb-4">Capacity: {classroom.capacity} students</p>
            <div className="flex gap-2">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${classroom.classroomNumber}?`)) {
                    setClassrooms(classrooms.filter(c => c.id !== classroom.id));
                  }
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderViewTimetables = () => {
      const sections = viewDept === 'CSE' ? ['CSE G1', 'CSE G2'] : ['IT G1', 'IT G2'];
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
              const nextDept = e.target.value as 'CSE' | 'IT';
              setViewDept(nextDept);
              setViewSection(nextDept === 'CSE' ? 'CSE G1' : 'IT G1');
            }}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
          </select>

          <select
            value={viewSection}
            onChange={(e) => setViewSection(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {timetable && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => exportToPDF(timetable)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => exportToExcel(timetable)}
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
                        const subject = entry ? subjects.find(s => s.id === entry.subjectId) : null;
                        const faculty = entry ? faculties.find(f => f.id === entry.facultyId) : null;
                        const classroom = entry ? classrooms.find(c => c.id === entry.classroomId) : null;

                        return (
                          <td key={period} className={`px-4 py-3 text-center text-sm ${
                            entry?.entryType === 'lab' ? 'bg-purple-500/10' : ''
                          }`}>
                            {entry && !entry.isCancelled ? (
                              <div>
                                <div className="font-semibold text-white text-xs">{subject?.subjectCode}</div>
                                <div className="text-[10px] text-slate-300">{subject?.subjectName}</div>
                                <div className="text-[10px] text-slate-400">{faculty?.name.split(' ').pop()}</div>
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
      const sectionSubjects = subjects.filter(
        s => s.department === genDept && s.semester === genSem
      );

      // Validate all subjects have faculty assigned
      const unassignedSubjects = sectionSubjects.filter(s => !facultyAssignments[s.id]);
      if (unassignedSubjects.length > 0) {
        alert(`Cannot generate: Missing faculty assignment for ${unassignedSubjects.map(s => s.subjectCode).join(', ')}`);
        return;
      }

      console.log('Generating timetable with faculty assignments:', facultyAssignments);

      const otherSection = genSection.endsWith('G1') ? `${genDept} G2` : `${genDept} G1`;
      let existingTimetableEntries: any[] = [];

      const localOtherTimetable = loadLocalTimetable(genDept, otherSection) || getTimetableForSection(genDept, otherSection);
      if (localOtherTimetable?.entries) {
        existingTimetableEntries = localOtherTimetable.entries;
      }

      try {
        const remoteOtherTimetable = await fetchTimetableForSection(genDept, otherSection);
        if (remoteOtherTimetable?.entries?.length) {
          existingTimetableEntries = remoteOtherTimetable.entries;
        }
      } catch (error) {
        console.warn(`Unable to fetch ${otherSection} timetable for cross-group validation:`, error);
      }

      const facultyProfiles = faculties.reduce((map, faculty) => {
        map[faculty.id] = { isHOD: !!faculty.isHOD, maxDailySlots: faculty.isHOD ? 3 : 5 };
        return map;
      }, {} as { [facultyId: string]: { isHOD?: boolean; maxDailySlots?: number } });

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

      console.log('Generated timetable entries:', timetable.entries.map(e => ({
        day: e.day,
        period: e.period,
        subject: sectionSubjects.find(s => s.id === e.subjectId)?.subjectCode,
        facultyId: e.facultyId,
        selectedFacultyId: facultyAssignments[e.subjectId],
        match: e.facultyId === facultyAssignments[e.subjectId]
      })));

      const validation = validateTimetable(timetable);

      if (!validation.valid) {
        alert('Timetable generation failed: ' + validation.conflicts.join(', '));
        return;
      }

      addTimetable(timetable);
      saveLocalTimetable(timetable);
      if (viewDept === genDept && viewSection === genSection) {
        setViewTimetable(timetable);
      }

      const response = await saveTimetable(timetable).catch((error) => {
        console.error('Timetable save failed:', error);
        return null;
      });
      if (response?.success) {
        alert('Timetable generated and saved to the database successfully!');
      } else {
        alert('Timetable generated locally; backend save failed or is unavailable. Check browser console for details.');
      }

      setGenStep(1);
      setFacultyAssignments({});
      setActiveTab('timetable');
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
                    setGenDept(e.target.value as 'CSE' | 'IT');
                    setGenSection(e.target.value === 'CSE' ? 'CSE G1' : 'IT G1');
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CSE">Computer Science Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                <select
                  value={genSem}
                  onChange={(e) => setGenSem(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="4">4th Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Section</label>
                <select
                  value={genSection}
                  onChange={(e) => setGenSection(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(genDept === 'CSE' ? ['CSE G1', 'CSE G2'] : ['IT G1', 'IT G2']).map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setGenStep(2)}
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
                      alert(`Please assign faculty to: ${unassignedSubjects.map(s => s.subjectCode).join(', ')}`);
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
                  onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value as 'CSE' | 'IT' })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
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
    </div>
  );
}
