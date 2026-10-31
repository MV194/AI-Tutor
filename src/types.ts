export interface Badge {
  title: string;
  description: string;
  icon: string; // e.g., "Shield", "Swords", "Zap", "BookOpen", "Compass", "Feather", "Cpu"
  color: string; // Tailwind color class, e.g., "text-amber-500 bg-amber-50"
}

export interface AcademicResponse {
  summary: string;
  coachingSteps: string[];
  guidedExercise: string;
  hints: string[];
  alternativePerspective: string;
}

export interface TutorResponse {
  subject: string;
  gradeLevel: string;
  masteryScoreChange: number; // e.g., 15
  conceptMasteryLevel: number; // e.g., 65 (represents progress out of 100)
  achievementBadgesEarned: Badge[];
  academicResponse: AcademicResponse;
  suggestedPractice: string[];
}

export interface TutorSession {
  id: string;
  timestamp: string;
  subject: string;
  gradeLevel: string;
  textInput: string;
  imageData: string | null;
  analysis: TutorResponse;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export interface OmniTemplate {
  title: string;
  subject: string;
  gradeLevel: string;
  textInput: string;
  imageThumbnail?: string; // Built-in preview/placeholder
  hasImagePlaceholder?: boolean;
  imageMockBase64?: string; // Simple mock image data if they want to simulate images
}
