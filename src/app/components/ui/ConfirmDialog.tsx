import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  type?: 'confirm' | 'alert';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  type = 'confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const colors = {
    danger:  { bg: 'bg-red-500/20',    text: 'text-red-300',    btn: 'bg-red-600 hover:bg-red-700' },
    warning: { bg: 'bg-amber-500/20',   text: 'text-amber-300',  btn: 'bg-amber-600 hover:bg-amber-700' },
    info:    { bg: 'bg-blue-500/20',    text: 'text-blue-300',   btn: 'bg-blue-600 hover:bg-blue-700' },
  }[variant];

  const Icon = variant === 'info' ? Info : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
         onClick={type === 'alert' ? onConfirm : onCancel}>
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl animate-in"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 p-6">
          <div className={`shrink-0 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
          <button onClick={type === 'alert' ? onConfirm : onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          {type === 'confirm' && (
            <button onClick={onCancel}
              className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:bg-white/10 transition-all">
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm}
            className={`px-4 py-2 ${colors.btn} text-white text-sm font-semibold rounded-xl transition-all`}>
            {type === 'alert' ? 'OK' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
