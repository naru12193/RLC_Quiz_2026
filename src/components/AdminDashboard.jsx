import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { 
  toDatetimeLocalIST, 
  fromDatetimeLocalIST, 
  formatIST, 
  getNowIST 
} from '../utils/timeUtils';
import { exportLeaderboardToCsv } from '../utils/csvParser';
import { 
  Clock, 
  Calendar, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Trophy, 
  ShieldAlert, 
  Sliders, 
  Save,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { 
    settings, 
    updateQuizSettings, 
    questions, 
    syncQuestionsFromCsv, 
    allSubmissions, 
    currentTimeFormatted 
  } = useQuiz();

  // Time Form State (IST local format)
  const [startTimeLocal, setStartTimeLocal] = useState('');
  const [endTimeLocal, setEndTimeLocal] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [allowAnyEmail, setAllowAnyEmail] = useState(false);
  const [timeSaveStatus, setTimeSaveStatus] = useState(null);

  // CSV Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState(null);
  const [customCsvError, setCustomCsvError] = useState(null);

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      if (settings.startTime) setStartTimeLocal(toDatetimeLocalIST(settings.startTime));
      if (settings.endTime) setEndTimeLocal(toDatetimeLocalIST(settings.endTime));
      setQuizTitle(settings.quizTitle || 'Google Anti-Gravity Challenge');
      setAllowAnyEmail(Boolean(settings.allowAnyEmailForTesting));
    }
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-slate-400">
          This panel is restricted exclusively to the administrator account (<strong>naru12193@gmail.com</strong>).
        </p>
      </div>
    );
  }

  // Handle Save Time Settings
  const handleSaveTimes = async (e) => {
    e?.preventDefault?.();
    setTimeSaveStatus('saving');

    const startIso = fromDatetimeLocalIST(startTimeLocal);
    const endIso = fromDatetimeLocalIST(endTimeLocal);

    if (!startIso || !endIso) {
      setTimeSaveStatus({ type: 'error', message: 'Please select both start and end times.' });
      return;
    }

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
      setTimeSaveStatus({ type: 'error', message: 'End time must be after start time!' });
      return;
    }

    const res = await updateQuizSettings({
      quizTitle: quizTitle.trim() || 'Google Anti-Gravity Challenge',
      startTime: startIso,
      endTime: endIso,
      allowAnyEmailForTesting: allowAnyEmail
    });

    if (res.success) {
      setTimeSaveStatus({ type: 'success', message: 'Quiz settings saved successfully!' });
      setTimeout(() => setTimeSaveStatus(null), 4000);
    } else {
      setTimeSaveStatus({ type: 'error', message: res.error || 'Failed to update settings.' });
    }
  };

  // Quick Preset Handlers
  const handleSetQuickWindow = (startDelayMinutes, durationMinutes) => {
    const now = getNowIST();
    const start = new Date(now.getTime() + startDelayMinutes * 60 * 1000);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    setStartTimeLocal(toDatetimeLocalIST(start.toISOString()));
    setEndTimeLocal(toDatetimeLocalIST(end.toISOString()));
  };

  // Handle CSV Sync from Server /quizQuestion.csv (Default Server Fetch)
  const handleSyncServerCsv = async () => {
    setIsSyncing(true);
    setSyncLog(null);
    setCustomCsvError(null);

    const res = await syncQuestionsFromCsv(); // defaults to fetch('/quizQuestion.csv')
    setIsSyncing(false);

    if (res.success) {
      setSyncLog({
        type: 'success',
        message: `Successfully loaded ${res.count} questions from public/quizQuestion.csv into Firestore /questions!`,
        timestamp: formatIST(getNowIST())
      });
    } else {
      setSyncLog({
        type: 'error',
        message: res.error || 'Failed to sync CSV questions.',
        timestamp: formatIST(getNowIST())
      });
    }
  };

  // Handle Custom CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (text) {
        setIsSyncing(true);
        const res = await syncQuestionsFromCsv(text);
        setIsSyncing(false);

        if (res.success) {
          setSyncLog({
            type: 'success',
            message: `Successfully loaded ${res.count} questions from uploaded file "${file.name}"!`,
            timestamp: formatIST(getNowIST())
          });
        } else {
          setSyncLog({
            type: 'error',
            message: res.error || 'Failed to sync uploaded CSV.',
            timestamp: formatIST(getNowIST())
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Signed in as naru12193@gmail.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Quiz Operations & Management
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Current IST: {currentTimeFormatted}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Time Settings & Ingestion (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* CARD 1: Time Window Management */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Quiz Schedule (IST)</h2>
                  <p className="text-xs text-slate-400">Strict start and end time window in Asia/Kolkata</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveTimes} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Quiz Title / Challenge Name
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Google Anti-Gravity Challenge"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Quiz Start Time (IST)</span>
                    <span className="text-[10px] text-blue-400">Asia/Kolkata</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startTimeLocal}
                    onChange={(e) => setStartTimeLocal(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Active: {formatIST(fromDatetimeLocalIST(startTimeLocal))}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Quiz End Time (IST)</span>
                    <span className="text-[10px] text-blue-400">Asia/Kolkata</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endTimeLocal}
                    onChange={(e) => setEndTimeLocal(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Active: {formatIST(fromDatetimeLocalIST(endTimeLocal))}
                  </span>
                </div>
              </div>

              {/* Quick Presets for Easy Demo / Live Testing */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Presets for Testing:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetQuickWindow(1, 15)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                  >
                    Start in 1 min (15 min run)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickWindow(0, 30)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                  >
                    Start NOW (30 min run)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickWindow(5, 60)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                  >
                    Start in 5 min (1 hr run)
                  </button>
                </div>
              </div>

              {/* Dev / Test Mode Toggle */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Development Test Mode
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Allow non-@gmail.com email accounts to attempt quiz during testing
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowAnyEmail(prev => !prev)}
                  className={`text-2xl transition-colors ${allowAnyEmail ? 'text-blue-500' : 'text-slate-600'}`}
                >
                  {allowAnyEmail ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              {/* Save Status Alert */}
              {timeSaveStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  timeSaveStatus.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}>
                  {timeSaveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{timeSaveStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={timeSaveStatus === 'saving'}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Time Settings</span>
              </button>
            </form>
          </div>

          {/* CARD 2: CSV Ingestion Pipeline */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">CSV Question Ingestion</h2>
                  <p className="text-xs text-slate-400">Sync questions into Firestore collection /questions</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                {questions.length} Questions Live
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                Clicking <strong>"Sync Questions from CSV"</strong> will fetch <code className="text-blue-400">/quizQuestion.csv</code> from the web server directory, parse questions and publish them to active quiz state.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Default Server Fetch Button */}
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleSyncServerCsv}
                  className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Questions from Server CSV'}</span>
                </button>

                {/* Upload Alternative */}
                <label className="w-full sm:w-auto cursor-pointer py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Upload Local CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sync Status Log */}
              {syncLog && (
                <div className={`p-4 rounded-xl border text-xs ${
                  syncLog.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{syncLog.type === 'success' ? 'Sync Successful' : 'Sync Error'}</span>
                    <span className="text-[10px] opacity-75 font-mono">{syncLog.timestamp}</span>
                  </div>
                  <p>{syncLog.message}</p>
                </div>
              )}

              {settings.lastSyncedAt && (
                <div className="text-[11px] text-slate-400">
                  Last synced: <span className="text-slate-200 font-medium">{settings.lastSyncedAt}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Admin Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Live Submissions</h2>
                  <p className="text-xs text-slate-400">{allSubmissions.length} participant attempts</p>
                </div>
              </div>

              {/* Export Button */}
              <button
                type="button"
                disabled={allSubmissions.length === 0}
                onClick={() => exportLeaderboardToCsv(allSubmissions, `quiz_leaderboard_${Date.now()}.csv`)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Submissions Table */}
            {allSubmissions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No submissions recorded yet. Once participants submit, live scores will appear here in real time.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Participant</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-right">Time (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {allSubmissions.map((sub, idx) => (
                      <tr key={sub.id || sub.userId} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-2 px-3 font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-100 truncate max-w-[140px]">
                            {sub.displayName || sub.userEmail?.split('@')[0]}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {sub.userEmail}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">
                            {sub.totalScore ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[10px] text-slate-400">
                          {sub.submittedAt ? sub.submittedAt.split(',')[1] || sub.submittedAt : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Questions Preview Accordion */}
      {questions.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">
              Current Synced Questions ({questions.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Firestore: /questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-blue-400">#{idx + 1} ({q.questionId})</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    Answer: {q.correctOption} ({q.marks || 1} mark)
                  </span>
                </div>
                <p className="text-slate-200 font-medium mb-2">{q.questionText}</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                  <span>A: {q.options?.A}</span>
                  <span>B: {q.options?.B}</span>
                  <span>C: {q.options?.C}</span>
                  <span>D: {q.options?.D}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
