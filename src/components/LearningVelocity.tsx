import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Activity, Flame, TrendingUp, Sparkles, Award } from "lucide-react";

interface LearningVelocityProps {
  xpVelocityHistory: { name: string; xpGained: number }[];
}

export default function LearningVelocity({ xpVelocityHistory }: LearningVelocityProps) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Calculate some analytics
  const totalGained = xpVelocityHistory.reduce((sum, item) => sum + item.xpGained, 0);
  const activeDays = xpVelocityHistory.filter(item => item.xpGained > 0).length;
  const avgGained = Math.round(totalGained / Math.max(xpVelocityHistory.length, 1));

  // Streak calculation (days with non-zero XP ending today/recent)
  let activeStreak = 0;
  for (let i = xpVelocityHistory.length - 1; i >= 0; i--) {
    if (xpVelocityHistory[i].xpGained > 0) {
      activeStreak++;
    } else {
      break;
    }
  }

  return (
    <div id="learning-velocity-card" className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
            <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
          </span>
          <div>
            <h4 className="text-xs font-mono font-black text-zinc-850 dark:text-zinc-100 tracking-wider uppercase">
              Learning Velocity Tracker
            </h4>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">XP accumulation metrics over last 7 days of active study sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 animate-pulse" /> {activeStreak}d STREAK
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Render area chart */}
        <div className="md:col-span-8 h-48 sm:h-52 flex items-center justify-center min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={xpVelocityHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXpGains" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#f4f4f5"} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: isDark ? "#a1a1aa" : "#71717a", fontSize: 8, fontWeight: 700, fontFamily: "monospace" }} 
              />
              <YAxis 
                tick={{ fill: isDark ? "#71717a" : "#a1a1aa", fontSize: 8 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: "10px", 
                  fontFamily: "monospace", 
                  borderRadius: "8px", 
                  backgroundColor: isDark ? "#18181b" : "#ffffff", 
                  borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                  color: isDark ? "#f4f4f5" : "#18181b" 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="xpGained" 
                name="Gains" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorXpGains)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats segment */}
        <div className="md:col-span-4 space-y-3 font-mono">
          <div className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-500">Aggregate XP (7d)</span>
              <strong className="text-indigo-600 dark:text-indigo-400 text-xs">+{totalGained} XP</strong>
            </div>
            <div className="w-full bg-zinc-250 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalGained / 400) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-zinc-100 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/20 dark:bg-zinc-950/10">
              <span className="text-[8px] text-zinc-400 uppercase font-bold block">Velocity</span>
              <strong className="text-zinc-700 dark:text-zinc-300 text-xs font-mono">+{avgGained} XP</strong>
            </div>
            <div className="p-2 border border-zinc-100 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/20 dark:bg-zinc-950/10">
              <span className="text-[8px] text-zinc-400 uppercase font-bold block">Active Days</span>
              <strong className="text-zinc-700 dark:text-zinc-300 text-xs font-mono">{activeDays} / 7</strong>
            </div>
          </div>

          <div className="p-2 border border-indigo-100/50 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/10 rounded-lg text-center flex items-center justify-center gap-1 select-none">
            <Award className="h-3 w-3 text-indigo-500 shrink-0" />
            <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">Velocity Track Recalculated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
