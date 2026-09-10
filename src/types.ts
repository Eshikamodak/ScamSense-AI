export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNCERTAIN';

export interface ScamAnalysis {
  risk_score: number;
  risk_level: RiskLevel;
  category: string;
  summary: string;
  red_flags: string[];
  recommended_actions: string[];
  protect_information: string[];
  context_analysis?: string;
  analyzed_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DemoExample {
  id: string;
  label: string;
  category: string;
  iconName: string;
  preview: string;
  message: string;
}
