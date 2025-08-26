import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Download,
  Search,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Target,
  Eye,
  Filter,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StaffMember {
  id: string;
  name: string;
  department: string;
  subject: string;
  keyStage: string;
  totalObservations: number;
  averageScore: number;
  lastObservationDate: string;
  daysSinceLastObservation: number;
  outstanding: number;
  good: number;
  requiresImprovement: number;
  inadequate: number;
  trend: 'up' | 'down' | 'stable';
  previousScore?: number;
  observedBy: string[];
  needsDevelopment: boolean;
  immediateConcern: boolean;
}

interface Observer {
  name: string;
  observationsCount: number;
  averageScore: number;
  departments: string[];
}

interface StaffAnalysisTablesProps {
  staffData: StaffMember[];
  observerData: Observer[];
}

type SortField = 'name' | 'department' | 'totalObservations' | 'averageScore' | 'daysSinceLastObservation';
type SortOrder = 'asc' | 'desc';

const StaffAnalysisTables: React.FC<StaffAnalysisTablesProps> = ({ staffData, observerData }) => {
  const [activeTab, setActiveTab] = useState<'frequency' | 'observers' | 'development'>('frequency');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalObservations');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Check if we have data
  const hasData = staffData && staffData.length > 0;
  
  // Get unique departments
  const departments = hasData ? Array.from(new Set(staffData.map(staff => staff.department))).sort() : [];

  // Filter and sort staff data
  const filteredStaffData = hasData ? staffData
    .filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof StaffMember];
      const bValue = b[sortField as keyof StaffMember];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    }) : [];

  // Staff needing development or with immediate concerns
  const developmentStaff = hasData ? staffData.filter(staff => 
    staff.averageScore < 2.5 || staff.daysSinceLastObservation > 90
  ).map(staff => ({
    ...staff,
    immediateConcern: staff.averageScore < 2.0,
    needsDevelopment: staff.averageScore < 2.5 && staff.averageScore >= 2.0
  })) : [];
  
  // Staff not observed for 3+ months
  const notObservedRecently = hasData ? staffData.filter(staff => staff.daysSinceLastObservation >= 90) : [];

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export functions
  const exportFrequencyData = () => {
    const dataToExport = hasData ? filteredStaffData : [{
      name: 'No data available',
      department: 'N/A',
      subject: 'N/A',
      keyStage: 'N/A',
      totalObservations: 0,
      averageScore: 0,
      lastObservationDate: 'N/A',
      daysSinceLastObservation: 0,
      outstanding: 0,
      good: 0,
      requiresImprovement: 0,
      inadequate: 0,
      observedBy: ['N/A']
    }];
    
    const csvContent = [
      ['Name', 'Department', 'Subject', 'Key Stage', 'Total Observations', 'Average Score', 'Last Observation', 'Days Since Last', 'Outstanding', 'Good', 'Requires Improvement', 'Inadequate', 'Observed By'].join(','),
      ...dataToExport.map(staff => [
        staff.name,
        staff.department,
        staff.subject,
        staff.keyStage,
        staff.totalObservations,
        hasData ? staff.averageScore.toFixed(2) : '0.00',
        hasData ? staff.lastObservationDate : 'N/A',
        staff.daysSinceLastObservation,
        staff.outstanding,
        staff.good,
        staff.requiresImprovement,
        staff.inadequate,
        Array.isArray(staff.observedBy) ? staff.observedBy.join('; ') : staff.observedBy
      ].join(','))
    ].join('\n');
    
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `staff-observation-frequency-${today}.csv`);
  };

  const exportObserverData = () => {
    const dataToExport = observerData && observerData.length > 0 ? observerData : [{
      name: 'No data available',
      observationsCount: 0,
      averageScore: 0,
      departments: ['N/A']
    }];
    
    const csvContent = [
      ['Observer Name', 'Observations Count', 'Average Score', 'Departments'].join(','),
      ...dataToExport.map(observer => [
        observer.name,
        observer.observationsCount,
        observer.averageScore.toFixed(2),
        observer.departments.join('; ')
      ].join(','))
    ].join('\n');
    
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `observer-statistics-${today}.csv`);
  };

  const exportDevelopmentData = () => {
    const dataToExport = developmentStaff.length > 0 ? developmentStaff : [{
      name: 'No data available',
      department: 'N/A',
      subject: 'N/A',
      immediateConcern: false,
      averageScore: 0,
      totalObservations: 0,
      daysSinceLastObservation: 0
    }];
    
    const csvContent = [
      ['Name', 'Department', 'Subject', 'Issue Type', 'Average Score', 'Total Observations', 'Days Since Last Observation'].join(','),
      ...dataToExport.map(staff => [
        staff.name,
        staff.department,
        staff.subject,
        staff.immediateConcern ? 'Immediate Concern' : 'Development Needed',
        staff.averageScore.toFixed(2),
        staff.totalObservations,
        staff.daysSinceLastObservation
      ].join(','))
    ].join('\n');
    
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `staff-development-needs-${today}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getScoreBadgeColour = (score: number) => {
    if (score >= 3.5) return 'bg-green-100 text-green-800';
    if (score >= 2.5) return 'bg-blue-100 text-blue-800';
    if (score >= 1.5) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Analysis Tables
              </CardTitle>
              <CardDescription>
                Detailed analysis of staff observation patterns, frequency, and development needs.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'frequency'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Staff Frequency ({filteredStaffData.length})
            </button>
            <button
              onClick={() => setActiveTab('observers')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'observers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Observers ({observerData.length})
            </button>
            <button
              onClick={() => setActiveTab('development')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'development'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              Development Needs ({developmentStaff.length})
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search staff by name, department, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {activeTab === 'frequency' && (
              <>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <Button variant="outline" size="sm" onClick={exportFrequencyData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            
            {activeTab === 'observers' && (
              <Button variant="outline" size="sm" onClick={exportObserverData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            
            {activeTab === 'development' && (
              <Button variant="outline" size="sm" onClick={exportDevelopmentData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Staff Frequency Table */}
          {activeTab === 'frequency' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Staff Member
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center gap-2">
                        Department
                        <SortIcon field="department" />
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('totalObservations')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Observations
                        <SortIcon field="totalObservations" />
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('averageScore')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Avg Score
                        <SortIcon field="averageScore" />
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('daysSinceLastObservation')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Last Observed
                        <SortIcon field="daysSinceLastObservation" />
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Grade Breakdown</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Trend</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Observed By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffData.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500">{staff.subject} • {staff.keyStage}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{staff.department}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{staff.totalObservations}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getScoreBadgeColour(staff.averageScore)}>
                          {staff.averageScore.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">
                          <div>{new Date(staff.lastObservationDate).toLocaleDateString('en-GB')}</div>
                          <div className={`text-xs ${
                            staff.daysSinceLastObservation > 90 ? 'text-red-600' :
                            staff.daysSinceLastObservation > 60 ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            {staff.daysSinceLastObservation} days ago
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-1">
                          {staff.outstanding > 0 && (
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger>
                                  <div className="w-6 h-6 bg-green-500 text-white text-xs rounded flex items-center justify-center">
                                    {staff.outstanding}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Outstanding observations</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          )}
                          {staff.good > 0 && (
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger>
                                  <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded flex items-center justify-center">
                                    {staff.good}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Good observations</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          )}
                          {staff.requiresImprovement > 0 && (
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger>
                                  <div className="w-6 h-6 bg-amber-500 text-white text-xs rounded flex items-center justify-center">
                                    {staff.requiresImprovement}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Requires improvement</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          )}
                          {staff.inadequate > 0 && (
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger>
                                  <div className="w-6 h-6 bg-red-500 text-white text-xs rounded flex items-center justify-center">
                                    {staff.inadequate}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Inadequate observations</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(staff.trend)}
                          {staff.previousScore && (
                            <span className="text-xs text-gray-500">
                              {staff.previousScore.toFixed(2)} → {staff.averageScore.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.observedBy.slice(0, 2).map((observer, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {observer}
                            </Badge>
                          ))}
                          {staff.observedBy.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{staff.observedBy.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStaffData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{hasData ? 'No staff members found matching your criteria.' : 'No staff data available for the selected filters.'}</p>
                  {!hasData && <p className="text-sm mt-1">Staff observation data will appear here once observations are recorded.</p>}
                </div>
              )}
            </div>
          )}

          {/* Observer Statistics Table */}
          {activeTab === 'observers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Observer</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Observations</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Average Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Departments</th>
                  </tr>
                </thead>
                <tbody>
                  {observerData && observerData.length > 0 ? (
                    observerData
                      .filter(observer => observer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => b.observationsCount - a.observationsCount)
                      .map((observer, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{observer.name}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary">{observer.observationsCount}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={getScoreBadgeColour(observer.averageScore)}>
                              {observer.averageScore.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {observer.departments.map((dept, deptIndex) => (
                                <Badge key={deptIndex} variant="outline" className="text-xs">
                                  {dept}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No observer data available for the selected filters.</p>
                        <p className="text-sm mt-1">Observer statistics will appear here once observations are recorded.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Development Needs Table */}
          {activeTab === 'development' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Immediate Concern</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {hasData ? developmentStaff.filter(s => s.immediateConcern).length : 0}
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-900">Development Needed</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-700">
                    {hasData ? developmentStaff.filter(s => s.needsDevelopment && !s.immediateConcern).length : 0}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Not Observed (3+ months)</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {hasData ? notObservedRecently.length : 0}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Staff Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Issue Type</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Average Score</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Observations</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Last Observed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developmentStaff
                      .filter(staff => 
                        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        staff.department.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => {
                        // Sort by severity: immediate concern first, then by score
                        if (a.immediateConcern && !b.immediateConcern) return -1;
                        if (!a.immediateConcern && b.immediateConcern) return 1;
                        return a.averageScore - b.averageScore;
                      })
                      .map((staff) => (
                        <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{staff.name}</div>
                              <div className="text-xs text-gray-500">{staff.subject} • {staff.keyStage}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{staff.department}</td>
                          <td className="py-3 px-4 text-center">
                            {staff.immediateConcern ? (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Immediate Concern
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800">
                                <Target className="h-3 w-3 mr-1" />
                                Development Needed
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={getScoreBadgeColour(staff.averageScore)}>
                              {staff.averageScore.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary">{staff.totalObservations}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="text-sm">
                              <div>{new Date(staff.lastObservationDate).toLocaleDateString('en-GB')}</div>
                              <div className={`text-xs ${
                                staff.daysSinceLastObservation > 90 ? 'text-red-600' :
                                staff.daysSinceLastObservation > 60 ? 'text-amber-600' : 'text-gray-500'
                              }`}>
                                {staff.daysSinceLastObservation} days ago
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {developmentStaff.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No staff members currently need development support.</p>
                    <p className="text-sm mt-1">Excellent work by the team!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StaffAnalysisTables;