import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CreateObservationCard } from "@/components/dashboard/CreateObservationCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teachersApi, observationTypesApi, keyStagesApi, subjectsApi, type Teacher, type ObservationType, type KeyStage, type Subject } from "@/lib/supabase";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Target, Eye, LayoutDashboard, Search, X, Clock, User, GraduationCap, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import stPaulsLogo from "@/assets/st-pauls-logo.png";
import MrBishopFab from "@/components/teacher/MrBishopFab";
import { learningWalkApi } from "@/lib/supabase";

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
        
        navigate('/dashboard/learning-walk');
      } catch (error) {
        console.error('Error saving learning walk configuration:', error);
        toast.error('Failed to save configuration. Please try again.');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const [aspects, setAspects] = useState<any[]>([]);
  
  useEffect(() => {
    const loadAspects = async () => {
      try {
        const aspectsData = await learningWalkApi.getAspects();
        setAspects(aspectsData);
      } catch (error) {
        console.error('Error loading learning walk aspects:', error);
      }
    };
    
    loadAspects();
  }, []);

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

export default function Dashboard() {
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
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CreateObservationCard />
                <DashboardStats />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Recent Observations</h3>
                        <p className="text-sm text-slate-600">View your latest feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Learning Resources</h3>
                        <p className="text-sm text-slate-600">Access teaching materials</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Development Goals</h3>
                        <p className="text-sm text-slate-600">Track your progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <MrBishopFab />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};