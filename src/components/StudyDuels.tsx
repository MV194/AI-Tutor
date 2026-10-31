import React, { useState, useEffect, useRef } from "react";
import { Swords, Trophy, Sparkles, Timer, Play, Check, X, ShieldAlert, Award, User, Bot, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudyDuelsProps {
  subjectMastery: { [key: string]: number };
  onGainXP: (amount: number) => void;
  onIncrementCorrectStreak: () => void;
  onResetCorrectStreak: () => void;
}

interface DuelQuestion {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

// Extensive question database structured by subject and relative mastery difficulty
const DUEL_QUESTIONS: { [subject: string]: { [level: string]: DuelQuestion[] } } = {
  Math: {
    junior: [
      {
        question: "What is the absolute value of -15 subtracted from 5?",
        choices: ["-10", "20", "10", "-20"],
        answer: "-10",
        explanation: "5 - |-15| = 5 - 15 = -10."
      },
      {
        question: "Simplify the algebraic expression: 3(x + 4) - 2x.",
        choices: ["x + 12", "5x + 12", "x + 4", "3x + 12"],
        answer: "x + 12",
        explanation: "Expanding terms: 3x + 12 - 2x = x + 12."
      }
    ],
    varsity: [
      {
        question: "Find the limit: limit of (x^2 - 4) / (x - 2) as x approaches 2.",
        choices: ["2", "4", "0", "Undefined"],
        answer: "4",
        explanation: "Factor (x^2 - 4) into (x-2)(x+2). Cancel (x-2). The limit is (2 + 2) = 4."
      },
      {
        question: "Solve the equation for x: log2(x) + log2(x-2) = 3.",
        choices: ["4", "2", "8", "-2"],
        answer: "4",
        explanation: "log2(x(x-2)) = 3 => x^2 - 2x = 8 => (x-4)(x+2) = 0. Since log cannot take negative args, x = 4."
      }
    ],
    boss: [
      {
        question: "What is the derivative of f(x) = x^x with respect to x?",
        choices: ["x^x * (ln(x) + 1)", "x * x^(x-1)", "x^x * ln(x)", "e^x * ln(x)"],
        answer: "x^x * (ln(x) + 1)",
        explanation: "Using logarithmic differentiation: y = x^x => ln(y) = x ln(x) => y'/y = ln(x) + 1 => y' = x^x(ln(x) + 1)."
      }
    ]
  },
  Coding: {
    junior: [
      {
        question: "Which HTML tag is used to embed client-side JavaScript code?",
        choices: ["<javascript>", "<scripting>", "<js>", "<script>"],
        answer: "<script>",
        explanation: "The HTML <script> tag is used to embed executable client script files or inline logic."
      },
      {
        question: "In Python, which function is used to output text in the console?",
        choices: ["console.log()", "print()", "echo()", "write()"],
        answer: "print()",
        explanation: "The Python build-in print() outputs text lines to standard console streams."
      }
    ],
    varsity: [
      {
        question: "What is the average time complexity of quicksort operations?",
        choices: ["O(n log n)", "O(n^2)", "O(log n)", "O(n)"],
        answer: "O(n log n)",
        explanation: "Quicksort averages O(n log n) by partitioning sections, though worst-case is O(n^2)."
      },
      {
        question: "Which array function accumulates active values into a single result in JS?",
        choices: ["map", "reduce", "filter", "forEach"],
        answer: "reduce",
        explanation: "The reduce() method executes a reducer function on each element, rendering a single output."
      }
    ],
    boss: [
      {
        question: "Which database design anomaly does Third Normal Form (3NF) strictly eliminate?",
        choices: ["Functional dependencies", "Transitive dependencies", "Partial dependencies", "Multi-valued dependencies"],
        answer: "Transitive dependencies",
        explanation: "3NF requires a relation to be in 2NF and have no transitive functional dependencies of non-prime attributes."
      }
    ]
  },
  Science: {
    junior: [
      {
        question: "Which organelle serves as the powerhouse for eukaryotic ATP synthesis?",
        choices: ["Ribosome", "Lysosome", "Mitochondrion", "Golgi Body"],
        answer: "Mitochondrion",
        explanation: "Mitochondria convert nutrients into adenosine triphosphate (ATP) via cellular respiration."
      },
      {
        question: "What is the most abundant element found in the Universe?",
        choices: ["Oxygen", "Hydrogen", "Carbon", "Helium"],
        answer: "Hydrogen",
        explanation: "Hydrogen accounts for roughly 75% of baryonic mass throughout the interstellar medium."
      }
    ],
    varsity: [
      {
        question: "What is the molecular geometry of a methane molecule (CH4)?",
        choices: ["Trigonal planar", "Linear", "Tetrahedral", "Bent"],
        answer: "Tetrahedral",
        explanation: "With sp3 hybridization and no lone pairs on the central carbon, methane has tetrahedral geometry."
      },
      {
        question: "According to thermodynamics, absolute zero is equal to which temperature?",
        choices: ["-273.15 °C", "-459.67 °F", "0 Kelvin", "All of the above"],
        answer: "All of the above",
        explanation: "Absolute zero represents zero thermal kinetic motion, equal to 0 K, -273.15 °C, or -459.67 °F."
      }
    ],
    boss: [
      {
        question: "Which boson mediates the gauge gravity transactions in General Relativistic models theoretically?",
        choices: ["Gluon", "Graviton", "Higgs Boson", "Photon"],
        answer: "Graviton",
        explanation: "The hypothetical spin-2 mediator for quantum gravitational attraction is the graviton."
      }
    ]
  },
  English: {
    junior: [
      {
        question: "Identify the noun in the sentence: 'The heavy rain fell silently.'",
        choices: ["heavy", "rain", "fell", "silently"],
        answer: "rain",
        explanation: "Rain is the primary structural noun (concept/thing) of the active clause."
      },
      {
        question: "Identify the primary coordinating conjunction (FANBOYS):",
        choices: ["although", "because", "but", "unless"],
        answer: "but",
        explanation: "'But' is a coordinating conjunction, connecting independent clauses of equal coordinate weight."
      }
    ],
    varsity: [
      {
        question: "What literary term describes words that mimic their native physical auditory sounds?",
        choices: ["Hyperbole", "Synecdoche", "Onomatopoeia", "Irony"],
        answer: "Onomatopoeia",
        explanation: "Onomatopoeia comprises words like 'hiss', 'buzz', or 'clatter' mimicking actual sounds."
      },
      {
        question: "Which option represents a correct usage of a semicolon?",
        choices: [
          "I went to the store; because we ran out of milk.",
          "I went to the store; we had run out of fresh milk.",
          "Since I ran out; of milk, I left.",
          "I bought milk; and bread; and cereal."
        ],
        answer: "I went to the store; we had run out of fresh milk.",
        explanation: "Semicolons connect separate, complete independent clauses without coordinating conjunctions."
      }
    ],
    boss: [
      {
        question: "Which literary model proposes that literary texts exist primarily as cooperative transactions with readers?",
        choices: ["Deconstruction", "New Criticism", "Reader-Response Criticism", "Historiography"],
        answer: "Reader-Response Criticism",
        explanation: "Reader-Response theory highlights the active transaction role of the audience in co-creating narrative meaning."
      }
    ]
  }
};

const BOT_RIVALS = [
  { name: "Alge-bot 3000", subject: "Math", speed: 5000, accuracy: 0.65, title: "Silicon Math Rival" },
  { name: "Syntax Slayer", subject: "Coding", speed: 4000, accuracy: 0.70, title: "Compiling Adversary" },
  { name: "Cyber Einstein", subject: "Science", speed: 4500, accuracy: 0.85, title: "Automated Polymath" },
  { name: "Shakespeare AI", subject: "English", speed: 5500, accuracy: 0.60, title: "Generative Playwright" }
];

export default function StudyDuels({ subjectMastery, onGainXP, onIncrementCorrectStreak, onResetCorrectStreak }: StudyDuelsProps) {
  const [gameState, setGameState] = useState<"lobby" | "battle" | "finished">("lobby");
  const [selectedSubject, setSelectedSubject] = useState<"Math" | "Science" | "Coding" | "English">("Math");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userSelectedChoice, setUserSelectedChoice] = useState<string | null>(null);
  const [rivalSelectedChoice, setRivalSelectedChoice] = useState<string | null>(null);
  const [questionStreak, setQuestionStreak] = useState(0);
  const [timerCount, setTimerCount] = useState(15);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [scoreUser, setScoreUser] = useState(0);
  const [scoreRival, setScoreRival] = useState(0);

  const activeRival = BOT_RIVALS.find(r => r.subject === selectedSubject) || BOT_RIVALS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve current level tier (junior, varsity, boss) dynamically based on current mastery level
  const getSubjectTier = (): "junior" | "varsity" | "boss" => {
    const score = subjectMastery[selectedSubject] || 50;
    if (score < 55) return "junior";
    if (score < 80) return "varsity";
    return "boss";
  };

  const activeQuestionList = DUEL_QUESTIONS[selectedSubject]?.[getSubjectTier()] || DUEL_QUESTIONS.Math.junior;
  const activeQuestion = activeQuestionList[currentQuestionIndex] || activeQuestionList[0];

  useEffect(() => {
    if (gameState === "battle") {
      // Start 15s Countdown Timer
      setTimerCount(15);
      setRoundCompleted(false);
      setUserSelectedChoice(null);
      setRivalSelectedChoice(null);

      timerRef.current = setInterval(() => {
        setTimerCount(prev => {
          if (prev <= 1) {
            handleRoundTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate Bot rival making a decision based on speed & accuracy
      const decisionDelay = activeRival.speed - (Math.random() * 1500);
      botRef.current = setTimeout(() => {
        if (!roundCompleted) {
          const isCorrect = Math.random() < activeRival.accuracy;
          if (isCorrect) {
            setRivalSelectedChoice(activeQuestion.answer);
          } else {
            const wrongChoices = activeQuestion.choices.filter(c => c !== activeQuestion.answer);
            setRivalSelectedChoice(wrongChoices[Math.floor(Math.random() * wrongChoices.length)]);
          }
        }
      }, decisionDelay);
    }

    return () => {
      clearAllClocks();
    };
  }, [gameState, currentQuestionIndex, selectedSubject]);

  const clearAllClocks = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botRef.current) clearTimeout(botRef.current);
  };

  const handleRoundTimeout = () => {
    clearAllClocks();
    setRoundCompleted(true);
    // If user hasn't selected, show incorrect
    if (!userSelectedChoice) {
      onResetCorrectStreak();
    }
  };

  const selectUserChoice = (choice: string) => {
    if (roundCompleted) return;
    setUserSelectedChoice(choice);
    clearAllClocks();
    setRoundCompleted(true);

    const isUserCorrect = choice === activeQuestion.answer;
    const isRivalCorrect = rivalSelectedChoice === activeQuestion.answer;

    // Fast resolution update
    if (isUserCorrect) {
      setScoreUser(prev => prev + 1);
      onIncrementCorrectStreak();
      setQuestionStreak(prev => prev + 1);
    } else {
      onResetCorrectStreak();
      setQuestionStreak(0);
    }

    if (rivalSelectedChoice === null) {
      // Force rival rapid choice if user answered extremely fast
      const robotRight = Math.random() < activeRival.accuracy;
      const finalRivalChoice = robotRight 
        ? activeQuestion.answer 
        : activeQuestion.choices.filter(c => c !== activeQuestion.answer)[0];
      setRivalSelectedChoice(finalRivalChoice);
      if (robotRight) {
        setScoreRival(prev => prev + 1);
      }
    } else {
      if (isRivalCorrect) {
        setScoreRival(prev => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeQuestionList.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed last question of the duel arena
      setGameState("finished");
      clearAllClocks();

      // Award XP based on win outcomes
      if (scoreUser > scoreRival) {
        onGainXP(25); // Duel Win Bonus XP
        window.dispatchEvent(new CustomEvent("omnitutor-toast", {
          detail: { message: `⚔️ Victory! Defeated ${activeRival.name} in standard academic duel. +25 XP!`, type: "success" }
        }));
      } else if (scoreUser === scoreRival) {
        onGainXP(10); // Draw bonus
        window.dispatchEvent(new CustomEvent("omnitutor-toast", {
          detail: { message: `⚔️ Stand-off! Draw match with ${activeRival.name}. +10 XP.`, type: "info" }
        }));
      } else {
        window.dispatchEvent(new CustomEvent("omnitutor-toast", {
          detail: { message: `⚔️ Defeat! ${activeRival.name} claimed the victory. Review logic and duel again!`, type: "info" }
        }));
      }
    }
  };

  const startArenaDuel = () => {
    setScoreUser(0);
    setScoreRival(0);
    setCurrentQuestionIndex(0);
    setQuestionStreak(0);
    setGameState("battle");
  };

  const resetToLobby = () => {
    setGameState("lobby");
  };

  return (
    <div id="study-duels-arena-card" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 overflow-hidden relative transition-colors">
      
      {/* Absolute Decorative glow */}
      <div className="absolute top-0 right-0 h-20 w-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Lobby View */}
      {gameState === "lobby" && (
        <div className="space-y-4 font-sans animate-fadeIn">
          <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <Swords className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
              </span>
              <div>
                <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-100 tracking-wider font-mono uppercase">
                  Cognitive Study Duels
                </h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono">Compete in quick-fire academic arena rounds</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-950 border dark:border-zinc-800 px-2 py-0.5 rounded font-bold uppercase">
              Tier: {getSubjectTier()}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-center space-y-3 transition-colors">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Select Duel Topic Subject:</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Math", "Science", "Coding", "English"] as const).map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`py-2 text-[11px] font-semibold font-mono rounded-lg transition border cursor-pointer ${
                    selectedSubject === sub
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-sm"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Adversary Profile Summary */}
          <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-900/40 shadow-inner">
                <Bot className="h-5.5 w-5.5 text-rose-600" />
              </div>
              <div className="text-center sm:text-left">
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  {activeRival.name} 
                  <span className="text-[8px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono px-1 py-0.2 rounded font-black uppercase">
                    Rival Bot
                  </span>
                </h5>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{activeRival.title} • {(activeRival.accuracy * 100).toFixed(0)}% accuracy</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startArenaDuel}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-805 hover:bg-zinc-850 dark:hover:bg-zinc-700 text-white font-mono text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md transform active:scale-95 text-center w-full sm:w-auto justify-center border dark:border-zinc-700"
            >
              <Play className="h-3.5 w-3.5 fill-white" /> ENGAGE IN DUEL
            </button>
          </div>
        </div>
      )}

      {/* Battle View */}
      {gameState === "battle" && (
        <div className="space-y-4 font-sans animate-fadeIn">
          
          {/* Battle Header */}
          <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                <User className="h-4 w-4 text-indigo-500" /> Player ({scoreUser})
              </div>
              <span className="text-zinc-300 dark:text-zinc-700 font-mono text-[10px]">vs</span>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 font-mono">
                <Bot className="h-4 w-4 text-rose-500 animate-bounce" /> {activeRival.name} ({scoreRival})
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-lg font-mono text-[10px] font-black">
              <Timer className="h-3.5 w-3.5 text-yellow-600 animate-spin" /> {timerCount}s LEFT
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded border dark:border-indigo-900/30">
              Question {currentQuestionIndex + 1} of {activeQuestionList.length} • {selectedSubject}
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800 p-3 rounded-xl shadow-inner font-sans">
              {activeQuestion.question}
            </h4>
          </div>

          {/* Choices layout */}
          <div className="grid grid-cols-1 gap-2">
            {activeQuestion.choices.map((choice, idx) => {
              const isSelected = userSelectedChoice === choice;
              const isRivalSelected = rivalSelectedChoice === choice;
              const isCorrectAnswer = choice === activeQuestion.answer;
              
              let choiceBtnClass = "bg-white dark:bg-zinc-800 border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50";
              if (roundCompleted) {
                if (isCorrectAnswer) {
                  choiceBtnClass = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-350 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 font-bold shadow-xs";
                } else if (isSelected) {
                  choiceBtnClass = "bg-rose-50 dark:bg-rose-955/30 border-rose-350 dark:border-rose-900 text-rose-800 dark:text-rose-400 font-medium";
                } else {
                  choiceBtnClass = "bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-100 dark:border-zinc-850 text-zinc-400 dark:text-zinc-600 opacity-60";
                }
              } else if (isSelected) {
                choiceBtnClass = "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-700 text-indigo-805 dark:text-indigo-300 font-bold";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={roundCompleted}
                  onClick={() => selectUserChoice(choice)}
                  className={`w-full text-left p-3 text-xs rounded-xl border transition flex items-center justify-between cursor-pointer ${choiceBtnClass} transition-colors`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black font-mono text-[9px] flex items-center justify-center">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{choice}</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0">
                    {/* Visual badges for selections */}
                    {isSelected && (
                      <span className="text-[8px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1 py-0.5 rounded font-mono font-bold">
                        YOU
                      </span>
                    )}
                    {isRivalSelected && (
                      <span className="text-[8px] bg-rose-105 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                        <Bot className="h-2 w-2" /> BOT
                      </span>
                    )}

                    {roundCompleted && isCorrectAnswer && (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {roundCompleted && isSelected && !isCorrectAnswer && (
                      <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rationale explanation text block */}
          <AnimatePresence>
            {roundCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-zinc-100 dark:bg-zinc-950/80 border dark:border-zinc-800 rounded-xl space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-bold">Concept Analysis:</span>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-black rounded-lg transition"
                  >
                    CONTINUE DUEL →
                  </button>
                </div>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed mt-1">
                  {activeQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* Finished Summary Results Screen */}
      {gameState === "finished" && (
        <div className="space-y-4 text-center py-4 font-sans animate-fadeIn">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-900/40 shadow-md">
              <Award className="h-8 w-8 text-amber-505 animate-bounce" />
            </div>
            
            <h3 className="text-sm font-black font-mono uppercase tracking-widest text-zinc-800 dark:text-zinc-100 animate-pulse">
              Duel Arena Completed
            </h3>
            
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm">
              Your match logs have been parsed and reconciled with standard study levels.
            </p>
          </div>

          <div className="border border-zinc-150 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-950 max-w-xs mx-auto grid grid-cols-2 gap-4 divide-x divide-zinc-200 dark:divide-zinc-850 transition-colors">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-550 font-mono tracking-wider">Your Score</p>
              <h4 className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono">{scoreUser} / {activeQuestionList.length}</h4>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-550 font-mono tracking-wider">Opponent Score</p>
              <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{scoreRival} / {activeQuestionList.length}</h4>
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5">
            {scoreUser > scoreRival ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                🏆 Victory Bonus! Evaluated: +25 XP Gain.
              </span>
            ) : scoreUser === scoreRival ? (
              <span className="text-zinc-650 dark:text-zinc-400">
                🤝 Standoff outcome. Evaluated: +10 XP Gain.
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">
                ❌ Defeat. Log details stored. Try another duel scenario!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-center max-w-xs mx-auto">
            <button
              type="button"
              onClick={startArenaDuel}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-730 text-white font-mono text-xs font-black rounded-lg transition"
            >
              DUEL AGAIN
            </button>
            <button
              type="button"
              onClick={resetToLobby}
              className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-202 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-black rounded-lg border border-zinc-200 dark:border-zinc-700 transition"
            >
              EXIT LOBBY
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
