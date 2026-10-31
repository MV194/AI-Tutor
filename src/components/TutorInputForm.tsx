import React, { useState, useRef } from "react";
import { ACADEMIC_TEMPLATES } from "../templates";
import { OmniTemplate } from "../types";
import { BookOpen, Sparkles, Trash2, GraduationCap, Image, HelpCircle, FileText, Upload, AlertCircle, X } from "lucide-react";
import { motion } from "motion/react";

interface TutorInputFormProps {
  textInput: string;
  setTextInput: (v: string) => void;
  imageData: string | null;
  setImageData: (v: string | null) => void;
  subject: string;
  setSubject: (v: string) => void;
  gradeLevel: string;
  setGradeLevel: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function TutorInputForm({
  textInput,
  setTextInput,
  imageData,
  setImageData,
  subject,
  setSubject,
  gradeLevel,
  setGradeLevel,
  onSubmit,
  isLoading,
}: TutorInputFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectTemplate = (template: OmniTemplate) => {
    setTextInput(template.textInput);
    setSubject(template.subject);
    setGradeLevel(template.gradeLevel);
  };

  const handleClearAll = () => {
    setTextInput("");
    setImageData(null);
  };

  // Process selected files
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files (JPEG, PNG, WEBP) are supported for multimodal analysis.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const subjectsAvailable = [
    { value: "Math", label: "📐 Mathematics" },
    { value: "Science", label: "🌌 Science (Bio / Chem / Physics)" },
    { value: "English", label: "✍️ English & Humanities" },
    { value: "History", label: "📜 History & Social Studies" },
    { value: "Coding", label: "🐍 Computer Science / Coding" },
    { value: "Study Habits", label: "⚡ Study & Organizational Habits" },
  ];

  const gradesAvailable = [
    { value: "Elementary School (3-5)", label: "🎒 Elementary School (Grades 3-5)" },
    { value: "Middle School (6-8)", label: "🏫 Middle School (Grades 6-8)" },
    { value: "High School (9-12)", label: "🎓 High School (Grades 9-12)" },
    { value: "College / University", label: "🧠 College & University" },
  ];

  return (
    <div id="tutor-input-form" className="space-y-6">
      {/* Templates Section */}
      <div>
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 font-mono flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-500" /> Start with a real homework scenario:
        </span>
        <div className="flex flex-wrap gap-2 block bg-transparent">
          {ACADEMIC_TEMPLATES.map((t) => (
            <button
              key={t.title}
              type="button"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-750 text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-sm active:scale-95 text-left"
              onClick={() => handleSelectTemplate(t)}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Entry Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5 transition-colors">
        
        {/* Core subject & Grade selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Academic Subject
            </label>
            <select
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjectsAvailable.map((s) => (
                <option key={s.value} value={s.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Cognitive Grade Level
            </label>
            <select
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              {gradesAvailable.map((g) => (
                <option key={g.value} value={g.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area Problem Input */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              What are we learning or solving today?
            </span>
            {textInput && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-zinc-400 dark:text-zinc-550 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear Text & Img
              </button>
            )}
          </label>
          <textarea
            className="w-full h-40 px-3.5 py-3 font-sans text-xs rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50/20 dark:bg-zinc-950/40 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-850 dark:text-zinc-150 placeholder-zinc-450 dark:placeholder-zinc-600 transition leading-relaxed"
            placeholder="Type your study problem, request a concept crash-course, paste an assignment sheet, or draft your essay text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        {/* Multimodal drag & drop uploader */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <Image className="h-4 w-4 text-emerald-500" /> Attach homework photo or textbook diagram
          </label>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[110px] relative ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                : imageData
                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/10 hover:border-emerald-400"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-950/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {imageData ? (
              <div className="flex items-center gap-4 w-full">
                <img
                  src={imageData}
                  alt="Attached academic layout"
                  className="h-16 w-16 object-cover rounded-lg border border-emerald-250 dark:border-emerald-800 shadow-sm"
                />
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Photo successfully attached!</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Gemini Vision will process this diagram/handwriting with pixel precision.</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageData(null);
                  }}
                  className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-250 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition shadow hover:text-red-500 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mx-auto" />
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                  Drag and drop homework image, or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">browse files</span>
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Supports JPG, PNG, WEBP representing formulas, diagrams, questions</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Execute Button with gamified style */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition duration-150 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95"
            onClick={onSubmit}
            disabled={isLoading || (!textInput.trim() && !imageData)}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-mono tracking-wide">COMPILING COGNITIVE ANALYSIS...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300 animate-pulse" />
                <span className="font-mono tracking-wider">SUMMON ACADEMIC TUTOR ({subject.toUpperCase()})</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
