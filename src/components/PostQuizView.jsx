import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Users,
  Target,
  Sparkles,
  Medal
} from 'lucide-react';

export function PostQuizView() {
  const { user } = useAuth();
  const { userSubmission, allSubmissions, questions } = useQuiz();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'breakdown' | 'leaderboard'
  const [searchEmail, setSearchEmail] = useState('');

  // Fire confetti celebration once on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  // Compute user rank among all submissions
  const userRankIndex = allSubmissions.findIndex(sub => sub.userId === user?.uid);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '—';

  const totalPossibleMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);
  const userScore = userSubmission?.totalScore ?? 0;
  const percentage = totalPossibleMarks > 0 ? Math.round((userScore / totalPossibleMarks) * 100) : 0;

  // Filter leaderboard
  const filteredSubmissions = allSubmissions.filter(sub => {
    if (!searchEmail) return true;
    const term = searchEmail.toLowerCase();
    return (
      sub.userEmail?.toLowerCase().includes(term) ||
      sub.displayName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Official Quiz Concluded
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Quiz Results & Leaderboard
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          The quiz window has closed and results are unlocked. Review your performance and global standings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          My Score & Rank
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'breakdown'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Answer Key Breakdown
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Global Leaderboard ({allSubmissions.length})
        </button>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {userSubmission ? (
            <>
              {/* Score Highlight Card */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-yellow-500/20">
                  <Trophy className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {userSubmission.displayName || user?.displayName || 'Participant'}
                </h2>
                <p className="text-xs text-slate-400 mb-6 font-mono">{user?.email}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Global Rank</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                      #{userRank}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      of {allSubmissions.length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Total Score</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {userScore}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      / {totalPossibleMarks} Marks
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {percentage}%
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Score Ratio
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Correct</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                      {userSubmission.correctCount ?? 0}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      / {questions.length} Questions
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Submitted At (IST): <strong>{userSubmission.submittedAt}</strong></span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] border border-blue-500/20">
                    Attempt #{userSubmission.attemptNumber || 1}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center">
              <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No Quiz Attempt Recorded</h3>
              <p className="text-sm text-slate-400 mb-6">
                You did not submit an attempt for this quiz session. You can still inspect the leaderboard and answer key!
              </p>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                View Leaderboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BREAKDOWN */}
      {activeTab === 'breakdown' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-bold text-white text-base">Question by Question Review</h3>
            <span className="text-xs text-slate-400">{questions.length} Questions Total</span>
          </div>

          {questions.map((q, idx) => {
            const qId = q.questionId || q.id;
            const userAns = userSubmission?.answers?.[qId] || null;
            const isCorrect = userAns && q.correctOption && userAns.toUpperCase() === q.correctOption.toUpperCase();

            return (
              <div 
                key={qId}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      {q.marks || 1} {Number(q.marks) === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  {userSubmission && (
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks || 1})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> {userAns ? 'Incorrect' : 'Skipped'} (0)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-white mb-4">
                  {q.questionText}
                </p>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = q.options?.[optKey];
                    if (!optText) return null;

                    const isWinning = q.correctOption?.toUpperCase() === optKey;
                    const isUserChoice = userAns?.toUpperCase() === optKey;

                    let cardClass = 'bg-slate-950/50 border-slate-800 text-slate-300';
                    if (isWinning) {
                      cardClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold ring-1 ring-emerald-500/40';
                    } else if (isUserChoice && !isWinning) {
                      cardClass = 'bg-rose-500/15 border-rose-500 text-rose-300 line-through';
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${cardClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isWinning ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {optKey}
                          </span>
                          <span>{optText}</span>
                        </div>

                        {isWinning && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isWinning && (
                          <span className="text-[10px] uppercase font-bold text-rose-400 shrink-0">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Official Global Standings</span>
            </h3>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email or name..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 text-sm">
              No submissions found matching criteria.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-right">Submitted At (IST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredSubmissions.map((sub, idx) => {
                    const isCurrentUser = sub.userId === user?.uid;
                    const rank = idx + 1;

                    return (
                      <tr 
                        key={sub.id || sub.userId}
                        className={`transition-colors ${
                          isCurrentUser 
                            ? 'bg-blue-600/15 font-semibold text-white' 
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-extrabold">
                              🥇 1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center gap-1 text-slate-300 font-extrabold">
                              🥈 2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-400">#{rank}</span>
                          )}
                        </td>

                        {/* Participant */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {sub.photoURL ? (
                              <img src={sub.photoURL} alt="" className="w-6 h-6 rounded-full border border-slate-700" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-200">
                                {(sub.displayName || sub.userEmail || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-slate-100 flex items-center gap-1.5">
                                <span>{sub.displayName || sub.userEmail?.split('@')[0]}</span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] border border-blue-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                <span>{sub.userEmail}</span>
                                {sub.attemptNumber > 1 && (
                                  <span className="text-[10px] px-1 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                                    Att. #{sub.attemptNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-white text-sm">
                            {sub.totalScore ?? 0}
                          </span>
                        </td>

                        {/* Submitted At */}
                        <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                          {sub.submittedAt || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
