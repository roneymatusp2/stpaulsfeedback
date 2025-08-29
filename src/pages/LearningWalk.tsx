import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Mic, MicOff, Image, FileText, Save, Trash2 } from "lucide-react";
import { learningWalkApi, type LearningWalkAspect, type LearningWalkCriteria } from "@/lib/supabase";
import { toast } from "sonner";

export default function LearningWalk() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(null);
  const [aspects, setAspects] = useState<LearningWalkAspect[]>([]);
  const [criteria, setCriteria] = useState<LearningWalkCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAspect, setSelectedAspect] = useState<LearningWalkAspect | null>(null);
  
  // Form data
  const [strengths, setStrengths] = useState("");
  const [areasForDevelopment, setAreasForDevelopment] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [audioRecording, setAudioRecording] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Media recorder for audio
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load configuration from localStorage
      const savedConfig = localStorage.getItem('learningWalkConfig');
      if (!savedConfig) {
        toast.error('Learning Walk configuration not found');
        navigate('/dashboard');
        return;
      }
      
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      // Load aspects from Supabase
      const aspectsData = await learningWalkApi.getAspects();
      setAspects(aspectsData);
      
      // Find and load criteria for the selected aspect
      if (parsedConfig.learningAspect?.name) {
        const aspect = aspectsData.find(a => a.name === parsedConfig.learningAspect.name);
        if (aspect) {
          setSelectedAspect(aspect);
          const criteriaData = await learningWalkApi.getCriteriaForAspect(aspect.id);
          setCriteria(criteriaData);
        }
      }
    } catch (error) {
      console.error('Error loading Learning Walk data:', error);
      toast.error('Failed to load Learning Walk data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedImages(prev => [...prev, ...imageFiles]);
    toast.success(`${imageFiles.length} image(s) uploaded`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioRecording(audioBlob);
        toast.success('Audio recording saved');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const removeFile = (index: number, type: 'image' | 'file') => {
    if (type === 'image') {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = (isDraft: boolean = false) => {
    if (!isDraft && !notes.trim()) {
      toast.error('You must add at least one note before publishing');
      return;
    }

    // Save learning walk data
    const learningWalkData = {
      config,
      selectedAspect: selectedAspect?.name,
      criteria: criteria.map(c => c.title),
      responses: {
        strengths,
        areasForDevelopment,
        notes
      },
      attachments: {
        images: uploadedImages.length,
        files: uploadedFiles.length,
        hasAudio: !!audioRecording
      },
      status: isDraft ? 'draft' : 'completed',
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('learningWalkData', JSON.stringify(learningWalkData));
    
    toast.success(isDraft ? 'Learning Walk saved for later' : 'Learning Walk completed successfully');
    navigate('/dashboard');
  };

  const handleDiscard = () => {
    localStorage.removeItem('learningWalkConfig');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-lg font-medium">Loading Learning Walk...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Learning Walk</h1>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Observer:</strong> You</p>
                    <p><strong>Teacher:</strong> {config?.teacher?.name || 'Loading...'}</p>
                    <p><strong>Aspect:</strong> {selectedAspect?.name || 'Loading...'}</p>
                    <p><strong>Date:</strong> {config?.date ? new Date(config.date).toLocaleDateString('en-GB') : 'Today'}</p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedAspect?.name || 'Learning Aspect'}
                  </CardTitle>
                  {selectedAspect?.description && (
                    <p className="text-sm text-muted-foreground">{selectedAspect.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Criteria Display */}
                  {criteria.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Assessment Criteria</h3>
                      <div className="space-y-3">
                        {criteria.map((criterion) => (
                          <div key={criterion.id} className="bg-white p-3 rounded border border-blue-100">
                            <h4 className="font-medium text-blue-900 mb-1">{criterion.title}</h4>
                            <p className="text-sm text-blue-800">{criterion.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Strengths</label>
                    <Textarea
                      placeholder="Record observations about teaching strengths and effective practices..."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Areas for Development Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Areas for Development</label>
                    <Textarea
                      placeholder="Note areas where teaching could be enhanced or improved..."
                      value={areasForDevelopment}
                      onChange={(e) => setAreasForDevelopment(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* File Upload Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Image className="h-4 w-4" />
                        Add Image
                      </Button>
                      {uploadedImages.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {uploadedImages.length} image(s) uploaded
                        </div>
                      )}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="w-full flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <FileText className="h-4 w-4" />
                        Add Files
                      </Button>
                      {uploadedFiles.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {uploadedFiles.length} file(s) uploaded
                        </div>
                      )}
                    </div>

                    {/* Audio Recording */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full flex items-center gap-2 ${
                          isRecording 
                            ? 'border-red-300 text-red-700 hover:bg-red-50' 
                            : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isRecording ? 'Stop Recording' : 'Record Audio'}
                      </Button>
                      {audioRecording && (
                        <div className="text-xs text-green-600">
                          Audio recording saved
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Files Display */}
                  {(uploadedImages.length > 0 || uploadedFiles.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Uploaded Files</h4>
                      
                      {/* Images */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Images ({uploadedImages.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {uploadedImages.map((file, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-2">
                                <Image className="h-3 w-3" />
                                {file.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index, 'image')}
                                  className="h-4 w-4 p-0 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Files ({uploadedFiles.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map((file, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {file.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index, 'file')}
                                  className="h-4 w-4 p-0 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Additional Notes</label>
                    <Textarea
                      placeholder="You must add at least one note before publishing..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                    {!notes.trim() && (
                      <p className="text-xs text-muted-foreground border border-gray-200 rounded p-2">
                        You must add at least one note before publishing
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Button 
                      variant="destructive"
                      onClick={handleDiscard}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Discard
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleSave(true)}
                      className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Save className="h-4 w-4" />
                      Save for Later
                    </Button>
                  </div>

                  {/* Publish Button */}
                  <Button 
                    onClick={() => handleSave(false)}
                    disabled={!notes.trim()}
                    className="w-full"
                  >
                    Publish Learning Walk
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}