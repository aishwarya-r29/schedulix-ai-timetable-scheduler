import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Clock, AlertTriangle } from 'lucide-react';
import { Faculty } from '../../data/mockData';
import { useAppData } from '../../context/AppDataContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const INPUT = 'w-full px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
const LABEL = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider';
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all';
const BTN_GHOST = 'px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-all';

const blankForm = (deptId: string = ''): Omit<Faculty, 'id' | 'userId'> => ({
  name: '', email: '', department: deptId, designation: 'Faculty',
  subjects: [], isHOD: false, maxDailySlots: 5, offSlots: [],
  password: 'faculty123',
});

export default function FacultyModule() {
  const { 
    faculties = [], 
    subjects = [], 
    departments = [], 
    addFaculty, 
    updateFaculty, 
    deleteFaculty 
  } = useAppData();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(() => blankForm(departments[0]?.id || ''));
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<Faculty | null>(null);

  const filtered = faculties.filter(f => {
    const q = search.toLowerCase();
    const matchQ = f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
    const matchD = deptFilter === 'All' || f.department === deptFilter;
    return matchQ && matchD;
  });

  const openAdd = () => { setEditId(null); setForm(blankForm(departments[0]?.id || '')); setError(''); setModalOpen(true); };
  const openEdit = (f: Faculty) => {
    setEditId(f.id);
    setForm({ name: f.name, email: f.email, department: f.department, designation: f.designation,
      subjects: f.subjects, isHOD: !!f.isHOD, maxDailySlots: f.maxDailySlots ?? 5,
      offSlots: f.offSlots ?? [], password: f.password });
    setError(''); setModalOpen(true);
  };

  const handleSave = () => {
    const err = editId
      ? updateFaculty({ ...form, id: editId, userId: `u_${editId}` })
      : addFaculty(form);
    if (err) { setError(err); return; }
    setModalOpen(false);
  };

  const handleDelete = (f: Faculty) => setConfirmTarget(f);

  const executeDelete = () => {
    if (confirmTarget) {
      const err = deleteFaculty(confirmTarget.id);
      setConfirmTarget(null);
      if (err) setError(err);
    }
  };

  const toggleSlot = (slot: string) => {
    setForm(p => ({ ...p, offSlots: p.offSlots?.includes(slot)
      ? p.offSlots.filter(s => s !== slot)
      : [...(p.offSlots ?? []), slot] }));
  };

  const toggleSubject = (sId: string) => {
    setForm(p => ({ ...p, subjects: p.subjects.includes(sId)
      ? p.subjects.filter(s => s !== sId)
      : [...p.subjects, sId] }));
  };

  const deptSubjects = subjects.filter(s => s.department === form.department);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Faculty Management</h2>
          <p className="text-slate-400 text-sm mt-1">{faculties.length} faculty members across all departments</p>
        </div>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus className="w-4 h-4" />Add Faculty</button>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                {['Name', 'Email', 'Dept', 'Role', 'Max Slots/Day', 'Off-Slots', 'Subjects', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {f.name ? f.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{f.name}</div>
                        {f.isHOD && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">HOD</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{f.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      f.department === 'CSE' ? 'bg-blue-500/20 text-blue-300' : 
                      f.department === 'IT' ? 'bg-emerald-500/20 text-emerald-300' : 
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {f.department}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{f.designation}</td>
                  <td className="px-5 py-4 text-sm text-slate-300 text-center">{f.maxDailySlots ?? 5}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{f.offSlots?.length ? `${f.offSlots.length} slot(s)` : '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">{f.subjects.length} subject(s)</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg bg-white/5 text-blue-400 hover:bg-blue-500/20 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(f)} className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">No faculty members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">{editId ? 'Edit Faculty' : 'Add Faculty'}</h3>
                <p className="text-slate-400 text-sm mt-0.5">Fill in the faculty details below.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={INPUT} placeholder="Dr. John Smith" />
                </div>
                <div>
                  <label className={LABEL}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={INPUT} placeholder="john@college.edu" />
                </div>
                <div>
                  <label className={LABEL}>Department *</label>
                  <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value, subjects: [] }))} className={INPUT}>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Designation</label>
                  <select value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value, isHOD: e.target.value === 'HOD' }))} className={INPUT}>
                    <option>Faculty</option>
                    <option>HOD</option>
                    <option>Assistant Professor</option>
                    <option>Associate Professor</option>
                    <option>Professor</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Max Daily Slots</label>
                  <input type="number" min={1} max={8} value={form.maxDailySlots} onChange={e => setForm(p => ({ ...p, maxDailySlots: Number(e.target.value) }))} className={INPUT} />
                  <p className="text-xs text-slate-500 mt-1">HOD default = 3, Faculty default = 5</p>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className={LABEL}>Assigned Subjects (for {form.department})</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-800/40 border border-white/10 rounded-xl min-h-[48px]">
                  {deptSubjects.map(s => (
                    <button key={s.id} onClick={() => toggleSubject(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${form.subjects.includes(s.id) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                      {s.subjectCode}
                    </button>
                  ))}
                  {deptSubjects.length === 0 && <span className="text-xs text-slate-500">No subjects in this department yet.</span>}
                </div>
              </div>

              {/* Off-Slots */}
              <div>
                <label className={LABEL}><Clock className="inline w-3 h-3 mr-1" />Preferred Off-Slots (generator will avoid these)</label>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-9 bg-white/5 text-xs text-slate-400 font-semibold">
                    <div className="p-2">Day</div>
                    {PERIODS.map(p => <div key={p} className="p-2 text-center">P{p}</div>)}
                  </div>
                  {DAYS.map(day => (
                    <div key={day} className="grid grid-cols-9 border-t border-white/5">
                      <div className="p-2 text-xs text-slate-300 font-medium">{day.slice(0, 3)}</div>
                      {PERIODS.map(p => {
                        const slot = `${day}_${p}`;
                        const active = form.offSlots?.includes(slot);
                        return (
                          <button key={p} onClick={() => toggleSlot(slot)}
                            className={`m-1 h-7 rounded text-xs transition-all ${active ? 'bg-red-500/40 text-red-300' : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}>
                            {active ? '✕' : ''}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button onClick={() => setModalOpen(false)} className={BTN_GHOST}>Cancel</button>
              <button onClick={handleSave} className={BTN_PRIMARY}>{editId ? 'Save Changes' : 'Add Faculty'}</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Faculty"
        message={confirmTarget ? (
          timetables.some(tt => tt.entries.some(e => e.facultyId === confirmTarget.id))
            ? `Warning: ${confirmTarget.name} appears in existing timetable(s). Those entries will become unresolvable.\n\nDelete anyway?`
            : `Are you sure you want to delete ${confirmTarget.name}?`
        ) : ''}
        onConfirm={executeDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
