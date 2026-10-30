import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { formatIST } from '../utils/timeUtils';
import { 
  CheckCircle2, 
  Flag, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Send, 
  Save, 
  HelpCircle,
  XCircle,
  FileCheck2,
  Lock,
  RotateCcw,
  Edit3,
  Undo2
} from 'lucide-react';

export function ActiveQuizView() {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    draftAnswers,
    selectOption,
    flaggedQuestions,
    toggleFlag,
    submitQuiz,
    isSubmitting,
    userSubmission,
    isReattempting,
    startReattempt,
    cancelReattempt,
    timeRemaining,
    settings
  } = useQuiz();

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // If questions not yet synced or loaded
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Questions Available Yet</h2>
        <p className="text-sm text-slate-400 mb-6">
          The quiz questions have not been synced into the database by the administrator yet.
        </p>
      </div>
    );
  }

  // If user already submitted their quiz and NOT currently taking a re-attempt
  if (userSubmission && !isReattempting) {
    const attemptNumber = userSubmission.attemptNumber || 1;

    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <FileCheck2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Attempt #{attemptNumber} Recorded
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Quiz Successfully Submitted!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your answers have been securely recorded on the server.
          </p>

          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-left mb-6 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Recorded Attempt:</span>
              <span className="font-semibold text-white">Attempt #{attemptNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Questions Attempted:</span>
              <span className="font-semibold text-white">
                {Object.keys(userSubmission.answers || {}).length} / {questions.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Submission Timestamp (IST):</span>
              <span className="font-semibold text-emerald-400">{userSubmission.submittedAt}</span>
            </div>
          </div>

          {/* Re-attempt Option Card during Active Window */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Re-attempt Quiz (Active Window)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Window Active
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              The quiz window is currently active until <strong className="text-slate-200">{formatIST(settings.endTime)}</strong>. You are permitted to re-attempt the quiz to improve your answers. Your latest submission before the deadline will be recorded on the final leaderboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => startReattempt('fresh')}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Fresh Re-attempt</span>
              </button>

              <button
                type="button"
                onClick={() => startReattempt('revise')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Revise Previous Answers</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-3 text-left">
            <Lock className="w-5 h-5 shrink-0 text-blue-400" />
            <div>
              <p className="font-semibold">Results & Leaderboard Confidentiality</p>
              <p className="text-slate-400 mt-0.5">
                Per quiz integrity rules, detailed scores and rank leaderboards unlock after the quiz period officially ends at <strong>{formatIST(settings.endTime)}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const qId = currentQ.questionId || currentQ.id;
  const selectedOpt = draftAnswers[qId] || null;
  const isFlagged = flaggedQuestions.includes(qId);

  // Counts
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(draftAnswers).filter(k => draftAnswers[k]).length;
  const unansweredCount = totalQuestions - answeredCount;

  const padZero = (n) => String(Math.max(0, n)).padStart(2, '0');
  const isUrgentTime = timeRemaining.hours === 0 && timeRemaining.minutes < 5;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Top Bar: Progress & Remaining Countdown */}
      <div className="mb-6 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Progress & Saved badge */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              {userSubmission && isReattempting && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <RotateCcw className="w-2.5 h-2.5" />
                  Attempt #{(userSubmission.attemptNumber || 1) + 1}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-white">
                {answeredCount} Answered
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-amber-400 font-medium">
                {unansweredCount} Left
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono border border-slate-700">
            <Save className="w-3.5 h-3.5" />
            <span>Auto-saved to device</span>
          </div>
        </div>

        {/* Time Remaining Clock */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold transition-colors ${
          isUrgentTime 
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse' 
            : 'bg-slate-950 border-slate-800 text-blue-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span>
            {padZero(timeRemaining.hours)}:{padZero(timeRemaining.minutes)}:{padZero(timeRemaining.seconds)}
          </span>
          <span className="text-[11px] font-sans font-normal text-slate-400">remaining</span>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2">
          {userSubmission && isReattempting && (
            <button
              type="button"
              onClick={cancelReattempt}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Return to your previous recorded submission summary"
            >
              <Undo2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Cancel Re-attempt</span>
            </button>
          )}

          {/* Submit Quiz Header Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{userSubmission ? `Submit Attempt #${(userSubmission.attemptNumber || 1) + 1}` : 'Submit Quiz'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Question Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                  Question #{currentQuestionIndex + 1}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-medium">
                  {currentQ.marks || 1} {Number(currentQ.marks) === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>

              {/* Flag Toggle */}
              <button
                onClick={() => toggleFlag(qId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isFlagged
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-medium text-white leading-relaxed mb-6">
              {currentQ.questionText}
            </h2>

            {/* Option Choices */}
            <div className="space-y-3 mb-8">
              {['A', 'B', 'C', 'D'].map((optKey) => {
                const optText = currentQ.options?.[optKey];
                if (!optText) return null;
                const isSelected = selectedOpt === optKey;

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() => selectOption(qId, optKey)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-900/20 ring-1 ring-blue-500'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {optKey}
                    </div>
                    <span className="text-sm pt-0.5 leading-snug">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Question Card Bottom Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {selectedOpt && (
                <button
                  onClick={() => selectOption(qId, null)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear Selection
                </button>
              )}

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Review & Submit
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Palette / Navigator (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <h3 className="font-bold text-white text-sm mb-3">Question Navigator</h3>
          
          {/* Status Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500"></span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500"></span>
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-950 border border-slate-700"></span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-blue-400 bg-blue-500/30"></span>
              <span>Current</span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const itemQId = q.questionId || q.id;
              const hasAnswered = Boolean(draftAnswers[itemQId]);
              const itemFlagged = flaggedQuestions.includes(itemQId);
              const isCurrent = idx === currentQuestionIndex;

              let style = 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700';

              if (hasAnswered && itemFlagged) {
                style = 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold';
              } else if (hasAnswered) {
                style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70 font-semibold';
              } else if (itemFlagged) {
                style = 'bg-amber-500/20 text-amber-300 border-amber-500';
              }

              if (isCurrent) {
                style += ' ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900';
              }

              return (
                <button
                  key={itemQId}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{userSubmission ? `Submit Attempt #${(userSubmission.attemptNumber || 1) + 1}` : 'Submit Final Answers'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {userSubmission 
                ? `Submit Attempt #${(userSubmission.attemptNumber || 1) + 1}?` 
                : 'Ready to Submit Quiz?'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {userSubmission 
                ? `This will record Attempt #${(userSubmission.attemptNumber || 1) + 1} and update your score on the leaderboard. You can continue re-attempting as long as the quiz window is open.` 
                : 'Please double-check your answers. You can also re-attempt the quiz anytime while the active window remains open.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-xs text-emerald-400 block font-medium">Answered</span>
                <span className="text-xl font-bold text-white">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-xs text-amber-400 block font-medium">Unanswered</span>
                <span className="text-xl font-bold text-white">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-400/90 mb-5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                ⚠️ You still have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to proceed?
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Back to Questions
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  const ok = await submitQuiz();
                  if (ok) setShowSubmitModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
