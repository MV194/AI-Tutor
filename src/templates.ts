import { OmniTemplate } from "./types";

export const ACADEMIC_TEMPLATES: OmniTemplate[] = [
  {
    title: "📐 Math: Quadratic Roots",
    subject: "Math",
    gradeLevel: "High School (9-12)",
    textInput: "Help me find and understand the roots of the quadratic equation: f(x) = 2x^2 + 8x - 10. Can you show me how the quadratic formula applies here step-by-step?"
  },
  {
    title: "🌌 Science: Kinetic Energy",
    subject: "Science",
    gradeLevel: "Middle School (6-8)",
    textInput: "A 4kg drone is flying through the air at a constant speed of 5 m/s. How do I calculate its kinetic energy? Please show the formula and details."
  },
  {
    title: "✍️ Humanities: Rhetorical Analysis",
    subject: "English",
    gradeLevel: "College",
    textInput: "I am writing an argumentative essay on clean energy. My thesis is: 'While solar energy provides a clean alternative, current grid infrastructure is not ready for scale.' How can I make this thesis statement more persuasive and logically robust? What rhetorical devices should I use?"
  },
  {
    title: "📜 History: The Silk Road Impact",
    subject: "History",
    gradeLevel: "High School (9-12)",
    textInput: "Can you explain the historical significance of the Silk Road beyond just trading silk? I need help preparing for a DBQ (document-based question) exam essay."
  },
  {
    title: "⚡ Physics: Circuit Resistance",
    subject: "Science",
    gradeLevel: "High School (9-12)",
    textInput: "If I have three resistors with values R1 = 4 ohms, R2 = 6 ohms, and R3 = 12 ohms connected in parallel, how do I find the equivalent resistance?"
  },
  {
    title: "🐍 Coding: Recursive Fibonacci",
    subject: "Coding",
    gradeLevel: "College",
    textInput: "My python script for Fibonacci returns duplicate calculations and crashes on fib(45) due to infinite call stack. Here is my current draft:\n\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\nExplain how memoization works."
  }
];
