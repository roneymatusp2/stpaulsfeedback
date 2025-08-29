import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { learningWalkApi, teachersApi, subjectsApi } from "@/lib/supabase";

export function CreateObservationCard() {
  const navigate = useNavigate();
  const [observationType, setObservationType] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [keyStage, setKeyStage] = useState("");
  const [date, setDate] = useState<Date>();
  const [learningAspect, setLearningAspect] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dynamic data from Supabase
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [learningAspects, setLearningAspects] = useState<any[]>([]);

  const observationTypes = [
    "Senior School Learning Observation",
    "Senior School Learning Walk",
    "Senior School Self Assessment",
    "Senior School Support Plan",
    "Senior School Peer Observation Reflection"
  ];

  const keyStages = ["NA", "Key Stage 1", "Key Stage 2", "Key Stage 3", "Key Stage 4", "Key Stage 5"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, subjectsData, aspectsData] = await Promise.all([
          teachersApi.getAll(),
          subjectsApi.getAll(),
          learningWalkApi.getAspects()
        ]);
        
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setLearningAspects(aspectsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleCreateObservation = () => {
    if (!observationType || !teacher) {
      return;
    }
    
    const config = {
      observationType,
      teacher: { 
        value: teacher,
        name: teachers.find(t => t.id === teacher)?.name || ''
      },
      subject: {
        value: subject,
        name: subjects.find(s => s.id === subject)?.name || ''
      },
      keyStage,
      date: date?.toISOString(),
      ...(observationType === "Senior School Learning Walk" && { 
        learningAspect: {
          value: learningAspect,
          name: learningAspects.find(a => a.id === learningAspect)?.name || ''
        }
      })
    };
    
    if (observationType === "Senior School Learning Walk") {
      localStorage.setItem('learningWalkConfig', JSON.stringify(config));
      navigate('/dashboard/learning-walk');
    } else if (observationType === "Senior School Self Assessment") {
      localStorage.setItem('selfAssessmentConfig', JSON.stringify(config));
      navigate('/dashboard/self-assessment');
    } else {
      console.log('Creating observation with config:', config);
    }
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="p-0">
          <div className="h-24 bg-sps-ruby relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative z-10 p-6 text-center">
              <Plus className="h-10 w-10 text-white mx-auto drop-shadow-sm" />
            </div>
          </div>
          <div className="p-6 bg-gradient-to-b from-background to-background/80">
            <h3 className="font-semibold text-foreground text-lg mb-2">Create a new observation</h3>
          </div>
        </CardContent>
      </Card>

      {isExpanded && (
        <div className="col-span-full mt-8">
          <Card className="w-full shadow-elegant">
            <CardHeader className="bg-gradient-to-r from-sps-ruby to-sps-ruby/80 text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create a New Observation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Main Form Grid */}
              <div className={`grid gap-4 ${
                observationType === "Senior School Learning Walk" 
                  ? "grid-cols-1 md:grid-cols-4" 
                  : "grid-cols-1 md:grid-cols-3"
              }`}>
                {/* Observation Type */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Observation Type
                  </label>
                  <Select value={observationType} onValueChange={setObservationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Observation Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {observationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Who are you observing?
                  </label>
                  <Select value={teacher} onValueChange={setTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Who are you observing?" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Subject List
                  </label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Subject List" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Learning Aspect (only for Learning Walk) */}
                {observationType === "Senior School Learning Walk" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Choose Learning Aspect
                    </label>
                    <Select value={learningAspect} onValueChange={setLearningAspect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Learning Aspect" />
                      </SelectTrigger>
                      <SelectContent>
                        {learningAspects.map((aspect) => (
                          <SelectItem key={aspect.id} value={aspect.id}>
                            {aspect.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Key Stage/Class
                  </label>
                  <Select value={keyStage} onValueChange={setKeyStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Key Stage/Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {keyStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
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
                          !date && "text-muted-foreground"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleCreateObservation}
                  disabled={!observationType || !teacher}
                >
                  Create Observation
                </Button>
                <Button variant="outline" onClick={() => setIsExpanded(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}