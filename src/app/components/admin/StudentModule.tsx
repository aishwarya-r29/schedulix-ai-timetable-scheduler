import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { Student } from '../../data/mockData';
import { useAppData } from '../../context/AppDataContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const INPUT = 'w-full px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
const LABEL = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider';
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all';
const BTN_GHOST = 'px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-all';

const blankForm = (deptId: string = '', sectionId: string = '', groupName: string = ''): Omit<Student, 'id' | 'userId'> => ({
  name: '', email: '', rollNumber: '', department: deptId,
  semester: 4, section: sectionId, group: groupName, password: 'student123',
});

export default function StudentModule() {
  const { 
    students = [], 
    groups = [], 
    departments = [], 
    addStudent, 
    updateStudent, 
    deleteStudent 
  } = useAppData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(() => {
    const d = departments[0]?.id || '';
    const g = groups.find(grp => grp.department === d);
    return blankForm(d, g?.id || '', g?.name || '');
  });
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<Student | null>(null);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchD = deptFilter === 'All' || s.department === deptFilter;
    return matchQ && matchD;
  });

  const deptGroups = groups.filter(g => g.department === form.department);

  const openAdd = () => {
    setEditId(null);
    const firstDept = departments[0]?.id || '';
    const firstGroup = groups.find(g => g.department === firstDept);
    setForm(blankForm(firstDept, firstGroup?.id || '', firstGroup?.name || ''));
    setError('');
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditId(s.id);
    setForm({ name: s.name, email: s.email, rollNumber: s.rollNumber, department: s.department, semester: s.semester, section: s.section, group: s.group ?? '', password: s.password });
    setError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    const err = editId
      ? updateStudent({ ...form, id: editId, userId: form.rollNumber })
      : addStudent(form);
    if (err) { setError(err); return; }
    setModalOpen(false);
  };

  const handleDelete = (s: Student) => setConfirmTarget(s);

  const executeDelete = () => {
    if (confirmTarget) {
      const err = deleteStudent(confirmTarget.id);
      setConfirmTarget(null);
      if (err) setError(err);
    }
  };

  const handleDeptChange = (dept: string) => {
    const firstGroup = groups.find(g => g.department === dept);
    setForm(p => ({ ...p, department: dept, section: firstGroup?.id ?? '', group: firstGroup?.name ?? '' }));
  };

  const handleSectionChange = (sectionId: string) => {
    const grp = groups.find(g => g.id === sectionId);
    setForm(p => ({ ...p, section: sectionId, group: grp?.name ?? '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Student Management</h2>
          <p className="text-slate-400 text-sm mt-1">{students.length} students across all departments</p>
        </div>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus className="w-4 h-4" />Add Student</button>
      </div>
      
      {error && !modalOpen && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 text-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, roll number or email…"
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        {['All', ...departments.map(d => d.id)].map(d => (
          <button key={d} onClick={() => setDeptFilter(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${deptFilter === d ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {d}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full">
            <thead className="bg-white/5 sticky top-0">
              <tr>
                {['Roll No', 'Name', 'Email', 'Dept', 'Section', 'Sem', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 60).map(s => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-3 text-sm font-mono text-indigo-300">{s.rollNumber}</td>
                  <td className="px-5 py-3 text-sm text-white">{s.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-300">{s.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      s.department === 'CSE' ? 'bg-blue-500/20 text-blue-300' : 
                      s.department === 'IT' ? 'bg-emerald-500/20 text-emerald-300' : 
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {s.department}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-300">{s.section}</td>
                  <td className="px-5 py-3 text-sm text-slate-300">{s.semester}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-white/5 text-blue-400 hover:bg-blue-500/20 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-white/5 text-xs text-slate-500">
          Showing {Math.min(60, filtered.length)} of {filtered.length} students
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">{editId ? 'Edit Student' : 'Add Student'}</h3>
                <p className="text-slate-400 text-sm mt-0.5">Fill in the student details below.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-8 py-6 space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={INPUT} placeholder="Aarav Sharma" />
                </div>
                <div>
                  <label className={LABEL}>Roll Number *</label>
                  <input value={form.rollNumber} onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value }))} disabled={!!editId} className={`${INPUT} ${editId ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="24i201" />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={INPUT} placeholder="student@gmail.com" />
                </div>
                <div>
                  <label className={LABEL}>Department *</label>
                  <select value={form.department} onChange={e => handleDeptChange(e.target.value)} className={INPUT}>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Class Group / Section *</label>
                  <select value={form.section} onChange={e => handleSectionChange(e.target.value)} className={INPUT}>
                    {deptGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.id} ({g.studentIds.length} students)</option>
                    ))}
                    {deptGroups.length === 0 && <option value="">No groups in this department</option>}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Semester</label>
                  <input type="number" min={1} max={8} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: Number(e.target.value) }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Password</label>
                  <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={INPUT} placeholder="student123" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button onClick={() => setModalOpen(false)} className={BTN_GHOST}>Cancel</button>
              <button onClick={handleSave} className={BTN_PRIMARY}>{editId ? 'Save Changes' : 'Add Student'}</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Student"
        message={confirmTarget ? `Are you sure you want to delete ${confirmTarget.name} (${confirmTarget.rollNumber})?` : ''}
        onConfirm={executeDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
