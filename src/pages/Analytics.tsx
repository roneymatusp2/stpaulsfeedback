import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

// Import analytics components (to be created)
import AdvancedFilters from '@/components/analytics/AdvancedFilters';
import CriteriaBreakdownChart from '@/components/analytics/CriteriaBreakdownChart';
import ObservationTrendsChart from '@/components/analytics/ObservationTrendsChart';
import SubjectDistributionChart from '@/components/analytics/SubjectDistributionChart';
import TypeDistributionChart from '@/components/analytics/TypeDistributionChart';
import KeyStageAnalysisChart from '@/components/analytics/KeyStageAnalysisChart';
import StaffAnalysisTables from '@/components/analytics/StaffAnalysisTables';

// Import analytics API functions (to be created)
import { analyticsApi } from '@/lib/supabase';

interface AnalyticsFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  subjects: string[];
  keyStages: string[];
  observationTypes: string[];
  staff: string[];
  departments: string[];
}

interface CriteriaBreakdownItem {
  criteria: string;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  total: number;
  average: number;
  trend?: number;
}

interface ObservationTrendItem {
  date: string;
  averageScore: number;
  totalObservations: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  movingAverage?: number;
}

interface SubjectDistributionItem {
  subject: string;
  count: number;
  percentage: number;
  averageScore: number;
}

interface TypeDistributionItem {
  type: string;
  count: number;
  percentage: number;
  averageScore: number;
  averageDuration: number;
}

interface KeyStageAnalysisItem {
  keyStage: string;
  totalObservations: number;
  averageScore: number;
  staffCount: number;
  subjectCount: number;
  outstanding?: number;
  good?: number;
  requiresImprovement?: number;
  inadequate?: number;
}

interface StaffFrequencyItem {
  id: string;
  name: string;
  department: string;
  observationCount: number;
  averageScore: number;
  lastObservation: string;
}

interface DevelopmentNeededItem {
  id: string;
  name: string;
  department: string;
  subject: string;
  observationDate: string;
  score: number;
  concerns: string[];
}

interface NotObservedItem {
  id: string;
  name: string;
  department: string;
  lastObservation: string;
  daysSinceLastObservation: number;
}

