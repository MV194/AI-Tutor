import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flame, Coffee, Sparkles, CheckCircle2, Timer, ChevronDown, ChevronUp, BellRing, Target, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudyTimerProps {
  onSessionComplete?: (mode: "study" | "break") => void;
}

export default function StudyTimer({ onSessionComplete }: StudyTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"study" | "break">("study");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Feature 1: Study Goals States (sync'd to localStorage)
  const [goalSubject, setGoalSubject] = useState<string>(() => localStorage.getItem("omnitutor_goal_subject") || "Math");
  const [goalMinutes, setGoalMinutes] = useState<number>(() => {
    const v = localStorage.getItem("omnitutor_goal_minutes");
    return v ? parseInt(v, 10) : 30; // default 30 minutes
  });
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(() => {
    const v = localStorage.getItem("omnitutor_accumulated_seconds");
    return v ? parseInt(v, 10) : 0;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const durationMap = {
    study: 25 * 60,
    break: 5 * 60,
  };

  useEffect(() => {
    localStorage.setItem("omnitutor_goal_subject", goalSubject);
  }, [goalSubject]);

  useEffect(() => {
    localStorage.setItem("omnitutor_goal_minutes", goalMinutes.toString());
  }, [goalMinutes]);

  useEffect(() => {
    // Sync seconds left when the mode is changed and state is not active
    if (!isRunning) {
      setSecondsLeft(durationMap[mode]);
    }
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Increment accumulated seconds under "study" mode
        if (mode === "study") {
          setAccumulatedSeconds((prevSec) => {
            const nextSec = prevSec + 1;
            localStorage.setItem("omnitutor_accumulated_seconds", nextSec.toString());

            // Milestone: 30 minutes total study time
            if (prevSec < 1800 && nextSec >= 1800) {
              window.dispatchEvent(new CustomEvent("omnitutor-toast", {
                detail: { message: "🏆 Milestone Unlocked: 30 minutes of total study time completed! Keep up the brilliant concentration!", type: "milestone" }
              }));
            }

            // Milestone: Daily Goal Completed
            const targetSeconds = goalMinutes * 60;
            if (prevSec < targetSeconds && nextSec >= targetSeconds) {
              window.dispatchEvent(new CustomEvent("omnitutor-toast", {
                detail: { message: `🌟 Goal Achieved: You met your daily study goal of ${goalMinutes} mins of ${goalSubject}! Spectacular work!`, type: "success" }
              }));
            }

            return nextSec;
          });
        }

        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Notify parent or trigger internal celebration
            if (onSessionComplete) {
              onSessionComplete(mode);
            }
            
            if (mode === "study") {
              setCompletedCount((c) => c + 1);
            }
            
            // Alert user visually
            alert(`🎉 Quest complete! Time for a ${mode === "study" ? "well-deserved break" : "focused study block"}!`);
            
            const nextMode = mode === "study" ? "break" : "study";
            setMode(nextMode);
            return durationMap[nextMode];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, goalMinutes, goalSubject]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(durationMap[mode]);
  };

  const handleModeChange = (newMode: "study" | "break") => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(durationMap[newMode]);
  };

  const resetTodayAccumulatedSeconds = () => {
    setAccumulatedSeconds(0);
    localStorage.setItem("omnitutor_accumulated_seconds", "0");
  };

  // Calculations for display
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  
  const totalDuration = durationMap[mode];
  const progressPercent = ((totalDuration - secondsLeft) / totalDuration) * 100;

  // Study Goal progress ratio
  const goalTargetSeconds = goalMinutes * 60;
  const goalProgressRatio = Math.min(accumulatedSeconds / goalTargetSeconds, 1);
  const goalProgressPercent = Math.round(goalProgressRatio * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      
      {/* Floating expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-805 shadow-2xl p-4 space-y-3.5 transition-colors"
            id="study-pomodoro-timer-panel"
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <span className="text-[10px] font-mono uppercase font-black text-zinc-650 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
                {mode === "study" ? (
                  <Flame className="h-4 w-4 text-rose-500 animate-pulse" />
                ) : (
                  <Coffee className="h-4 w-4 text-emerald-500" />
                )}
                {mode === "study" ? "Pomodoro Block" : "Break Mode"}
              </span>
              
              <div className="flex items-center gap-1.5">
                {completedCount > 0 && (
                  <span className="text-[8px] font-mono uppercase font-black text-indigo-650 dark:text-indigo-450 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> {completedCount} Done
                  </span>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-transparent"
                  title="Minimize Timer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-zinc-100/80 dark:bg-zinc-950 rounded-lg">
              <button
                type="button"
                onClick={() => handleModeChange("study")}
                className={`py-1 text-[10px] font-bold font-mono rounded cursor-pointer transition ${
                  mode === "study"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
                }`}
              >
                25m Study
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("break")}
                className={`py-1 text-[10px] font-bold font-mono rounded cursor-pointer transition ${
                  mode === "break"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-805 dark:hover:text-zinc-350"
                }`}
              >
                5m Break
              </button>
            </div>

            {/* Central Clock widget */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />

              <div className="text-center space-y-0.5">
                <h3 className="text-4xl font-black font-mono text-zinc-800 dark:text-zinc-100 tracking-tight">
                  {formattedTime}
                </h3>
                <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550">
                  {isRunning ? "Study stream online..." : "Ready to focus"}
                </p>
              </div>

              {/* Play & controls row */}
              <div className="flex items-center gap-2 w-full max-w-[170px]">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`flex-1 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition transform active:scale-95 shadow-md ${
                    isRunning 
                      ? "bg-zinc-900 hover:bg-zinc-800" 
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3 w-3 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-white" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-505 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 cursor-pointer transition shadow-xs"
                  title="Reset counter"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Feature 1: Study Goal Tracking Panel */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase font-black text-zinc-500 tracking-wider flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-indigo-500" /> Daily Target Focus
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-[9px] font-mono text-indigo-600 hover:text-indigo-805 dark:text-indigo-400 flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" /> {isEditingGoal ? "Save" : "Edit"}
                </button>
              </div>

              {isEditingGoal ? (
                <div className="space-y-2 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-mono uppercase font-bold text-zinc-400 block mb-0.5">Subject</label>
                      <select
                        className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-md p-1 focus:outline-none text-zinc-800 dark:text-zinc-200 dark:border-zinc-750"
                        value={goalSubject}
                        onChange={(e) => setGoalSubject(e.target.value)}
                      >
                        <option value="Math">Math</option>
                        <option value="Science">Science</option>
                        <option value="Coding">Coding</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Habits">Habits</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-mono uppercase font-bold text-zinc-400 block mb-0.5">Duration</label>
                      <select
                        className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-md p-1 focus:outline-none text-zinc-800 dark:text-zinc-200 dark:border-zinc-750"
                        value={goalMinutes}
                        onChange={(e) => setGoalMinutes(parseInt(e.target.value, 10))}
                      >
                        <option value="5">5 Mins</option>
                        <option value="15">15 Mins</option>
                        <option value="30">30 Mins</option>
                        <option value="45">45 Mins</option>
                        <option value="60">60 Mins (1h)</option>
                        <option value="120">120 Mins (2h)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="w-full text-[9px] font-mono bg-indigo-50 dark:bg-indigo-955/70 text-indigo-700 dark:text-indigo-400 py-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded text-center transition font-bold border dark:border-indigo-900"
                  >
                    Confirm Goal Settings
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800">
                  {/* Goal SVG Progress Ring inside panel */}
                  <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="stroke-indigo-600 transition-all duration-300"
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - goalProgressRatio)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-black font-mono text-zinc-700 dark:text-zinc-300">
                      {goalProgressPercent}%
                    </span>
                  </div>

                  {/* Goal info text */}
                  <div className="space-y-0.5 animate-fadeIn">
                    <h5 className="text-[10px] font-extrabold text-zinc-700 dark:text-zinc-200 font-mono tracking-tight leading-none">
                      {goalMinutes} mins of {goalSubject}
                    </h5>
                    <p className="text-[9px] text-zinc-400 font-medium">
                      Accumulated: {Math.floor(accumulatedSeconds / 60)}m {accumulatedSeconds % 60}s
                    </p>
                    {goalProgressRatio >= 1 ? (
                      <span className="text-[8px] uppercase font-black text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded inline-block font-mono animate-pulse">
                        Goal Achieved Today!
                      </span>
                    ) : (
                      <button
                        onClick={resetTodayAccumulatedSeconds}
                        className="text-[8px] text-zinc-400 font-mono hover:text-red-500 cursor-pointer block"
                        title="Reset daily progress tracker"
                      >
                        Reset Progress
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg border cursor-pointer font-mono text-xs font-black transition-all ${
          isRunning 
            ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400" 
            : mode === "break"
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-700 dark:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }`}
        id="study-timer-floating-badge"
      >
        {/* Dynamic circular goal progress ring next to timer */}
        <div className="relative flex items-center justify-center h-6 w-6 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="9"
              className="stroke-zinc-150 dark:stroke-zinc-805"
              strokeWidth="2.2"
              fill="transparent"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              className="stroke-indigo-600 transition-all duration-300"
              strokeWidth="2.2"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - goalProgressRatio)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[7px] font-black font-mono text-indigo-700 dark:text-indigo-400">
            {goalProgressPercent}%
          </span>
        </div>

        <Timer className="h-4 w-4" />
        <span className="font-bold tracking-tight">{formattedTime}</span>
        
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 ml-0.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-400 ml-0.5" />
        )}
      </motion.button>

    </div>
  );
}

