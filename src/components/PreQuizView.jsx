import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { formatIST } from '../utils/timeUtils';
import { 
  Clock, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Award,
  Zap 
} from 'lucide-react';

export function PreQuizView() {
  const { settings, timeRemaining, questions } = useQuiz();

  const padZero = (n) => String(Math.max(0, n)).padStart(2, '0');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Countdown Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl text-center mb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          Scheduled Quiz Window
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {settings.quizTitle || 'Google Anti-Gravity Challenge'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
          The quiz will automatically unlock at start time. Keep this page open. Your draft answers will be protected against disconnects.
        </p>

        {/* Countdown Blocks */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-18 sm:w-20 sm:h-22 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-2xl sm:text-4xl font-bold text-white shadow-inner">
              {padZero(timeRemaining.hours)}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-2 font-medium">Hours</span>
          </div>

          <span className="text-2xl font-bold text-slate-600 -mt-6">:</span>

          <div className="flex flex-col items-center">
            <div className="w-16 h-18 sm:w-20 sm:h-22 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-2xl sm:text-4xl font-bold text-blue-400 shadow-inner">
              {padZero(timeRemaining.minutes)}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-2 font-medium">Minutes</span>
          </div>

          <span className="text-2xl font-bold text-slate-600 -mt-6">:</span>

          <div className="flex flex-col items-center">
            <div className="w-16 h-18 sm:w-20 sm:h-22 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-2xl sm:text-4xl font-bold text-emerald-400 shadow-inner animate-pulse">
              {padZero(timeRemaining.seconds)}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-2 font-medium">Seconds</span>
          </div>
        </div>

        {/* Quiz Window Meta Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">Start Time (IST)</span>
              <span className="text-slate-200 font-semibold">{formatIST(settings.startTime)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">End Time (IST)</span>
              <span className="text-slate-200 font-semibold">{formatIST(settings.endTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm mb-1">Instant Auto-Save</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every answer you select is immediately saved to your local device memory. Refreshing or accidental disconnects will never lose your progress.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm mb-1">Tie-Breaker Rule</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Rankings are computed by highest total score first. In case of ties, the earliest submission timestamp wins the higher rank.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm mb-1">Integrity Locked</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Results, answer keys, and leaderboards remain strictly confidential and locked until the official quiz end time expires.
          </p>
        </div>
      </div>
    </div>
  );
}
