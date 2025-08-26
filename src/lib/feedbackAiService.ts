import { supabase } from './supabase';
import {
  FeedbackMessage,
  AnalysisRequest,
  FeedbackAIResponse,
  FeedbackAIConfig,
  TeacherPerformanceData,
  ObservationInsight,
  FeedbackReport,
  AIConversationContext,
  DatabaseFeedback,
  DatabaseTeacher
} from './feedbackAiTypes';

class FeedbackAIService {
  private config: FeedbackAIConfig;
  private conversationContext: AIConversationContext | null = null;
  private messages: FeedbackMessage[] = [];

  constructor() {
    this.config = {
      apiKey: '', // Will be loaded from Supabase
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      systemPrompt: this.getSystemPrompt(),
      contextWindow: 10,
      enableVoice: false,
      enableExport: true,
      defaultScope: {
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          to: new Date()
        }
      }
    };
  }

  private getSystemPrompt(): string {
    return `You are an expert educational consultant and data analyst specialising in teacher observation feedback and school improvement. You work with British educational terminology and standards.

Your role is to:
1. Analyse observation data to identify patterns, trends, and insights
2. Generate comprehensive reports on teacher performance and school improvement
3. Provide actionable recommendations based on observation data
4. Discuss feedback data in a professional, constructive manner
5. Use British English spelling and educational terminology throughout

Key principles:
- Always maintain a supportive, professional tone
- Focus on improvement and development rather than criticism
- Use evidence-based insights from the observation data
- Provide specific, actionable recommendations
- Consider the context of different key stages and subjects
- Respect confidentiality and professional standards

When generating reports or analysis:
- Use clear headings and structure
- Include relevant statistics and data points
- Highlight both strengths and areas for development
- Suggest specific professional development opportunities
- Consider whole-school improvement strategies

Always respond in British English with appropriate educational terminology.`;
  }

  async initialize(): Promise<void> {
    try {
      // Get the OPENAI_FEEDBACK key from Supabase secrets
      const { data, error } = await supabase.rpc('get_secret', {
        secret_name: 'OPENAI_FEEDBACK'
      });

      if (error) {
        console.error('Error fetching OpenAI key:', error);
        throw new Error('Failed to initialise AI service: Unable to fetch API key');
      }

      if (!data) {
        throw new Error('OpenAI API key not found in Supabase secrets');
      }

      this.config.apiKey = data;
      console.log('Feedback AI Service initialised successfully');
    } catch (error) {
      console.error('Failed to initialise Feedback AI Service:', error);
      throw error;
    }
  }

  async startConversation(userId: string): Promise<AIConversationContext> {
    this.conversationContext = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      preferences: {
        language: 'en-GB',
        reportFormat: 'detailed',
        includeCharts: true,
        autoExport: false
      }
    };

    this.messages = [];
    return this.conversationContext;
  }

  async processTextCommand(text: string, request?: AnalysisRequest): Promise<{
    success: boolean;
    data?: { response: string };
    error?: string;
  }> {
    try {
      if (!this.config.apiKey) {
        await this.initialize();
      }

      // Build context-aware system prompt
      let systemPrompt = 'You are an educational feedback AI assistant specialising in teacher observation analysis and improvement suggestions. Provide helpful, constructive feedback based on educational best practices. Use British English spelling and terminology.';
      
      // Add context if analysis request is provided
      if (request?.scope) {
        const contextData = await this.prepareAnalysisContext(request);
        const parsedData = JSON.parse(contextData);
        if (parsedData.observations && parsedData.observations.length > 0) {
          systemPrompt += `\n\nRelevant observation context:\n${this.formatObservationData(parsedData.observations.slice(0, 5))}`;
        }
      }

      // Call OpenAI API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('feedback-ai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: text
            }
          ],
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          api_key: this.config.apiKey
        }
      });

      if (error) {
        console.error('Error calling AI service:', error);
        throw new Error('Failed to process AI request');
      }

      const content = data.choices[0]?.message?.content || 'I apologise, but I couldn\'t process your request at the moment.';
      
      return {
        success: true,
        data: { response: content }
      };
    } catch (error) {
      console.error('Error processing text command:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private countDataPoints(contextData: string): number {
    try {
      const data = JSON.parse(contextData);
      return data.observations?.length || 0;
    } catch {
      return 0;
    }
  }

  async generateReport(request: AnalysisRequest): Promise<FeedbackReport> {
    try {
      const contextData = await this.prepareAnalysisContext(request);
      const analysisData = JSON.parse(contextData);
      
      // Calculate statistics from the data
      const stats = this.calculateObservationStatistics(analysisData.observations || []);
      
      const reportPrompt = `Generate a comprehensive ${request.type} report based on the following observation data.
      
      CONTEXT:
      - Total Observations: ${stats.totalObservations}
      - Average Score: ${stats.averageScore.toFixed(1)}
      - Date Range: ${request.scope.dateRange?.from.toLocaleDateString('en-GB')} to ${request.scope.dateRange?.to.toLocaleDateString('en-GB')}
      - Departments: ${stats.departments.join(', ')}
      - Key Stages: ${stats.keyStages.join(', ')}
      
      DETAILED DATA:
      ${contextData}
      
      Please provide a structured analysis with:
      
      **EXECUTIVE SUMMARY** (2-3 sentences)
      Brief overview of key findings and overall performance trends.
      
      **KEY FINDINGS** (3-5 bullet points)
      • Most significant observations
      • Performance patterns
      • Areas of excellence
      • Areas needing attention
      
      **DETAILED ANALYSIS**
      Comprehensive breakdown by:
      - Teaching quality trends
      - Subject-specific insights
      - Department performance
      - Grade distribution analysis
      
      **RECOMMENDATIONS** (3-5 actionable items)
      Specific, measurable recommendations for improvement.
      
      **ACTION POINTS** (immediate next steps)
      Priority actions with suggested timelines.
      
      Use British English, educational terminology, and maintain a professional, constructive tone throughout.`;

      const response = await this.processTextCommand(reportPrompt, request);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to generate report');
      }

      // Parse the AI response to extract structured sections
      const sections = this.parseReportSections(response.data.response);
      
      const report: FeedbackReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${this.getReportTitle(request.type)} - ${new Date().toLocaleDateString('en-GB')}`,
        type: this.mapAnalysisTypeToReportType(request.type),
        generatedAt: new Date(),
        scope: request.scope,
        summary: {
          totalObservations: stats.totalObservations,
          averageScore: stats.averageScore,
          keyFindings: stats.keyFindings,
          recommendations: stats.recommendations
        },
        sections: sections,
        exportFormats: ['pdf', 'csv', 'json'],
        metadata: {
          generatedBy: 'Feedback AI Assistant',
          dataSource: 'Observation Database',
          analysisType: request.type,
          filters: request.scope
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private async prepareAnalysisContext(request: AnalysisRequest): Promise<string> {
    try {
      let query = supabase.from('feedback').select(`
        *,
        teachers!inner(name, department, subjects, key_stages)
      `);

      // Apply filters based on request scope
      if (request.scope.dateRange) {
        query = query.gte('observation_date', request.scope.dateRange.from.toISOString())
                    .lte('observation_date', request.scope.dateRange.to.toISOString());
      }

      if (request.scope.teacherIds && request.scope.teacherIds.length > 0) {
        query = query.in('teacher_id', request.scope.teacherIds);
      }

      if (request.scope.subjects && request.scope.subjects.length > 0) {
        query = query.in('lesson_subject', request.scope.subjects);
      }

      if (request.scope.keyStages && request.scope.keyStages.length > 0) {
        query = query.in('key_stage', request.scope.keyStages);
      }

      const { data: observations, error } = await query;

      if (error) {
        console.error('Error fetching observation data:', error);
        return 'No observation data available for analysis.';
      }

      if (!observations || observations.length === 0) {
        return 'No observations found matching the specified criteria.';
      }

      // Format the data for AI analysis
      const formattedData = observations.map(obs => ({
        date: obs.observation_date,
        teacher: obs.teachers?.name || 'Unknown',
        department: obs.teachers?.department || 'Unknown',
        subject: obs.lesson_subject,
        keyStage: obs.key_stage,
        grade: obs.overall_grade,
        score: obs.overall_score,
        strengths: obs.strengths,
        areasForDevelopment: obs.areas_for_development,
        actionPoints: obs.action_points,
        followUpRequired: obs.follow_up_required
      }));

      return JSON.stringify({
        totalObservations: observations.length,
        dateRange: request.scope.dateRange,
        observations: formattedData
      }, null, 2);

    } catch (error) {
      console.error('Error preparing analysis context:', error);
      return 'Error retrieving observation data for analysis.';
    }
  }

  private prepareConversationMessages(contextData?: string): any[] {
    const messages = [
      {
        role: 'system',
        content: this.config.systemPrompt
      }
    ];

    if (contextData) {
      messages.push({
        role: 'system',
        content: `Here is the current observation data for analysis:\n\n${contextData}`
      });
    }

    // Add recent conversation messages
    const recentMessages = this.messages.slice(-this.config.contextWindow);
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    return messages;
  }

  private formatResponseForUI(response: string): string {
    // Clean up the response for better UI display
    let formatted = response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/^/, '<p>') // Start paragraph
      .replace(/$/, '</p>'); // End paragraph

    // Clean up any double paragraphs
    formatted = formatted.replace(/<p><\/p>/g, '');
    
    return formatted;
  }

  private calculateObservationStatistics(observations: any[]): {
    totalObservations: number;
    averageScore: number;
    departments: string[];
    keyStages: string[];
    keyFindings: string[];
    recommendations: string[];
  } {
    if (!observations || observations.length === 0) {
      return {
        totalObservations: 0,
        averageScore: 0,
        departments: [],
        keyStages: [],
        keyFindings: ['No observation data available'],
        recommendations: ['Ensure regular classroom observations are conducted']
      };
    }

    const totalObservations = observations.length;
    const scores = observations.map(obs => obs.score || 0).filter(score => score > 0);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    const departments = [...new Set(observations.map(obs => obs.department).filter(Boolean))];
    const keyStages = [...new Set(observations.map(obs => obs.keyStage).filter(Boolean))];
    
    // Generate basic findings based on data
    const keyFindings = [];
    const recommendations = [];
    
    if (averageScore >= 3.5) {
      keyFindings.push('Overall teaching quality is strong across observations');
    } else if (averageScore >= 2.5) {
      keyFindings.push('Teaching quality shows room for improvement');
      recommendations.push('Focus on targeted professional development programmes');
    } else {
      keyFindings.push('Significant improvement needed in teaching quality');
      recommendations.push('Implement intensive support and mentoring programmes');
    }
    
    if (departments.length > 1) {
      keyFindings.push(`Analysis covers ${departments.length} departments`);
    }
    
    return {
      totalObservations,
      averageScore,
      departments,
      keyStages,
      keyFindings,
      recommendations
    };
  }

  private parseReportSections(reportContent: string): FeedbackReport['sections'] {
    const sections: FeedbackReport['sections'] = [];
    
    // Split content by common section headers
    const sectionPatterns = [
      { id: 'executive_summary', title: 'Executive Summary', pattern: /\*\*EXECUTIVE SUMMARY\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i },
      { id: 'key_findings', title: 'Key Findings', pattern: /\*\*KEY FINDINGS\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i },
      { id: 'detailed_analysis', title: 'Detailed Analysis', pattern: /\*\*DETAILED ANALYSIS\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i },
      { id: 'recommendations', title: 'Recommendations', pattern: /\*\*RECOMMENDATIONS\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i },
      { id: 'action_points', title: 'Action Points', pattern: /\*\*ACTION POINTS\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i }
    ];
    
    sectionPatterns.forEach(({ id, title, pattern }) => {
      const match = reportContent.match(pattern);
      if (match && match[1]) {
        sections.push({
          id,
          title,
          content: match[1].trim(),
          type: 'text'
        });
      }
    });
    
    // If no sections were parsed, add the entire content as a single section
    if (sections.length === 0) {
      sections.push({
        id: 'full_report',
        title: 'Analysis Report',
        content: reportContent,
        type: 'text'
      });
    }
    
    return sections;
  }

  private getReportTitle(type: string): string {
    const titles = {
      'report': 'Comprehensive Teaching Observation Report',
      'analysis': 'Performance Analysis Report',
      'insights': 'Teaching Insights and Trends',
      'suggestions': 'Improvement Recommendations Report',
      'department': 'Department Performance Review',
      'individual': 'Individual Teacher Assessment',
      'school': 'School-wide Teaching Quality Report'
    };
    
    return titles[type] || 'Educational Analysis Report';
  }

  private mapAnalysisTypeToReportType(analysisType: string): FeedbackReport['type'] {
    switch (analysisType) {
      case 'report':
        return 'school';
      case 'analysis':
        return 'department';
      case 'insights':
        return 'subject';
      case 'suggestions':
        return 'individual';
      default:
        return 'school';
    }
  }

  async analyzeTeacherPerformance(teacherId: string, dateRange?: { from: Date; to: Date }): Promise<{
    summary: string;
    trends: string[];
    recommendations: string[];
    strengths: string[];
    concerns: string[];
  }> {
    try {
      // Fetch teacher-specific observations
      const { data: observations, error } = await supabase
        .from('feedback')
        .select(`
          *,
          teachers(name, department)
        `)
        .eq('teacher_id', teacherId)
        .gte('observation_date', dateRange?.from?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .lte('observation_date', dateRange?.to?.toISOString() || new Date().toISOString())
        .order('observation_date', { ascending: false });

      if (error) throw error;

      if (!observations || observations.length === 0) {
        return {
          summary: 'No observations found for this teacher in the specified period.',
          trends: [],
          recommendations: ['Consider scheduling regular observations to track progress.'],
          strengths: [],
          concerns: ['Insufficient observation data available.']
        };
      }

      // Analyze the data using AI
      const analysisPrompt = `Analyse the following teacher observation data and provide insights:\n\n${this.formatObservationData(observations)}\n\nProvide analysis in the following format:\nSUMMARY: [Brief overview]\nTRENDS: [List key trends]\nRECOMMENDATIONS: [List specific recommendations]\nSTRENGTHS: [List key strengths]\nCONCERNS: [List areas of concern]`;

      const analysisRequest: AnalysisRequest = {
        type: 'individual',
        scope: {
          teacherIds: [teacherId],
          dateRange: dateRange || {
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            to: new Date()
          }
        }
      };

      const response = await this.processTextCommand(analysisPrompt, analysisRequest);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to analyze teacher performance');
      }
      
      // Parse the structured response
      return this.parseAnalysisResponse(response.data.response);
    } catch (error) {
      console.error('Error analyzing teacher performance:', error);
      throw error;
    }
  }

  async discussFeedbackData(query: string, contextData?: {
    observationIds?: string[];
    teacherIds?: string[];
    subjects?: string[];
  }): Promise<string> {
    try {
      let analysisRequest: AnalysisRequest | undefined;
      
      if (contextData) {
        analysisRequest = {
          type: 'discussion',
          scope: {
            teacherIds: contextData.teacherIds,
            subjects: contextData.subjects,
            dateRange: {
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              to: new Date()
            }
          }
        };
      }

      const response = await this.processTextCommand(query, analysisRequest);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to process feedback discussion');
      }
      
      return response.data.response;
    } catch (error) {
      console.error('Error in feedback discussion:', error);
      throw error;
    }
  }

  private formatObservationData(observations: any[]): string {
    return observations.map(obs => {
      const date = obs.date ? new Date(obs.date).toLocaleDateString('en-GB') : 'Unknown Date';
      const teacher = obs.teacher || 'Unknown Teacher';
      const subject = obs.subject || 'Unknown Subject';
      const keyStage = obs.keyStage || 'Unknown Key Stage';
      const grade = obs.grade || 'Not graded';
      const strengths = obs.strengths || 'No strengths recorded';
      const improvements = obs.areasForDevelopment || 'No improvements recorded';
      
      return `Date: ${date}\nTeacher: ${teacher}\nSubject: ${subject}\nKey Stage: ${keyStage}\nGrade: ${grade}\nStrengths: ${strengths}\nAreas for Development: ${improvements}\n`;
    }).join('\n---\n');
  }

  // Helper method to format observations for context
  private formatObservationsForContext(observations: any[]): string {
    return observations.map(obs => {
      const date = new Date(obs.observation_date).toLocaleDateString('en-GB');
      const teacher = obs.teachers?.name || 'Unknown';
      const subject = obs.lesson_subject || 'Unknown';
      const grade = obs.overall_grade || 'Not graded';
      const strengths = obs.strengths || 'None recorded';
      const improvements = obs.areas_for_development || 'None recorded';
      
      return `${date} - ${teacher} (${subject}): Grade ${grade}\nStrengths: ${strengths}\nImprovements: ${improvements}`;
    }).join('\n\n');
  }

  // Generate intelligent insights based on observation patterns
  async generateInsights(request: AnalysisRequest): Promise<{
    success: boolean;
    data?: {
      insights: string[];
      recommendations: string[];
      trends: string[];
      actionItems: string[];
    };
    error?: string;
  }> {
    try {
      const contextData = await this.prepareAnalysisContext(request);
      const parsedData = JSON.parse(contextData);
      
      if (!parsedData.observations || parsedData.observations.length === 0) {
        return {
          success: false,
          error: 'No observation data available for analysis'
        };
      }

      const insights = this.analyzeObservationPatterns(parsedData.observations);
      const recommendations = this.generateRecommendations(parsedData.observations);
      const trends = this.identifyTrends(parsedData.observations);
      const actionItems = this.createActionItems(parsedData.observations);

      return {
        success: true,
        data: {
          insights,
          recommendations,
          trends,
          actionItems
        }
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate insights'
      };
    }
  }

  // Analyze observation patterns to identify key insights
  private analyzeObservationPatterns(observations: any[]): string[] {
    const insights: string[] = [];
    
    // Grade distribution analysis
    const grades = observations.map(obs => obs.overall_grade).filter(Boolean);
    const gradeDistribution = this.calculateGradeDistribution(grades);
    
    if (gradeDistribution.outstanding > 0.3) {
      insights.push(`Excellent performance: ${Math.round(gradeDistribution.outstanding * 100)}% of lessons rated as Outstanding`);
    }
    
    if (gradeDistribution.inadequate > 0.1) {
      insights.push(`Area of concern: ${Math.round(gradeDistribution.inadequate * 100)}% of lessons require improvement`);
    }

    // Subject-specific patterns
    const subjectPerformance = this.analyzeSubjectPerformance(observations);
    const topSubject = Object.entries(subjectPerformance).sort(([,a], [,b]) => b - a)[0];
    const bottomSubject = Object.entries(subjectPerformance).sort(([,a], [,b]) => a - b)[0];
    
    if (topSubject && bottomSubject && topSubject[1] > bottomSubject[1]) {
      insights.push(`${topSubject[0]} shows strongest performance whilst ${bottomSubject[0]} may benefit from additional support`);
    }

    // Common strengths and areas for development
    const commonStrengths = this.identifyCommonThemes(observations.map(obs => obs.strengths).filter(Boolean));
    const commonImprovements = this.identifyCommonThemes(observations.map(obs => obs.areas_for_development).filter(Boolean));
    
    if (commonStrengths.length > 0) {
      insights.push(`Consistent strengths identified: ${commonStrengths.slice(0, 3).join(', ')}`);
    }
    
    if (commonImprovements.length > 0) {
      insights.push(`Common development areas: ${commonImprovements.slice(0, 3).join(', ')}`);
    }

    return insights;
  }

  // Generate actionable recommendations
  private generateRecommendations(observations: any[]): string[] {
    const recommendations: string[] = [];
    
    // Teacher-specific recommendations
    const teacherPerformance = this.analyzeTeacherPerformanceData(observations);
    Object.entries(teacherPerformance).forEach(([teacher, data]: [string, any]) => {
      if (data.averageGrade < 2.5) {
        recommendations.push(`Provide targeted support for ${teacher} focusing on ${data.commonIssues.join(' and ')}`);
      }
      if (data.averageGrade > 3.5) {
        recommendations.push(`Consider ${teacher} as a mentor for peer learning opportunities`);
      }
    });

    // Subject-specific recommendations
    const subjectIssues = this.identifySubjectSpecificIssues(observations);
    Object.entries(subjectIssues).forEach(([subject, issues]: [string, any]) => {
      if (issues.length > 0) {
        recommendations.push(`${subject} department should focus on: ${issues.slice(0, 2).join(' and ')}`);
      }
    });

    // General recommendations based on patterns
    const commonImprovements = this.identifyCommonThemes(observations.map(obs => obs.areas_for_development).filter(Boolean));
    if (commonImprovements.includes('differentiation')) {
      recommendations.push('Implement whole-school CPD on differentiation strategies');
    }
    if (commonImprovements.includes('assessment')) {
      recommendations.push('Review and enhance assessment for learning practices across all departments');
    }

    return recommendations;
  }

  // Identify trends in the data
  private identifyTrends(observations: any[]): string[] {
    const trends: string[] = [];
    
    // Sort observations by date to identify temporal trends
    const sortedObs = observations.sort((a, b) => new Date(a.observation_date).getTime() - new Date(b.observation_date).getTime());
    
    if (sortedObs.length >= 6) {
      const firstHalf = sortedObs.slice(0, Math.floor(sortedObs.length / 2));
      const secondHalf = sortedObs.slice(Math.floor(sortedObs.length / 2));
      
      const firstHalfAvg = this.calculateAverageGrade(firstHalf);
      const secondHalfAvg = this.calculateAverageGrade(secondHalf);
      
      if (secondHalfAvg > firstHalfAvg + 0.3) {
        trends.push('Positive trend: Overall teaching quality has improved over the observation period');
      } else if (firstHalfAvg > secondHalfAvg + 0.3) {
        trends.push('Concerning trend: Teaching quality appears to be declining and requires attention');
      } else {
        trends.push('Stable performance: Teaching quality has remained consistent throughout the observation period');
      }
    }

    // Key stage trends
    const keyStagePerformance = this.analyzeKeyStagePerformance(observations);
    const bestKS = Object.entries(keyStagePerformance).sort(([,a], [,b]) => b - a)[0];
    const worstKS = Object.entries(keyStagePerformance).sort(([,a], [,b]) => a - b)[0];
    
    if (bestKS && worstKS && bestKS[1] > worstKS[1] + 0.5) {
      trends.push(`${bestKS[0]} consistently outperforms other key stages, whilst ${worstKS[0]} requires additional focus`);
    }

    return trends;
  }

  // Create specific action items
  private createActionItems(observations: any[]): string[] {
    const actionItems: string[] = [];
    
    // Immediate actions based on inadequate lessons
    const inadequateLessons = observations.filter(obs => obs.overall_grade === 'Inadequate');
    inadequateLessons.forEach(lesson => {
      actionItems.push(`Schedule follow-up observation for ${lesson.teachers?.name || 'teacher'} within 4 weeks`);
    });

    // Medium-term actions
    const commonImprovements = this.identifyCommonThemes(observations.map(obs => obs.areas_for_development).filter(Boolean));
    if (commonImprovements.length > 0) {
      actionItems.push(`Organise professional development session on ${commonImprovements[0]} by end of term`);
    }

    // Long-term strategic actions
    const subjectPerformance = this.analyzeSubjectPerformance(observations);
    const underperformingSubjects = Object.entries(subjectPerformance)
      .filter(([, avg]) => avg < 2.5)
      .map(([subject]) => subject);
    
    if (underperformingSubjects.length > 0) {
      actionItems.push(`Develop improvement plan for ${underperformingSubjects.join(' and ')} departments`);
    }

    // Celebration and sharing good practice
    const outstandingLessons = observations.filter(obs => obs.overall_grade === 'Outstanding');
    if (outstandingLessons.length > 0) {
      const excellentTeachers = [...new Set(outstandingLessons.map(obs => obs.teachers?.name).filter(Boolean))];
      actionItems.push(`Arrange peer observation opportunities with ${excellentTeachers.slice(0, 2).join(' and ')}`);
    }

    return actionItems;
  }

  // Helper methods for analysis
  private calculateGradeDistribution(grades: string[]): { outstanding: number; good: number; requiresImprovement: number; inadequate: number } {
    const total = grades.length;
    return {
      outstanding: grades.filter(g => g === 'Outstanding').length / total,
      good: grades.filter(g => g === 'Good').length / total,
      requiresImprovement: grades.filter(g => g === 'Requires Improvement').length / total,
      inadequate: grades.filter(g => g === 'Inadequate').length / total
    };
  }

  private analyzeSubjectPerformance(observations: any[]): { [subject: string]: number } {
    const subjectGrades: { [subject: string]: number[] } = {};
    
    observations.forEach(obs => {
      const subject = obs.lesson_subject || 'Unknown';
      const gradeValue = this.gradeToNumber(obs.overall_grade);
      
      if (!subjectGrades[subject]) {
        subjectGrades[subject] = [];
      }
      subjectGrades[subject].push(gradeValue);
    });

    const subjectAverages: { [subject: string]: number } = {};
    Object.entries(subjectGrades).forEach(([subject, grades]) => {
      subjectAverages[subject] = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    });

    return subjectAverages;
  }

  private analyzeTeacherPerformanceData(observations: any[]): { [teacher: string]: any } {
    const teacherData: { [teacher: string]: any } = {};
    
    observations.forEach(obs => {
      const teacher = obs.teachers?.name || 'Unknown';
      const gradeValue = this.gradeToNumber(obs.overall_grade);
      
      if (!teacherData[teacher]) {
        teacherData[teacher] = {
          grades: [],
          issues: [],
          strengths: []
        };
      }
      
      teacherData[teacher].grades.push(gradeValue);
      if (obs.areas_for_development) {
        teacherData[teacher].issues.push(obs.areas_for_development);
      }
      if (obs.strengths) {
        teacherData[teacher].strengths.push(obs.strengths);
      }
    });

    // Calculate averages and common themes
    Object.keys(teacherData).forEach(teacher => {
      const data = teacherData[teacher];
      data.averageGrade = data.grades.reduce((sum: number, grade: number) => sum + grade, 0) / data.grades.length;
      data.commonIssues = this.identifyCommonThemes(data.issues);
      data.commonStrengths = this.identifyCommonThemes(data.strengths);
    });

    return teacherData;
  }

  private identifySubjectSpecificIssues(observations: any[]): { [subject: string]: string[] } {
    const subjectIssues: { [subject: string]: string[] } = {};
    
    observations.forEach(obs => {
      const subject = obs.lesson_subject || 'Unknown';
      if (obs.areas_for_development) {
        if (!subjectIssues[subject]) {
          subjectIssues[subject] = [];
        }
        subjectIssues[subject].push(obs.areas_for_development);
      }
    });

    // Get common themes for each subject
    Object.keys(subjectIssues).forEach(subject => {
      subjectIssues[subject] = this.identifyCommonThemes(subjectIssues[subject]);
    });

    return subjectIssues;
  }

  private analyzeKeyStagePerformance(observations: any[]): { [keyStage: string]: number } {
    const keyStageGrades: { [keyStage: string]: number[] } = {};
    
    observations.forEach(obs => {
      const keyStage = obs.key_stage || 'Unknown';
      const gradeValue = this.gradeToNumber(obs.overall_grade);
      
      if (!keyStageGrades[keyStage]) {
        keyStageGrades[keyStage] = [];
      }
      keyStageGrades[keyStage].push(gradeValue);
    });

    const keyStageAverages: { [keyStage: string]: number } = {};
    Object.entries(keyStageGrades).forEach(([keyStage, grades]) => {
      keyStageAverages[keyStage] = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    });

    return keyStageAverages;
  }

  private identifyCommonThemes(texts: string[]): string[] {
    const themes: { [theme: string]: number } = {};
    const commonWords = ['differentiation', 'assessment', 'engagement', 'behaviour', 'planning', 'questioning', 'feedback', 'pace', 'challenge', 'support'];
    
    texts.forEach(text => {
      const lowerText = text.toLowerCase();
      commonWords.forEach(word => {
        if (lowerText.includes(word)) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private calculateAverageGrade(observations: any[]): number {
    const grades = observations.map(obs => this.gradeToNumber(obs.overall_grade)).filter(g => g > 0);
    return grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
  }

  private gradeToNumber(grade: string): number {
    switch (grade) {
      case 'Outstanding': return 4;
      case 'Good': return 3;
      case 'Requires Improvement': return 2;
      case 'Inadequate': return 1;
      default: return 0;
    }
  }

  private parseAnalysisResponse(response: string): {
    summary: string;
    trends: string[];
    recommendations: string[];
    strengths: string[];
    concerns: string[];
  } {
    const sections = {
      summary: '',
      trends: [] as string[],
      recommendations: [] as string[],
      strengths: [] as string[],
      concerns: [] as string[]
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('SUMMARY:')) {
        sections.summary = trimmed.replace('SUMMARY:', '').trim();
        currentSection = 'summary';
      } else if (trimmed.startsWith('TRENDS:')) {
        currentSection = 'trends';
      } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
      } else if (trimmed.startsWith('STRENGTHS:')) {
        currentSection = 'strengths';
      } else if (trimmed.startsWith('CONCERNS:')) {
        currentSection = 'concerns';
      } else if (trimmed && currentSection && currentSection !== 'summary') {
        const item = trimmed.replace(/^[-•*]\s*/, '').trim();
        if (item) {
          (sections[currentSection as keyof typeof sections] as string[]).push(item);
        }
      }
    }

    return sections;
  }

  // Utility methods
  getMessages(): FeedbackMessage[] {
    return [...this.messages];
  }

  getConversationContext(): AIConversationContext | null {
    return this.conversationContext;
  }

  clearConversation(): void {
    this.messages = [];
    this.conversationContext = null;
  }

  async exportConversation(format: 'json' | 'csv' | 'txt' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify({
        context: this.conversationContext,
        messages: this.messages
      }, null, 2);
    }
    
    if (format === 'txt') {
      return this.messages.map(msg => 
        `[${msg.timestamp.toLocaleString('en-GB')}] ${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n\n');
    }
    
    // CSV format
    const csvHeader = 'Timestamp,Role,Type,Content\n';
    const csvRows = this.messages.map(msg => 
      `"${msg.timestamp.toISOString()}","${msg.role}","${msg.type || 'text'}","${msg.content.replace(/"/g, '""')}"`
    ).join('\n');
    
    return csvHeader + csvRows;
  }
}

// Export singleton instance
export const feedbackAiService = new FeedbackAIService();
export default feedbackAiService;