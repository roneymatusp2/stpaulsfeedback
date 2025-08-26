import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  BarChart3,
  Activity,
  Calendar,
  Target,
  Info
} from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrendData {
  date: string;
  averageScore: number;
  totalObservations: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  movingAverage?: number;
  target?: number;
}

interface ObservationTrendsChartProps {
  data: TrendData[];
  showMovingAverage?: boolean;
  showTarget?: boolean;
  targetScore?: number;
}

const ObservationTrendsChart: React.FC<ObservationTrendsChartProps> = ({ 
  data, 
  showMovingAverage = true,
  showTarget = true,
  targetScore = 3.0
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showBrush, setShowBrush] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'averageScore' | 'totalObservations'>('averageScore');

  // Calculate moving average (7-period)
  const dataWithMovingAverage = data.map((item, index) => {
    if (index < 6) return { ...item, movingAverage: null };
    
    const sum = data.slice(index - 6, index + 1).reduce((acc, curr) => acc + curr.averageScore, 0);
    return {
      ...item,
      movingAverage: sum / 7,
      target: targetScore
    };
  });

  // Calculate trend statistics
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0, isImproving: false };
    
    const recent = data.slice(-7); // Last 7 data points
    const previous = data.slice(-14, -7); // Previous 7 data points
    
    if (previous.length === 0) return { direction: 'stable', percentage: 0, isImproving: false };
    
    const recentAvg = recent.reduce((sum, item) => sum + item.averageScore, 0) / recent.length;
    const previousAvg = previous.reduce((sum, item) => sum + item.averageScore, 0) / previous.length;
    
    const percentage = ((recentAvg - previousAvg) / previousAvg) * 100;
    const direction = percentage > 2 ? 'up' : percentage < -2 ? 'down' : 'stable';
    const isImproving = percentage > 0;
    
    return { direction, percentage: Math.abs(percentage), isImproving };
  };

  const trend = calculateTrend();

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        averageScore: number;
        totalObservations: number;
        movingAverage?: number;
        outstanding: number;
        good: number;
        requiresImprovement: number;
        inadequate: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score:</span>
              <span className="font-semibold text-blue-600">
                {data.averageScore.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Observations:</span>
              <span className="font-medium">{data.totalObservations}</span>
            </div>
            
            {showMovingAverage && data.movingAverage && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">7-Day Average:</span>
                <span className="font-medium text-purple-600">
                  {data.movingAverage.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
          <Separator className="my-2" />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Outstanding: {data.outstanding}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Good: {data.good}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Requires Improvement: {data.requiresImprovement}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Inadequate: {data.inadequate}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Export chart data
  const handleExport = () => {
    const exportData = hasData ? dataWithMovingAverage : emptyStateData;
    const csvContent = [
      ['Date', 'Average Score', 'Total Observations', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', '7-Day Moving Average'].join(','),
      ...exportData.map(item => [
        item.date,
        item.averageScore.toFixed(2),
        item.totalObservations || 0,
        item.outstanding || 0,
        item.good || 0,
        item.requiresImprovement || 0,
        item.inadequate || 0,
        item.movingAverage?.toFixed(2) || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observation-trends-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasData = data && data.length > 0;
  
  // Create empty state data to maintain chart structure
  const emptyStateData = [
    { date: new Date().toISOString(), averageScore: 0, totalObservations: 0 }
  ];
  
  const displayData = hasData ? data : emptyStateData;

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Overall Observation Scores
              </CardTitle>
              <CardDescription>
                Trend analysis of observation scores over time. Shows improvement patterns and performance consistency.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBrush(!showBrush)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {showBrush ? 'Hide' : 'Show'} Zoom
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Current Trend</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Comparison of recent 7 days vs previous 7 days</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {trend.direction === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                {trend.direction === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                {trend.direction === 'stable' && <Minus className="h-5 w-5 text-gray-600" />}
                <span className={`font-semibold ${
                  trend.direction === 'up' ? 'text-green-600' : 
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Latest Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? data[data.length - 1]?.averageScore.toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Period Average</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? (data.reduce((sum, item) => sum + item.averageScore, 0) / data.length).toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Observations</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? data.reduce((sum, item) => sum + item.totalObservations, 0).toLocaleString() : '0'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-96 relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg z-10">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No trend data available for the selected period</p>
                  <p className="text-sm mt-1">Try selecting a different date range or criteria</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent
                data={hasData ? dataWithMovingAverage : emptyStateData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: showBrush ? 80 : 20
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  stroke="#64748b"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                />
                <YAxis 
                  fontSize={12}
                  stroke="#64748b"
                  domain={hasData ? [1, 4] : [0, 4]}
                  tickCount={4}
                  tickFormatter={(value) => {
                    if (!hasData && value === 0) return '';
                    const labels = { 1: 'Inadequate', 2: 'Requires Improvement', 3: 'Good', 4: 'Outstanding' };
                    return labels[value as keyof typeof labels] || value.toString();
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Target line */}
                {showTarget && (
                  <ReferenceLine 
                    y={targetScore} 
                    stroke="#dc2626" 
                    strokeDasharray="5 5" 
                    label={{ value: `Target (${targetScore})`, position: 'topRight' }}
                  />
                )}
                
                {/* Main trend line/area */}
                <DataComponent
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill={chartType === 'area' ? 'url(#colorScore)' : undefined}
                  name="Average Score"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                
                {/* Moving average line */}
                {showMovingAverage && (
                  <Line
                    type="monotone"
                    dataKey="movingAverage"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="7-Day Moving Average"
                  />
                )}
                
                {/* Gradient definition for area chart */}
                {chartType === 'area' && (
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                )}
                
                {/* Brush for zooming */}
                {showBrush && (
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#3b82f6"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  />
                )}
              </ChartComponent>
            </ResponsiveContainer>
          </div>

          {/* Performance Indicators */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Indicators</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Above Target Days</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {hasData ? data.filter(item => item.averageScore >= targetScore).length : 0} days
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Highest Score</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {hasData ? Math.max(...data.map(item => item.averageScore)).toFixed(2) : '0.00'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Most Active Day</span>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {hasData ? data.reduce((max, item) => 
                      item.totalObservations > max.totalObservations ? item : max
                    ).totalObservations : 0} observations
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Consistency Score</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {hasData ? (100 - (Math.sqrt(data.reduce((sum, item, _, arr) => {
                      const mean = arr.reduce((s, i) => s + i.averageScore, 0) / arr.length;
                      return sum + Math.pow(item.averageScore - mean, 2);
                    }, 0) / data.length) / 4 * 100)).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ObservationTrendsChart;