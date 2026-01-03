export type HealthLevel = 'safe' | 'caution' | 'warning' | 'danger';

export interface IngredientAnalysis {
  name: string;
  level: HealthLevel;
  description: string;
  reasoning: string;
  scientificContext?: string;
  uncertaintyNote?: string;
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  verdict: 'Great' | 'Good' | 'Caution' | 'Avoid';
  summary: string;
  ingredients: IngredientAnalysis[];
  personalizedAlerts: string[];
}

export interface UserProfile {
  allergies: string[];
  dietaryRestrictions: string[];
  healthGoals: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