interface AnalyticsData {
  criteriaBreakdown: CriteriaBreakdownItem[];
  observationTrends: ObservationTrendItem[];
  subjectDistribution: SubjectDistributionItem[];
  typeDistribution: TypeDistributionItem[];
  keyStageAnalysis: KeyStageAnalysisItem[];
  staffAnalysis: {
    staffData: StaffFrequencyItem[];
    observerData: { name: string; observationsCount: number; averageScore: number; departments: string[] }[];
  };
  summary: {
    totalObservations: number;
    averageScore: number;
    improvementTrend: number;
    staffObserved: number;
  };
}

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
      to: new Date()
    },
    subjects: [],
    keyStages: [],
    observationTypes: [],
    staff: [],
    departments: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const raw = await analyticsApi.getAnalyticsData(filters);
      const mapped: AnalyticsData = {
        criteriaBreakdown: (raw.criteriaBreakdown || []).map((c: any) => ({
          criteria: c.criteria,
          outstanding: c.outstanding ?? 0,
          good: c.good ?? 0,
          requiresImprovement: c.requiresImprovement ?? 0,
          inadequate: c.inadequate ?? 0,
          total: c.total ?? 0,
          average: c.average ?? 0,
          trend: 0
        })),
        observationTrends: (raw.observationTrends || []).map((t: any) => ({
          date: t.date,
          averageScore: t.averageScore ?? t.score ?? 0,
          totalObservations: t.totalObservations ?? t.count ?? 0,
          outstanding: t.outstanding ?? 0,
          good: t.good ?? 0,
          requiresImprovement: t.requiresImprovement ?? 0,
          inadequate: t.inadequate ?? 0
        })),
        subjectDistribution: (raw.subjectDistribution || []).map((s: any) => ({
          subject: s.subject || s.name,
          count: s.count ?? s.value ?? 0,
          percentage: s.percentage ?? 0,
          averageScore: s.averageScore ?? 0
        })),
        typeDistribution: (raw.typeDistribution || []).map((t: any) => ({
          type: t.type || t.name,
          count: t.count ?? t.value ?? 0,
          percentage: t.percentage ?? 0,
          averageScore: t.averageScore ?? 0,
          averageDuration: t.averageDuration
        })),
        keyStageAnalysis: (raw.keyStageAnalysis || []).map((k: any) => ({
          keyStage: k.keyStage || k.name,
          totalObservations: k.totalObservations ?? k.value ?? 0,
          averageScore: k.averageScore ?? 0,
          staffCount: k.staffCount ?? 0,
          subjectCount: k.subjectCount ?? 0,
          outstanding: k.outstanding ?? 0,
          good: k.good ?? 0,
          requiresImprovement: k.requiresImprovement ?? 0,
          inadequate: k.inadequate ?? 0
        })),
        staffAnalysis: {
          staffData: raw.staffAnalysis?.staffData || [],
          observerData: raw.staffAnalysis?.observerData || []
        },
        summary: {
          totalObservations: raw.summaryStats?.totalObservations ?? 0,
          averageScore: raw.summaryStats?.averageScore ?? 0,
          improvementTrend: raw.summaryStats?.trendsComparison?.changePercentage ?? 0,
          staffObserved: raw.summaryStats?.totalTeachers ?? 0
        }
      };
      setData(mapped);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  // Export data
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      toast.loading('Preparing export...');
      await analyticsApi.exportData(filters, format);
      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  // Apply filters
  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
    loadAnalyticsData();
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg font-medium">Loading analytics data...</p>
          <p className="text-sm text-muted-foreground">Analysing observation data and generating insights</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadAnalyticsData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
            Comprehensive analysis of observation data and teaching standards
          </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
            <CardDescription>
              Customise your analysis by filtering data according to your requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Observations</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.summary?.totalObservations || 0}</div>
                <p className="text-xs text-muted-foreground">Across all filtered criteria</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.summary?.averageScore ? data.summary.averageScore.toFixed(1) : '0.0'}
                </div>
                <p className="text-xs text-muted-foreground">Out of 4.0 scale</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {data?.summary?.improvementTrend ? 
                      `${data.summary.improvementTrend > 0 ? '+' : ''}${data.summary.improvementTrend.toFixed(1)}%` : 
                      '0.0%'
                    }
                  </div>
                  <Badge variant={data?.summary?.improvementTrend && data.summary.improvementTrend > 0 ? 'default' : 'secondary'}>
                    {data?.summary?.improvementTrend && data.summary.improvementTrend > 0 ? 'Improving' : 
                     data?.summary?.improvementTrend && data.summary.improvementTrend < 0 ? 'Declining' : 'No Data'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Compared to previous period</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Observed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.summary?.staffObserved || 0}</div>
                <p className="text-xs text-muted-foreground">Individual staff members</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Analytics Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="criteria">Criteria Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
            <TabsTrigger value="staff">Staff Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SubjectDistributionChart 
                  data={(data?.subjectDistribution || []).map((item: any) => ({
                    subject: item.subject || item.name,
                    observations: item.observations ?? item.count ?? 0,
                    averageScore: item.averageScore ?? 0,
                    outstanding: item.outstanding ?? 0,
                    good: item.good ?? 0,
                    requiresImprovement: item.requiresImprovement ?? 0,
                    inadequate: item.inadequate ?? 0,
                    teachers: item.teachers ?? 0
                  }))}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <TypeDistributionChart 
                  data={(data?.typeDistribution || []).map((item: any) => ({
                    type: item.type || item.name,
                    observations: item.observations ?? item.count ?? 0,
                    averageScore: item.averageScore ?? 0,
                    outstanding: item.outstanding ?? 0,
                    good: item.good ?? 0,
                    requiresImprovement: item.requiresImprovement ?? 0,
                    inadequate: item.inadequate ?? 0,
                    averageDuration: item.averageDuration ?? undefined
                  }))}
                />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <KeyStageAnalysisChart data={(data?.keyStageAnalysis || []).map((k: any) => ({
                keyStage: k.keyStage,
                totalObservations: k.totalObservations,
                averageScore: k.averageScore,
                staffCount: k.staffCount,
                subjectCount: k.subjectCount ?? 0
              }))} />
            </motion.div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CriteriaBreakdownChart data={data?.criteriaBreakdown || []} />
            </motion.div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ObservationTrendsChart data={data?.observationTrends || []} />
            </motion.div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StaffAnalysisTables 
                staffData={data?.staffAnalysis?.staffData || []}
                observerData={data?.staffAnalysis?.observerData || []}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Analytics;