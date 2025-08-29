import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, BookOpen, GraduationCap, Target } from 'lucide-react';
import { observationTypesApi, keyStagesApi, subjectsApi, type ObservationType, type KeyStage, type Subject } from '@/lib/supabase';
import { toast } from 'sonner';

const SelfAssessmentManagement = () => {
  const [observationTypes, setObservationTypes] = useState<ObservationType[]>([]);
  const [keyStages, setKeyStages] = useState<KeyStage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ObservationType | KeyStage | Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('observation-types');
  const [learningWalkAspects, setLearningWalkAspects] = useState([]);
  const [learningWalkCriteria, setLearningWalkCriteria] = useState([]);
  const [selectedAspectId, setSelectedAspectId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [obsTypes, stages, subjs] = await Promise.all([
        observationTypesApi.getAll(),
        keyStagesApi.getAll(),
        subjectsApi.getAll()
      ]);
      setObservationTypes(obsTypes);
      setKeyStages(stages);
      setSubjects(subjs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCriteriaForAspect = (aspectId) => {
    // Implementation for loading criteria
  };

  const handleCreate = async (type: 'observation-types' | 'key-stages' | 'subjects') => {
    try {
      const data = { name: formData.name, description: formData.description };
      
      switch (type) {
        case 'observation-types':
          await observationTypesApi.create(data);
          break;
        case 'key-stages':
          await keyStagesApi.create(data);
          break;
        case 'subjects':
          await subjectsApi.create(data);
          break;
      }
      
      toast.success('Item created successfully');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdate = async (type: 'observation-types' | 'key-stages' | 'subjects', id: string) => {
    try {
      const data = { name: formData.name, description: formData.description };
      
      switch (type) {
        case 'observation-types':
          await observationTypesApi.update(id, data);
          break;
        case 'key-stages':
          await keyStagesApi.update(id, data);
          break;
        case 'subjects':
          await subjectsApi.update(id, data);
          break;
      }
      
      toast.success('Item updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (type: 'observation-types' | 'key-stages' | 'subjects', id: string) => {
    try {
      switch (type) {
        case 'observation-types':
          await observationTypesApi.delete(id);
          break;
        case 'key-stages':
          await keyStagesApi.delete(id);
          break;
        case 'subjects':
          await subjectsApi.delete(id);
          break;
      }
      
      toast.success('Item deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const openCreateDialog = (type: string) => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setActiveTab(type);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ObservationType | KeyStage | Subject, type: string) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setActiveTab(type);
    setIsDialogOpen(true);
  };

  const renderItemsList = (items: (ObservationType | KeyStage | Subject)[], type: 'observation-types' | 'key-stages' | 'subjects', icon: React.ElementType) => {
    const Icon = icon;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {type === 'observation-types' ? 'Observation Types' : 
             type === 'key-stages' ? 'Key Stages' : 'Subjects'}
          </h3>
          <Button onClick={() => openCreateDialog(type)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
        
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <Badge variant="outline" className="mt-2 text-xs">
                    ID: {item.id}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item, type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(type, item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
          {items.length === 0 && (
            <Card className="p-8 text-center">
              <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found</p>
            </Card>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sps-ruby"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Self-Assessment Management</h2>
          <p className="text-muted-foreground">Manage observation types, key stages, and subjects</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="observation-types">Observation Types</TabsTrigger>
          <TabsTrigger value="key-stages">Key Stages</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="learning-walk">Learning Walk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="observation-types" className="mt-6">
          {renderItemsList(observationTypes, 'observation-types', Target)}
        </TabsContent>
        
        <TabsContent value="key-stages" className="mt-6">
          {renderItemsList(keyStages, 'key-stages', GraduationCap)}
        </TabsContent>
        
        <TabsContent value="subjects" className="mt-6">
          {renderItemsList(subjects, 'subjects', BookOpen)}
        </TabsContent>
        
        <TabsContent value="learning-walk" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Walk Management
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aspects */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Learning Aspects</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Aspect
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {learningWalkAspects.map((aspect) => (
                    <div 
                      key={aspect.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedAspectId === aspect.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedAspectId(aspect.id);
                        loadCriteriaForAspect(aspect.id);
                      }}
                    >
                      <div className="font-medium text-sm">{aspect.name}</div>
                      {aspect.description && (
                        <div className="text-xs text-muted-foreground mt-1">{aspect.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Criteria for Selected Aspect */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Criteria {selectedAspectId && `(${learningWalkCriteria.length})`}
                  </h4>
                  {selectedAspectId && (
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criteria
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedAspectId ? (
                    learningWalkCriteria.map((criteria) => (
                      <div key={criteria.id} className="p-3 border border-gray-200 rounded">
                        <div className="font-medium text-sm">{criteria.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{criteria.description}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select an aspect to view its criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} {' '}
              {activeTab === 'observation-types' ? 'Observation Type' :
               activeTab === 'key-stages' ? 'Key Stage' : 'Subject'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingItem) {
                    handleUpdate(activeTab as 'observation-types' | 'key-stages' | 'subjects', editingItem.id);
                  } else {
                    handleCreate(activeTab as 'observation-types' | 'key-stages' | 'subjects');
                  }
                }}
                disabled={!formData.name.trim()}
              >
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelfAssessmentManagement;