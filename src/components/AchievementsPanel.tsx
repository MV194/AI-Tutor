import React, { useState } from "react";
import { Trophy, Star, Shield, Zap, Compass, Feather, Cpu, Bookmark, HelpCircle, Lock, Unlock, Award } from "lucide-react";
import { Badge } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AchievementsPanelProps {
  unlockedBadges: Badge[];
  subjectMastery: { [key: string]: number };
  totalXP: number;
}

interface PredefinedAchievement {
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  check: (props: { unlockedBadges: Badge[]; subjectMastery: { [key: string]: number }; totalXP: number }) => boolean;
}

const ALL_ACHIEVEMENTS: PredefinedAchievement[] = [
  {
    title: "Pioneer Scholar",
    description: "Successfully booted the OmniTutor core intelligence matrix.",
    icon: "Trophy",
    color: "amber",
    requirement: "Unlocked by default.",
    check: () => true
  },
  {
    title: "Math Sorcerer",
    description: "Formulated and appraised complex mathematical proofs.",
    icon: "Zap",
    color: "emerald",
    requirement: "Achieve Math mastery level of 65% or higher.",
    check: ({ subjectMastery }) => (subjectMastery["Math"] || 50) >= 65
  },
  {
    title: "Celestial Explorer",
    description: "Appraised cosmological, planetary, or chemical structures.",
    icon: "compass",
    color: "rose",
    requirement: "Achieve Science mastery level of 70% or higher.",
    check: ({ subjectMastery }) => (subjectMastery["Science"] || 50) >= 70
  },
  {
    title: "Syntax Warlord",
    description: "Solved advanced data algorithms and software logic.",
    icon: "cpu",
    color: "indigo",
    requirement: "Achieve Coding mastery level of 80% or higher.",
    check: ({ subjectMastery }) => (subjectMastery["Coding"] || 50) >= 80
  },
  {
    title: "Orator Scribe",
    description: "Mastered active literal comprehension and narration.",
    icon: "feather",
    color: "amber",
    requirement: "Achieve English mastery level of 60% or higher.",
    check: ({ subjectMastery }) => (subjectMastery["English"] || 50) >= 60
  },
  {
    title: "Eminent Thinker",
    description: "Ascended into high scholar state with formidable XP.",
    icon: "shield",
    color: "indigo",
    requirement: "Reach a total of 300 Scholar XP points.",
    check: ({ totalXP }) => totalXP >= 300
  },
  {
    title: "Demi-God Scholar",
    description: "Attained absolute cognitive supremacy across chapters.",
    icon: "trophy",
    color: "rose",
    requirement: "Reach a total of 800 Scholar XP points.",
    check: ({ totalXP }) => totalXP >= 800
  }
];

