import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Brain, Trophy, Star, TrendingUp, Presentation, LineChart as LineChartIcon } from "lucide-react";

interface SubjectMastery {
  subject: string;
  level: number;
}

interface MasteryRadarProps {
  subjectMastery: { [key: string]: number };
  sessionCount: number;
  masteryHistory: any[];
}

export default function MasteryRadar({ subjectMastery, sessionCount, masteryHistory }: MasteryRadarProps) {
  const [activeView, setActiveView] = useState<"radar" | "line">("radar");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    // Monitor dark mode state changes dynamically to update SVG stroke/text colours perfectly
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Map subjects into chart coordinate format
  const chartData = [
    { name: "📐 Math", value: subjectMastery["Math"] || 50 },
    { name: "🌌 Science", value: subjectMastery["Science"] || 50 },
    { name: "✍️ English", value: subjectMastery["English"] || 50 },
    { name: "📜 History", value: subjectMastery["History"] || 50 },
    { name: "🐍 Coding", value: subjectMastery["Coding"] || 50 },
    { name: "⚡ Study", value: subjectMastery["Study Habits"] || 50 },
  ];

  // Calculate Average Mastery
  const total = Object.values(subjectMastery).reduce((sum, val) => sum + val, 0);
  const averageMastery = Math.round(total / 6);

  return (
    <motion.div 
      key={`mastery-${total}`}
      initial={{ scale: 0.98, y: 4, opacity: 0.85 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      id="mastery-radar-card" 
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-100 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-indigo-500" /> Academic Mastery Matrix
          </h4>
        </div>

        {/* Dual Mode Tab Selector */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg self-start sm:self-auto shrink-0 border dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveView("radar")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold font-mono rounded-md transition cursor-pointer ${
              activeView === "radar"
                ? "bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Presentation className="h-3 w-3" /> Snapshot
          </button>
          <button
            type="button"
            onClick={() => setActiveView("line")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold font-mono rounded-md transition cursor-pointer ${
              activeView === "line"
                ? "bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <LineChartIcon className="h-3 w-3" /> Timeline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-fadeIn">
        {/* Chart Side */}
        <div className="md:col-span-8 h-56 flex items-center justify-center min-w-0">
          {activeView === "radar" ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke={isDark ? "#3f3f46" : "#e4e4e7"} />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? "#a1a1aa" : "#52525b", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: isDark ? "#71717a" : "#a1a1aa", fontSize: 9 }}
                  axisLine={false}
                />
                <Radar
                   name="Proficiency"
                   dataKey="value"
                   stroke="#6366f1"
                   fill="#818cf8"
                   fillOpacity={isDark ? 0.25 : 0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={masteryHistory} margin={{ top: 12, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#f4f4f5"} />
                <XAxis dataKey="name" tick={{ fill: isDark ? "#a1a1aa" : "#71717a", fontSize: 8, fontWeight: 700, fontFamily: "monospace" }} />
                <YAxis domain={[0, 100]} tick={{ fill: isDark ? "#71717a" : "#a1a1aa", fontSize: 8 }} />
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
                <Legend wrapperStyle={{ fontSize: "8px", fontFamily: "monospace", paddingTop: "5px" }} />
                <Line type="monotone" name="Math" dataKey="Math" stroke="#6366f1" activeDot={{ r: 5 }} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" name="Science" dataKey="Science" stroke="#10b981" activeDot={{ r: 5 }} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" name="English" dataKey="English" stroke="#f59e0b" activeDot={{ r: 5 }} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" name="Coding" dataKey="Coding" stroke="#f43f5e" activeDot={{ r: 5 }} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" name="History" dataKey="History" stroke="#d97706" activeDot={{ r: 5 }} strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend / Breakdown Side */}
        <div className="md:col-span-4 space-y-3 font-mono">
          <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-center space-y-0.5 transition-colors">
            <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-550 font-mono tracking-widest">Average Aptitude</p>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="text-emerald-500 h-3.5 w-3.5 shrink-0" />
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 font-mono">{averageMastery}%</span>
            </div>
            <p className="text-[8px] text-zinc-400 dark:text-zinc-500">Calculated over all cognitive quadrants</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono font-medium text-zinc-650 dark:text-zinc-400">
            {[
              { id: "Math", name: "📐 Math" },
              { id: "Science", name: "🌌 Science" },
              { id: "English", name: "✍️ English" },
              { id: "Coding", name: "🐍 Coding" },
              { id: "History", name: "📜 History" },
              { id: "Study Habits", name: "⚡ Study" }
            ].map((sub) => {
              const val = subjectMastery[sub.id] !== undefined ? subjectMastery[sub.id] : 50;
              const isLow = val < 40;
              return (
                <div 
                  key={sub.id} 
                  className={`p-1.5 border rounded-lg transition-all ${
                    isLow 
                      ? "border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400" 
                      : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/10 text-zinc-650 dark:text-zinc-400"
                  }`}
                >
                  <span className={`${isLow ? "text-rose-800 dark:text-rose-400 font-bold" : "text-zinc-400 dark:text-zinc-500"} block mb-0.5 font-sans leading-none`}>
                    {sub.name}
                  </span>
                  <div className="flex items-center justify-between">
                    <strong className={`text-xs ${isLow ? "text-rose-600 dark:text-rose-400 font-black" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {val}%
                    </strong>
                    {isLow && (
                      <span className="text-[7px] uppercase bg-rose-100 dark:bg-rose-950/50 px-1 py-0.2 rounded font-black tracking-wider text-rose-600 dark:text-rose-400">
                        LOW
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
