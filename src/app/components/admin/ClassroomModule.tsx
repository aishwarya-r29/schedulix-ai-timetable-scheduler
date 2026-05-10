import { useState } from 'react';
import { Plus, Edit, Trash2, X, AlertTriangle, Building2, FlaskConical, BookOpen } from 'lucide-react';
import { Classroom } from '../../data/mockData';
import { useAppData } from '../../context/AppDataContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const INPUT = 'w-full px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
const LABEL = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider';
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all';
const BTN_GHOST = 'px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-all';

const blankForm = (): Omit<Classroom, 'id'> => ({
  classroomNumber: '',
  capacity: 60,
  status: 'available',
  roomType: 'theory',
  departmentPriority: 'Both',
});

export default function ClassroomModule() {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom, departments } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'theory' | 'lab'>('All');
  const [confirmTarget, setConfirmTarget] = useState<Classroom | null>(null);

  const filtered = typeFilter === 'All' ? classrooms : classrooms.filter(c => c.roomType === typeFilter);

  const openAdd = () => {
    setEditId(null);
    setForm(blankForm());
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: Classroom) => {
    setEditId(c.id);
    setForm({
      classroomNumber: c.classroomNumber,
      capacity: c.capacity,
      status: c.status,
      roomType: c.roomType,
      departmentPriority: c.departmentPriority ?? 'Both',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    const err = editId
      ? updateClassroom({ ...form, id: editId })
      : addClassroom(form);
    if (err) { setError(err); return; }
    setModalOpen(false);
  };

  const handleDelete = (c: Classroom) => setConfirmTarget(c);

  const executeDelete = () => {
    if (confirmTarget) {
      const err = deleteClassroom(confirmTarget.id);
      if (err) {
        setError(err);
      } else {
        setConfirmTarget(null);
      }
    }
  };

  const statusColor = (s: string) =>
    s === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
    s === 'occupied'  ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-300';

  const typeIcon = (t: string) =>
    t === 'lab' ? <FlaskConical className="w-5 h-5 text-purple-400" /> : <BookOpen className="w-5 h-5 text-blue-400" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Classroom Management</h2>
          <p className="text-slate-400 text-sm mt-1">{classrooms.length} rooms · {classrooms.filter(c => c.roomType === 'lab').length} labs</p>
        </div>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus className="w-4 h-4" />Add Classroom</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(['All', 'theory', 'lab'] as const).map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${typeFilter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {f === 'All' ? 'All' : f === 'theory' ? 'Theory Rooms' : 'Labs'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all group relative">
            {/* Type badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                {typeIcon(c.roomType)}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>
                {c.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{c.classroomNumber}</h3>
            <p className="text-xs text-slate-400 mb-0.5">Capacity: <span className="text-slate-200">{c.capacity}</span></p>
            <p className="text-xs text-slate-400 mb-0.5">Type: <span className="text-slate-200 capitalize">{c.roomType}</span></p>
            <p className="text-xs text-slate-400 mb-4">Priority: <span className="text-slate-200">{c.departmentPriority ?? '—'}</span></p>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors">
                <Edit className="w-3 h-3" />Edit
              </button>
              <button onClick={() => handleDelete(c)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-3 h-3" />Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No classrooms found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">{editId ? 'Edit Classroom' : 'Add Classroom'}</h3>
                <p className="text-slate-400 text-sm mt-0.5">Fill in the classroom details below.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={LABEL}>Room Number *</label>
                  <input
                    value={form.classroomNumber}
                    onChange={e => setForm(p => ({ ...p, classroomNumber: e.target.value }))}
                    disabled={!!editId}
                    className={`${INPUT} ${editId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="CS-101 or LAB-301"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Prefix with "LAB-" to auto-detect as lab room.</p>
                </div>

                <div>
                  <label className={LABEL}>Capacity</label>
                  <input
                    type="number" min={1} max={500}
                    value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))}
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className={LABEL}>Room Type</label>
                  <select value={form.roomType} onChange={e => setForm(p => ({ ...p, roomType: e.target.value as 'theory' | 'lab' }))} className={INPUT}>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Classroom['status'] }))} className={INPUT}>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Department Priority</label>
                  <select value={form.departmentPriority} onChange={e => setForm(p => ({ ...p, departmentPriority: e.target.value as Classroom['departmentPriority'] }))} className={INPUT}>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                    <option value="Both">Both (Shared)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 pb-8">
              <button onClick={() => setModalOpen(false)} className={BTN_GHOST}>Cancel</button>
              <button onClick={handleSave} className={BTN_PRIMARY}>{editId ? 'Save Changes' : 'Add Classroom'}</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Classroom"
        message={confirmTarget ? `Are you sure you want to delete classroom ${confirmTarget.classroomNumber}?` : ''}
        onConfirm={executeDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
