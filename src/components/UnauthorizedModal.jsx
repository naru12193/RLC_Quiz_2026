import React from 'react';
import { ShieldAlert, X, AlertOctagon } from 'lucide-react';

export function UnauthorizedModal({ errorMessage, onClose }) {
  if (!errorMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-rose-950/50">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
        
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {errorMessage}
        </p>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 mb-6 flex items-start gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Please sign in with your verified <strong>@gmail.com</strong> account. Other email domains are automatically denied access.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30"
        >
          Understood & Dismiss
        </button>
      </div>
    </div>
  );
}
