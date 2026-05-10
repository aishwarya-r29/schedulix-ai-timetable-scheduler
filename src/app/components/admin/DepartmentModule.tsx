import { useState } from 'react';
import { Plus, Trash2, Building2, Layers, AlertTriangle, X, Edit } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const INPUT = 'w-full px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
const LABEL = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider';
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all';
const BTN_GHOST = 'px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-all';

export default function DepartmentModule() {
  const { departments = [], groups = [], addDepartment, deleteDepartment, addGroup, deleteGroup } = useAppData();
  const [modalOpen, setModalOpen] = useState<'add' | 'edit' | null>(null);
  const [newSection, setNewSection] = useState<{deptId: string, name: string}>({ deptId: '', name: '' });
  const [form, setForm] = useState({ id: '', name: '', fullName: '', sections: '' });
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<any>(null);

  const handleSave = () => {
    if (!form.id.trim() || !form.name.trim()) {
      setError('ID and short name are required.');
      return;
    }

    const deptId = form.id.toUpperCase().trim();
    
    if (modalOpen === 'add') {
      const err = addDepartment({
        id: deptId,
        name: form.name.trim(),
        fullName: form.fullName.trim() || form.name.trim()
      });
      if (err) { setError(err); return; }
    } else {
      // For edit, we currently only allow changing names (since ID is the primary key)
      // This is a simplified implementation as the backend would need an update endpoint
      addDepartment({
        id: deptId,
        name: form.name.trim(),
        fullName: form.fullName.trim() || form.name.trim()
      });
    }

    // Handle sections
    if (form.sections.trim()) {
      const sectionNames = form.sections.split(',').map(s => s.trim()).filter(Boolean);
      sectionNames.forEach(name => {
        addGroup({ department: deptId, name, semester: 4 });
      });
    }

    setModalOpen(null);
    setForm({ id: '', name: '', fullName: '', sections: '' });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Department Management</h2>
          <p className="text-slate-400 text-sm mt-1">{departments.length} departments currently configured</p>
        </div>
        <button onClick={() => setModalOpen('add')} className={BTN_PRIMARY}>
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(departments || []).map((dept) => (
          <div key={dept.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm({ id: dept.id, name: dept.name, fullName: dept.fullName, sections: '' });
                    setModalOpen('edit');
                  }}
                  className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {dept.id !== 'CSE' && dept.id !== 'IT' && (
                  <button
                    onClick={() => setConfirmTarget(dept)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{dept.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{dept.fullName}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-tighter mb-4">
              <Layers className="w-3 h-3" />
              ID: {dept.id}
            </div>

            {/* Sections List */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                <span>Sections / Groups</span>
                <span>{groups.filter(g => g.department === dept.id).length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(groups || []).filter(g => g.department === dept.id).map(g => (
                  <div key={g.id} className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg group/sec">
                    <span className="text-[10px] text-slate-300">{g.name}</span>
                    <button 
                      onClick={() => {
                        const err = deleteGroup(g.id);
                        if (err) setError(err);
                      }} 
                      className="opacity-0 group-hover/sec:opacity-100 hover:text-red-400 transition-all"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setNewSection({ deptId: dept.id, name: '' })}
                  className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] hover:bg-indigo-500/20 transition-all"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Modal */}
      {newSection.deptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xs p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Section to {newSection.deptId}</h3>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Section Name (e.g. G1)</label>
                <input
                  autoFocus
                  className={INPUT}
                  value={newSection.name}
                  onChange={e => setNewSection({ ...newSection, name: e.target.value })}
                  placeholder="e.g. G1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setNewSection({ deptId: '', name: '' })} className={`${BTN_GHOST} flex-1`}>Cancel</button>
                <button 
                  onClick={() => {
                    addGroup({ department: newSection.deptId, name: newSection.name, semester: 4 });
                    setNewSection({ deptId: '', name: '' });
                  }} 
                  className={`${BTN_PRIMARY} flex-1 justify-center`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">{modalOpen === 'add' ? 'Add New Department' : 'Edit Department'}</h3>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Department ID (Read-only on edit)</label>
                <input
                  disabled={modalOpen === 'edit'}
                  className={`${INPUT} ${modalOpen === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={form.id}
                  onChange={e => setForm({ ...form, id: e.target.value })}
                  placeholder="Short ID (e.g. MECH)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Short Name</label>
                  <input
                    className={INPUT}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Mechanical"
                  />
                </div>
                <div>
                  <label className={LABEL}>Full Name</label>
                  <input
                    className={INPUT}
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Mechanical Engineering"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Initial Sections (comma separated)</label>
                <input
                  className={INPUT}
                  value={form.sections}
                  onChange={e => setForm({ ...form, sections: e.target.value })}
                  placeholder="e.g. G1, G2, G3"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOpen(null)} className={`${BTN_GHOST} flex-1`}>Cancel</button>
                <button onClick={handleSave} className={`${BTN_PRIMARY} flex-1 justify-center`}>
                  {modalOpen === 'add' ? 'Create Department' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <ConfirmDialog
          open={!!confirmTarget}
          title="Delete Department?"
          message={`Are you sure you want to delete the ${confirmTarget.name} department? This cannot be undone.`}
          onConfirm={() => {
            const err = deleteDepartment(confirmTarget.id);
            setConfirmTarget(null);
            if (err) setError(err);
          }}
          onCancel={() => {
            setConfirmTarget(null);
            setError('');
          }}
          variant="danger"
        />
      )}
    </div>
  );
}
