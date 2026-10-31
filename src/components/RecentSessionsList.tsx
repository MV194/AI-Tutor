import React, { useState } from "react";
import { TutorSession } from "../types";
import { History, BookOpen, Clock, Calendar, CheckSquare, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecentSessionsListProps {
  sessions: TutorSession[];
  activeSessionId: string | null;
  onSelectSession: (session: TutorSession) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function RecentSessionsList({ 
  sessions, 
  activeSessionId, 
  onSelectSession,
  isOpen, 
  setIsOpen 
}: RecentSessionsListProps) {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All");
  
  const getSubjectEmoji = (sub: string) => {
    switch (sub) {
      case "Math": return "📐";
      case "Science": return "🌌";
      case "English": return "✍️";
      case "History": return "📜";
      case "Coding": return "🐍";
      default: return "⚡";
    }
  };

  const filteredSessions = selectedSubjectFilter === "All"
    ? sessions
    : sessions.filter(s => s.subject === selectedSubjectFilter);

  const subjects = ["All", "Math", "Science", "English", "History", "Coding"];

  return (
    <div className="relative">
      {/* Mobile/Desktop toggle tab attached to drawer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 left-0 z-40 bg-zinc-900 border-y border-r border-zinc-700 dark:bg-zinc-850 dark:border-zinc-700 text-white rounded-r-lg p-2.5 shadow-md flex items-center justify-center cursor-pointer transition hover:bg-zinc-800 dark:hover:bg-zinc-800"
        title="Toggle Past Study Quests"
      >
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
          <History className="h-4 w-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="hidden sm:inline">Sessions ({sessions.length})</span>
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay on mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 bg-zinc-950/20 md:hidden backdrop-blur-xs"
            />

            {/* Sidebar drawer panel with fully integrated dark mode support */}
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-20 bottom-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-30 shadow-xl flex flex-col pt-16 h-[calc(100vh-5rem)]"
            >
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-mono uppercase font-black text-zinc-500 dark:text-zinc-400 tracking-widest flex items-center gap-1.5">
                  <History className="h-4 w-4 text-indigo-500" /> Historical Study Quests
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono">Max 5 Logged</span>
              </div>

              {/* High Contrast Subject segment filters */}
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-wider shrink-0">Sort:</span>
                <div className="flex gap-1">
                  {subjects.map((sub) => {
                    const count = sub === "All" ? sessions.length : sessions.filter(s => s.subject === sub).length;
                    const isActive = selectedSubjectFilter === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubjectFilter(sub)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer shrink-0 border ${
                          isActive
                            ? "bg-indigo-650 text-white border-indigo-700 shadow-xs"
                            : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-850 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
                        }`}
                      >
                        {sub} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list of previous analyses */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredSessions.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                    <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-650" />
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-400">No sessions match</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 leading-relaxed">
                      {selectedSubjectFilter === "All" 
                        ? "Complete study questions to store past scholar quests here."
                        : `No study logs found for ${selectedSubjectFilter}.`}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectSession(s)}
                        className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                          isActive
                            ? "bg-indigo-55/40 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800 shadow-sm shadow-indigo-100 dark:shadow-none"
                            : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/60 dark:border-indigo-900/60 px-2 py-0.5 rounded">
                            {getSubjectEmoji(s.subject)} {s.subject}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {s.timestamp}
                          </span>
                        </div>

                        {/* Snippet representation */}
                        <p className="text-[11px] text-zinc-650 dark:text-zinc-300 line-clamp-2 leading-relaxed font-semibold">
                          {s.textInput || "Multimodal photo appraisal quest"}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 pt-1 font-mono">
                          <span>{s.gradeLevel}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                            Level Progress: {s.analysis.conceptMasteryLevel}%
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              
              {/* Optional footer tip */}
              <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-[10px] text-zinc-400 dark:text-zinc-500 text-center font-mono shrink-0">
                <p>Click session cards to reload active matrices</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
