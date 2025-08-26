import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Download, Trash2, Loader2, Calendar, Filter, BarChart3, MessageCircle, TrendingUp, Users, Lightbulb, Target } from 'lucide-react';
import { feedbackAiService } from '../lib/feedbackAiService';
import type { FeedbackMessage, FeedbackReport, AnalysisRequest } from '../lib/feedbackAiTypes';

interface FeedbackAIProps {
  className?: string;
}

const FeedbackAI: React.FC<FeedbackAIProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<FeedbackReport | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportType, setReportType] = useState<string>('report');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [showDiscussionOptions, setShowDiscussionOptions] = useState(false);
  const [showInsightsOptions, setShowInsightsOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize the service on component mount
  useEffect(() => {
    const initializeService = async () => {
      try {
        await feedbackAiService.initialize();
        setIsInitialized(true);
        
        // Add welcome message
        const welcomeMessage: FeedbackMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Hello! I\'m your Educational Feedback AI Assistant. I can help you analyse observation data, generate comprehensive reports, and provide insights on teaching performance. How may I assist you today?',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages([welcomeMessage]);
      } catch (err) {
        console.error('Failed to initialize Feedback AI service:', err);
        setError('Failed to initialise the AI service. Please check your configuration.');
      }
    };

    initializeService();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !isInitialized) return;

    const userMessage: FeedbackMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      // Create analysis request if we have active filters
      let analysisRequest: AnalysisRequest | undefined;
      if (dateRange.from || dateRange.to) {
        analysisRequest = {
          type: 'discussion',
          scope: {
            dateRange: {
              from: dateRange.from || undefined,
              to: dateRange.to || undefined
            }
          }
        };
      }

      const result = await feedbackAiService.processTextCommand(inputText.trim(), analysisRequest);

      if (result.success && result.data) {
        const assistantMessage: FeedbackMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error processing command:', err);
      const errorMessage: FeedbackMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologise, but I encountered an error whilst processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const generateReport = async (customRequest?: Partial<AnalysisRequest>) => {
    if (isLoading || !isInitialized) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const request: AnalysisRequest = {
        type: customRequest?.type || reportType,
        scope: {
          dateRange: customRequest?.scope?.dateRange || dateRange,
          teacherIds: customRequest?.scope?.teacherIds || [],
          subjects: customRequest?.scope?.subjects || [],
          keyStages: customRequest?.scope?.keyStages || []
        },
        parameters: {
          includeCharts: true,
          detailLevel: 'comprehensive',
          format: 'structured'
        }
      };

      const report = await feedbackAiService.generateReport(request);
      
      const reportMessage: FeedbackMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've generated a comprehensive ${report.type} report covering ${report.summary.totalObservations} observations from ${dateRange.from.toLocaleDateString('en-GB')} to ${dateRange.to.toLocaleDateString('en-GB')}. The report includes detailed analysis, key findings, and actionable recommendations.`,
        timestamp: new Date(),
        type: 'report',
        metadata: { report }
      };

      setMessages(prev => [...prev, reportMessage]);
      setLastReport(report);
      setShowReportOptions(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    if (!lastReport) return;
    
    try {
      await feedbackAiService.exportConversation(format);
      
      // Create and download the report file
      const reportData = format === 'json' 
        ? JSON.stringify(lastReport, null, 2)
        : format === 'csv'
        ? convertReportToCSV(lastReport)
        : lastReport.sections.map(s => `${s.title}\n${s.content}`).join('\n\n');
      
      const blob = new Blob([reportData], { 
        type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    }
  };

  const convertReportToCSV = (report: FeedbackReport): string => {
    const headers = ['Section', 'Content'];
    const rows = report.sections.map(section => [
      section.title,
      section.content.replace(/\n/g, ' ').replace(/,/g, ';')
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const clearConversation = () => {
    setMessages([]);
    setLastReport(null);
    setError(null);
    feedbackAiService.clearConversation();
    
    // Re-add welcome message
    const welcomeMessage: FeedbackMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversation cleared. How may I assist you with your educational feedback analysis?',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  };

  const generateInsights = async () => {
    if (isLoading || !isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    setShowInsightsOptions(false);

    try {
      const request: AnalysisRequest = {
        type: 'insights',
        scope: {
          dateRange: dateRange,
          teacherIds: [],
          subjects: [],
          keyStages: []
        },
        parameters: {
          includeCharts: false,
          detailLevel: 'comprehensive',
          format: 'structured'
        }
      };

      const insights = await feedbackAiService.generateInsights(request);
      
      const insightsMessage: FeedbackMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've analysed the observation data from ${dateRange.from.toLocaleDateString('en-GB')} to ${dateRange.to.toLocaleDateString('en-GB')} and generated comprehensive insights including key patterns, trends, and actionable recommendations.`,
        timestamp: new Date(),
        type: 'insights',
        metadata: insights
      };

      setMessages(prev => [...prev, insightsMessage]);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInsightsData = (insightsData: any) => {
    if (!insightsData) return null;

    return (
      <div className="mt-4 space-y-4">
        {/* Key Insights */}
        {insightsData.insights && insightsData.insights.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Key Insights
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              {insightsData.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trends */}
        {insightsData.trends && insightsData.trends.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Identified Trends
            </h4>
            <ul className="space-y-2 text-sm text-purple-800">
              {insightsData.trends.map((trend: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {trend}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insightsData.recommendations && insightsData.recommendations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-green-800">
              {insightsData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {insightsData.actionItems && insightsData.actionItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Action Items
            </h4>
            <ul className="space-y-2 text-sm text-amber-800">
              {insightsData.actionItems.map((item: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const startDiscussion = async (topic: string) => {
    const discussionPrompts = {
      'teacher-performance': 'Can you analyse the recent teacher performance data and highlight key trends and areas for improvement?',
      'lesson-quality': 'What patterns do you see in lesson quality across different subjects and key stages?',
      'student-engagement': 'How can we improve student engagement based on recent observation data?',
      'curriculum-delivery': 'What insights can you provide about curriculum delivery effectiveness?',
      'professional-development': 'What professional development recommendations would you make based on current observation patterns?'
    };

    const prompt = discussionPrompts[topic as keyof typeof discussionPrompts];
    if (prompt && !isLoading) {
      setInputText(prompt);
      
      // Create user message
      const userMessage: FeedbackMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: prompt,
        role: 'user',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);

      try {
        // Create analysis request with current date range if available
        let analysisRequest: AnalysisRequest | undefined;
        if (dateRange.from || dateRange.to) {
          analysisRequest = {
            type: 'discussion',
            scope: {
              dateRange: {
                from: dateRange.from || undefined,
                to: dateRange.to || undefined
              }
            }
          };
        }

        const response = await feedbackAiService.processTextCommand(prompt, analysisRequest);
        
        if (response.success && response.data) {
          const aiMessage: FeedbackMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: response.data.response,
            role: 'assistant',
            timestamp: new Date(),
            type: 'analysis'
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(response.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Error in discussion:', error);
        const errorMessage: FeedbackMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: 'I apologise, but I encountered an error processing your discussion request. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
          type: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>
    ));
  };

  const renderReportSections = (report: FeedbackReport) => {
    return (
      <div className="mt-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Report Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Observations:</span>
              <span className="ml-2">{report.summary.totalObservations}</span>
            </div>
            <div>
              <span className="font-medium">Teachers Observed:</span>
              <span className="ml-2">{report.summary.teachersObserved}</span>
            </div>
            <div>
              <span className="font-medium">Average Rating:</span>
              <span className="ml-2">{report.summary.averageRating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">Period:</span>
              <span className="ml-2">{report.summary.dateRange}</span>
            </div>
          </div>
        </div>
        
        {report.sections.map((section, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {section.title}
            </h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        ))}
        
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Key Recommendations</h4>
            <ul className="space-y-1 text-sm text-green-800">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!isInitialized && !error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Initialising Feedback AI...</span>
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background rounded-lg shadow-sm border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Educational Feedback AI</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowReportOptions(!showReportOptions)}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            
            <button
              onClick={() => setShowDiscussionOptions(!showDiscussionOptions)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Start Discussion</span>
            </button>
            
            <button
              onClick={() => setShowInsightsOptions(!showInsightsOptions)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Generate Insights</span>
            </button>
            
            {showReportOptions && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full border border-input rounded px-2 py-1 text-sm bg-background text-foreground"
                    >
                      <option value="report">Comprehensive Report</option>
                      <option value="analysis">Performance Analysis</option>
                      <option value="insights">Teaching Insights</option>
                      <option value="suggestions">Improvement Suggestions</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">From Date</label>
                      <input
                        type="date"
                        value={dateRange.from.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                        className="w-full border border-input rounded px-2 py-1 text-sm bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">To Date</label>
                      <input
                        type="date"
                        value={dateRange.to.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                        className="w-full border border-input rounded px-2 py-1 text-sm bg-background text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => generateReport()}
                      className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => setShowReportOptions(false)}
                      className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showInsightsOptions && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4">
                <h3 className="text-lg font-semibold mb-3">Generate Insights</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRange.from.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                      />
                      <input
                        type="date"
                        value={dateRange.to.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                       onClick={generateInsights}
                       disabled={isLoading}
                       className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                       <Lightbulb className="w-4 h-4" />
                       Generate Insights
                     </button>
                    <button
                      onClick={() => setShowInsightsOptions(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {lastReport && (
            <div className="relative">
              <button
                onClick={() => exportReport('json')}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          )}
          
          <button
            onClick={clearConversation}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className={`max-w-4xl ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`rounded-lg p-4 ${message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border shadow-sm text-card-foreground'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1 flex items-center">
                      {message.role === 'user' ? 'You' : 'Feedback AI'}
                      {message.type === 'report' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Report Generated
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                    {message.type === 'report' && message.metadata?.report && (
                      renderReportSections(message.metadata.report)
                    )}
                    {message.type === 'insights' && message.metadata && (
                       <>
                         <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mb-2">
                           Insights Generated
                         </span>
                         {renderInsightsData(message.metadata)}
                       </>
                     )}
                    <div className={`text-xs mt-2 opacity-75 text-muted-foreground`}>
                      {message.timestamp.toLocaleTimeString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Analysing...</span>
              </div>
            </div>
          </div>
        )}
        
        {showDiscussionOptions && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4">
            <h3 className="text-sm font-medium text-card-foreground mb-3">Discussion Topics</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  startDiscussion('teacher-performance');
                  setShowDiscussionOptions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <TrendingUp size={16} className="text-blue-600" />
                Teacher Performance Analysis
              </button>
              
              <button
                onClick={() => {
                  startDiscussion('lesson-quality');
                  setShowDiscussionOptions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 size={16} className="text-green-600" />
                Lesson Quality Patterns
              </button>
              
              <button
                onClick={() => {
                  startDiscussion('student-engagement');
                  setShowDiscussionOptions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users size={16} className="text-violet-600" />
                Student Engagement Strategies
              </button>
              
              <button
                onClick={() => {
                  startDiscussion('curriculum-delivery');
                  setShowDiscussionOptions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText size={16} className="text-orange-600" />
                Curriculum Delivery Insights
              </button>
              
              <button
                onClick={() => {
                  startDiscussion('professional-development');
                  setShowDiscussionOptions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <TrendingUp size={16} className="text-red-600" />
                Professional Development Recommendations
              </button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about observation data, request a report, or discuss teaching performance insights..."
            className="flex-1 resize-none border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            rows={2}
            disabled={isLoading || !isInitialized}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || !isInitialized}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackAI;