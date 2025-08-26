import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Eye,
  EyeOff,
  BookOpen,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface SubjectData {
  subject: string;
  observations: number;
  averageScore: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  teachers: number;
  colour?: string;
}

interface SubjectDistributionChartProps {
  data: SubjectData[];
  showAsBar?: boolean;
}

const SubjectDistributionChart: React.FC<SubjectDistributionChartProps> = ({ 
  data, 
  showAsBar = false 
}) => {
  // Compute data availability and display set BEFORE using it in state initialisers
  const hasData = data && data.length > 0;
  const emptyStateData = [
    { subject: 'No Data', observations: 0, averageScore: 0, outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0, teachers: 0, colour: '#e5e7eb' }
  ];
  const displayData = hasData ? data : emptyStateData;

  const [chartType, setChartType] = useState<'pie' | 'bar'>(showAsBar ? 'bar' : 'pie');
  const [visibleSubjects, setVisibleSubjects] = useState<Record<string, boolean>>(
    displayData.reduce((acc, item) => ({ ...acc, [item.subject]: true }), {})
  );
  const [sortBy, setSortBy] = useState<'observations' | 'averageScore' | 'teachers'>('observations');

  // Enhanced colour palette for subjects
  const subjectColours = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a855f7', // Violet
    '#22c55e', // Green-500
    '#eab308', // Yellow
    '#dc2626', // Red-600
    '#0ea5e9', // Sky
    '#7c3aed', // Violet-600
    '#059669', // Emerald-600
    '#d97706', // Amber-600
    '#be185d'  // Pink-600
  ];

  // Assign colours to subjects
  const dataWithColours = displayData.map((item, index) => ({
    ...item,
    colour: item.colour || subjectColours[index % subjectColours.length]
  }));

  // Filter visible data
  const visibleData = dataWithColours.filter(item => visibleSubjects[item.subject]);

  // Sort data
  const sortedData = [...visibleData].sort((a, b) => {
    switch (sortBy) {
      case 'observations':
        return b.observations - a.observations;
      case 'averageScore':
        return b.averageScore - a.averageScore;
      case 'teachers':
        return b.teachers - a.teachers;
      default:
        return b.observations - a.observations;
    }
  });

  // Toggle subject visibility
  const toggleSubject = (subject: string) => {
    setVisibleSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // Custom tooltip for pie chart
  interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        subject: string;
        observations: number;
        averageScore: number;
        teachers: number;
        outstanding: number;
        good: number;
        requiresImprovement: number;
        inadequate: number;
        colour: string;
      };
    }>;
  }

  const PieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = visibleData.reduce((sum, item) => sum + item.observations, 0);
      const percentage = ((data.observations / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.colour }}
            />
            <span className="font-semibold text-gray-900">{data.subject}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Observations:</span>
              <span className="font-medium">{data.observations}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Average Score:</span>
              <span className="font-medium">{data.averageScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Teachers:</span>
              <span className="font-medium">{data.teachers}</span>
            </div>
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

  // Custom label for pie chart
  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) => {
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
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Export data
  const handleExport = () => {
    const dataToExport = hasData ? visibleData : emptyStateData;
    const csvContent = [
      ['Subject', 'Observations', 'Average Score', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Teachers'].join(','),
      ...dataToExport.map(item => [
        hasData ? item.subject : 'No Data Available',
        hasData ? item.observations : 0,
        hasData ? item.averageScore.toFixed(2) : '0.00',
        hasData ? item.outstanding : 0,
        hasData ? item.good : 0,
        hasData ? item.requiresImprovement : 0,
        hasData ? item.inadequate : 0,
        hasData ? item.teachers : 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subject-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Note: hasData, emptyStateData and displayData are computed above

  const totalObservations = visibleData.reduce((sum, item) => sum + item.observations, 0);
  const averageScore = hasData && totalObservations > 0 
    ? visibleData.reduce((sum, item) => sum + (item.averageScore * item.observations), 0) / totalObservations 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Observations by Subject
              </CardTitle>
              <CardDescription>
                Distribution of observations across different subjects. Click legend items to toggle visibility.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  Pie
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
              </div>
              
              {chartType === 'bar' && (
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'observations' | 'averageScore' | 'teachers')}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="observations">Sort by Observations</option>
                  <option value="averageScore">Sort by Average Score</option>
                  <option value="teachers">Sort by Teachers</option>
                </select>
              )}
              
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
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Total Observations</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasData ? totalObservations.toLocaleString() : '0'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Average Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasData ? averageScore.toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Subjects</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasData ? visibleData.length : '0'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Teachers</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasData ? visibleData.reduce((sum, item) => sum + item.teachers, 0) : '0'}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {dataWithColours.map((item) => {
              const isVisible = visibleSubjects[item.subject];
              
              return (
                <button
                  key={item.subject}
                  onClick={() => toggleSubject(item.subject)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
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
                  <span className="text-sm font-medium">{item.subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.observations}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div className="h-96 relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg z-10">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No subject data available for the selected filters</p>
                  <p className="text-sm mt-1">Try adjusting your filter criteria or date range</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="observations"
                  >
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              ) : (
                <BarChart
                  data={sortedData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="subject" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <YAxis 
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return <PieTooltip active={active} payload={[{ payload: data }]} />;
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="observations" name="Observations">
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Top Performing Subjects */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Subjects</h4>
            <div className="space-y-2">
              {hasData ? (
                visibleData
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.subject} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          #{index + 1}
                        </Badge>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.colour }}
                        />
                        <span className="font-medium text-gray-900">{item.subject}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-700">{item.averageScore.toFixed(2)}</div>
                        <div className="text-xs text-green-600">{item.observations} observations</div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">No subject performance data available to analyse rankings</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubjectDistributionChart;