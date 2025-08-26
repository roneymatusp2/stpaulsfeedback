import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CalendarIcon,
  ChevronDown,
  Filter,
  X,
  RefreshCw,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Import API functions (to be created)
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

interface FilterOptions {
  subjects: Array<{ id: string; name: string }>;
  keyStages: Array<{ id: string; name: string }>;
  observationTypes: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string; department?: string }>;
  departments: Array<{ id: string; name: string }>;
}

interface AdvancedFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onFiltersChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<FilterOptions>({
    subjects: [],
    keyStages: [],
    observationTypes: [],
    staff: [],
    departments: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        // Handle empty data gracefully - provide empty arrays as fallback
        try {
          const filterOptions = await analyticsApi.getFilterOptions();
          setOptions(filterOptions);
        } catch (error) {
          // Set empty options if API fails or returns no data
          setOptions({
            subjects: [],
            keyStages: [],
            observationTypes: [],
            staff: [],
            departments: []
          });
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Ensure we always have valid empty arrays
        setOptions({
          subjects: [],
          keyStages: [],
          observationTypes: [],
          staff: [],
          departments: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Quick filter presets
  const quickFilters = [
    {
      label: 'Last 30 Days',
      action: () => {
        const from = new Date();
        from.setDate(from.getDate() - 30);
        updateFilters({ dateRange: { from, to: new Date() } });
      }
    },
    {
      label: 'Last 3 Months',
      action: () => {
        const from = new Date();
        from.setMonth(from.getMonth() - 3);
        updateFilters({ dateRange: { from, to: new Date() } });
      }
    },
    {
      label: 'This Academic Year',
      action: () => {
        const now = new Date();
        const academicYearStart = new Date(now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1, 8, 1);
        updateFilters({ dateRange: { from: academicYearStart, to: new Date() } });
      }
    },
    {
      label: 'This Term',
      action: () => {
        const now = new Date();
        const month = now.getMonth();
        let termStart: Date;
        
        if (month >= 8 && month <= 11) { // Autumn term
          termStart = new Date(now.getFullYear(), 8, 1);
        } else if (month >= 0 && month <= 3) { // Spring term
          termStart = new Date(now.getFullYear(), 0, 1);
        } else { // Summer term
          termStart = new Date(now.getFullYear(), 3, 1);
        }
        
        updateFilters({ dateRange: { from: termStart, to: new Date() } });
      }
    }
  ];

  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      subjects: [],
      keyStages: [],
      observationTypes: [],
      staff: [],
      departments: []
    });
  };

  const toggleArrayFilter = (key: keyof AnalyticsFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.subjects.length > 0) count++;
    if (filters.keyStages.length > 0) count++;
    if (filters.observationTypes.length > 0) count++;
    if (filters.staff.length > 0) count++;
    if (filters.departments.length > 0) count++;
    return count;
  };

  const filteredStaff = options.staff.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((quickFilter, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={quickFilter.action}
            className="flex items-center gap-2"
          >
            <Clock className="h-3 w-3" />
            {quickFilter.label}
          </Button>
        ))}
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-3 w-3" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
        </Button>
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {/* Date Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "dd/MM/yyyy")
                        ) : (
                          "From date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, from: date || null } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "dd/MM/yyyy")
                        ) : (
                          "To date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, to: date || null } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Subjects ({filters.subjects.length} selected)
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                  {options.subjects.length > 0 ? (
                    options.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject.id}`}
                          checked={filters.subjects.includes(subject.id)}
                          onCheckedChange={() => toggleArrayFilter('subjects', subject.id)}
                        />
                        <Label
                          htmlFor={`subject-${subject.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {subject.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                       No subjects available
                     </div>
                  )}
                </div>
              </div>

              {/* Key Stages */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  Key Stages ({filters.keyStages.length} selected)
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                  {options.keyStages.length > 0 ? (
                    options.keyStages.map((keyStage) => (
                      <div key={keyStage.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`keystage-${keyStage.id}`}
                          checked={filters.keyStages.includes(keyStage.id)}
                          onCheckedChange={() => toggleArrayFilter('keyStages', keyStage.id)}
                        />
                        <Label
                          htmlFor={`keystage-${keyStage.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {keyStage.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                       No key stages available
                     </div>
                  )}
                </div>
              </div>

              {/* Observation Types */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4" />
                  Observation Types ({filters.observationTypes.length} selected)
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                  {options.observationTypes.length > 0 ? (
                    options.observationTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.id}`}
                          checked={filters.observationTypes.includes(type.id)}
                          onCheckedChange={() => toggleArrayFilter('observationTypes', type.id)}
                        />
                        <Label
                          htmlFor={`type-${type.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                       No observation types available
                     </div>
                  )}
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  Departments ({filters.departments.length} selected)
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                  {options.departments.length > 0 ? (
                    options.departments.map((department) => (
                      <div key={department.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${department.id}`}
                          checked={filters.departments.includes(department.id)}
                          onCheckedChange={() => toggleArrayFilter('departments', department.id)}
                        />
                        <Label
                          htmlFor={`dept-${department.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {department.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                       No departments available
                     </div>
                  )}
                </div>
              </div>

              {/* Staff */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Staff Members ({filters.staff.length} selected)
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                    {filteredStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`staff-${staff.id}`}
                          checked={filters.staff.includes(staff.id)}
                          onCheckedChange={() => toggleArrayFilter('staff', staff.id)}
                        />
                        <Label
                          htmlFor={`staff-${staff.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div>
                            <div>{staff.name}</div>
                            {staff.department && (
                              <div className="text-xs text-muted-foreground">{staff.department}</div>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                    {filteredStaff.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                         {options.staff.length === 0 ? 'No staff members available' : 'No staff members found matching search criteria'}
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.dateRange.from && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {format(filters.dateRange.from, "dd/MM/yyyy")}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: { ...filters.dateRange, from: null } })}
              />
            </Badge>
          )}
          {filters.dateRange.to && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {format(filters.dateRange.to, "dd/MM/yyyy")}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: { ...filters.dateRange, to: null } })}
              />
            </Badge>
          )}
          {filters.subjects.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.subjects.length} Subject{filters.subjects.length !== 1 ? 's' : ''}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ subjects: [] })}
              />
            </Badge>
          )}
          {filters.keyStages.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.keyStages.length} Key Stage{filters.keyStages.length !== 1 ? 's' : ''}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ keyStages: [] })}
              />
            </Badge>
          )}
          {filters.observationTypes.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.observationTypes.length} Type{filters.observationTypes.length !== 1 ? 's' : ''}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ observationTypes: [] })}
              />
            </Badge>
          )}
          {filters.staff.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.staff.length} Staff Member{filters.staff.length !== 1 ? 's' : ''}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ staff: [] })}
              />
            </Badge>
          )}
          {filters.departments.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.departments.length} Department{filters.departments.length !== 1 ? 's' : ''}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ departments: [] })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;