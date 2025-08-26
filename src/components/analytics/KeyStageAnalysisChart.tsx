import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Download,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Users,
  Info
} from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KeyStageData {
  keyStage: string;
  totalObservations: number;
  averageScore: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  subjects: string[];
  staffCount: number;
  trend?: 'up' | 'down' | 'stable';
  previousScore?: number;
}

interface KeyStageAnalysisChartProps {
  data: KeyStageData[];
}

const KeyStageAnalysisChart: React.FC<KeyStageAnalysisChartProps> = ({ data }) => {
  const [visibleMetrics, setVisibleMetrics] = useState({
    outstanding: true,
    good: true,
    requiresImprovement: true,
    inadequate: true
  });
  const [sortBy, setSortBy] = useState<'keyStage' | 'averageScore' | 'totalObservations'>('keyStage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Check if we have data
  const hasData = data && data.length > 0;

  // Empty state data for consistent chart structure
  const emptyStateData: KeyStageData[] = [
    {
      keyStage: 'No Data',
      totalObservations: 0,
      averageScore: 0,
      outstanding: 0,
      good: 0,
      requiresImprovement: 0,
      inadequate: 0,
      subjects: [],
      staffCount: 0
    }
  ];

  // Use actual data or empty state data
  const chartData = hasData ? data : emptyStateData;

  // Grade colours
  const gradeColours = {
    outstanding: '#10b981',      // Green
    good: '#3b82f6',            // Blue
    requiresImprovement: '#f59e0b', // Amber
    inadequate: '#ef4444'        // Red
  };

  // Sort data
  const sortedData = [...chartData].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'averageScore':
        aValue = a.averageScore;
        bValue = b.averageScore;
        break;
      case 'totalObservations':
        aValue = a.totalObservations;
        bValue = b.totalObservations;
        break;
      default:
        aValue = a.keyStage;
        bValue = b.keyStage;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  // Toggle metric visibility
  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && hasData) {
      const keyStageData = chartData.find(item => item.keyStage === label);
      if (!keyStageData) return null;
      
      const total = keyStageData.outstanding + keyStageData.good + keyStageData.requiresImprovement + keyStageData.inadequate;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-900">{label}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Observations:</span>
              <span className="font-medium">{keyStageData.totalObservations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score:</span>
              <span className="font-medium">{keyStageData.averageScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Staff Members:</span>
              <span className="font-medium">{keyStageData.staffCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subjects:</span>
              <span className="font-medium">{keyStageData.subjects.length}</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            {payload.map((entry, index: number) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm capitalize">{entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{entry.value}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {keyStageData.trend && keyStageData.previousScore && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trend:</span>
                <div className="flex items-center gap-1">
                  {keyStageData.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {keyStageData.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {keyStageData.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600" />}
                  <span className="text-sm font-medium">
                    {keyStageData.previousScore.toFixed(2)} → {keyStageData.averageScore.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Export data
  const handleExport = () => {
    const dataToExport = hasData ? data : emptyStateData;
    const csvContent = [
      ['Key Stage', 'Total Observations', 'Average Score', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Staff Count', 'Subjects'].join(','),
      ...dataToExport.map(item => [
        hasData ? item.keyStage : 'No Data',
        hasData ? item.totalObservations : '0',
        hasData ? item.averageScore.toFixed(2) : '0.00',
        hasData ? item.outstanding : '0',
        hasData ? item.good : '0',
        hasData ? item.requiresImprovement : '0',
        hasData ? item.inadequate : '0',
        hasData ? item.staffCount : '0',
        hasData ? item.subjects.join('; ') : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `key-stage-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Key Stage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No key stage data available.</p>
            <p className="text-sm mt-1">Try adjusting your filter criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalObservations = hasData ? data.reduce((sum, item) => sum + item.totalObservations, 0) : 0;
  const overallAverageScore = hasData ? data.reduce((sum, item) => sum + (item.averageScore * item.totalObservations), 0) / totalObservations : 0;
  const totalStaff = hasData ? data.reduce((sum, item) => sum + item.staffCount, 0) : 0;
  const bestPerformingStage = hasData && data.length > 0 ? data.reduce((best, current) => 
    current.averageScore > best.averageScore ? current : best
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Key Stage Analysis
              </CardTitle>
              <CardDescription>
                Performance breakdown across different key stages. Click legend items to toggle visibility.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="keyStage-asc">Key Stage (A-Z)</option>
                <option value="keyStage-desc">Key Stage (Z-A)</option>
                <option value="averageScore-desc">Score (High-Low)</option>
                <option value="averageScore-asc">Score (Low-High)</option>
                <option value="totalObservations-desc">Observations (Most)</option>
                <option value="totalObservations-asc">Observations (Least)</option>
              </select>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Observations</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total observations across all key stages</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {totalObservations.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Average</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Weighted average score across all key stages</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? overallAverageScore.toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Staff</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total staff members across all key stages</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {totalStaff}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Best Performing</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Key stage with highest average score</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {bestPerformingStage ? bestPerformingStage.keyStage : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">
                {bestPerformingStage ? bestPerformingStage.averageScore.toFixed(2) : '0.00'} avg
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(visibleMetrics).map(([metric, isVisible]) => {
              const label = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const colour = gradeColours[metric as keyof typeof gradeColours];
              
              return (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric as keyof typeof visibleMetrics)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isVisible 
                      ? 'bg-white border-gray-300 shadow-sm' 
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: isVisible ? colour : '#d1d5db' }}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Bar Chart */}
          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="keyStage" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {visibleMetrics.outstanding && (
                  <Bar 
                    dataKey="outstanding" 
                    stackId="grades" 
                    fill={gradeColours.outstanding}
                    name="Outstanding"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {visibleMetrics.good && (
                  <Bar 
                    dataKey="good" 
                    stackId="grades" 
                    fill={gradeColours.good}
                    name="Good"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {visibleMetrics.requiresImprovement && (
                  <Bar 
                    dataKey="requiresImprovement" 
                    stackId="grades" 
                    fill={gradeColours.requiresImprovement}
                    name="Requires Improvement"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {visibleMetrics.inadequate && (
                  <Bar 
                    dataKey="inadequate" 
                    stackId="grades" 
                    fill={gradeColours.inadequate}
                    name="Inadequate"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {!hasData && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                    No key stage data available for the selected filters
                  </text>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Stage Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Key Stages */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                Top Performing Key Stages
              </h4>
              <div className="space-y-2">
                {hasData ? (
                  sortedData
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 3)
                    .map((item, index) => {
                      const outstandingPercentage = ((item.outstanding / item.totalObservations) * 100).toFixed(1);
                      return (
                        <div key={item.keyStage} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              #{index + 1}
                            </Badge>
                            <div>
                              <div className="font-medium text-gray-900">{item.keyStage}</div>
                              <div className="text-xs text-green-600">
                                {item.outstanding} outstanding ({outstandingPercentage}%)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-700">{item.averageScore.toFixed(2)}</div>
                            <div className="text-xs text-green-600">{item.totalObservations} observations</div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No key stage data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Key Stages Needing Support */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                Key Stages Needing Support
              </h4>
              <div className="space-y-2">
                {hasData ? (
                  sortedData
                    .filter(item => item.requiresImprovement > 0 || item.inadequate > 0)
                    .sort((a, b) => (b.requiresImprovement + b.inadequate) - (a.requiresImprovement + a.inadequate))
                    .slice(0, 3)
                    .map((item) => {
                      const concernPercentage = (((item.requiresImprovement + item.inadequate) / item.totalObservations) * 100).toFixed(1);
                      return (
                        <div key={item.keyStage} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Target className="h-4 w-4 text-red-600" />
                            <div>
                              <div className="font-medium text-gray-900">{item.keyStage}</div>
                              <div className="text-xs text-red-600">
                                {item.requiresImprovement + item.inadequate} need support ({concernPercentage}%)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-red-700">{item.averageScore.toFixed(2)}</div>
                            <div className="text-xs text-red-600">{item.totalObservations} observations</div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No key stage data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Key Stage Information */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Stage Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Key Stage</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Observations</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Avg Score</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Staff</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Subjects</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {hasData ? (
                    sortedData.map((item) => (
                      <tr key={item.keyStage} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{item.keyStage}</td>
                        <td className="py-2 px-3 text-right">{item.totalObservations}</td>
                        <td className="py-2 px-3 text-right">{item.averageScore.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">{item.staffCount}</td>
                        <td className="py-2 px-3 text-right">{item.subjects.length}</td>
                        <td className="py-2 px-3 text-center">
                          {item.trend && (
                            <div className="flex items-center justify-center">
                              {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                              {item.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600" />}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No key stage data available for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KeyStageAnalysisChart;