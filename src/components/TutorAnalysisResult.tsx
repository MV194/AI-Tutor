import React, { useState } from "react";
import { TutorResponse, Badge } from "../types";
import { renderRichAcademicText } from "../utils/markdownParser";
import { 
  Trophy, Shield, Swords, Zap, BookOpen, Compass, Feather, Cpu, 
  HelpCircle, Eye, EyeOff, Check, Clipboard, RefreshCw, Sparkles, Award, Download,
  Volume2, VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

interface TutorAnalysisResultProps {
  analysis: TutorResponse | null;
  isLoading: boolean;
  onClear: () => void;
  currentScore: number;
}

export default function TutorAnalysisResult({ analysis, isLoading, onClear, currentScore }: TutorAnalysisResultProps) {
  const [revealedHints, setRevealedHints] = useState<boolean[]>([]);
  const [selectedExerciseAnswer, setSelectedExerciseAnswer] = useState<string>("");
  const [exerciseEvaluated, setExerciseEvaluated] = useState<boolean>(false);
  const [exerciseResult, setExerciseResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Clean up any acting speech synthesis on component unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      window.dispatchEvent(new CustomEvent("omnitutor-toast", {
        detail: { message: "Audio speech synthesis is not supported in this browser environment.", type: "info" }
      }));
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!analysis) return;

    const cleanTextForSpeech = (str: string) => {
      if (!str) return "";
      return str
        .replace(/\$\$/g, " ")
        .replace(/\$/g, " ")
        .replace(/\*\*/g, " ")
        .replace(/\\rightarrow/g, " leads to ")
        .replace(/\\times/g, " times ")
        .replace(/\\div/g, " divided by ")
        .replace(/\\le/g, " less than or equal to ")
        .replace(/\\ge/g, " greater than or equal to ")
        .replace(/\\cdot/g, " times ")
        .replace(/\\pm/g, " plus or minus ")
        .replace(/`/g, " ");
    };

    const textToSpeak = [
      `Academic Feed-back for ${analysis.subject}, level ${analysis.gradeLevel}.`,
      `Summary Overview: ${cleanTextForSpeech(analysis.academicResponse.summary)}`,
      `Step by step walkthrough:`,
      ...analysis.academicResponse.coachingSteps.map((step, idx) => `Milestone ${idx + 1}: ${cleanTextForSpeech(step)}`),
      `Strategic Angle: ${cleanTextForSpeech(analysis.academicResponse.alternativePerspective)}`
    ].join(" . ");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Pick an english voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
                  voices.find(v => v.lang.startsWith("en-")) || 
                  voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const exportToPDF = () => {
    if (!analysis) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - (margin * 2);
      let y = 18;

      const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          doc.addPage();
          y = 18;
          drawFooter();
        }
      };

      const drawFooter = () => {
        const oldFont = doc.getFont();
        const oldSize = doc.getFontSize();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("OmniTutor Multimodal Academic Engine - Personalized Study Report", margin, pageHeight - 10);
        doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 10);
        
        // Restore previous font configurations
        doc.setFont(oldFont.fontName, oldFont.fontStyle);
        doc.setFontSize(oldSize);
      };

      // Draw footer on first page
      drawFooter();

      // 1. Header block
      doc.setFillColor(30, 41, 59); // zinc-800
      doc.rect(margin, y, contentWidth, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("OMNITUTOR STUDY GUIDE & COGNITIVE ANALYSIS", margin + 5, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(200, 201, 210);
      doc.text(`Subject: ${analysis.subject.toUpperCase()}   |   Grade Level: ${analysis.gradeLevel.toUpperCase()}  |  XP GAINED: +${analysis.masteryScoreChange} XP`, margin + 5, y + 17);

      y += 32;

      // 2. Metrics Block
      ensureSpace(20);
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.rect(margin, y, contentWidth, 16, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`CONCEPT MASTERY COMPLIANCE: ${analysis.conceptMasteryLevel}%`, margin + 6, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122); // zinc-500
      const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Report Compiled: ${today}`, margin + 115, y + 10);

      y += 24;

      // Helper for wrapping and writing titles
      const writeSectionTitle = (title: string, color: [number, number, number]) => {
        ensureSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(title, margin, y);
        
        doc.setDrawColor(228, 228, 231); // line-zinc-200
        doc.setLineWidth(0.4);
        doc.line(margin, y + 2, margin + contentWidth, y + 2);
        y += 8;
      };

      const cleanTextForPDF = (text: string) => {
        if (!text) return "";
        return text
          .replace(/\$\$/g, "\n")
          .replace(/\$/g, "")
          .replace(/\\rightarrow/g, " -> ")
          .replace(/\\times/g, " x ")
          .replace(/\\div/g, " / ")
          .replace(/\\le/g, " <=")
          .replace(/\\ge/g, " >=")
          .replace(/\\cdot/g, " * ")
          .replace(/\\pm/g, " +/- ");
      };

      const writeBlock = (text: string) => {
        const clean = cleanTextForPDF(text);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(63, 63, 70); // zinc-700
        const lines = doc.splitTextToSize(clean, contentWidth);
        const textLinesArray: string[] = Array.isArray(lines) ? lines : [lines];
        
        textLinesArray.forEach((line: string) => {
          ensureSpace(6);
          doc.text(line, margin, y);
          y += 5.5;
        });
        y += 4;
      };

      // Summary Topic
      writeSectionTitle("I. EXECUTIVE SUMMARY & ADVISORY OVERVIEW", [15, 23, 42]);
      writeBlock(analysis.academicResponse.summary);

      // Steps Topic
      writeSectionTitle("II. STEP-BY-STEP COGNITIVE LEARNING CONTEXT", [79, 70, 229]);
      analysis.academicResponse.coachingSteps.forEach((step, idx) => {
        ensureSpace(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Milestone ${idx + 1}:`, margin, y);
        y += 4.5;
        writeBlock(step);
      });

      // Alternative perspective
      writeSectionTitle("III. ALTERNATIVE STRATEGIC ANGLE & INFERENCE", [15, 23, 42]);
      writeBlock(analysis.academicResponse.alternativePerspective);

      // Self-Assessment Exercise
      writeSectionTitle("IV. CHECK YOUR UNDERSTANDING - QUEST EXERCISE", [217, 119, 6]);
      writeBlock(analysis.academicResponse.guidedExercise);

      // Locked Clues
      if (analysis.academicResponse.hints && analysis.academicResponse.hints.length > 0) {
        ensureSpace(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text("ADDITIONAL TUTORING CLUES AVAILABLE IN REPORT:", margin, y);
        y += 6;
        analysis.academicResponse.hints.forEach((hint, idx) => {
          writeBlock(`Clue #${idx + 1}: ${hint}`);
        });
      }

      // Boss practices
      if (analysis.suggestedPractice && analysis.suggestedPractice.length > 0) {
        writeSectionTitle("V. STANDALONE PRACTICE & BOSS ROADMAPS", [13, 148, 136]);
        analysis.suggestedPractice.forEach((practice, idx) => {
          writeBlock(`Challenge #${idx + 1}: ${practice}`);
        });
      }

      // Save as local PDF
      const safeTitle = analysis.subject.toLowerCase().replace(/[^a-z0-9]/g, "_");
      doc.save(`omnitutor_${safeTitle}_study_path.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Encountered an output exception compiling PDF data. Check network logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "trophy": return <Trophy className="h-5 w-5" />;
      case "shield": return <Shield className="h-5 w-5" />;
      case "swords": return <Swords className="h-5 w-5" />;
      case "zap": return <Zap className="h-5 w-5" />;
      case "compass": return <Compass className="h-5 w-5" />;
      case "feather": return <Feather className="h-5 w-5" />;
      case "cpu": return <Cpu className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getBadgeColor = (colorName: string) => {
    switch (colorName?.toLowerCase()) {
      case "amber": return "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50";
      case "emerald": return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50";
      case "rose": return "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/50";
      case "indigo": return "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100/50";
      default: return "bg-zinc-50 text-zinc-700 border-zinc-200 shadow-zinc-100/50";
    }
  };

  // Helper to format text replacing LaTeX block $$ and inline $ for web-safe layout
  const formatLaTeXText = (str: string) => {
    return renderRichAcademicText(str);
  };

  const handleValidateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseAnswer.trim()) return;

    // Simulate basic constructive outcome encouraging critical review
    setExerciseEvaluated(true);
    setExerciseResult({
      success: true,
      msg: "Nice job submitting your analysis! Discuss your answer in the Live Consultation box below to verify code nuances or proof structures with OmniTutor."
    });
  };

  const toggleHint = (idx: number) => {
    setRevealedHints(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  if (isLoading) {
    return (
      <div id="tutor-analysis-result" className="bg-white rounded-xl border border-zinc-200 p-8 shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[550px]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <Award className="h-6 w-6 text-indigo-600 absolute animate-pulse animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg text-zinc-900 tracking-tight">OmniTutor is reviewing your homework...</h3>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Generating custom cognitive depth guidelines, calculating master level changes, and forging RPG achievements.
          </p>
        </div>
        <div className="w-full space-y-3 max-w-md pt-4">
          <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4 mx-auto" />
          <div className="h-3 bg-zinc-100 rounded animate-pulse w-5/6 mx-auto" />
          <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div id="tutor-analysis-result" className="bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[550px] transition-colors">
        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
        </div>
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mb-1.5">No active Study Session</h3>
        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
          Select one of the sample templates or enter a custom homework scenario on the left, then click "Summon Academic Tutor" to build your mastery level!
        </p>
      </div>
    );
  }

  return (
    <div id="tutor-analysis-result" className="space-y-6">
      
      {/* Header Stat Board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
            {analysis.subject} • {analysis.gradeLevel}
          </span>
          <h3 className="text-base font-extrabold text-zinc-800 dark:text-white">Mastery Assessment</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Read Aloud Button */}
          <button
            onClick={handleToggleSpeech}
            type="button"
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shadow-sm active:scale-95 border cursor-pointer ${
              isSpeaking
                ? "text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20"
                : "text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            }`}
            title={isSpeaking ? "Stop reading feedback out loud" : "Read study guide out loud using text-to-speech voice"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-rose-500 animate-pulse animate-duration-1000" />
                <span>Stop Reading</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>Read Aloud</span>
              </>
            )}
          </button>

          <button
            onClick={exportToPDF}
            disabled={isExporting}
            type="button"
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shadow-sm active:scale-95"
            title="Download complete analysis offline as a PDF report"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Compiling PDF..." : "Download PDF Report"}
          </button>
          <button
            onClick={onClear}
            type="button"
            className="text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg transition shadow-sm active:scale-95 border dark:border-zinc-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Start New Quest
          </button>
        </div>
      </div>

      {/* Gamified RPG Progress Board */}
      <div className="bg-zinc-900 text-white rounded-xl p-5 shadow-inner border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/5 font-bold text-6xl tracking-tighter select-none font-mono">
          XP LEVEL
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400 fill-amber-400 animate-bounce" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Concept Mastery Growth</p>
                <p className="text-[10px] text-zinc-400">XP points calculated from academic complexity</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 text-xs font-black bg-indigo-500 rounded-md text-white shadow-sm font-mono animate-pulse">
                +{analysis.masteryScoreChange} XP Gained!
              </span>
            </div>
          </div>

          {/* Level Progress Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold font-mono">
              <span className="text-zinc-300">Subject Competence Tracker</span>
              <span className="text-indigo-300">{analysis.conceptMasteryLevel}% Proficient</span>
            </div>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-700">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysis.conceptMasteryLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400 h-full rounded-full shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges Earned Container */}
      {analysis.achievementBadgesEarned && analysis.achievementBadgesEarned.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
            <Trophy className="h-4 w-4 text-amber-500" /> RPG Study Badges Decrypted:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.achievementBadgesEarned.map((badge: Badge) => (
              <div 
                key={badge.title}
                className={`border rounded-xl p-3.5 flex items-start gap-3 shadow-sm transition hover:shadow ${getBadgeColor(badge.color)}`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-sm shrink-0 border border-current">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold tracking-tight">{badge.title}</h5>
                  <p className="text-[10px] leading-relaxed opacity-85">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Academic Advisor Output */}
      <div className="space-y-6 pt-2">
        
        {/* Concept Executive Summary */}
        <div className="border-l-4 border-emerald-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-r-2xl shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
              I. Executive Academic Advisory Summary
            </span>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed font-sans prose dark:prose-invert">
            {formatLaTeXText(analysis.academicResponse.summary)}
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
            <h4 className="text-xs font-mono font-black text-zinc-400 uppercase tracking-wider">
              II. Cognitive Mastery Milestone Steps
            </h4>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
              {analysis.academicResponse.coachingSteps.length} MILESTONES
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {analysis.academicResponse.coachingSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="group relative flex flex-col md:flex-row md:items-start gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-200"
              >
                {/* Stage Index Column */}
                <div className="flex items-center gap-3 md:flex-col md:items-center shrink-0 min-w-[70px]">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-mono font-black shadow-md border border-indigo-400/20">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold tracking-wider text-indigo-500 block uppercase">
                      Stage {idx + 1}
                    </span>
                    <span className="hidden md:block text-[7px] text-zinc-400 dark:text-zinc-500 font-mono text-center">
                      Concept Step
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-mono font-extrabold text-zinc-405 dark:text-zinc-400 uppercase tracking-widest block">
                    Academic Analysis & Solution Mechanics
                  </span>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {formatLaTeXText(step)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Critique Block */}
        <div className="border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/10 to-transparent dark:from-indigo-950/10 rounded-2xl p-6 shadow-sm space-y-2.5 transition-colors">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
            <h5 className="text-xs font-mono font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">
              III. Strategic Alternate Perspective Extension
            </h5>
          </div>
          <div className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-normal font-sans pt-1 border-t border-indigo-100/30 dark:border-indigo-950/20">
            {formatLaTeXText(analysis.academicResponse.alternativePerspective)}
          </div>
        </div>

        {/* Guided understanding exercise (do not reveal final answer easily) */}
        <div className="border-2 border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/5 dark:bg-amber-950/5 rounded-2xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                ?
              </div>
              <div>
                <h5 className="text-xs font-mono font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                  IV. Targeted Learning Understanding Challenge
                </h5>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Verify your conceptual proficiency in real-time</p>
              </div>
            </div>
            
            <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
              ACTIVE PRACTICE
            </span>
          </div>

          <div className="text-sm text-zinc-750 dark:text-zinc-200 font-medium leading-relaxed bg-white dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/80 shadow-inner">
            {formatLaTeXText(analysis.academicResponse.guidedExercise)}
          </div>

          {/* Verification input draft */}
          <form onSubmit={handleValidateAnswer} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write your brief answer or conceptual proof..."
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedExerciseAnswer}
                onChange={(e) => setSelectedExerciseAnswer(e.target.value)}
                disabled={exerciseEvaluated}
              />
              <button
                type="submit"
                className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-705 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer disabled:opacity-40 border dark:border-zinc-700"
                disabled={!selectedExerciseAnswer.trim() || exerciseEvaluated}
              >
                SUBMIT PROOF
              </button>
            </div>

            <AnimatePresence>
              {exerciseResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-400 rounded-lg leading-relaxed font-semibold flex items-start gap-2"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{exerciseResult.msg}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Interactive progressive hints */}
          {analysis.academicResponse.hints && analysis.academicResponse.hints.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Locked Clues Available:</p>
              <div className="flex flex-col gap-2">
                {analysis.academicResponse.hints.map((hint, idx) => (
                  <div key={idx} className="border border-zinc-200/60 dark:border-zinc-800 rounded-lg overflow-hidden bg-white/40 dark:bg-zinc-900/20">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-zinc-655 dark:text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer bg-transparent"
                      onClick={() => toggleHint(idx)}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-zinc-400" /> Clue #{idx + 1}
                      </span>
                      {revealedHints[idx] ? (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                          <EyeOff className="h-3 w-3" /> Lock Clue
                        </span>
                      ) : (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                          <Eye className="h-3 w-3" /> Reveal Clue
                        </span>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {revealedHints[idx] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3.5 py-2.5 bg-yellow-50/20 dark:bg-zinc-900/40 text-xs border-t border-zinc-200/40 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 italic leading-relaxed"
                        >
                          {formatLaTeXText(hint)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic focus exercises */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
          <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
            👑 BOSS CHALLENGE STANDALONE PRACTICE
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {analysis.suggestedPractice.map((practice, idx) => (
              <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-100 dark:border-zinc-805 flex items-start gap-2.5 transition-colors">
                <span className="h-5 w-5 bg-zinc-800 dark:bg-zinc-700 rounded text-amber-400 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed font-medium">
                  {formatLaTeXText(practice)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
