import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { selfAssessmentsApi, authUtils } from "@/lib/supabase";
import { toast } from "sonner";

const assessmentCriteria = [
  {
    category: "Teaching Standards",
    items: [
      "Subject knowledge",
      "Quality of instruction", 
      "Assessment for learning",
      "Behaviour for learning",
      "Progress for all",
      "Literacy and Oracy",
      "Metacognition and self-regulation",
      "Deep learning"
    ]
  },
  {
    category: "Quality of Instruction",
    expandable: true,
    items: [
      "Lessons begin with a short review of learning",
      "New information is presented in small steps and Pupils practice each step before more information is introduced",
      "Dual coding and analogies are used to aid Pupil memory",
      "Instructions are clear and detailed",
      "Pupils are asked many questions to assess their learning and material is re-taught when necessary",
      "Pupil practice is guided by models and worked examples",
      "Pupils are challenged by the content but supported to achieve a high success rate",
      "Pupils work independently to practice new knowledge/skills following teacher input"
    ]
  }
];

export default function SelfAssessment() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [assessmentData, setAssessmentData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{
    observationType?: { id: string; name: string };
    keyStage?: { id: string; name: string };
    subject?: { id: string; name: string };
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem('selfAssessmentConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Get current user
    authUtils.getCurrentUser().then(user => {
      setCurrentUser(user);
    }).catch(error => {
      console.error('Error getting current user:', error);
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
    });
  }, [navigate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleRatingChange = (item: string, value: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [item]: value
    }));
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    if (!currentUser || !config) {
      toast.error('Missing user or configuration data');
      return;
    }

    setLoading(true);
    try {
      const assessmentPayload = {
        teacher_id: currentUser.id,
        observation_type_id: config.observationType?.id,
        key_stage_id: config.keyStage?.id || null,
        subject_id: config.subject?.id || null,
        assessment_date: new Date().toISOString(),
        assessment_data: assessmentData,
        status: status
      };

      const result = await selfAssessmentsApi.create(assessmentPayload);
      
      if (result.success) {
        toast.success(status === 'draft' ? 'Assessment saved as draft' : 'Assessment submitted successfully');
        // Clear localStorage after successful save
        localStorage.removeItem('selfAssessmentConfig');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('An error occurred while saving the assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Self Assessment</h1>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>{currentUser?.name || 'Loading...'}</strong></p>
                    <p>Self Assessment</p>
                    <p>{config?.subject?.name || 'NA'}</p>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>{config?.observationType?.name || 'Loading...'}</p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {assessmentCriteria.map((section) => (
                      <div key={section.category} className="border-b pb-6 last:border-b-0">
                        <div 
                          className="flex items-center gap-2 cursor-pointer mb-4"
                          onClick={() => section.expandable && toggleSection(section.category)}
                        >
                          {section.expandable && (
                            expandedSections.includes(section.category) 
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />
                          )}
                          <h3 className="text-lg font-semibold text-foreground">
                            {section.category}
                          </h3>
                          {section.expandable && (
                            <span className="text-xs text-muted-foreground">(click here to show criteria under this header)</span>
                          )}
                        </div>

                        {(!section.expandable || expandedSections.includes(section.category)) && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                              <div></div>
                              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded text-sm font-medium">
                                Best practice
                              </div>
                              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded text-sm font-medium">
                                Good practice
                              </div>
                              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded text-sm font-medium">
                                Area for development
                              </div>
                            </div>

                            {section.items.map((item, index) => (
                              <div key={index} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50">
                                <div className="text-sm text-foreground">
                                  {item}
                                </div>
                                <div className="flex justify-center">
                                  <RadioGroup 
                                    value={assessmentData[item]} 
                                    onValueChange={(value) => handleRatingChange(item, value)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="best" id={`${item}-best`} />
                                      <Label htmlFor={`${item}-best`} className="sr-only">Best practice</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                <div className="flex justify-center">
                                  <RadioGroup 
                                    value={assessmentData[item]} 
                                    onValueChange={(value) => handleRatingChange(item, value)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="good" id={`${item}-good`} />
                                      <Label htmlFor={`${item}-good`} className="sr-only">Good practice</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                <div className="flex justify-center">
                                  <RadioGroup 
                                    value={assessmentData[item]} 
                                    onValueChange={(value) => handleRatingChange(item, value)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="development" id={`${item}-development`} />
                                      <Label htmlFor={`${item}-development`} className="sr-only">Area for development</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-4 pt-6">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleSave('submitted')}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Assessment'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSave('draft')}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save as Draft'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}