export default function AchievementsPanel({ unlockedBadges, subjectMastery, totalXP }: AchievementsPanelProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const getBadgeIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "trophy": return <Trophy className="h-5 w-5 text-amber-500" />;
      case "shield": return <Shield className="h-5 w-5 text-indigo-500" />;
      case "zap": return <Zap className="h-5 w-5 text-yellow-500" />;
      case "compass": return <Compass className="h-5 w-5 text-teal-600" />;
      case "feather": return <Feather className="h-5 w-5 text-emerald-500" />;
      case "cpu": return <Cpu className="h-5 w-5 text-indigo-500" />;
      default: return <Bookmark className="h-5 w-5 text-zinc-500" />;
    }
  };

  const badgeColorMapping: { [key: string]: string } = {
    amber: "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-955/20 text-amber-900 dark:text-amber-400",
    emerald: "border-emerald-250 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-900 dark:text-emerald-400",
    rose: "border-rose-250 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-955/20 text-rose-900 dark:text-rose-400",
    indigo: "border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-400",
    default: "border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
  };

  // Resolve which achievements are unlocked based on either the list and actual checks
  const resolvedAchievements = ALL_ACHIEVEMENTS.map(ach => {
    // Already in unlockedBadges object or satisfies the programmatic check
    const isUnlocked = unlockedBadges.some(b => b.title.toLowerCase() === ach.title.toLowerCase()) || ach.check({ unlockedBadges, subjectMastery, totalXP });
    return {
      ...ach,
      isUnlocked
    };
  });

  const filtered = resolvedAchievements.filter(ach => {
    if (filter === "unlocked") return ach.isUnlocked;
    if (filter === "locked") return !ach.isUnlocked;
    return true;
  });

  const unlockedCount = resolvedAchievements.filter(a => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / resolveAchievementsLength()) * 100);

  function resolveAchievementsLength() {
    return ALL_ACHIEVEMENTS.length || 1;
  }

  return (
    <div id="achievements-interactive-tab-card" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <Award className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
          </span>
          <div>
            <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 tracking-wider font-mono uppercase">
              Trophy Room & Accomplishments
            </h4>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Unlock badges by climbing subject chapters and XP ranks</p>
          </div>
        </div>

        {/* Filters tab switcher (subsequent/locked tabs) */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg text-[9px] font-bold font-mono self-start sm:self-auto shrink-0 border dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded cursor-pointer transition ${filter === "all" ? "bg-white dark:bg-zinc-805 text-indigo-700 dark:text-indigo-400 shadow-xs" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            All ({resolvedAchievements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unlocked")}
            className={`px-2 py-1 rounded cursor-pointer transition flex items-center gap-1 ${filter === "unlocked" ? "bg-white dark:bg-zinc-805 text-indigo-700 dark:text-indigo-400 shadow-xs" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("locked")}
            className={`px-2 py-1 rounded cursor-pointer transition flex items-center gap-1 ${filter === "locked" ? "bg-white dark:bg-zinc-805 text-indigo-700 dark:text-indigo-400 shadow-xs" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            Locked ({resolvedAchievements.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Progress ring or line bar indicator */}
      <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-505 dark:text-zinc-400">
          <span className="font-sans text-zinc-650 dark:text-zinc-300">Trophy Progression</span>
          <span>{unlockedCount} / {ALL_ACHIEVEMENTS.length} Cleared ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>
      </div>

      {/* List items of achievements (current/upcoming) */}
      <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.map((ach, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-3 flex gap-3 items-start transition relative overflow-hidden ${
              ach.isUnlocked
                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                : "bg-zinc-50/70 dark:bg-zinc-950/20 border-zinc-150 dark:border-zinc-805 opacity-75"
            }`}
          >
            {/* Corner status tag */}
            <div className="absolute top-2.5 right-2.5">
              {ach.isUnlocked ? (
                <span className="text-[7.5px] uppercase font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-900/30 flex items-center gap-0.5 font-mono">
                  <Unlock className="h-2 w-2" /> Unlocked
                </span>
              ) : (
                <span className="text-[7.5px] uppercase font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-750 flex items-center gap-0.5 font-mono">
                  <Lock className="h-2 w-2" /> Locked
                </span>
              )}
            </div>

            {/* Icon Block */}
            <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center shadow-inner ${
              ach.isUnlocked
                ? badgeColorMapping[ach.color] || "bg-indigo-50 border-indigo-200"
                : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
            }`}>
              {ach.isUnlocked ? getBadgeIcon(ach.icon) : <Lock className="h-4.5 w-4.5 text-zinc-400" />}
            </div>

            {/* Copy details */}
            <div className="space-y-0.5 pr-14">
              <h5 className={`text-xs font-bold leading-tight ${ach.isUnlocked ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-450 font-medium"}`}>
                {ach.title}
              </h5>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-sans font-medium">
                {ach.description}
              </p>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-550 font-mono flex items-center gap-1 pt-1">
                <span className="font-semibold text-zinc-400 dark:text-zinc-500 uppercase">Goal:</span> {ach.requirement}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-6 text-zinc-400 text-xs font-mono">
            No milestones found matching filter terms.
          </div>
        )}
      </div>

    </div>
  );
}
