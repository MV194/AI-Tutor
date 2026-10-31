import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Zap, Star, Shield, Swords, Compass, Feather, Cpu, BookOpen, Sparkles, X, ChevronRight } from "lucide-react";
import { Badge } from "../types";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "level-up" | "badge";
  level?: number;
  badge?: Badge | null;
}

export default function CelebrationModal({ isOpen, onClose, type, level = 1, badge = null }: CelebrationModalProps) {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "trophy": return <Trophy className="h-10 w-10 text-amber-500" />;
      case "shield": return <Shield className="h-10 w-10 text-indigo-505" />;
      case "swords": return <Swords className="h-10 w-10 text-rose-500" />;
      case "zap": return <Zap className="h-10 w-10 text-yellow-500 animate-pulse" />;
      case "compass": return <Compass className="h-10 w-10 text-teal-500" />;
      case "feather": return <Feather className="h-10 w-10 text-emerald-505" />;
      case "cpu": return <Cpu className="h-10 w-10 text-indigo-505" />;
      default: return <BookOpen className="h-10 w-10 text-zinc-500" />;
    }
  };

  const badgeColorMapping: { [key: string]: string } = {
    amber: "border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-955/20 shadow-amber-200/55 text-amber-900 dark:text-amber-400",
    emerald: "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-955/20 shadow-emerald-200/55 text-emerald-900 dark:text-emerald-400",
    rose: "border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-955/20 shadow-rose-200/55 text-rose-900 dark:text-rose-450",
    indigo: "border-indigo-300 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/20 shadow-indigo-200/55 text-indigo-900 dark:text-indigo-400",
    default: "border-zinc-300 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-950 shadow-zinc-200/55 text-zinc-900 dark:text-zinc-200"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-20 p-6 text-center space-y-6 transition-colors"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition cursor-pointer active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Sparkles Decoration */}
            <div className="absolute top-6 left-12 opacity-30 text-amber-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="absolute top-12 right-12 opacity-30 text-indigo-500">
              <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            {type === "level-up" ? (
              /* LEVEL UP CELEBRATION */
              <div className="space-y-4 font-sans">
                <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-gradient-to-tr from-amber-400 via-amber-505 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-black text-white font-mono">{level}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-550 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/20 border border-amber-200/60 dark:border-amber-900/40 px-3 py-1 rounded-full inline-block font-mono">
                    🎓 INTELLECTUAL MILESTONE REACHED
                  </span>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Level Up Completed!</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto font-medium">
                    Congratulations! Your cognitive depth expands. You are now recognized as a <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">Level {level} Scholar</strong>.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-xl grid grid-cols-2 gap-2 text-xs font-mono text-left transition-colors">
                  <div className="p-1">
                    <span className="text-[9px] text-zinc-400 block font-sans">COGNITION BOUND</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 text-sm">Enhanced</strong>
                  </div>
                  <div className="p-1 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    <span className="text-[9px] text-zinc-400 block font-sans">GEMINI INTELLIGENCE</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">Synchronized</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* BADGE UNLOCKED CELEBRATION */
              <div className="space-y-4 font-sans">
                <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse" />
                  <div className={`h-20 w-20 rounded-2xl border flex items-center justify-center shadow-md ${badgeColorMapping[badge?.color || "default"] || "bg-indigo-50 text-indigo-700"}`}>
                    {badge ? getBadgeIcon(badge.icon) : <Trophy className="h-10 w-10 text-amber-500" />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 px-3 py-1 rounded-full inline-block font-mono">
                    🏆 UNLOCKED ACADEMIC ACHIEVEMENT
                  </span>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {badge?.title || "New Study Trophy"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto font-medium">
                    &ldquo;{badge?.description || "You earned a badge for solving challenging textbook problems!"}&rdquo;
                  </p>
                </div>

                <div className="pt-2 bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-indigo-500/5 dark:from-indigo-950/5 dark:via-indigo-950/20 dark:to-indigo-950/5 p-3 rounded-xl border border-indigo-100/40 dark:border-indigo-900/30 transition-colors">
                  <p className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 fill-indigo-600 text-indigo-600" /> +25 BONUS ACADEMIC KNOWLEDGE XP
                  </p>
                </div>
              </div>
            )}

            {/* Acknowledgment button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 border dark:border-zinc-700"
              >
                <span>CONTINUE THE CAMPAIGN</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
