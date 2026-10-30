import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useQuiz } from './context/QuizContext';
import { Navbar } from './components/Navbar';
import { PreQuizView } from './components/PreQuizView';
import { ActiveQuizView } from './components/ActiveQuizView';
import { PostQuizView } from './components/PostQuizView';
import { AdminDashboard } from './components/AdminDashboard';
import { UnauthorizedModal } from './components/UnauthorizedModal';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  AlertCircle,
  FileCheck 
} from 'lucide-react';

export default function App() {
  const { user, isAdmin, loading: authLoading, authError, clearAuthError, loginWithGoogle } = useAuth();
  const { quizStatus, settingsLoading, currentTimeFormatted, settings } = useQuiz();

  const [currentView, setCurrentView] = useState('quiz'); // 'quiz' | 'admin'
  const [signingIn, setSigningIn] = useState(false);

  // If admin logs in, default view can be admin or quiz
  useEffect(() => {
    if (isAdmin && currentView !== 'admin' && quizStatus === 'pre-quiz') {
      // Keep admin flexible
    }
  }, [isAdmin, currentView, quizStatus]);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-bounce">
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-sm font-medium tracking-wide">Initializing RLC JE 2026 Environment...</p>
      </div>
    );
  }

  // Not logged in: Show Authentication Gateway
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden bg-radial-glow">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Minimal Header */}
        <header className="px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              <span className="text-blue-400">RLC</span> JE 2026
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>IST: {currentTimeFormatted || 'Live'}</span>
          </div>
        </header>

        {/* Central Sign-In Card */}
        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="max-w-md w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/25">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {settings.quizTitle || 'RLC JE 2026'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 leading-relaxed">
              Live timed quiz platform with instant local preservation and tamper-resistant Indian Standard Time synchronization.
            </p>

            {/* Google OAuth Login Button */}
            <button
              type="button"
              disabled={signingIn}
              onClick={async () => {
                setSigningIn(true);
                await loginWithGoogle();
                setSigningIn(false);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-950/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{signingIn ? 'Connecting...' : 'Sign In with Google'}</span>
            </button>

            {/* Access rules footnote */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Participants must authenticate with an <strong>@gmail.com</strong> account.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Administrator access designated to <strong>K Narayana Rao, VM BA</strong>.</span>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-slate-500 z-10">
          RLC JE 2026 Platform • Asia/Kolkata (IST) Standard
        </footer>

        {/* Unauthorized Domain Modal */}
        <UnauthorizedModal errorMessage={authError} onClose={clearAuthError} />
      </div>
    );
  }

  // Logged In: Render Navigation and Target View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 pb-16">
        {currentView === 'admin' && isAdmin ? (
          <AdminDashboard />
        ) : (
          <>
            {quizStatus === 'pre-quiz' && <PreQuizView />}
            {quizStatus === 'active' && <ActiveQuizView />}
            {quizStatus === 'post-quiz' && <PostQuizView />}
          </>
        )}
      </main>

      {/* Unauthorized Modal in case error pops up */}
      <UnauthorizedModal errorMessage={authError} onClose={clearAuthError} />
    </div>
  );
}
