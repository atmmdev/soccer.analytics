export interface AiExplanation {
  summary: string;
  topPick: string | null;
  marketInsights: Array<{
    selection: string;
    explanation: string;
    recommendation: string;
  }>;
  risks: string[];
  dataSources: string[];
  provider: 'template' | 'openai';
  generatedAt: string;
}
