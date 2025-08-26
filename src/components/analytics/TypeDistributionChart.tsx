import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Info
} from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TypeData {
  type: string;
  observations: number;
  averageScore: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  averageDuration?: number; // in minutes
  colour?: string;
}

interface TypeDistributionChartProps {
  data: TypeData[];
}

const TypeDistributionChart: React.FC<TypeDistributionChartProps> = ({ data }) => {
  const hasData = data && data.length > 0;
  
  // Create empty state data to maintain chart structure
  const emptyStateData = [
    { type: 'No Data', observations: 0, averageScore: 0, outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0, averageDuration: 0, colour: '#e5e7eb' }
  ];
  
  const displayData = hasData ? data : emptyStateData;
  
  const [visibleTypes, setVisibleTypes] = useState<Record<string, boolean>>(
    displayData.reduce((acc, item) => ({ ...acc, [item.type]: true }), {})
  );
  const [showPercentages, setShowPercentages] = useState(true);

  // Enhanced colour palette for observation types
  const typeColours = {
    'Formal Observation': '#3b82f6',      // Blue
    'Informal Observation': '#10b981',     // Green
    'Learning Walk': '#f59e0b',           // Amber
    'Peer Observation': '#8b5cf6',        // Purple
    'Self Assessment': '#ec4899',         // Pink
    'Lesson Study': '#06b6d4',            // Cyan
    'Performance Management': '#ef4444',   // Red
    'Support Visit': '#84cc16',           // Lime
    'Quality Assurance': '#f97316',       // Orange
    'Coaching Session': '#6366f1',        // Indigo
    'Mentoring': '#14b8a6',               // Teal
    'Drop-in': '#a855f7'                 // Violet
  };

  // Assign colours to types
  const dataWithColours = displayData.map((item) => ({
    ...item,
    colour: hasData ? (typeColours[item.type as keyof typeof typeColours] || '#64748b') : item.colour
  }));

  // Filter visible data
  const visibleData = dataWithColours.filter(item => visibleTypes[item.type]);

  // Toggle type visibility
  const toggleType = (type: string) => {
    setVisibleTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        type: string;
        observations: number;
        averageScore: number;
        outstanding: number;
        good: number;
        requiresImprovement: number;
        inadequate: number;
        averageDuration?: number;
        colour: string;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = visibleData.reduce((sum, item) => sum + item.observations, 0);
      const percentage = ((data.observations / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[250px]">
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.colour }}
            />
            <span className="font-semibold text-gray-900">{data.type}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Observations:</span>
              <span className="font-medium">{data.observations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score:</span>
              <span className="font-medium">{data.averageScore.toFixed(2)}</span>
            </div>
            {data.averageDuration && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Duration:</span>
                <span className="font-medium">{data.averageDuration} mins</span>
              </div>
            )}
          </div>
          
          <Separator className="my-3" />
          
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

  // Custom label for donut chart
  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
  }

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: LabelProps) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {showPercentages ? `${(percent * 100).toFixed(0)}%` : name.split(' ')[0]}
      </text>
    );
  };

  // Export data
  const handleExport = () => {
    const dataToExport = hasData ? data : emptyStateData;
    const csvContent = [
      ['Type', 'Observations', 'Average Score', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Average Duration (mins)'].join(','),
      ...dataToExport.map(item => [
        item.type,
        hasData ? item.observations : '0',
        hasData ? item.averageScore.toFixed(2) : '0.00',
        hasData ? item.outstanding : '0',
        hasData ? item.good : '0',
        hasData ? item.requiresImprovement : '0',
        hasData ? item.inadequate : '0',
        hasData ? (item.averageDuration || '') : '0'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observation-types-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalObservations = visibleData.reduce((sum, item) => sum + item.observations, 0);
  const averageScore = hasData && totalObservations > 0 
    ? visibleData.reduce((sum, item) => sum + (item.averageScore * item.observations), 0) / totalObservations 
    : 0;
  const averageDuration = hasData && totalObservations > 0 
    ? visibleData.reduce((sum, item) => sum + ((item.averageDuration || 0) * item.observations), 0) / totalObservations 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observations by Type
              </CardTitle>
              <CardDescription>
                Distribution of different observation types. Click legend items to toggle visibility.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPercentages(!showPercentages)}
              >
                {showPercentages ? 'Show Names' : 'Show %'}
              </Button>
              
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
                      <p>Total number of observations across all types</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? totalObservations.toLocaleString() : '0'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Average Score</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mean score across all observation types</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? averageScore.toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Observation Types</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of different observation types used</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? visibleData.length : '0'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Avg Duration</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average duration of observations in minutes</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData && averageDuration > 0 ? `${averageDuration.toFixed(0)}m` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {dataWithColours.map((item) => {
              const isVisible = visibleTypes[item.type];
              const percentage = ((item.observations / totalObservations) * 100).toFixed(1);
              
              return (
                <button
                  key={item.type}
                  onClick={() => toggleType(item.type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isVisible 
                      ? 'bg-white border-gray-300 shadow-sm' 
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: isVisible ? item.colour : '#d1d5db' }}
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium">{item.type}</div>
                    <div className="text-xs text-gray-500">
                      {item.observations} ({percentage}%)
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Donut Chart */}
          <div className="h-96 relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg z-10">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No observation type data available for the selected filters</p>
                  <p className="text-sm mt-1">Try adjusting your filter criteria or date range</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="observations"
                  paddingAngle={2}
                >
                  {visibleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colour} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {hasData ? totalObservations.toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600">Total Observations</div>
              </div>
            </div>
          </div>

          {/* Type Analysis */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Common Types */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Most Common Types</h4>
              <div className="space-y-2">
                {hasData ? (
                  visibleData
                    .sort((a, b) => b.observations - a.observations)
                    .slice(0, 3)
                    .map((item, index) => {
                      const percentage = ((item.observations / totalObservations) * 100).toFixed(1);
                      return (
                        <div key={item.type} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              #{index + 1}
                            </Badge>
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.colour }}
                            />
                            <span className="font-medium text-gray-900">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-700">{item.observations}</div>
                            <div className="text-xs text-blue-600">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-muted-foreground">
                    <p className="text-sm">No observation type data available to analyse frequency</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Highest Scoring Types */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Highest Scoring Types</h4>
              <div className="space-y-2">
                {hasData ? (
                  visibleData
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            #{index + 1}
                          </Badge>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.colour }}
                          />
                          <span className="font-medium text-gray-900">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-700">{item.averageScore.toFixed(2)}</div>
                          <div className="text-xs text-green-600">{item.observations} observations</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-muted-foreground">
                    <p className="text-sm">No observation type data available to analyse performance</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Duration Analysis */}
          {(hasData && visibleData.some(item => item.averageDuration)) && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Duration Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleData
                  .filter(item => item.averageDuration)
                  .sort((a, b) => (b.averageDuration || 0) - (a.averageDuration || 0))
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-gray-900">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-amber-700">{item.averageDuration}m</div>
                        <div className="text-xs text-amber-600">average</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TypeDistributionChart;