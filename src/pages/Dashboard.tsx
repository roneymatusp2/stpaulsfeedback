import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teachersApi, observationTypesApi, keyStagesApi, subjectsApi, type Teacher, type ObservationType, type KeyStage, type Subject } from "@/lib/supabase";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Eye, Users, LayoutDashboard, Search, X, Clock, User, BookOpen, GraduationCap, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import stPaulsLogo from "@/assets/st-pauls-logo.png";
import MrBishopFab from "@/components/teacher/MrBishopFab";

// Data will be loaded from Supabase

const Dashboard = () => {
  const navigate = useNavigate();
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [date, setDate] = useState<Date>();
  const [additionalObservers, setAdditionalObservers] = useState<string[]>([]);
  const [selectedObservationType, setSelectedObservationType] = useState("");
  const [selectedObservee, setSelectedObservee] = useState("");
  const [showSelfAssessmentOptions, setShowSelfAssessmentOptions] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [observationTypes, setObservationTypes] = useState<ObservationType[]>([]);
  const [keyStages, setKeyStages] = useState<KeyStage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Teacher search states
  const [teacherSearch, setTeacherSearch] = useState("");
  const [additionalObserverSearches, setAdditionalObserverSearches] = useState<string[]>([]);
  
  // Self-assessment form state
  const [selectedKeyStage, setSelectedKeyStage] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Learning Walk specific states
  const [showLearningWalkOptions, setShowLearningWalkOptions] = useState(false);
  const [selectedLearningAspect, setSelectedLearningAspect] = useState<string>("");
  
  // Learning Walk aspects configuration
  const learningWalkAspects = [
    "Subject knowledge and subject pedagogies",
    "Quality of instruction",
    "Assessment for learning",
    "Behaviour for learning and student attitude",
    "Progress for all students",
    "Literacy and Oracy",
    "General",
    "Metacognition and self-regulation",
    "Deep Learning"
  ];
  
  // Auto-fill configuration for different observation types
  const observationTypeConfigs = {
    "Senior School Self Assessment": {
      hideSubject: true,
      autoFillTeacher: true,
      defaultAssessmentType: "self-assessment",
      requiredFields: ["observationType", "observee", "date"]
    },
    "Senior School Learning Observation": {
      hideSubject: false,
      autoFillTeacher: false,
      defaultAssessmentType: "peer-observation",
      requiredFields: ["observationType", "observee", "subject", "keyStage", "date"]
    },
    "Senior School Learning Walk": {
      hideSubject: false,
      autoFillTeacher: false,
      defaultAssessmentType: "learning-walk",
      requiredFields: ["observationType", "observee", "subject", "keyStage", "date"]
    },
    "Senior School Support Plan": {
      hideSubject: false,
      autoFillTeacher: false,
      defaultAssessmentType: "support-plan",
      requiredFields: ["observationType", "observee", "subject", "keyStage", "date"]
    },
    "Senior School Peer Observation Reflection": {
      hideSubject: false,
      autoFillTeacher: false,
      defaultAssessmentType: "peer-reflection",
      requiredFields: ["observationType", "observee", "subject", "keyStage", "date"]
    }
  };
  
  // Current user - should match the header information
  const currentUser = "Roney Nascimento";

  // Auto-fill handler for observation type selection
  const handleObservationTypeChange = (value: string) => {
    setSelectedObservationType(value);
    const config = observationTypeConfigs[value as keyof typeof observationTypeConfigs];
    
    if (config) {
      // Auto-fill teacher for self-assessment
      if (config.autoFillTeacher) {
        setSelectedObservee(currentUser);
      }
      
      // Clear subject if not needed for this observation type
      if (config.hideSubject) {
        setSelectedSubject("");
      }
      
      // Set default date to today if not already set
      if (!date) {
        setDate(new Date());
      }
      
      // For Senior School Self Assessment, automatically show the configuration section
      if (value === "Senior School Self Assessment") {
        setShowSelfAssessmentOptions(true);
      } else if (value === "Senior School Learning Walk") {
        setShowLearningWalkOptions(true);
      }
    }
    
    // Clear any existing form errors
    setFormErrors({});
  };
  
  // Validation functions
  const validateSelfAssessmentForm = () => {
    const errors: {[key: string]: string} = {};
    const config = observationTypeConfigs[selectedObservationType as keyof typeof observationTypeConfigs];
    
    if (!selectedObservationType) {
      errors.observationType = "Please select an observation type";
    }
    
    if (!selectedObservee) {
      errors.observee = "Please select a teacher";
    }
    
    // Only validate key stage if it's required for this observation type (not for Senior School Self Assessment)
    if (selectedObservationType !== "Senior School Self Assessment" && !selectedKeyStage) {
      errors.keyStage = "Please select a key stage";
    }
    
    // Only validate subject if it's required for this observation type
    if (config && !config.hideSubject && !selectedSubject) {
      errors.subject = "Please select a subject";
    }
    
    if (!date) {
      errors.date = "Please select a date";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLearningWalkForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedObservationType) {
      errors.observationType = "Please select an observation type";
    }
    
    if (!selectedObservee) {
      errors.observee = "Please select a teacher";
    }
    
    if (!selectedLearningAspect) {
      errors.learningAspect = "Please select a learning aspect";
    }
    
    if (!selectedSubject) {
      errors.subject = "Please select a subject";
    }
    
    if (!selectedKeyStage) {
      errors.keyStage = "Please select a key stage";
    }
    
    if (!date) {
      errors.date = "Please select a date";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmSelfAssessment = () => {
    if (validateSelfAssessmentForm()) {
      try {
        // Store the self-assessment configuration in localStorage for the SelfAssessment page
        const selfAssessmentConfig = {
          observationType: selectedObservationType,
          teacher: selectedObservee,
          keyStage: selectedKeyStage,
          subject: selectedSubject,
          date: date?.toISOString(),
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('selfAssessmentConfig', JSON.stringify(selfAssessmentConfig));
        
        toast.success('Self-assessment configuration saved successfully!');
        
        // Navigate to the self-assessment page
        navigate('/dashboard/self-assessment');
      } catch (error) {
        console.error('Error saving self-assessment configuration:', error);
        toast.error('Failed to save configuration. Please try again.');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleConfirmLearningWalk = () => {
    if (validateLearningWalkForm()) {
      try {
        // Store the learning walk configuration in localStorage for the observation creation
        const learningWalkConfig = {
          observationType: selectedObservationType,
          teacher: selectedObservee,
          learningAspect: selectedLearningAspect,
          subject: selectedSubject,
          keyStage: selectedKeyStage,
          date: date?.toISOString(),
          additionalObservers: additionalObservers.filter(obs => obs.trim() !== ""),
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('learningWalkConfig', JSON.stringify(learningWalkConfig));
        
        toast.success('Learning Walk configuration saved successfully!');
        
        // For now, we'll navigate to observations page - later this can be a dedicated Learning Walk page
        navigate('/dashboard/observations');
      } catch (error) {
        console.error('Error saving learning walk configuration:', error);
        toast.error('Failed to save configuration. Please try again.');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersList, observationTypesList, keyStagesList, subjectsList] = await Promise.all([
          teachersApi.getAll(),
          observationTypesApi.getAll(),
          keyStagesApi.getAll(),
          subjectsApi.getAll()
        ]);
        
        setTeachers(teachersList);
        setObservationTypes(observationTypesList);
        setKeyStages(keyStagesList);
        setSubjects(subjectsList);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addObserver = () => {
    setAdditionalObservers([...additionalObservers, ""]);
    setAdditionalObserverSearches([...additionalObserverSearches, ""]);
  };

  const removeObserver = (index: number) => {
    setAdditionalObservers(additionalObservers.filter((_, i) => i !== index));
    setAdditionalObserverSearches(additionalObserverSearches.filter((_, i) => i !== index));
  };
  
  // Filter teachers based on search
  const getFilteredTeachers = (searchTerm: string) => {
    if (!searchTerm.trim()) return teachers;
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const updateAdditionalObserverSearch = (index: number, value: string) => {
    const newSearches = [...additionalObserverSearches];
    newSearches[index] = value;
    setAdditionalObserverSearches(newSearches);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading dashboard data...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-8 space-y-8 relative overflow-hidden">
            {/* Modern background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              {/* Modern Header */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Welcome back, {currentUser?.name?.split(' ')[0] || 'Teacher'}
                    </h1>
                    <p className="text-slate-600 text-lg">Ready to make an impact on teaching excellence?</p>
                  </div>
                </div>
              </div>
              
              {/* Modern Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Card 1: Create a new observation */}
                <div 
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-500" 
                  onClick={() => setIsFormExpanded(true)}
                >
                  <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white transition-all duration-500">
                    <CardContent className="p-8 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <div className="relative z-10">
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Create New Observation</h3>
                        <p className="text-white/80 text-sm">Start a peer observation session</p>
                        <div className="mt-4 flex items-center text-white/60">
                          <div className="h-1 w-12 bg-white/30 rounded-full group-hover:w-16 transition-all duration-300"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Card 2: Observations made about you */}
                <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500">
                  <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition-all duration-500">
                    <CardContent className="p-8 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <div className="relative z-10">
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Your Feedback</h3>
                        <p className="text-white/80 text-sm">View observations made about you</p>
                        <div className="mt-4 flex items-center text-white/60">
                          <div className="h-1 w-12 bg-white/30 rounded-full group-hover:w-16 transition-all duration-300"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Card 3: Observations created by you */}
                <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500">
                  <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white transition-all duration-500">
                    <CardContent className="p-8 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <div className="relative z-10">
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Your Observations</h3>
                        <p className="text-white/80 text-sm">Manage observations you've created</p>
                        <div className="mt-4 flex items-center text-white/60">
                          <div className="h-1 w-12 bg-white/30 rounded-full group-hover:w-16 transition-all duration-300"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Modern Form Card */}
              {isFormExpanded && (
                <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                      </div>
                      Create New Observation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <Button 
                        onClick={addObserver}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Additional Observers
                      </Button>
                      
                      {/* Additional Observers */}
                      {additionalObservers.map((observer, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                              {/* Enhanced Observer Search with Combobox */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !observer && "text-muted-foreground"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Search className="h-4 w-4 text-slate-400" />
                                      <span className="truncate">
                                        {observer || "Type or select an observer..."}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {observer && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newObservers = [...additionalObservers];
                                            newObservers[index] = "";
                                            setAdditionalObservers(newObservers);
                                            updateAdditionalObserverSearch(index, "");
                                          }}
                                          className="h-4 w-4 text-slate-400 hover:text-slate-600"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                      <svg
                                        className="h-4 w-4 shrink-0 opacity-50"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="m6 9 6 6 6-6" />
                                      </svg>
                                    </div>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <div className="border-b p-2">
                                    <div className="relative">
                                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                      <input
                                        type="text"
                                        placeholder="Search observers..."
                                        value={additionalObserverSearches[index] || ""}
                                        onChange={(e) => updateAdditionalObserverSearch(index, e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {getFilteredTeachers(additionalObserverSearches[index] || "").length > 0 ? (
                                      getFilteredTeachers(additionalObserverSearches[index] || "").map((teacher) => (
                                        <button
                                          key={teacher.id}
                                          onClick={() => {
                                            const newObservers = [...additionalObservers];
                                            newObservers[index] = teacher.name;
                                            setAdditionalObservers(newObservers);
                                            updateAdditionalObserverSearch(index, teacher.name);
                                          }}
                                          className={cn(
                                            "w-full px-3 py-2 text-left text-sm hover:bg-slate-100 flex items-center justify-between",
                                            observer === teacher.name && "bg-blue-50 text-blue-600"
                                          )}
                                        >
                                          <span>{teacher.name}</span>
                                          {observer === teacher.name && (
                                            <svg
                                              className="h-4 w-4"
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <polyline points="20,6 9,17 4,12" />
                                            </svg>
                                          )}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-slate-500">
                                        {additionalObserverSearches[index] ? "No teacher found" : "Start typing to search..."}
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeObserver(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Observation Type
                          </label>
                          <Select value={selectedObservationType} onValueChange={handleObservationTypeChange}>
                            <SelectTrigger className={formErrors.observationType ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select Observation Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {observationTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.observationType && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.observationType}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Who are you observing?
                          </label>
                          
                          {/* Enhanced Teacher Search with Combobox */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !selectedObservee && "text-muted-foreground",
                                  formErrors.observee && "border-red-500"
                                )}
                                disabled={selectedObservationType === "Senior School Self Assessment"}
                              >
                                <div className="flex items-center gap-2">
                                  <Search className="h-4 w-4 text-slate-400" />
                                  <span className="truncate">
                                    {selectedObservee || "Type or select a teacher..."}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {selectedObservee && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedObservee("");
                                        setTeacherSearch("");
                                      }}
                                      className="h-4 w-4 text-slate-400 hover:text-slate-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                  <svg
                                    className="h-4 w-4 shrink-0 opacity-50"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <div className="border-b p-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                  <input
                                    type="text"
                                    placeholder="Search teachers..."
                                    value={teacherSearch}
                                    onChange={(e) => setTeacherSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {getFilteredTeachers(teacherSearch).length > 0 ? (
                                  getFilteredTeachers(teacherSearch).map((teacher) => (
                                    <button
                                      key={teacher.id}
                                      onClick={() => {
                                        setSelectedObservee(teacher.name);
                                        setTeacherSearch(teacher.name);
                                      }}
                                      className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-slate-100 flex items-center justify-between",
                                        selectedObservee === teacher.name && "bg-blue-50 text-blue-600"
                                      )}
                                    >
                                      <span>{teacher.name}</span>
                                      {selectedObservee === teacher.name && (
                                        <svg
                                          className="h-4 w-4"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-slate-500">
                                    {teacherSearch ? "No teacher found" : "Start typing to search..."}
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                          {formErrors.observee && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.observee}</p>
                          )}
                        </div>

                        {/* Subject field - hidden for Self Assessment */}
                        {!observationTypeConfigs[selectedObservationType as keyof typeof observationTypeConfigs]?.hideSubject && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 mb-3 block">
                              Subject
                            </label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                              <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                                <SelectValue placeholder="Subject List" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.name}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.subject && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Select Key Stage/Class
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Key Stage/Class" />
                            </SelectTrigger>
                            <SelectContent>
                              {keyStages.map((stage) => (
                                <SelectItem key={stage.id} value={stage.name}>
                                  {stage.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Select Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground",
                                  formErrors.date && "border-red-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Select Date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.date && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                          size="lg"
                          onClick={() => {
                            if (selectedObservationType === "Senior School Self Assessment") {
                              setShowSelfAssessmentOptions(true);
                            } else if (selectedObservationType === "Senior School Learning Walk") {
                              setShowLearningWalkOptions(true);
                            } else {
                              // Handle other observation types
                              console.log("Creating observation:", {
                                type: selectedObservationType,
                                observee: selectedObservee,
                                date
                              });
                            }
                          }}
                        >
                          Create Observation
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          onClick={() => setIsFormExpanded(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Walk Options */}
              {showLearningWalkOptions && (
                <Card className="w-full mt-6">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Learning Walk Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Learning Aspect Selection */}
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Choose Learning Aspect
                        </label>
                        <Select value={selectedLearningAspect} onValueChange={setSelectedLearningAspect}>
                          <SelectTrigger className={formErrors.learningAspect ? "border-red-500" : ""}>
                            <SelectValue placeholder="Choose Learning Aspect" />
                          </SelectTrigger>
                          <SelectContent>
                            {learningWalkAspects.map((aspect) => (
                              <SelectItem key={aspect} value={aspect}>
                                {aspect}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.learningAspect && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.learningAspect}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Observation Type
                          </label>
                          <Select value={selectedObservationType} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Teacher
                          </label>
                          <Select value={selectedObservee} disabled>
                            <SelectTrigger className={formErrors.observee ? "border-red-500" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                          {formErrors.observee && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.observee}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Subject
                          </label>
                          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.name}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.subject && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Key Stage/Class
                          </label>
                          <Select value={selectedKeyStage} onValueChange={setSelectedKeyStage}>
                            <SelectTrigger className={formErrors.keyStage ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select Key Stage/Class" />
                            </SelectTrigger>
                            <SelectContent>
                              {keyStages.map((stage) => (
                                <SelectItem key={stage.id} value={stage.id}>
                                  {stage.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.keyStage && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.keyStage}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Select Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground",
                                  formErrors.date && "border-red-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Select Date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.date && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Observers Section */}
                      {additionalObservers.length > 0 && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-3 block">
                            Additional Observers
                          </label>
                          <div className="space-y-2">
                            {additionalObservers.map((observer, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Badge variant="outline" className="flex-1">
                                  {observer || `Observer ${index + 1}`}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeObserver(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                          onClick={handleConfirmLearningWalk}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm these options'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowLearningWalkOptions(false);
                            setIsFormExpanded(false);
                            setSelectedObservationType("");
                            setSelectedObservee("");
                            setSelectedLearningAspect("");
                            setSelectedSubject("");
                            setSelectedKeyStage("");
                            setFormErrors({});
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Self Assessment Options */}
              {showSelfAssessmentOptions && (
                <Card className="w-full mt-6">
                  <CardHeader className="bg-sps-green text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Self Assessment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Observation Type
                          </label>
                          <Select value={selectedObservationType} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Teacher (You)
                          </label>
                          <Select value={selectedObservee} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Assessment Type
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Self Assessment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self-assessment">Self Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Key Stage/Class field removed for Senior School Self Assessment as it's not required */}
                        {selectedObservationType !== "Senior School Self Assessment" && (
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Key Stage/Class
                            </label>
                            <Select value={selectedKeyStage} onValueChange={setSelectedKeyStage}>
                              <SelectTrigger className={formErrors.keyStage ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select key stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {keyStages.map((keyStage) => (
                                  <SelectItem key={keyStage.id} value={keyStage.id}>
                                    {keyStage.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.keyStage && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.keyStage}</p>
                            )}
                          </div>
                        )}

                        {/* Subject field removed for Self Assessment as it's not required */}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Select Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground",
                                  formErrors.date && "border-red-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Select Date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.date && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          className="flex-1 bg-black text-white hover:bg-gray-800" 
                          onClick={handleConfirmSelfAssessment}
                        >
                          Confirm these options
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowSelfAssessmentOptions(false);
                            setIsFormExpanded(false);
                            setSelectedObservationType("");
                            setSelectedObservee("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <MrBishopFab />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;