import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp, 
  writeBatch,
  CONFIG_DOC,
  QUESTIONS_COLLECTION,
  SUBMISSIONS_COLLECTION 
} from '../firebase';
import { useAuth } from './AuthContext';
import { 
  getQuizStatus, 
  getTimeRemaining, 
  getNowIST, 
  formatIST,
  setServerTimeOffset 
} from '../utils/timeUtils';
import { parseQuestionsCsv } from '../utils/csvParser';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const { user, isAdmin, setAllowAnyEmailForTesting } = useAuth();

  // Settings & Status
  const [settings, setSettings] = useState({
    quizTitle: 'Google Anti-Gravity Challenge',
    startTime: null,
    endTime: null,
    lastSyncedAt: null,
    allowAnyEmailForTesting: false
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Submissions
  const [userSubmission, setUserSubmission] = useState(null);
  const [userSubmissionLoading, setUserSubmissionLoading] = useState(true);
  const [allSubmissions, setAllSubmissions] = useState([]);

  // Active Quiz State & Navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticker state (updates every second)
  const [quizStatus, setQuizStatus] = useState('pre-quiz'); // 'pre-quiz' | 'active' | 'post-quiz'
  const [timeRemaining, setTimeRemaining] = useState({ totalMs: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');

  const autoSubmittedRef = useRef(false);

  // LocalStorage Key for current user
  const getDraftKey = useCallback(() => {
    return user ? `quiz_draft_state_${user.uid}` : null;
  }, [user]);

  // 1. Sync server time / clock check against World Time or Firestore ping
  useEffect(() => {
    async function syncTime() {
      try {
        const start = Date.now();
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const serverNow = new Date(data.datetime).getTime();
          const latency = (Date.now() - start) / 2;
          setServerTimeOffset(serverNow - latency);
        }
      } catch (err) {
        console.warn('Network time sync fallback to local IST clock:', err.message);
      }
    }
    syncTime();
  }, []);

  // 2. Real-time Quiz Settings Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', CONFIG_DOC), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(data);
        if (data.allowAnyEmailForTesting !== undefined) {
          setAllowAnyEmailForTesting(Boolean(data.allowAnyEmailForTesting));
        }
      } else {
        // Default initial settings
        const now = new Date();
        const start = new Date(now.getTime() + 5 * 60 * 1000); // starts in 5 minutes
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
        const defaultSettings = {
          quizTitle: 'Google Anti-Gravity Challenge',
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          lastSyncedAt: null,
          allowAnyEmailForTesting: false
        };
        setSettings(defaultSettings);
      }
      setSettingsLoading(false);
    }, (error) => {
      console.error('Error listening to quiz settings:', error);
      setSettingsLoading(false);
    });

    return () => unsub();
  }, [setAllowAnyEmailForTesting]);

  // 3. Real-time Questions Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, QUESTIONS_COLLECTION), (snap) => {
      const qList = [];
      snap.forEach((doc) => {
        qList.push({ id: doc.id, ...doc.data() });
      });

      // Sort by order or numeric ID
      qList.sort((a, b) => {
        const orderA = a.order ?? parseInt(a.questionId?.replace(/\D/g, '') || 0, 10);
        const orderB = b.order ?? parseInt(b.questionId?.replace(/\D/g, '') || 0, 10);
        return orderA - orderB;
      });

      setQuestions(qList);
      setQuestionsLoading(false);
    }, (error) => {
      console.error('Error listening to questions:', error);
      setQuestionsLoading(false);
    });

    return () => unsub();
  }, []);

  // 4. Restore Draft from LocalStorage on mount or user change
  useEffect(() => {
    const key = getDraftKey();
    if (!key) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setDraftAnswers(parsed.answers);
        if (parsed.flagged) setFlaggedQuestions(parsed.flagged);
        if (typeof parsed.currentQuestionIndex === 'number') {
          setCurrentQuestionIndex(parsed.currentQuestionIndex);
        }
      }
    } catch (e) {
      console.error('Failed reading draft state from localStorage:', e);
    }
  }, [getDraftKey]);

  // 5. Real-time User Submission Listener
  useEffect(() => {
    if (!user) {
      setUserSubmission(null);
      setUserSubmissionLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, SUBMISSIONS_COLLECTION, user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const subData = docSnap.data();
        setUserSubmission(subData);
        // Sync local storage state
        const key = getDraftKey();
        if (key) {
          try {
            const saved = localStorage.getItem(key);
            const parsed = saved ? JSON.parse(saved) : {};
            parsed.submitted = true;
            localStorage.setItem(key, JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
      } else {
        setUserSubmission(null);
      }
      setUserSubmissionLoading(false);
    }, (error) => {
      console.error('Error listening to user submission:', error);
      setUserSubmissionLoading(false);
    });

    return () => unsub();
  }, [user, getDraftKey]);

  // 6. Submissions Listener for Leaderboard (Locked for participants until post-quiz)
  useEffect(() => {
    // Only listen if user is Admin OR if quiz has reached post-quiz state
    if (!isAdmin && quizStatus !== 'post-quiz') {
      setAllSubmissions([]);
      return;
    }

    const unsub = onSnapshot(collection(db, SUBMISSIONS_COLLECTION), (snap) => {
      const subs = [];
      snap.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() });
      });

      // Sort by score descending, then submission timestamp ascending (tie-breaker)
      subs.sort((a, b) => {
        const scoreDiff = (b.totalScore ?? 0) - (a.totalScore ?? 0);
        if (scoreDiff !== 0) return scoreDiff;

        // Earliest timestamp wins tie
        const timeA = a.submittedAtTimestamp?.toMillis?.() || new Date(a.submittedAt || 0).getTime();
        const timeB = b.submittedAtTimestamp?.toMillis?.() || new Date(b.submittedAt || 0).getTime();
        return timeA - timeB;
      });

      setAllSubmissions(subs);
    }, (error) => {
      console.error('Error fetching leaderboard submissions:', error);
    });

    return () => unsub();
  }, [isAdmin, quizStatus]);

  // 7. Auto-save Answer Handler
  const selectOption = (questionId, optionKey) => {
    setDraftAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionKey };
      const key = getDraftKey();
      if (key) {
        try {
          const saved = localStorage.getItem(key);
          const currentData = saved ? JSON.parse(saved) : {};
          currentData.answers = updated;
          currentData.currentQuestionIndex = currentQuestionIndex;
          localStorage.setItem(key, JSON.stringify(currentData));
        } catch (e) {
          console.error('Error saving answer to localStorage:', e);
        }
      }
      return updated;
    });
  };

  // Toggle Flag Question
  const toggleFlag = (questionId) => {
    setFlaggedQuestions((prev) => {
      const isFlagged = prev.includes(questionId);
      const updated = isFlagged ? prev.filter(id => id !== questionId) : [...prev, questionId];
      const key = getDraftKey();
      if (key) {
        try {
          const saved = localStorage.getItem(key);
          const currentData = saved ? JSON.parse(saved) : {};
          currentData.flagged = updated;
          localStorage.setItem(key, JSON.stringify(currentData));
        } catch (e) {
          console.error('Error saving flag to localStorage:', e);
        }
      }
      return updated;
    });
  };

  // 8. Submit Quiz Function
  const submitQuiz = useCallback(async () => {
    if (!user || userSubmission || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Calculate score securely using questions loaded
      let score = 0;
      let maxScore = 0;
      let correctCount = 0;

      questions.forEach((q) => {
        const qId = q.questionId || q.id;
        const marks = Number(q.marks) || 1;
        maxScore += marks;
        const userAnswer = draftAnswers[qId];
        if (userAnswer && q.correctOption && userAnswer.toUpperCase() === q.correctOption.toUpperCase()) {
          score += marks;
          correctCount += 1;
        }
      });

      const submissionData = {
        userId: user.uid,
        userEmail: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        answers: draftAnswers,
        totalScore: score,
        maxScore: maxScore,
        correctCount: correctCount,
        totalQuestions: questions.length,
        submittedAt: formatIST(getNowIST()),
        submittedAtTimestamp: serverTimestamp()
      };

      await setDoc(doc(db, SUBMISSIONS_COLLECTION, user.uid), submissionData);
      setUserSubmission(submissionData);

      // Update draft in localStorage
      const key = getDraftKey();
      if (key) {
        try {
          const saved = localStorage.getItem(key);
          const parsed = saved ? JSON.parse(saved) : {};
          parsed.submitted = true;
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
      return true;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz: ' + err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userSubmission, isSubmitting, questions, draftAnswers, getDraftKey]);

  // 9. Timer & Status Clock Ticker
  useEffect(() => {
    const updateTicker = () => {
      const now = getNowIST();
      setCurrentTimeFormatted(formatIST(now));

      const status = getQuizStatus(settings.startTime, settings.endTime);
      setQuizStatus(status);

      if (status === 'pre-quiz') {
        setTimeRemaining(getTimeRemaining(settings.startTime));
      } else if (status === 'active') {
        const remaining = getTimeRemaining(settings.endTime);
        setTimeRemaining(remaining);

        // Auto-submit if time runs out
        if (remaining.isPast && !userSubmission && !autoSubmittedRef.current && user) {
          autoSubmittedRef.current = true;
          submitQuiz();
        }
      } else {
        // post-quiz
        setTimeRemaining({ totalMs: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        // Auto-submit if participant is still on screen without submission
        if (!userSubmission && !autoSubmittedRef.current && user) {
          autoSubmittedRef.current = true;
          submitQuiz();
        }
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [settings.startTime, settings.endTime, userSubmission, user, submitQuiz]);

  // 10. Admin: Update Quiz Settings
  const updateQuizSettings = async (newSettings) => {
    try {
      await setDoc(doc(db, 'config', CONFIG_DOC), newSettings, { merge: true });
      return { success: true };
    } catch (err) {
      console.error('Error saving settings:', err);
      return { success: false, error: err.message };
    }
  };

  // 11. Admin: Sync Questions from CSV (Default Server Fetch from /quizQuestion.csv or raw CSV text)
  const syncQuestionsFromCsv = async (csvTextOverride = null) => {
    try {
      let csvContent = csvTextOverride;

      if (!csvContent) {
        // Default Server Fetch: automatically fetches /quizQuestion.csv from public directory
        const response = await fetch('/quizQuestion.csv', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to fetch /quizQuestion.csv: Status ${response.status} ${response.statusText}`);
        }
        csvContent = await response.text();
      }

      const parsedQuestions = await parseQuestionsCsv(csvContent);
      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions found in CSV file.');
      }

      // Batch write to Firestore collection /questions
      const batch = writeBatch(db);

      // Clean or overwrite existing questions
      parsedQuestions.forEach((q) => {
        const docRef = doc(db, QUESTIONS_COLLECTION, String(q.questionId));
        batch.set(docRef, {
          questionId: q.questionId,
          order: q.order,
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          marks: q.marks
        });
      });

      // Update lastSyncedAt in quiz_settings
      const settingsRef = doc(db, 'config', CONFIG_DOC);
      batch.set(settingsRef, {
        lastSyncedAt: formatIST(getNowIST()),
        totalQuestionsCount: parsedQuestions.length
      }, { merge: true });

      await batch.commit();

      return {
        success: true,
        count: parsedQuestions.length,
        questions: parsedQuestions
      };
    } catch (err) {
      console.error('CSV Sync Error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  return (
    <QuizContext.Provider
      value={{
        settings,
        settingsLoading,
        updateQuizSettings,
        questions,
        questionsLoading,
        syncQuestionsFromCsv,
        userSubmission,
        userSubmissionLoading,
        allSubmissions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        draftAnswers,
        selectOption,
        flaggedQuestions,
        toggleFlag,
        submitQuiz,
        isSubmitting,
        quizStatus,
        timeRemaining,
        currentTimeFormatted
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
