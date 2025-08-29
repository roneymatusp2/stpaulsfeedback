import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  Mail,
  Building,
  BookOpen,
  UserCheck,
  UserX,
  Download,
  Upload,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { teachersApi, type Teacher } from '@/lib/supabase';
import { toast } from 'sonner';

interface TeacherFormData {
  name: string;
  email: string;
  department: string;
  title: string;
  subjects: string[];
  key_stages: string[];
  is_admin: boolean;
  admin_role: string;
  active: boolean;
}

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    department: '',
    title: '',
    subjects: [],
    key_stages: [],
    is_admin: false,
    admin_role: 'teacher',
    active: true
  });

  // Available options
  const departments = [
    'Mathematics',
    'English',
    'Science',
    'Humanities', 
    'Modern Languages',
    'Art & Design',
    'Music',
    'Physical Education',
    'Drama',
    'Technology',
    'Computer Science',
    'Business Studies'
  ];

  const availableSubjects = [
    'IB Mathematics',
    'IGCSE Mathematics', 
    'KS3 Mathematics',
    'English Literature',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'French',
    'Spanish',
    'German',
    'Art',
    'Music',
    'Drama',
    'PE',
    'Computer Science',
    'Business Studies'
  ];

  const availableKeyStages = [
    'Key Stage 1',
    'Key Stage 2', 
    'Key Stage 3',
    'Key Stage 4',
    'Key Stage 5'
  ];

  const adminRoles = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Administrator' },
    { value: 'head_of_department', label: 'Head of Department' },
    { value: 'senior_leadership', label: 'Senior Leadership' },
    { value: 'dev_admin', label: 'Developer Admin' }
  ];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const teachersData = await teachersApi.getAll();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.department && teacher.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || teacher.department === departmentFilter;
    
    const matchesActive = activeFilter === 'all' || 
                         (activeFilter === 'active' && teacher.active) ||
                         (activeFilter === 'inactive' && !teacher.active) ||
                         (activeFilter === 'admin' && teacher.is_admin);

    return matchesSearch && matchesDepartment && matchesActive;
  });

  const openCreateDialog = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      title: '',
      subjects: [],
      key_stages: [],
      is_admin: false,
      admin_role: 'teacher',
      active: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department || '',
      title: teacher.title || '',
      subjects: teacher.subjects || [],
      key_stages: teacher.key_stages || [],
      is_admin: teacher.is_admin || false,
      admin_role: teacher.admin_role || 'teacher',
      active: teacher.active !== false
    });
    setIsDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error('Name and email are required');
        return;
      }

      const emailRegex = /^[^\s@]+@stpauls\.br$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Email must be a valid St. Paul\'s email address (@stpauls.br)');
        return;
      }

      await teachersApi.create(formData);
      toast.success('Teacher created successfully');
      setIsDialogOpen(false);
      loadTeachers();
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('Failed to create teacher. Email might already exist.');
    }
  };

  const handleUpdate = async () => {
    if (!editingTeacher) return;

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error('Name and email are required');
        return;
      }

      await teachersApi.update(editingTeacher.id, formData);
      toast.success('Teacher updated successfully');
      setIsDialogOpen(false);
      setEditingTeacher(null);
      loadTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast.error('Failed to update teacher');
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    try {
      await teachersApi.delete(teacher.id);
      toast.success('Teacher removed successfully');
      loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to remove teacher');
    }
  };

  const toggleActiveStatus = async (teacher: Teacher) => {
    try {
      await teachersApi.update(teacher.id, { active: !teacher.active });
      toast.success(`Teacher ${teacher.active ? 'deactivated' : 'activated'} successfully`);
      loadTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error('Failed to update teacher status');
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject) 
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleKeyStageToggle = (keyStage: string) => {
    setFormData(prev => ({
      ...prev,
      key_stages: prev.key_stages.includes(keyStage)
        ? prev.key_stages.filter(k => k !== keyStage) 
        : [...prev.key_stages, keyStage]
    }));
  };

  const exportTeachers = () => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Title', 'Subjects', 'Key Stages', 'Admin', 'Admin Role', 'Active'].join(','),
      ...filteredTeachers.map(teacher => [
        teacher.name,
        teacher.email,
        teacher.department || '',
        teacher.title || '',
        (teacher.subjects || []).join('; '),
        (teacher.key_stages || []).join('; '),
        teacher.is_admin ? 'Yes' : 'No',
        teacher.admin_role || 'teacher',
        teacher.active !== false ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Teachers exported to CSV');
  };

  const getStatusBadge = (teacher: Teacher) => {
    if (!teacher.active) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>;
    }
    if (teacher.is_admin) {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Teacher Management
          </h2>
          <p className="text-muted-foreground">Manage teacher accounts, permissions, and access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTeachers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search teachers by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{teachers.length}</div>
            <div className="text-sm text-muted-foreground">Total Teachers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{teachers.filter(t => t.active !== false).length}</div>
            <div className="text-sm text-muted-foreground">Active Teachers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{teachers.filter(t => t.is_admin).length}</div>
            <div className="text-sm text-muted-foreground">Administrators</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{new Set(teachers.map(t => t.department).filter(Boolean)).size}</div>
            <div className="text-sm text-muted-foreground">Departments</div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {teacher.name}
                      {teacher.is_admin && <Shield className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="text-sm text-muted-foreground">{teacher.email}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">{teacher.department || 'No Department'}</div>
                    <div className="text-sm text-muted-foreground">{teacher.title || 'Teacher'}</div>
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(teacher.subjects || []).slice(0, 2).map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {(teacher.subjects || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(teacher.subjects || []).length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(teacher.key_stages || []).slice(0, 2).map((stage) => (
                        <Badge key={stage} variant="secondary" className="text-xs">
                          {stage}
                        </Badge>
                      ))}
                      {(teacher.key_stages || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(teacher.key_stages || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(teacher)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActiveStatus(teacher)}
                        className={teacher.active !== false ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                      >
                        {teacher.active !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently remove {teacher.name} from the system? 
                              This action cannot be undone and will remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(teacher)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Teacher
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTeachers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Teacher Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Smith"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.smith@stpauls.br"
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Head of Mathematics"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Teaching Subjects */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teaching Subjects
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
              
              {formData.subjects.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {formData.subjects.join(', ')}
                </div>
              )}
            </div>

            <Separator />

            {/* Key Stages */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Key Stages
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableKeyStages.map(stage => (
                  <label key={stage} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.key_stages.includes(stage)}
                      onChange={() => handleKeyStageToggle(stage)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Administrative Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administrative Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active">Active Teacher</Label>
                    <p className="text-sm text-muted-foreground">Teacher can access the platform</p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_admin">Administrator Access</Label>
                    <p className="text-sm text-muted-foreground">Grant administrative privileges</p>
                  </div>
                  <Switch
                    id="is_admin"
                    checked={formData.is_admin}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                  />
                </div>
                
                {formData.is_admin && (
                  <div>
                    <Label htmlFor="admin_role">Administrative Role</Label>
                    <Select value={formData.admin_role} onValueChange={(value) => setFormData({ ...formData, admin_role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingTeacher ? handleUpdate : handleCreate}>
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherManagement;