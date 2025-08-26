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
  BarChart3,
  Download,
  Eye,
  EyeOff,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CriteriaData {
  criteria: string;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  total: number;
  average: number;
  trend?: number; // Percentage change from previous period
}

interface CriteriaBreakdownChartProps {
  data: CriteriaData[];
}

const CriteriaBreakdownChart: React.FC<CriteriaBreakdownChartProps> = ({ data }) => {
  const [visibleSeries, setVisibleSeries] = useState({
    outstanding: true,
    good: true,
    requiresImprovement: true,
    inadequate: true
  });
  const [sortBy, setSortBy] = useState<'criteria' | 'total' | 'average'>('total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Colour scheme for different performance levels
  const colours = {
    outstanding: '#10b981', // Green
    good: '#3b82f6', // Blue
    requiresImprovement: '#f59e0b', // Amber
    inadequate: '#ef4444' // Red
  };

  // Sort data based on selected criteria
  const sortedData = [...data].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'criteria':
        return sortOrder === 'asc' 
          ? a.criteria.localeCompare(b.criteria)
          : b.criteria.localeCompare(a.criteria);
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'average':
        aValue = a.average;
        bValue = b.average;
        break;
      default:
        aValue = a.total;
        bValue = b.total;
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Toggle series visibility
  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
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
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {entry.dataKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{entry.value}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((entry.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Observations:</span>
            <span className="font-semibold">{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Export chart data
  const handleExport = () => {
    const exportData = hasData ? data : emptyStateData;
    const csvContent = [
      ['Criteria', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Total', 'Average', 'Trend (%)'].join(','),
      ...exportData.map(item => [
        item.criteria,
        item.outstanding,
        item.good,
        item.requiresImprovement,
        item.inadequate,
        item.total,
        item.average.toFixed(2),
        (item.trend ?? 0).toFixed(1)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'criteria-breakdown.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle empty data gracefully
  const hasData = data && data.length > 0;
  const displayData = hasData ? sortedData : [];
  
  // Create empty state data for chart structure
  const emptyStateData = [
    { criteria: 'Teaching Quality', outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0, total: 0, average: 0, trend: 0 },
    { criteria: 'Learning Outcomes', outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0, total: 0, average: 0, trend: 0 },
    { criteria: 'Behaviour Management', outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0, total: 0, average: 0, trend: 0 }
  ];
  
  const chartData = hasData ? displayData : emptyStateData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Criteria Marks Breakdown
              </CardTitle>
              <CardDescription>
                Distribution of observation marks across teaching criteria. Click legend items to toggle visibility.
                {!hasData && " (No data available for selected criteria)"}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium">Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'total' | 'average' | 'criteria')}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="total">Total Observations</option>
                  <option value="average">Average Score</option>
                  <option value="criteria">Criteria Name</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            {Object.entries(colours).map(([key, colour]) => {
              const isVisible = visibleSeries[key as keyof typeof visibleSeries];
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              return (
                <button
                  key={key}
                  onClick={() => toggleSeries(key as keyof typeof visibleSeries)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
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

          {/* Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60
                }}
              >
                {!hasData && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">
                    No data available for the selected criteria
                  </text>
                )}
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="criteria" 
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
                <Tooltip content={<CustomTooltip />} />
                
                {visibleSeries.outstanding && (
                  <Bar 
                    dataKey="outstanding" 
                    stackId="a" 
                    fill={colours.outstanding}
                    name="Outstanding"
                  />
                )}
                {visibleSeries.good && (
                  <Bar 
                    dataKey="good" 
                    stackId="a" 
                    fill={colours.good}
                    name="Good"
                  />
                )}
                {visibleSeries.requiresImprovement && (
                  <Bar 
                    dataKey="requiresImprovement" 
                    stackId="a" 
                    fill={colours.requiresImprovement}
                    name="Requires Improvement"
                  />
                )}
                {visibleSeries.inadequate && (
                  <Bar 
                    dataKey="inadequate" 
                    stackId="a" 
                    fill={colours.inadequate}
                    name="Inadequate"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Observations</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total number of observations across all criteria</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? data.reduce((sum, item) => sum + item.total, 0).toLocaleString() : '0'}
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
                      <p>Mean score across all criteria (1-4 scale)</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? (data.reduce((sum, item) => sum + item.average, 0) / data.length).toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Criteria Analysed</span>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of different teaching criteria with observations</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {hasData ? data.length : '0'}
              </div>
            </div>
          </div>

          {/* Top Performing Criteria */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Criteria</h4>
            <div className="space-y-2">
              {hasData ? (
                data
                  .sort((a, b) => b.average - a.average)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.criteria} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium text-gray-900">{item.criteria}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-700">{item.average.toFixed(2)}</div>
                        <div className="text-xs text-green-600">{item.total} observations</div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No criteria data available to analyse performance rankings.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CriteriaBreakdownChart;