// TypeScript types for Feedback AI system

export interface FeedbackMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'report' | 'analysis' | 'suggestion';
  metadata?: {
    reportType?: string;
    analysisScope?: string;
    dataPoints?: number;
    exportable?: boolean;
  };
}

export interface AnalysisRequest {
  type: 'report' | 'analysis' | 'insights' | 'suggestions';
  scope: {
    dateRange?: {
      from: Date;
      to: Date;
    };
    teacherIds?: string[];
    subjects?: string[];
    keyStages?: string[];
    departments?: string[];
    observationTypes?: string[];
  };
  parameters?: {
    includeCharts?: boolean;
    includeRecommendations?: boolean;
    detailLevel?: 'summary' | 'detailed' | 'comprehensive';
    format?: 'text' | 'structured' | 'report';
  };
}

export interface TeacherPerformanceData {
  teacherId: string;
  teacherName: string;
  department: string;
  subjects: string[];
  totalObservations: number;
  averageScore: number;
  gradeDistribution: {
    outstanding: number;
    good: number;
    requiresImprovement: number;
    inadequate: number;
  };
  trends: {
    improving: boolean;
    stagnant: boolean;
    declining: boolean;
    trendScore: number;
  };
  strengths: string[];
  areasForDevelopment: string[];
  lastObservationDate: Date;
}

export interface ObservationInsight {
  id: string;
  type: 'strength' | 'concern' | 'trend' | 'recommendation';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  affectedTeachers?: string[];
  suggestedActions?: string[];
  dataSupport: {
    observationCount: number;
    averageScore: number;
    timeframe: string;
  };
}

export interface FeedbackReport {
  id: string;
  title: string;
  type: 'individual' | 'department' | 'school' | 'subject' | 'keystage';
  generatedAt: Date;
  scope: AnalysisRequest['scope'];
  summary: {
    totalObservations: number;
    averageScore: number;
    keyFindings: string[];
    recommendations: string[];
  };
  sections: ReportSection[];
  charts?: ChartData[];
  exportFormats: ('pdf' | 'csv' | 'json')[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'chart' | 'table' | 'list';
  data?: any;
  insights?: ObservationInsight[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    colors?: string[];
  };
}

export interface AIConversationContext {
  sessionId: string;
  userId: string;
  startedAt: Date;
  lastActivity: Date;
  messageCount: number;
  currentScope?: AnalysisRequest['scope'];
  preferences: {
    language: 'en-GB';
    reportFormat: 'detailed' | 'summary';
    includeCharts: boolean;
    autoExport: boolean;
  };
}

export interface FeedbackAIResponse {
  success: boolean;
  message?: string;
  data?: {
    response: string;
    formatted?: string;
    type: 'text' | 'report' | 'analysis';
    attachments?: {
      charts?: ChartData[];
      reports?: FeedbackReport[];
      exports?: {
        format: string;
        url: string;
        filename: string;
      }[];
    };
  };
  error?: string;
  metadata?: {
    processingTime: number;
    dataPointsAnalysed: number;
    confidenceScore: number;
  };
}

export interface FeedbackAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  contextWindow: number;
  enableVoice: boolean;
  enableExport: boolean;
  defaultScope: AnalysisRequest['scope'];
}

// Supabase table interfaces for integration
export interface DatabaseFeedback {
  id: string;
  teacher_id: string;
  observer_id: string;
  observation_date: string;
  lesson_subject: string;
  lesson_topic: string;
  key_stage: string;
  class_size: number;
  lesson_duration: number;
  overall_grade: 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate';
  overall_score: number;
  strengths: string[];
  areas_for_development: string[];
  action_points: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTeacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  key_stages: string[];
  employment_status: 'full-time' | 'part-time' | 'supply';
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseActivity {
  id: string;
  activity_title: string;
  activity_description: string | null;
  activity_status: 'active' | 'inactive' | 'archived';
  activity_priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  task_title: string;
  task_description: string | null;
  task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  task_priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Export utility types
export type MessageRole = FeedbackMessage['role'];
export type AnalysisType = AnalysisRequest['type'];
export type ReportType = FeedbackReport['type'];
export type InsightType = ObservationInsight['type'];
export type ChartType = ChartData['type'];