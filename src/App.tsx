import React, { useState, useEffect, useRef } from "react";
import TutorInputForm from "./components/TutorInputForm";
import TutorAnalysisResult from "./components/TutorAnalysisResult";
import FollowUpChat from "./components/FollowUpChat";
import MasteryRadar from "./components/MasteryRadar";
import LearningVelocity from "./components/LearningVelocity";
import CelebrationModal from "./components/CelebrationModal";
import RecentSessionsList from "./components/RecentSessionsList";
import StudyTimer from "./components/StudyTimer";
import StudyDuels from "./components/StudyDuels";
import AchievementsPanel from "./components/AchievementsPanel";
import { TutorResponse, ChatMessage, Badge, TutorSession } from "./types";
import { 
  Sparkles, Terminal, AlertCircle, BookOpen, GraduationCap, Trophy, 
  Gamepad2, Star, Target, Info, Flame, Award, Trash2, History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ToastEventMessage {
  id: string;
  message: string;
  type: "success" | "info" | "milestone";
}

export default function App() {
  const [textInput, setTextInput] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [subject, setSubject] = useState("Math");
  const [gradeLevel, setGradeLevel] = useState("High School (9-12)");

  const [analysis, setAnalysis] = useState<TutorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Follow-up correct answer streak and toast state
  const [correctStreak, setCorrectStreak] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_correct_streak");
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [toasts, setToasts] = useState<ToastEventMessage[]>([]);

  // Seed default history data for instant delightful visual progress graph loading
  const [masteryHistory, setMasteryHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_mastery_history");
      if (stored) return JSON.parse(stored);
      return [
        { name: "Checkpoint 1", "Math": 45, "Science": 60, "English": 40, "Coding": 65, "History": 40, "Study Habits": 35 },
        { name: "Checkpoint 2", "Math": 50, "Science": 65, "English": 45, "Coding": 70, "History": 42, "Study Habits": 35 },
        { name: "Checkpoint 3", "Math": 55, "Science": 70, "English": 45, "Coding": 75, "History": 45, "Study Habits": 40 },
        { name: "Checkpoint 4", "Math": 60, "Science": 75, "English": 50, "Coding": 80, "History": 45, "Study Habits": 40 },
      ];
    } catch {
      return [];
    }
  });

  // Track daily XP velocity with 7-day sliding scale alignment
  const [xpVelocityHistory, setXpVelocityHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_xp_velocity_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Align stored index data with the latest 7-day relative sliding scale
        const historyMap = new Map(parsed.map((item: any) => [item.name, item.xpGained]));
        const alignedHistory = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
          alignedHistory.push({
            name: dateStr,
            xpGained: historyMap.has(dateStr) ? historyMap.get(dateStr) : 0,
          });
        }
        return alignedHistory;
      }
    } catch (e) {
      console.error("Error aligning velocity index history:", e);
    }
    
    // Seed gorgeous base values for daily XP targets
    const defaultVals = [20, 35, 15, 60, 45, 75, 0];
    const initialHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      initialHistory.push({
        name: dateStr,
        xpGained: defaultVals[6 - i] || 0,
      });
    }
    return initialHistory;
  });

  // Collapsible sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // High Contrast Mode & Active Board Tab States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_dark_mode");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [activeBoardTab, setActiveBoardTab] = useState<"analytics" | "achievements">("analytics");

  // Keep dark class state in sync on root element
  useEffect(() => {
    localStorage.setItem("omnitutor_dark_mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);



  // Celebratory overlay modal states
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"level-up" | "badge">("level-up");
  const [celebratedLevel, setCelebratedLevel] = useState<number>(1);
  const [celebratedBadge, setCelebratedBadge] = useState<Badge | null>(null);

  // Persistent user history states
  const [pastSessions, setPastSessions] = useState<TutorSession[]>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_past_sessions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [subjectMastery, setSubjectMastery] = useState<{ [key: string]: number }>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_subject_mastery");
      return stored ? JSON.parse(stored) : {
        "Math": 60,
        "Science": 75,
        "English": 50,
        "History": 45,
        "Coding": 80,
        "Study Habits": 40
      };
    } catch {
      return {
        "Math": 60,
        "Science": 75,
        "English": 50,
        "History": 45,
        "Coding": 80,
        "Study Habits": 40
      };
    }
  });

  // Gamified metrics stored in persistent state across interactions
  const [totalXP, setTotalXP] = useState(() => {
    try {
      const stored = localStorage.getItem("omnitutor_total_xp");
      return stored ? parseInt(stored, 10) : 120;
    } catch {
      return 120;
    }
  });

  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => {
    try {
      const stored = localStorage.getItem("omnitutor_unlocked_badges");
      return stored ? JSON.parse(stored) : [
        {
          title: "Pioneer Scholar",
          description: "Successfully booted the OmniTutor core intelligence matrix.",
          icon: "Trophy",
          color: "amber"
        }
      ];
    } catch {
      return [
        {
          title: "Pioneer Scholar",
          description: "Successfully booted the OmniTutor core intelligence matrix.",
          icon: "Trophy",
          color: "amber"
        }
      ];
    }
  });

  // Sync basic statistics with localStorage
  useEffect(() => {
    localStorage.setItem("omnitutor_total_xp", totalXP.toString());
  }, [totalXP]);

  // Universal Level Up Alert & Popups Engine
  const isFirstRender = useRef(true);
  const prevLevelRef = useRef(Math.floor(totalXP / 100) + 1);

  useEffect(() => {
    const computedLevel = Math.floor(totalXP / 100) + 1;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevLevelRef.current = computedLevel;
      return;
    }

    if (computedLevel > prevLevelRef.current) {
      // Level Up Event takes highest priority
      setCelebratedLevel(computedLevel);
      setCelebrationType("level-up");
      setCelebrationOpen(true);
      addToast(`🎉 Scholarly Rise! Welcome to Level ${computedLevel}!`, "milestone");
    }
    prevLevelRef.current = computedLevel;
  }, [totalXP]);

  useEffect(() => {
    localStorage.setItem("omnitutor_unlocked_badges", JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  useEffect(() => {
    localStorage.setItem("omnitutor_correct_streak", correctStreak.toString());
  }, [correctStreak]);

  useEffect(() => {
    localStorage.setItem("omnitutor_mastery_history", JSON.stringify(masteryHistory));
  }, [masteryHistory]);

  useEffect(() => {
    localStorage.setItem("omnitutor_xp_velocity_history", JSON.stringify(xpVelocityHistory));
  }, [xpVelocityHistory]);

  const addToast = (message: string, type: ToastEventMessage["type"] = "info") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const custom = e as CustomEvent<{ message: string; type?: ToastEventMessage["type"] }>;
      if (custom.detail) {
        addToast(custom.detail.message, custom.detail.type || "info");
      }
    };
    window.addEventListener("omnitutor-toast", handleToastEvent);
    return () => window.removeEventListener("omnitutor-toast", handleToastEvent);
  }, []);

  const currentLevel = Math.floor(totalXP / 100) + 1;
  const currentLevelPercent = totalXP % 100;

  const handleStartAnalysis = async () => {
    if (!textInput.trim() && !imageData) return;

    setIsLoading(true);
    setApiError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textInput,
          imageData,
          subject,
          gradeLevel,
          currentMastery: currentLevelPercent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "OmniTutor failed to parse the question. Try restructuring.");
      }

      const result: TutorResponse = await response.json();
      setAnalysis(result);

      const oldXP = totalXP;
      const oldLevel = Math.floor(oldXP / 100) + 1;

      // Increment XP points dynamically with a satisfying level up calculation
      let nextXP = totalXP;
      if (result.masteryScoreChange) {
        const scoreChange = result.masteryScoreChange;
        nextXP = totalXP + scoreChange;
        setTotalXP(nextXP);

        // Update daily XP velocity tracker
        setXpVelocityHistory(prev => {
          const todayStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
          return prev.map(item => {
            if (item.name === todayStr) {
              return { ...item, xpGained: item.xpGained + scoreChange };
            }
            return item;
          });
        });
      }

      // Update subject mastery levels
      if (result.subject && result.conceptMasteryLevel) {
        setSubjectMastery(prev => {
          const updated = {
            ...prev,
            [result.subject]: result.conceptMasteryLevel
          };
          localStorage.setItem("omnitutor_subject_mastery", JSON.stringify(updated));
          return updated;
        });

        // Append to history log
        setMasteryHistory(prev => {
          const lastPoint = prev[prev.length - 1] || {
            Math: 50, Science: 50, English: 50, Coding: 50, History: 45, "Study Habits": 40
          };
          const nextPointName = `Point ${prev.length + 1}`;
          const newPoint = {
            ...lastPoint,
            name: nextPointName,
            [result.subject]: result.conceptMasteryLevel
          };
          const updatedHistory = [...prev, newPoint].slice(-10); // Keep last 10 points
          return updatedHistory;
        });
      }

      // Record any newly generated game achievements
      let newBadgesAdded: Badge[] = [];
      if (result.achievementBadgesEarned && result.achievementBadgesEarned.length > 0) {
        setUnlockedBadges(prev => {
          const existingTitles = new Set(prev.map(b => b.title));
          const withNew = [...prev];
          result.achievementBadgesEarned.forEach(b => {
            if (!existingTitles.has(b.title)) {
              withNew.push(b);
              newBadgesAdded.push(b);
            }
          });
          return withNew;
        });
      }

      // Trigger Badge Celebration overlays (Level Up is handled universally via state effect)
      if (newBadgesAdded.length > 0) {
        setCelebratedBadge(newBadgesAdded[0]);
        setCelebrationType("badge");
        setCelebrationOpen(true);
      }

      // Store in past sessions limit of 5
      const newSession: TutorSession = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject,
        gradeLevel,
        textInput,
        imageData,
        analysis: result
      };

      setPastSessions(prev => {
        const filteredPast = prev.filter(p => p.textInput !== textInput); // avoid duplicates
        const updated = [newSession, ...filteredPast].slice(0, 5);
        localStorage.setItem("omnitutor_past_sessions", JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      console.error("Evaluation pipeline failed:", err);
      setApiError(err.message || "An unexpected network break interrupted OmniTutor. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPastSession = (session: TutorSession) => {
    setTextInput(session.textInput);
    setImageData(session.imageData);
    setSubject(session.subject);
    setGradeLevel(session.gradeLevel);
    setAnalysis(session.analysis);
  };

  const handleFollowUpMessage = async (
    message: string,
    context: { textInput: string; subject: string; gradeLevel: string },
    history: ChatMessage[]
  ): Promise<string> => {
    const response = await fetch("/api/followup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        context,
        history,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Tutor server missed the reply stream.");
    }

    const data = await response.json();

    // Scan for success indicators to update correct answers streak (Feature 2)
    const replyText = data.reply.toLowerCase();
    const positiveWords = ["correct", "perfect", "spot on", "excellent", "exactly", "well done", "right on track", "good job", "nice job", "great work", "spectacular"];
    const negativeWords = ["not quite", "incorrect", "wrong", "try again", "mistake", "error"];
    
    let isPositive = positiveWords.some(w => replyText.includes(w));
    let isNegative = negativeWords.some(w => replyText.includes(w));
    
    if (isPositive) {
      setCorrectStreak(prev => {
        const next = prev + 1;
        localStorage.setItem("omnitutor_correct_streak", next.toString());
        if (next === 5) {
          window.dispatchEvent(new CustomEvent("omnitutor-toast", {
            detail: { message: "🔥 Unstoppable Streak: 5 consecutive correct answers achieved in follow-up chat! Master of Logic!", type: "milestone" }
          }));
        } else {
          window.dispatchEvent(new CustomEvent("omnitutor-toast", {
            detail: { message: `Streak +1! Current Streak: ${next}`, type: "success" }
          }));
        }
        return next;
      });
    } else if (isNegative) {
      setCorrectStreak(0);
      localStorage.setItem("omnitutor_correct_streak", "0");
    }

    return data.reply;
  };

  const handleClearTutor = () => {
    setAnalysis(null);
    setApiError(null);
  };

  const handleResetGameStats = () => {
    setTotalXP(120);
    setUnlockedBadges([
      {
        title: "Pioneer Scholar",
        description: "Successfully booted the OmniTutor core intelligence matrix.",
        icon: "Trophy",
        color: "amber"
      }
    ]);
    setSubjectMastery({
      "Math": 60,
      "Science": 75,
      "English": 50,
      "History": 45,
      "Coding": 80,
      "Study Habits": 40
    });
    setPastSessions([]);
    localStorage.removeItem("omnitutor_past_sessions");
    localStorage.removeItem("omnitutor_subject_mastery");
    setAnalysis(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 antialiased transition-colors duration-250">
      
      {/* Visual Navigation Bar */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-3.5 px-6 sticky top-0 z-30 shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <GraduationCap className="h-6 w-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-zinc-900 dark:text-white tracking-tight font-mono">OmniTutor</span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 uppercase tracking-widest font-mono">
                  MULTIMODAL AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">
                Multimodal Academic Mentor & Gamified Knowledge Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
            {/* High Contrast Light/Dark Switch Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-650 transition cursor-pointer text-xs font-mono font-bold"
              title="Toggle High Contrast Theme"
            >
              {darkMode ? "☀️ LIGHT" : "🌙 DARK"}
            </button>

            {/* Real-time system game performance telemetry */}
            <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400 text-xs font-extrabold font-mono">
              <Gamepad2 className="h-4 w-4 text-indigo-500" />
              <span>OmniEngine v2.6</span>
            </div>
          </div>
        </div>
      </header>

      {/* Gamified Stat Bar Hero banner */}
      <section className="bg-zinc-950 text-white border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Level Badge widget */}
          <div className="md:col-span-3 flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center font-black font-mono text-white shadow shadow-indigo-500/30">
              {currentLevel}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Scholar Level</p>
              <h4 className="text-xs font-extrabold text-white">Elite Mind Master</h4>
            </div>
          </div>

          {/* XP Progress Bar widget */}
          <motion.div 
            key={`xp-bar-${totalXP}`}
            initial={{ scale: 0.96, opacity: 0.85 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            className="md:col-span-5 space-y-1 bg-zinc-900 p-3 rounded-xl border border-zinc-800"
          >
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">
              <span>XP Level Progress Tracker</span>
              <span>{totalXP} XP Total</span>
            </div>
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-indigo-400 h-full rounded-full shrink-0"
              />
            </div>
          </motion.div>

          {/* Accumulated Badges count */}
          <div className="md:col-span-4 flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Trophy Inventory</p>
                <h4 className="text-xs font-black text-white">{unlockedBadges.length} Badges Unlocked</h4>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetGameStats}
              className="text-[9px] font-mono uppercase bg-zinc-800 hover:bg-red-950 hover:text-red-300 text-zinc-400 px-2 py-1 rounded border border-zinc-700/60 transition cursor-pointer"
              title="Reset game variables and test again"
            >
              Reset Stats
            </button>
          </div>

        </div>
      </section>

      {/* Embedded Collapsible Recent Sessions sidebar */}
      <RecentSessionsList 
        sessions={pastSessions}
        activeSessionId={analysis ? pastSessions.find(p => p.analysis.academicResponse.summary === analysis.academicResponse.summary)?.id || null : null}
        onSelectSession={handleSelectPastSession}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main View Area (offset slightly so sidebar button doesn't cover contents) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative pl-12 md:pl-14">
        
        {/* Left Side: Inputs & Mastery Radar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Motivation card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Flame className="h-32 w-32 rotate-12" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800 text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                <Star className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> ACTIVE STUDY ZONE
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Level Up Your Thinking Pattern.</h2>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                Upload photos of math proofs, computer logic blocks, or textbook questions. OmniTutor delivers customized educational paths without spoiling immediate answers.
              </p>
            </div>
          </div>

          <TutorInputForm
            textInput={textInput}
            setTextInput={setTextInput}
            imageData={imageData}
            setImageData={setImageData}
            subject={subject}
            setSubject={setSubject}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            onSubmit={handleStartAnalysis}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side: Tab-Selected Dashboard Boards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Dashboard Panel Selector Tab */}
          <div className="flex bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300/40 dark:border-zinc-800 p-1 rounded-xl w-full transition-colors duration-250">
            <button
              onClick={() => setActiveBoardTab("analytics")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition cursor-pointer select-none ${
                activeBoardTab === "analytics"
                  ? "bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Academic Analytics
            </button>
            <button
              onClick={() => setActiveBoardTab("achievements")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition cursor-pointer select-none ${
                activeBoardTab === "achievements"
                  ? "bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" /> Achievements ({unlockedBadges.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeBoardTab === "analytics" ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Radar Chart Summary panel (Feature 1) */}
                <MasteryRadar 
                  subjectMastery={subjectMastery}
                  sessionCount={pastSessions.length}
                  masteryHistory={masteryHistory}
                />

                {/* Learning Velocity Trend Chart (Feature Addition) */}
                <LearningVelocity 
                  xpVelocityHistory={xpVelocityHistory}
                />

                {/* Quick-Fire Study Duels (Feature 3) */}
                <StudyDuels 
                  subjectMastery={subjectMastery}
                  onGainXP={(amount) => {
                    setTotalXP(prev => {
                      const nextXP = prev + amount;
                      localStorage.setItem("omnitutor_total_xp", nextXP.toString());
                      return nextXP;
                    });

                    // Update daily XP velocity tracker
                    setXpVelocityHistory(prev => {
                      const todayStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
                      return prev.map(item => {
                        if (item.name === todayStr) {
                          return { ...item, xpGained: item.xpGained + amount };
                        }
                        return item;
                      });
                    });
                  }}
                  onIncrementCorrectStreak={() => {
                    setCorrectStreak(prev => {
                      const next = prev + 1;
                      localStorage.setItem("omnitutor_correct_streak", next.toString());
                      if (next === 5) {
                        window.dispatchEvent(new CustomEvent("omnitutor-toast", {
                          detail: { message: "🔥 Unstoppable Streak: 5 consecutive correct answers achieved! You are a genuine cognitive master!", type: "milestone" }
                        }));
                      } else {
                        window.dispatchEvent(new CustomEvent("omnitutor-toast", {
                          detail: { message: `Streak +1! Current Streak: ${next}`, type: "success" }
                        }));
                      }
                      return next;
                    });
                  }}
                  onResetCorrectStreak={() => {
                    setCorrectStreak(0);
                    localStorage.setItem("omnitutor_correct_streak", "0");
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AchievementsPanel 
                  unlockedBadges={unlockedBadges}
                  subjectMastery={subjectMastery}
                  totalXP={totalXP}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-850"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">Tutor Pipeline Error</h4>
                  <p className="text-xs leading-relaxed text-red-700/90">{apiError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Board */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <TutorAnalysisResult
              analysis={analysis}
              isLoading={isLoading}
              onClear={handleClearTutor}
              currentScore={totalXP}
            />
          </div>

          {/* Consultation panel */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <FollowUpChat
                  textInput={textInput}
                  subject={subject}
                  gradeLevel={gradeLevel}
                  onSendMessage={handleFollowUpMessage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Toast Notifications Container (Feature 2) */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" id="omnitutor-toast-port">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 shadow-2xl flex items-center gap-3"
            >
              <div className="shrink-0 h-6 w-6 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                {toast.type === "success" ? (
                  <span className="text-emerald-400 font-bold font-mono text-xs">✓</span>
                ) : toast.type === "milestone" ? (
                  <span className="text-amber-400 font-bold font-mono text-xs">★</span>
                ) : (
                  <span className="text-indigo-400 font-bold font-mono text-xs">i</span>
                )}
              </div>
              <p className="text-[11px] font-medium font-sans text-zinc-100 leading-tight">
                {toast.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Interactive Celebration overlay (Feature 2) */}
      <CelebrationModal
        isOpen={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        type={celebrationType}
        level={celebratedLevel}
        badge={celebratedBadge}
      />

      {/* Floating Pomodoro Study Timer (Feature 1) */}
      <StudyTimer />

      {/* Global Bottom Dashboard */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6 text-center text-xs text-zinc-400 mt-12 space-y-1 font-mono">
        <p className="font-bold flex items-center justify-center gap-1">
          <Info className="h-3.5 w-3.5 text-zinc-300" /> OmniTutor is a gamified peer learning system built under secure Google sandbox regulations.
        </p>
        <p className="text-[10px]">No persistent personal cookies are allocated during study runs. All formulas computed via Vite with Recharts components.</p>
      </footer>
    </div>
  );
}
