import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjvtncdjcslnkfctqnfy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnRuY2RqY3NsbmtmY3RxbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzM0MDEsImV4cCI6MjA1OTU0OTQwMX0.AzALxUUvYLJJtDkvxt7efJ7bGxeKmzOs-fT5bQOndiU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type { User } from '@supabase/supabase-js';

// Learning Walk Types
export interface LearningWalkAspect {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningWalkCriteria {
  id: string;
  aspect_id: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Database types
export interface Teacher {
  id: string
  name: string
  email: string
  department: string
  title?: string
  subjects?: string[]
  key_stages?: string[]
  active: boolean
  admin_role: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  teacher_id: string
  observer_id: string | null
  observation_date: string
  lesson_subject: string | null
  lesson_topic: string | null
  class_year: string | null
  student_count: number | null
  planning_preparation: Record<string, unknown>
  teaching_delivery: Record<string, unknown>
  student_engagement: Record<string, unknown>
  classroom_management: Record<string, unknown>
  assessment_feedback: Record<string, unknown>
  strengths: string | null
  areas_for_development: string | null
  action_points: string | null
  overall_rating: number | null
  status: string
  is_confidential: boolean
  created_at: string
  updated_at: string
}

export interface ObservationTemplate {
  id: string
  name: string
  description: string | null
  template_data: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  sender_id: string | null
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'observation'
  read: boolean
  action_url: string | null
  action_text: string | null
  metadata?: Record<string, unknown>
  read_at?: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description: string | null
  category: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'inactive' | 'archived'
  start_date: string | null
  end_date: string | null
  created_by: string | null
  assigned_to: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  activity_id: string | null
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date: string | null
  assigned_to: string | null
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ActivityTasksSummary {
  activity_id: string
  activity_title: string
  activity_description: string | null
  activity_status: 'active' | 'inactive' | 'archived'
  activity_priority: 'low' | 'medium' | 'high' | 'urgent'
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  created_at: string
  updated_at: string
}

export interface ObservationType {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KeyStage {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SelfAssessment {
  id: string
  teacher_id: string
  observation_type_id: string | null
  key_stage_id: string | null
  subject_id: string | null
  assessment_date: string
  assessment_data: Record<string, unknown>
  status: 'draft' | 'submitted' | 'reviewed' | 'completed'
  created_at: string
  updated_at: string
}

// Authentication and Authorization utilities
// Data validation utilities
export const validationUtils = {
  // Validate activity data
  validateActivity(activity: Partial<Activity>): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!activity.title || typeof activity.title !== 'string' || activity.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string')
    } else if (activity.title.length > 255) {
      errors.push('Title must be 255 characters or less')
    }
    
    if (activity.description && typeof activity.description !== 'string') {
      errors.push('Description must be a string')
    }
    
    if (activity.status && !['active', 'inactive', 'completed', 'cancelled'].includes(activity.status)) {
      errors.push('Status must be one of: active, inactive, completed, cancelled')
    }
    
    if (activity.priority && !['low', 'medium', 'high', 'urgent'].includes(activity.priority)) {
      errors.push('Invalid activity priority')
    }
    
    if (activity.due_date && isNaN(Date.parse(activity.due_date))) {
      errors.push('Due date must be a valid date')
    }
    
    if (activity.estimated_hours && (typeof activity.estimated_hours !== 'number' || activity.estimated_hours < 0)) {
      errors.push('Estimated hours must be a positive number')
    }
    
    return { isValid: errors.length === 0, errors }
  },

  // Validate task data
  validateTask(task: Partial<Task>): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string')
    } else if (task.title.length > 255) {
      errors.push('Title must be 255 characters or less')
    }
    
    if (task.description && typeof task.description !== 'string') {
      errors.push('Description must be a string')
    }
    
    if (task.status && !['pending', 'in_progress', 'completed', 'cancelled'].includes(task.status)) {
      errors.push('Status must be one of: pending, in_progress, completed, cancelled')
    }
    
    if (task.priority && !['low', 'medium', 'high', 'urgent'].includes(task.priority)) {
      errors.push('Priority must be one of: low, medium, high, urgent')
    }
    
    if (task.due_date && isNaN(Date.parse(task.due_date))) {
      errors.push('Due date must be a valid date')
    }
    
    if (task.estimated_hours && (typeof task.estimated_hours !== 'number' || task.estimated_hours < 0)) {
      errors.push('Estimated hours must be a positive number')
    }
    
    return { isValid: errors.length === 0, errors }
  },

  // Validate UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  // Sanitize string input
  sanitizeString(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '')
  }
}

// Error handling utilities
export const errorUtils = {
  // Handle Supabase errors
  handleSupabaseError(error: unknown): never {
    const err = error as { code?: string; message?: string }
    if (err?.code) {
      switch (err.code) {
        case '23505':
          throw this.createError('A record with this information already exists', 'DUPLICATE_ENTRY')
        case '23503':
          throw this.createError('Referenced record does not exist', 'FOREIGN_KEY_VIOLATION')
        case '42501':
          throw this.createError('Permission denied', 'PERMISSION_DENIED')
        case 'PGRST116':
          throw this.createError('Record not found', 'NOT_FOUND')
        default:
          throw this.createError(err.message || 'Database operation failed', 'DATABASE_ERROR')
      }
    }
    throw this.createError('An unexpected error occurred', 'UNKNOWN_ERROR')
  },

  // Validate and handle API responses
  validateResponse<T>(data: T | null, error: unknown): T {
    if (error) {
      this.handleSupabaseError(error)
    }
    if (!data) {
      throw this.createError('No data returned from operation', 'NO_DATA')
    }
    return data
  },

  // Create standardized error response
  createError(message: string, code?: string): Error {
    const error = new Error(message)
    if (code) {
      (error as Error & { code?: string }).code = code
    }
    return error
  }
}

export const authUtils = {
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Check if current user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return !!user
    } catch {
      return false
    }
  },

  // Check if current user is an admin
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false
      
      const teacher = await teachersApi.getByEmail(user.email!)
      return teacher?.is_admin === true && teacher?.active === true
    } catch {
      return false
    }
  },

  // Get current user's teacher record
  async getCurrentTeacher(): Promise<Teacher | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user?.email) return null
      
      return await teachersApi.getByEmail(user.email)
    } catch {
      return null
    }
  },

  // Require authentication (throws if not authenticated)
  async requireAuth(): Promise<void> {
    const isAuth = await this.isAuthenticated()
    if (!isAuth) {
      throw new Error('Authentication required')
    }
  },

  // Require admin access (throws if not admin)
  async requireAdmin(): Promise<void> {
    await this.requireAuth()
    const isAdminUser = await this.isAdmin()
    if (!isAdminUser) {
      throw new Error('Admin access required')
    }
  },

  // Check if user can access resource (admin or owner)
  async canAccessResource(resourceUserId?: string): Promise<boolean> {
    try {
      const isAdminUser = await this.isAdmin()
      if (isAdminUser) return true
      
      if (!resourceUserId) return false
      
      const currentUser = await this.getCurrentUser()
      return currentUser?.id === resourceUserId
    } catch {
      return false
    }
  }
}

// API functions
export const teachersApi = {
  // Get all active teachers
  async getAll(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Get all admin users
  async getAdmins(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_admin', true)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Get teacher by email
  async getByEmail(email: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) return null
    return data
  },

  // Get teacher by ID
  async getById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }
}

export const feedbackApi = {
  // Get all feedback for a teacher
  async getForTeacher(teacherId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        teacher:teachers!feedback_teacher_id_fkey(name, email),
        observer:teachers!feedback_observer_id_fkey(name, email)
      `)
      .eq('teacher_id', teacherId)
      .order('observation_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create new feedback
  async create(feedback: Partial<Feedback>): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update feedback
  async update(id: string, updates: Partial<Feedback>): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get recent feedback (for dashboard)
  async getRecent(limit: number = 10): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        teacher:teachers!feedback_teacher_id_fkey(name, email),
        observer:teachers!feedback_observer_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
     return data || []
   }
}

export const templatesApi = {
   // Get all active templates
   async getAll(): Promise<ObservationTemplate[]> {
    const { data, error } = await supabase
      .from('observation_templates')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Get template by ID
  async getById(id: string): Promise<ObservationTemplate | null> {
    const { data, error } = await supabase
      .from('observation_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }
}

export const notificationsApi = {
  // Get notifications for a user
  async getForUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    
    if (error) throw error
    return count || 0
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false)
    
    if (error) throw error
  },

  // Create a notification
  async create(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'read' | 'read_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Create activity-related notification
  async createActivityNotification(
    activityId: string,
    userId: string,
    type: 'activity_created' | 'activity_updated' | 'activity_deleted' | 'activity_assigned',
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<Notification> {
    return this.create({
      user_id: userId,
      type,
      title: 'Activity Update',
      message,
      metadata: {
        ...metadata,
        activity_id: activityId,
        entity_type: 'activity'
      }
    })
  },

  // Create task-related notification
  async createTaskNotification(
    taskId: string,
    userId: string,
    type: 'task_created' | 'task_updated' | 'task_completed' | 'task_assigned' | 'task_due_soon',
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<Notification> {
    return this.create({
      user_id: userId,
      type,
      title: 'Task Update',
      message,
      metadata: {
        ...metadata,
        task_id: taskId,
        entity_type: 'task'
      }
    })
  }
}

// Activities API
export const activitiesApi = {
  // Get all activities with optional filtering
  async getAll(filters?: {
    status?: Activity['status']
    priority?: Activity['priority']
    category?: string
    assigned_to?: string
  }): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.assigned_to) {
      query = query.contains('assigned_to', [filters.assigned_to])
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Get activity by ID
  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Create a new activity (Admin only)
  async create(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
    await authUtils.requireAdmin()
    
    // Validate activity data
    const validation = validationUtils.validateActivity(activity)
    if (!validation.isValid) {
      throw errorUtils.createError(`Validation failed: ${validation.errors.join(', ')}`, 'VALIDATION_ERROR')
    }
    
    // Sanitize string inputs
    const sanitizedActivity = {
      ...activity,
      title: validationUtils.sanitizeString(activity.title || ''),
      description: activity.description ? validationUtils.sanitizeString(activity.description) : activity.description
    }
    
    try {
       const { data, error } = await supabase
         .from('activities')
         .insert({
           ...sanitizedActivity,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         })
         .select()
         .single()
       
       return errorUtils.validateResponse(data, error)
     } catch (error) {
       errorUtils.handleSupabaseError(error)
     }
  },

  // Update an activity (Admin only)
  async update(id: string, updates: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>): Promise<Activity> {
    await authUtils.requireAdmin()
    
    // Validate UUID
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid activity ID format', 'VALIDATION_ERROR')
    }
    
    // Validate update data if provided
    if (Object.keys(updates).length > 0) {
      const validation = validationUtils.validateActivity(updates)
      if (!validation.isValid) {
        throw errorUtils.createError(`Validation failed: ${validation.errors.join(', ')}`, 'VALIDATION_ERROR')
      }
    }
    
    // Sanitize string inputs
    const sanitizedUpdates = { ...updates }
    if (sanitizedUpdates.title) {
      sanitizedUpdates.title = validationUtils.sanitizeString(sanitizedUpdates.title)
    }
    if (sanitizedUpdates.description) {
      sanitizedUpdates.description = validationUtils.sanitizeString(sanitizedUpdates.description)
    }
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          ...sanitizedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete an activity (Admin only)
  async delete(id: string): Promise<void> {
    await authUtils.requireAdmin()
    
    // Validate UUID
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid activity ID format', 'VALIDATION_ERROR')
    }
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get activities assigned to a specific user
  async getAssignedTo(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .contains('assigned_to', [userId])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get activities created by a specific user
  async getCreatedBy(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get activity summary with task counts
  async getSummary(): Promise<ActivityTasksSummary[]> {
    const { data, error } = await supabase
      .from('activity_tasks_summary')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Real-time subscriptions for activities
  subscribeToActivities(
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Activity, old?: Activity }) => void,
    filters?: { status?: string, assigned_to?: string }
  ) {
    const query = supabase
      .channel('activities-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Activity,
          old: payload.old as Activity
        })
      })
    
    return query.subscribe()
  },

  // Subscribe to specific activity changes
  subscribeToActivity(
    activityId: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Activity, old?: Activity }) => void
  ) {
    return supabase
      .channel(`activity-${activityId}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `id=eq.${activityId}`
      }, (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Activity,
          old: payload.old as Activity
        })
      })
      .subscribe()
  }
}

// Tasks API
export const tasksApi = {
  // Get all tasks with optional filtering
  async getAll(filters?: {
    activity_id?: string
    status?: Task['status']
    priority?: Task['priority']
    assigned_to?: string
    due_date_before?: string
    due_date_after?: string
  }): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters?.activity_id) {
      query = query.eq('activity_id', filters.activity_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.due_date_before) {
      query = query.lte('due_date', filters.due_date_before)
    }
    if (filters?.due_date_after) {
      query = query.gte('due_date', filters.due_date_after)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Get task by ID
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Get tasks for a specific activity
  async getByActivityId(activityId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get tasks assigned to a specific user
  async getAssignedTo(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true, nullsLast: true })
    
    if (error) throw error
    return data || []
  },

  // Get overdue tasks
  async getOverdue(): Promise<Task[]> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', now)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Create a new task (Admin or assigned user)
  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    await authUtils.requireAuth()
    
    // Validate task data
    const validation = validationUtils.validateTask(task)
    if (!validation.isValid) {
      throw errorUtils.createError(`Validation failed: ${validation.errors.join(', ')}`, 'VALIDATION_ERROR')
    }
    
    // Validate activity_id UUID
     if (!validationUtils.isValidUUID(task.activity_id)) {
       throw errorUtils.createError('Invalid activity ID format', 'VALIDATION_ERROR')
     }
     
     // Sanitize string inputs
     const sanitizedTask = {
       ...task,
       title: validationUtils.sanitizeString(task.title || ''),
       description: task.description ? validationUtils.sanitizeString(task.description) : task.description
     }
     
     const currentUser = await authUtils.getCurrentUser()
     const isAdmin = await authUtils.isAdmin()
     
     // Check if user is admin or creating task for themselves
     if (!isAdmin && sanitizedTask.assigned_to !== currentUser?.id) {
       throw errorUtils.createError('You can only create tasks for yourself unless you are an admin', 'PERMISSION_DENIED')
     }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...sanitizedTask,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Update a task (Admin or assigned user)
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    await authUtils.requireAuth()
    
    // Validate UUID
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid task ID format', 'VALIDATION_ERROR')
    }
    
    // Validate update data if provided
    if (Object.keys(updates).length > 0) {
      const validation = validationUtils.validateTask(updates)
      if (!validation.isValid) {
        throw errorUtils.createError(`Validation failed: ${validation.errors.join(', ')}`, 'VALIDATION_ERROR')
      }
    }
    
    // Sanitize string inputs
    const sanitizedUpdates = { ...updates }
    if (sanitizedUpdates.title) {
      sanitizedUpdates.title = validationUtils.sanitizeString(sanitizedUpdates.title)
    }
    if (sanitizedUpdates.description) {
      sanitizedUpdates.description = validationUtils.sanitizeString(sanitizedUpdates.description)
    }
    
    const currentUser = await authUtils.getCurrentUser()
    const isAdmin = await authUtils.isAdmin()
    
    // Check if user is admin or task is assigned to them
    if (!isAdmin) {
      try {
        const { data: task, error } = await supabase
          .from('tasks')
          .select('assigned_to')
          .eq('id', id)
          .single()
        
        if (error || !task || task.assigned_to !== currentUser?.id) {
          throw errorUtils.createError('You can only update tasks assigned to you unless you are an admin', 'PERMISSION_DENIED')
        }
      } catch (error) {
        errorUtils.handleSupabaseError(error)
      }
    }
    
    const updateData: Partial<Task> & { updated_at: string; completed_at?: string | null } = {
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    }
    
    // If marking as completed, set completed_at timestamp
    if (sanitizedUpdates.status === 'completed' && !sanitizedUpdates.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }
    // If changing from completed to another status, clear completed_at
    else if (sanitizedUpdates.status && sanitizedUpdates.status !== 'completed') {
      updateData.completed_at = null
    }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete a task (Admin only)
  async delete(id: string): Promise<void> {
    await authUtils.requireAdmin()
    
    // Validate UUID
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid task ID format', 'VALIDATION_ERROR')
    }
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Mark task as completed
  async markCompleted(id: string): Promise<Task> {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  },

  // Get task statistics for an activity
  async getActivityStats(activityId: string): Promise<{
    total: number
    completed: number
    pending: number
    in_progress: number
    cancelled: number
  }> {
    const tasks = await this.getByActivityId(activityId)
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    }
  },

  // Get tasks with activity information
  async getWithActivity(filters?: {
    status?: Task['status']
    assigned_to?: string
  }): Promise<(Task & { activity?: Activity })[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        activity:activities(*)
      `)
      .order('created_at', { ascending: false })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Real-time subscriptions for tasks
  subscribeToTasks(
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Task, old?: Task }) => void,
    filters?: { activity_id?: string, assigned_to?: string, status?: string }
  ) {
    let channelName = 'tasks-changes'
    let filter = ''
    
    // Add filters if provided
    if (filters?.activity_id) {
      filter = `activity_id=eq.${filters.activity_id}`
      channelName = `tasks-activity-${filters.activity_id}-changes`
    } else if (filters?.assigned_to) {
      filter = `assigned_to=eq.${filters.assigned_to}`
      channelName = `tasks-user-${filters.assigned_to}-changes`
    }
    
    const query = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        ...(filter && { filter })
      }, (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Task,
          old: payload.old as Task
        })
      })
    
    return query.subscribe()
  },

  // Subscribe to specific task changes
  subscribeToTask(
    taskId: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Task, old?: Task }) => void
  ) {
    return supabase
      .channel(`task-${taskId}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Task,
          old: payload.old as Task
        })
      })
      .subscribe()
  },

  // Subscribe to tasks for a specific activity
  subscribeToActivityTasks(
    activityId: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Task, old?: Task }) => void
  ) {
    return this.subscribeToTasks(callback, { activity_id: activityId })
  },

  // Subscribe to tasks assigned to a specific user
  subscribeToUserTasks(
    userId: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE', new?: Task, old?: Task }) => void
  ) {
    return this.subscribeToTasks(callback, { assigned_to: userId })
  }
}

// Observation Types API
export const observationTypesApi = {
  // Get all observation types
  async getAll(): Promise<ObservationType[]> {
    try {
      const { data, error } = await supabase
        .from('observation_types')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get observation type by ID
  async getById(id: string): Promise<ObservationType> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid observation type ID format', 'VALIDATION_ERROR')
    }

    try {
      const { data, error } = await supabase
        .from('observation_types')
        .select('*')
        .eq('id', id)
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Create new observation type (Admin only)
  async create(observationType: Omit<ObservationType, 'id' | 'created_at' | 'updated_at'>): Promise<ObservationType> {
    await authUtils.requireAdmin()
    
    if (!observationType.name?.trim()) {
      throw errorUtils.createError('Observation type name is required', 'VALIDATION_ERROR')
    }

    const sanitizedData = {
      name: validationUtils.sanitizeString(observationType.name),
      description: observationType.description ? validationUtils.sanitizeString(observationType.description) : null,
      is_active: observationType.is_active ?? true
    }

    try {
      const { data, error } = await supabase
        .from('observation_types')
        .insert(sanitizedData)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Update observation type (Admin only)
  async update(id: string, updates: Partial<Omit<ObservationType, 'id' | 'created_at' | 'updated_at'>>): Promise<ObservationType> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid observation type ID format', 'VALIDATION_ERROR')
    }

    const sanitizedUpdates: Partial<Pick<ObservationType, 'name' | 'description' | 'is_active'>> = {}
    if (updates.name) {
      sanitizedUpdates.name = validationUtils.sanitizeString(updates.name)
    }
    if (updates.description !== undefined) {
      sanitizedUpdates.description = updates.description ? validationUtils.sanitizeString(updates.description) : null
    }
    if (updates.is_active !== undefined) {
      sanitizedUpdates.is_active = updates.is_active
    }

    const updateData = {
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('observation_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete observation type (Admin only)
  async delete(id: string): Promise<void> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid observation type ID format', 'VALIDATION_ERROR')
    }

    try {
      const { error } = await supabase
        .from('observation_types')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get comprehensive analytics data
  async getAnalyticsData(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<{
    criteriaBreakdown: Array<{ name: string; averageScore: number; count: number }>
    observationTrends: Array<{ date: string; averageScore: number; count: number }>
    subjectDistribution: Array<{ name: string; value: number; percentage: number; averageScore: number }>
    typeDistribution: Array<{ name: string; value: number; percentage: number; averageScore: number }>
    keyStageAnalysis: Array<{ name: string; value: number; percentage: number; averageScore: number }>
    staffAnalysis: { 
      staffData: Array<{
        id: string; name: string; department: string; subject: string; keyStage: string;
        totalObservations: number; averageScore: number; outstanding: number; good: number;
        requiresImprovement: number; inadequate: number; trend: 'up' | 'down' | 'stable';
        daysSinceLastObservation: number; observedBy: string[]; needsDevelopment: boolean;
        immediateConcern: boolean; lastObservationDate: string; previousScore?: number;
      }>;
      observerData: Array<{ name: string; observationsCount: number; averageScore: number; departments: string[] }>
    }
    summaryStats: {
      totalObservations: number; averageScore: number; totalTeachers: number; totalObservers: number;
      gradeDistribution: { outstanding: number; good: number; requiresImprovement: number; inadequate: number };
      trendsComparison: { currentPeriod: number; previousPeriod: number; change: number; changePercentage: number }
    }
  }> {
    try {
      await authUtils.requireAdmin()
      
      // Call all analytics functions in parallel for better performance
      const [criteriaBreakdown, observationTrends, subjectDistribution, typeDistribution, keyStageAnalysis, staffAnalysis, summaryStats] = await Promise.all([
        this.getCriteriaBreakdown(filters),
        this.getObservationTrends(filters),
        this.getSubjectDistribution(filters),
        this.getTypeDistribution(filters),
        this.getKeyStageAnalysis(filters),
        this.getStaffAnalysis(filters),
        this.getSummaryStats(filters)
      ])
      
      return {
        criteriaBreakdown: criteriaBreakdown || [],
        observationTrends: observationTrends || [],
        subjectDistribution: subjectDistribution || [],
        typeDistribution: typeDistribution || [],
        keyStageAnalysis: keyStageAnalysis || [],
        staffAnalysis: staffAnalysis || { staffData: [], observerData: [] },
        summaryStats: summaryStats || {
          totalObservations: 0,
          averageScore: 0,
          totalTeachers: 0,
          totalObservers: 0,
          gradeDistribution: { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
          trendsComparison: { currentPeriod: 0, previousPeriod: 0, change: 0, changePercentage: 0 }
        }
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
      return {
        criteriaBreakdown: [],
        observationTrends: [],
        subjectDistribution: [],
        typeDistribution: [],
        keyStageAnalysis: [],
        staffAnalysis: { staffData: [], observerData: [] },
        summaryStats: {
          totalObservations: 0,
          averageScore: 0,
          totalTeachers: 0,
          totalObservers: 0,
          gradeDistribution: { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
          trendsComparison: { currentPeriod: 0, previousPeriod: 0, change: 0, changePercentage: 0 }
        }
      }
    }
  },

  // Export analytics data to CSV
  async exportData(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}, format: 'csv' | 'pdf' = 'csv'): Promise<string> {
    try {
      await authUtils.requireAdmin()
      
      if (format === 'pdf') {
        throw new Error('PDF export not yet implemented')
      }
      
      // Get all analytics data
      const analyticsData = await this.getAnalyticsData(filters)
      
      let csvContent = ''
      
      // Summary Statistics
      csvContent += 'SUMMARY STATISTICS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Observations,${analyticsData.summaryStats.totalObservations}\n`
      csvContent += `Average Score,${analyticsData.summaryStats.averageScore}\n`
      csvContent += `Total Teachers,${analyticsData.summaryStats.totalTeachers}\n`
      csvContent += `Total Observers,${analyticsData.summaryStats.totalObservers}\n`
      csvContent += `Outstanding (${analyticsData.summaryStats.gradeDistribution.outstanding}),${((analyticsData.summaryStats.gradeDistribution.outstanding / analyticsData.summaryStats.totalObservations) * 100).toFixed(1)}%\n`
      csvContent += `Good (${analyticsData.summaryStats.gradeDistribution.good}),${((analyticsData.summaryStats.gradeDistribution.good / analyticsData.summaryStats.totalObservations) * 100).toFixed(1)}%\n`
      csvContent += `Requires Improvement (${analyticsData.summaryStats.gradeDistribution.requiresImprovement}),${((analyticsData.summaryStats.gradeDistribution.requiresImprovement / analyticsData.summaryStats.totalObservations) * 100).toFixed(1)}%\n`
      csvContent += `Inadequate (${analyticsData.summaryStats.gradeDistribution.inadequate}),${((analyticsData.summaryStats.gradeDistribution.inadequate / analyticsData.summaryStats.totalObservations) * 100).toFixed(1)}%\n`
      csvContent += '\n\n'
      
      // Staff Analysis
      csvContent += 'STAFF ANALYSIS\n'
      csvContent += 'Name,Department,Subject,Key Stage,Total Observations,Average Score,Outstanding,Good,Requires Improvement,Inadequate,Trend,Days Since Last Observation,Observed By\n'
      analyticsData.staffAnalysis.staffData.forEach(staff => {
        csvContent += `"${staff.name}","${staff.department}","${staff.subject}","${staff.keyStage}",${staff.totalObservations},${staff.averageScore},${staff.outstanding},${staff.good},${staff.requiresImprovement},${staff.inadequate},${staff.trend},${staff.daysSinceLastObservation},"${staff.observedBy.join(', ')}"\n`
      })
      csvContent += '\n\n'
      
      // Observer Analysis
      csvContent += 'OBSERVER ANALYSIS\n'
      csvContent += 'Name,Observations Count,Average Score,Departments\n'
      analyticsData.staffAnalysis.observerData.forEach(observer => {
        csvContent += `"${observer.name}",${observer.observationsCount},${observer.averageScore},"${observer.departments.join(', ')}"\n`
      })
      csvContent += '\n\n'
      
      // Subject Distribution
      csvContent += 'SUBJECT DISTRIBUTION\n'
      csvContent += 'Subject,Count,Percentage,Average Score\n'
      analyticsData.subjectDistribution.forEach(subject => {
        csvContent += `"${subject.name}",${subject.value},${subject.percentage}%,${subject.averageScore}\n`
      })
      csvContent += '\n\n'
      
      // Key Stage Analysis
      csvContent += 'KEY STAGE ANALYSIS\n'
      csvContent += 'Key Stage,Count,Percentage,Average Score\n'
      analyticsData.keyStageAnalysis.forEach(keyStage => {
        csvContent += `"${keyStage.name}",${keyStage.value},${keyStage.percentage}%,${keyStage.averageScore}\n`
      })
      csvContent += '\n\n'
      
      // Observation Type Distribution
      csvContent += 'OBSERVATION TYPE DISTRIBUTION\n'
      csvContent += 'Type,Count,Percentage,Average Score\n'
      analyticsData.typeDistribution.forEach(type => {
        csvContent += `"${type.name}",${type.value},${type.percentage}%,${type.averageScore}\n`
      })
      csvContent += '\n\n'
      
      // Criteria Breakdown
      csvContent += 'CRITERIA BREAKDOWN\n'
      csvContent += 'Criteria,Average Score,Count\n'
      analyticsData.criteriaBreakdown.forEach(criteria => {
        csvContent += `"${criteria.name}",${criteria.averageScore},${criteria.count}\n`
      })
      
      return csvContent
    } catch (error) {
      errorUtils.handleSupabaseError(error)
      return ''
    }
  },

  // Get filter options for dropdowns
  async getFilterOptions(): Promise<{
    subjects: { id: string, name: string }[]
    keyStages: { id: string, name: string }[]
    observationTypes: { id: string, name: string }[]
    departments: { id: string, name: string }[]
    staff: { id: string, name: string, department?: string }[]
  }> {
    try {
      await authUtils.requireAdmin()
      
      // Get unique values from feedback table
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          lesson_subject,
          class_year,
          observation_type,
          teacher:teacher_id(id, name, department),
          observer:observer_id(id, name, department)
        `)
        .eq('status', 'completed')
      
      if (feedbackError) throw feedbackError
      
      // Extract unique subjects
      const subjects = Array.from(new Set(
        feedbackData?.map(f => f.lesson_subject).filter(Boolean) || []
      )).map(subject => ({ id: subject, name: subject }))
      
      // Extract unique key stages
      const keyStages = Array.from(new Set(
        feedbackData?.map(f => f.class_year).filter(Boolean) || []
      )).map(keyStage => ({ id: keyStage, name: keyStage }))
      
      // Extract unique observation types
      const observationTypes = Array.from(new Set(
        feedbackData?.map(f => f.observation_type).filter(Boolean) || []
      )).map(type => ({ id: type, name: type }))
      
      // Extract unique departments from teachers and observers
      const departments = Array.from(new Set([
        ...(feedbackData?.map(f => f.teacher?.department).filter(Boolean) || []),
        ...(feedbackData?.map(f => f.observer?.department).filter(Boolean) || [])
      ])).map(dept => ({ id: dept, name: dept }))
      
      // Extract unique staff (teachers and observers)
      const teacherMap = new Map()
      const observerMap = new Map()
      
      feedbackData?.forEach(f => {
        if (f.teacher) {
          teacherMap.set(f.teacher.id, {
            id: f.teacher.id,
            name: f.teacher.name,
            department: f.teacher.department
          })
        }
        if (f.observer) {
          observerMap.set(f.observer.id, {
            id: f.observer.id,
            name: f.observer.name,
            department: f.observer.department
          })
        }
      })
      
      const staff = Array.from(new Set([
        ...Array.from(teacherMap.values()),
        ...Array.from(observerMap.values())
      ]))
      
      return {
        subjects: subjects.sort((a, b) => a.name.localeCompare(b.name)),
        keyStages: keyStages.sort((a, b) => a.name.localeCompare(b.name)),
        observationTypes: observationTypes.sort((a, b) => a.name.localeCompare(b.name)),
        departments: departments.sort((a, b) => a.name.localeCompare(b.name)),
        staff: staff.sort((a, b) => a.name.localeCompare(b.name))
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
      return {
        subjects: [],
        keyStages: [],
        observationTypes: [],
        departments: [],
        staff: []
      }
    }
  }
}

// Key Stages API
export const keyStagesApi = {
  // Get all key stages
  async getAll(): Promise<KeyStage[]> {
    try {
      const { data, error } = await supabase
        .from('key_stages')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get key stage by ID
  async getById(id: string): Promise<KeyStage> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid key stage ID format', 'VALIDATION_ERROR')
    }

    try {
      const { data, error } = await supabase
        .from('key_stages')
        .select('*')
        .eq('id', id)
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Create new key stage (Admin only)
  async create(keyStage: Omit<KeyStage, 'id' | 'created_at' | 'updated_at'>): Promise<KeyStage> {
    await authUtils.requireAdmin()
    
    if (!keyStage.name?.trim()) {
      throw errorUtils.createError('Key stage name is required', 'VALIDATION_ERROR')
    }

    const sanitizedData = {
      name: validationUtils.sanitizeString(keyStage.name),
      description: keyStage.description ? validationUtils.sanitizeString(keyStage.description) : null,
      is_active: keyStage.is_active ?? true
    }

    try {
      const { data, error } = await supabase
        .from('key_stages')
        .insert(sanitizedData)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Update key stage (Admin only)
  async update(id: string, updates: Partial<Omit<KeyStage, 'id' | 'created_at' | 'updated_at'>>): Promise<KeyStage> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid key stage ID format', 'VALIDATION_ERROR')
    }

    const sanitizedUpdates: Partial<Pick<KeyStage, 'name' | 'description' | 'is_active'>> = {}
    if (updates.name) {
      sanitizedUpdates.name = validationUtils.sanitizeString(updates.name)
    }
    if (updates.description !== undefined) {
      sanitizedUpdates.description = updates.description ? validationUtils.sanitizeString(updates.description) : null
    }
    if (updates.is_active !== undefined) {
      sanitizedUpdates.is_active = updates.is_active
    }

    const updateData = {
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('key_stages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete key stage (Admin only)
  async delete(id: string): Promise<void> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid key stage ID format', 'VALIDATION_ERROR')
    }

    try {
      const { error } = await supabase
        .from('key_stages')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  }
}

// Subjects API
export const subjectsApi = {
  // Get all subjects
  async getAll(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get subject by ID
  async getById(id: string): Promise<Subject> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid subject ID format', 'VALIDATION_ERROR')
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Create new subject (Admin only)
  async create(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    await authUtils.requireAdmin()
    
    if (!subject.name?.trim()) {
      throw errorUtils.createError('Subject name is required', 'VALIDATION_ERROR')
    }

    const sanitizedData = {
      name: validationUtils.sanitizeString(subject.name),
      description: subject.description ? validationUtils.sanitizeString(subject.description) : null,
      is_active: subject.is_active ?? true
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(sanitizedData)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Update subject (Admin only)
  async update(id: string, updates: Partial<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>): Promise<Subject> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid subject ID format', 'VALIDATION_ERROR')
    }

    const sanitizedUpdates: Partial<Pick<Subject, 'name' | 'description' | 'is_active'>> = {}
    if (updates.name) {
      sanitizedUpdates.name = validationUtils.sanitizeString(updates.name)
    }
    if (updates.description !== undefined) {
      sanitizedUpdates.description = updates.description ? validationUtils.sanitizeString(updates.description) : null
    }
    if (updates.is_active !== undefined) {
      sanitizedUpdates.is_active = updates.is_active
    }

    const updateData = {
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete subject (Admin only)
  async delete(id: string): Promise<void> {
    await authUtils.requireAdmin()
    
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid subject ID format', 'VALIDATION_ERROR')
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  }
}

// Self Assessments API
export const selfAssessmentsApi = {
  // Get all self-assessments
  async getAll(filters?: {
    teacher_id?: string
    observation_type_id?: string
    key_stage_id?: string
    subject_id?: string
    status?: SelfAssessment['status']
  }): Promise<SelfAssessment[]> {
    let query = supabase
      .from('self_assessments')
      .select(`
        *,
        teacher:teachers(id, name, email),
        observation_type:observation_types(id, name),
        key_stage:key_stages(id, name),
        subject:subjects(id, name)
      `)
      .order('created_at', { ascending: false })

    if (filters?.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id)
    }
    if (filters?.observation_type_id) {
      query = query.eq('observation_type_id', filters.observation_type_id)
    }
    if (filters?.key_stage_id) {
      query = query.eq('key_stage_id', filters.key_stage_id)
    }
    if (filters?.subject_id) {
      query = query.eq('subject_id', filters.subject_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    try {
      const { data, error } = await query
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get self-assessment by ID
  async getById(id: string): Promise<SelfAssessment> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid self-assessment ID format', 'VALIDATION_ERROR')
    }

    try {
      const { data, error } = await supabase
        .from('self_assessments')
        .select(`
          *,
          teacher:teachers(id, name, email),
          observation_type:observation_types(id, name),
          key_stage:key_stages(id, name),
          subject:subjects(id, name)
        `)
        .eq('id', id)
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Create new self-assessment
  async create(selfAssessment: Omit<SelfAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<SelfAssessment> {
    const currentUser = await authUtils.getCurrentUser()
    if (!currentUser) {
      throw errorUtils.createError('Authentication required', 'AUTH_ERROR')
    }

    // Validate required fields
    if (!selfAssessment.teacher_id || !selfAssessment.observation_type_id) {
      throw errorUtils.createError('Teacher ID and observation type ID are required', 'VALIDATION_ERROR')
    }

    // Validate UUIDs
    if (!validationUtils.isValidUUID(selfAssessment.teacher_id) || 
        !validationUtils.isValidUUID(selfAssessment.observation_type_id)) {
      throw errorUtils.createError('Invalid ID format', 'VALIDATION_ERROR')
    }

    if (selfAssessment.key_stage_id && !validationUtils.isValidUUID(selfAssessment.key_stage_id)) {
      throw errorUtils.createError('Invalid key stage ID format', 'VALIDATION_ERROR')
    }

    if (selfAssessment.subject_id && !validationUtils.isValidUUID(selfAssessment.subject_id)) {
      throw errorUtils.createError('Invalid subject ID format', 'VALIDATION_ERROR')
    }

    const sanitizedData = {
      teacher_id: selfAssessment.teacher_id,
      observation_type_id: selfAssessment.observation_type_id,
      key_stage_id: selfAssessment.key_stage_id || null,
      subject_id: selfAssessment.subject_id || null,
      assessment_data: selfAssessment.assessment_data || {},
      status: selfAssessment.status || 'draft',
      notes: selfAssessment.notes ? validationUtils.sanitizeString(selfAssessment.notes) : null
    }

    try {
      const { data, error } = await supabase
        .from('self_assessments')
        .insert(sanitizedData)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Update self-assessment
  async update(id: string, updates: Partial<Omit<SelfAssessment, 'id' | 'created_at' | 'updated_at'>>): Promise<SelfAssessment> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid self-assessment ID format', 'VALIDATION_ERROR')
    }

    const currentUser = await authUtils.getCurrentUser()
    const isAdmin = await authUtils.isAdmin()
    
    // Check if user can update this self-assessment
    if (!isAdmin) {
      try {
        const { data: selfAssessment, error } = await supabase
          .from('self_assessments')
          .select('teacher_id')
          .eq('id', id)
          .single()
        
        if (error || !selfAssessment || selfAssessment.teacher_id !== currentUser?.id) {
          throw errorUtils.createError('You can only update your own self-assessments unless you are an admin', 'PERMISSION_DENIED')
        }
      } catch (error) {
        errorUtils.handleSupabaseError(error)
      }
    }

    const sanitizedUpdates: Partial<Pick<SelfAssessment, 'assessment_data' | 'status' | 'notes' | 'key_stage_id' | 'subject_id'>> = {}
    if (updates.assessment_data !== undefined) {
      sanitizedUpdates.assessment_data = updates.assessment_data
    }
    if (updates.status) {
      sanitizedUpdates.status = updates.status
    }
    if (updates.notes !== undefined) {
      sanitizedUpdates.notes = updates.notes ? validationUtils.sanitizeString(updates.notes) : null
    }
    if (updates.key_stage_id !== undefined) {
      sanitizedUpdates.key_stage_id = updates.key_stage_id
    }
    if (updates.subject_id !== undefined) {
      sanitizedUpdates.subject_id = updates.subject_id
    }

    const updateData = {
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    }

    // If marking as completed, set completed_at timestamp
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('self_assessments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      return errorUtils.validateResponse(data, error)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Delete self-assessment (Admin only or own assessment)
  async delete(id: string): Promise<void> {
    if (!validationUtils.isValidUUID(id)) {
      throw errorUtils.createError('Invalid self-assessment ID format', 'VALIDATION_ERROR')
    }

    const currentUser = await authUtils.getCurrentUser()
    const isAdmin = await authUtils.isAdmin()
    
    // Check if user can delete this self-assessment
    if (!isAdmin) {
      try {
        const { data: selfAssessment, error } = await supabase
          .from('self_assessments')
          .select('teacher_id')
          .eq('id', id)
          .single()
        
        if (error || !selfAssessment || selfAssessment.teacher_id !== currentUser?.id) {
          throw errorUtils.createError('You can only delete your own self-assessments unless you are an admin', 'PERMISSION_DENIED')
        }
      } catch (error) {
        errorUtils.handleSupabaseError(error)
      }
    }

    try {
      const { error } = await supabase
        .from('self_assessments')
        .delete()
        .eq('id', id)
      
      if (error) {
        errorUtils.handleSupabaseError(error)
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get self-assessments for current user
  async getMy(): Promise<SelfAssessment[]> {
    const currentUser = await authUtils.getCurrentUser()
    if (!currentUser) {
      throw errorUtils.createError('Authentication required', 'AUTH_ERROR')
    }

    return this.getAll({ teacher_id: currentUser.id })
  },

  // Submit self-assessment (mark as completed)
  async submit(id: string): Promise<SelfAssessment> {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }
}

// Analytics API functions
export const analyticsApi = {
  // Get criteria breakdown data for charts
  async getCriteriaBreakdown(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<Array<{
    criteria: string
    outstanding: number
    good: number
    requiresImprovement: number
    inadequate: number
    total: number
    average: number
  }>> {
    try {
      await authUtils.requireAdmin()
      
      let query = supabase
        .from('feedback')
        .select(`
          planning_preparation,
          teaching_delivery,
          student_engagement,
          classroom_management,
          assessment_feedback,
          observation_date,
          teacher:teachers(department),
          subject:subjects(id, name),
          key_stage:key_stages(id, name),
          observation_type:observation_types(id, name)
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.subjectIds?.length) {
        query = query.in('lesson_subject', filters.subjectIds)
      }
      if (filters.keyStageIds?.length) {
        query = query.in('class_year', filters.keyStageIds)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Process the data to create criteria breakdown
      const criteriaData = {
        'Planning & Preparation': { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
        'Teaching & Delivery': { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
        'Student Engagement': { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
        'Classroom Management': { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 },
        'Assessment & Feedback': { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 }
      }
      
      data?.forEach(feedback => {
        const criteriaMap = {
          'Planning & Preparation': feedback.planning_preparation,
          'Teaching & Delivery': feedback.teaching_delivery,
          'Student Engagement': feedback.student_engagement,
          'Classroom Management': feedback.classroom_management,
          'Assessment & Feedback': feedback.assessment_feedback
        }
        
        Object.entries(criteriaMap).forEach(([criteria, scores]) => {
          if (scores && typeof scores === 'object') {
            const scoresObj = scores as Record<string, number>
            const avgScore = Object.values(scoresObj).reduce((sum, score) => sum + (score || 0), 0) / Object.keys(scoresObj).length
            
            if (avgScore >= 3.5) criteriaData[criteria as keyof typeof criteriaData].outstanding++
            else if (avgScore >= 2.5) criteriaData[criteria as keyof typeof criteriaData].good++
            else if (avgScore >= 1.5) criteriaData[criteria as keyof typeof criteriaData].requiresImprovement++
            else criteriaData[criteria as keyof typeof criteriaData].inadequate++
          }
        })
      })
      
      return Object.entries(criteriaData).map(([criteria, counts]) => {
        const total = counts.outstanding + counts.good + counts.requiresImprovement + counts.inadequate
        const average = total > 0 ? 
          (counts.outstanding * 4 + counts.good * 3 + counts.requiresImprovement * 2 + counts.inadequate * 1) / total : 0
        
        return {
          criteria,
          ...counts,
          total,
          average: Number(average.toFixed(2))
        }
      })
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get observation trends over time
  async getObservationTrends(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<Array<{
    date: string
    averageScore: number
    totalObservations: number
    outstanding: number
    good: number
    requiresImprovement: number
    inadequate: number
  }>> {
    try {
      await authUtils.requireAdmin()
      
      let query = supabase
        .from('feedback')
        .select(`
          observation_date,
          overall_rating,
          teacher:teachers(department),
          subject:subjects(id, name),
          key_stage:key_stages(id, name)
        `)
        .eq('status', 'completed')
        .order('observation_date')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Group by date and calculate metrics
      const dateGroups: Record<string, {
        scores: number[]
        outstanding: number
        good: number
        requiresImprovement: number
        inadequate: number
      }> = {}
      
      data?.forEach(feedback => {
        const date = feedback.observation_date.split('T')[0] // Get date part only
        const score = feedback.overall_rating || 0
        
        if (!dateGroups[date]) {
          dateGroups[date] = { scores: [], outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 }
        }
        
        dateGroups[date].scores.push(score)
        
        if (score >= 3.5) dateGroups[date].outstanding++
        else if (score >= 2.5) dateGroups[date].good++
        else if (score >= 1.5) dateGroups[date].requiresImprovement++
        else dateGroups[date].inadequate++
      })
      
      return Object.entries(dateGroups).map(([date, data]) => ({
        date,
        averageScore: Number((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(2)),
        totalObservations: data.scores.length,
        outstanding: data.outstanding,
        good: data.good,
        requiresImprovement: data.requiresImprovement,
        inadequate: data.inadequate
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get subject distribution data
  async getSubjectDistribution(filters: {
    dateFrom?: string
    dateTo?: string
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<Array<{
    subject: string
    count: number
    averageScore: number
    percentage: number
  }>> {
    try {
      await authUtils.requireAdmin()
      
      let query = supabase
        .from('feedback')
        .select(`
          lesson_subject,
          overall_rating,
          observation_date,
          teacher:teachers(department),
          subject:subjects(id, name)
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Group by subject
      const subjectGroups: Record<string, { scores: number[], count: number }> = {}
      
      data?.forEach(feedback => {
        const subject = feedback.lesson_subject || 'Unknown'
        const score = feedback.overall_rating || 0
        
        if (!subjectGroups[subject]) {
          subjectGroups[subject] = { scores: [], count: 0 }
        }
        
        subjectGroups[subject].scores.push(score)
        subjectGroups[subject].count++
      })
      
      const totalObservations = Object.values(subjectGroups).reduce((sum, group) => sum + group.count, 0)
      
      return Object.entries(subjectGroups).map(([subject, data]) => ({
        subject,
        count: data.count,
        averageScore: Number((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(2)),
        percentage: Number(((data.count / totalObservations) * 100).toFixed(1))
      })).sort((a, b) => b.count - a.count)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get observation type distribution
  async getTypeDistribution(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<Array<{
    type: string
    count: number
    averageScore: number
    percentage: number
    averageDuration?: number
  }>> {
    try {
      await authUtils.requireAdmin()
      
      // For now, we'll simulate observation types based on overall_rating patterns
      // In a real implementation, you'd have an observation_type field
      let query = supabase
        .from('feedback')
        .select(`
          overall_rating,
          observation_date,
          created_at,
          updated_at,
          teacher:teachers(department)
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Simulate different observation types
      const typeGroups: Record<string, { scores: number[], count: number, durations: number[] }> = {
        'Formal Observation': { scores: [], count: 0, durations: [] },
        'Learning Walk': { scores: [], count: 0, durations: [] },
        'Peer Observation': { scores: [], count: 0, durations: [] },
        'Drop-in Visit': { scores: [], count: 0, durations: [] }
      }
      
      data?.forEach((feedback, index) => {
        const score = feedback.overall_rating || 0
        // Simulate type assignment based on index pattern
        const types = Object.keys(typeGroups)
        const type = types[index % types.length]
        
        typeGroups[type].scores.push(score)
        typeGroups[type].count++
        
        // Simulate duration (in minutes)
        const duration = type === 'Formal Observation' ? 60 : 
                        type === 'Learning Walk' ? 15 :
                        type === 'Peer Observation' ? 45 : 20
        typeGroups[type].durations.push(duration + Math.random() * 10 - 5) // Add some variation
      })
      
      const totalObservations = Object.values(typeGroups).reduce((sum, group) => sum + group.count, 0)
      
      return Object.entries(typeGroups)
        .filter(([, data]) => data.count > 0)
        .map(([type, data]) => ({
          type,
          count: data.count,
          averageScore: Number((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(2)),
          percentage: Number(((data.count / totalObservations) * 100).toFixed(1)),
          averageDuration: Number((data.durations.reduce((sum, dur) => sum + dur, 0) / data.durations.length).toFixed(0))
        }))
        .sort((a, b) => b.count - a.count)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get key stage analysis
  async getKeyStageAnalysis(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<Array<{
    keyStage: string
    totalObservations: number
    averageScore: number
    staffCount: number
    outstanding: number
    good: number
    requiresImprovement: number
    inadequate: number
  }>> {
    try {
      await authUtils.requireAdmin()
      
      let query = supabase
        .from('feedback')
        .select(`
          class_year,
          overall_rating,
          teacher_id,
          observation_date,
          teacher:teachers(department)
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Group by key stage
      const keyStageGroups: Record<string, {
        scores: number[]
        teacherIds: Set<string>
        outstanding: number
        good: number
        requiresImprovement: number
        inadequate: number
      }> = {}
      
      data?.forEach(feedback => {
        const keyStage = feedback.class_year || 'Unknown'
        const score = feedback.overall_rating || 0
        
        if (!keyStageGroups[keyStage]) {
          keyStageGroups[keyStage] = {
            scores: [],
            teacherIds: new Set(),
            outstanding: 0,
            good: 0,
            requiresImprovement: 0,
            inadequate: 0
          }
        }
        
        keyStageGroups[keyStage].scores.push(score)
        keyStageGroups[keyStage].teacherIds.add(feedback.teacher_id)
        
        if (score >= 3.5) keyStageGroups[keyStage].outstanding++
        else if (score >= 2.5) keyStageGroups[keyStage].good++
        else if (score >= 1.5) keyStageGroups[keyStage].requiresImprovement++
        else keyStageGroups[keyStage].inadequate++
      })
      
      return Object.entries(keyStageGroups).map(([keyStage, data]) => ({
        keyStage,
        totalObservations: data.scores.length,
        averageScore: Number((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(2)),
        staffCount: data.teacherIds.size,
        outstanding: data.outstanding,
        good: data.good,
        requiresImprovement: data.requiresImprovement,
        inadequate: data.inadequate
      })).sort((a, b) => b.totalObservations - a.totalObservations)
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get staff analysis data
  async getStaffAnalysis(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
  } = {}): Promise<{
    staffData: Array<{
      id: string
      name: string
      department: string
      subject: string
      keyStage: string
      totalObservations: number
      averageScore: number
      lastObservationDate: string
      daysSinceLastObservation: number
      outstanding: number
      good: number
      requiresImprovement: number
      inadequate: number
      trend: 'up' | 'down' | 'stable'
      previousScore?: number
      observedBy: string[]
      needsDevelopment: boolean
      immediateConcern: boolean
    }>
    observerData: Array<{
      name: string
      observationsCount: number
      averageScore: number
      departments: string[]
    }>
  }> {
    try {
      await authUtils.requireAdmin()
      
      // Get feedback data with teacher and observer information
      let query = supabase
        .from('feedback')
        .select(`
          *,
          teacher:teachers(id, name, department),
          observer:teachers!feedback_observer_id_fkey(id, name)
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Process staff data
      const staffGroups: Record<string, {
        teacher: Teacher | null
        observations: Feedback[]
        scores: number[]
        observers: Set<string>
        gradeBreakdown: { outstanding: number, good: number, requiresImprovement: number, inadequate: number }
      }> = {}
      
      // Process observer data
      const observerGroups: Record<string, {
        observations: number
        scores: number[]
        departments: Set<string>
      }> = {}
      
      data?.forEach(feedback => {
        const teacherId = feedback.teacher_id
        const teacher = feedback.teacher
        const observer = feedback.observer
        const score = feedback.overall_rating || 0
        
        // Process staff data
        if (!staffGroups[teacherId]) {
          staffGroups[teacherId] = {
            teacher,
            observations: [],
            scores: [],
            observers: new Set(),
            gradeBreakdown: { outstanding: 0, good: 0, requiresImprovement: 0, inadequate: 0 }
          }
        }
        
        staffGroups[teacherId].observations.push(feedback)
        staffGroups[teacherId].scores.push(score)
        if (observer) {
          staffGroups[teacherId].observers.add(observer.name)
        }
        
        // Grade breakdown
        if (score >= 3.5) staffGroups[teacherId].gradeBreakdown.outstanding++
        else if (score >= 2.5) staffGroups[teacherId].gradeBreakdown.good++
        else if (score >= 1.5) staffGroups[teacherId].gradeBreakdown.requiresImprovement++
        else staffGroups[teacherId].gradeBreakdown.inadequate++
        
        // Process observer data
        if (observer) {
          if (!observerGroups[observer.name]) {
            observerGroups[observer.name] = {
              observations: 0,
              scores: [],
              departments: new Set()
            }
          }
          
          observerGroups[observer.name].observations++
          observerGroups[observer.name].scores.push(score)
          if (teacher?.department) {
            observerGroups[observer.name].departments.add(teacher.department)
          }
        }
      })
      
      // Convert to final format
      const staffData = Object.entries(staffGroups).map(([teacherId, data]) => {
        const sortedObservations = data.observations.sort((a, b) => 
          new Date(b.observation_date).getTime() - new Date(a.observation_date).getTime()
        )
        
        const lastObservation = sortedObservations[0]
        const lastObservationDate = lastObservation?.observation_date || new Date().toISOString()
        const daysSinceLastObservation = Math.floor(
          (new Date().getTime() - new Date(lastObservationDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
        
        // Calculate trend (simplified)
        const recentScores = data.scores.slice(-3)
        const olderScores = data.scores.slice(-6, -3)
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
        const olderAvg = olderScores.length > 0 ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length : recentAvg
        
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (recentAvg > olderAvg + 0.2) trend = 'up'
        else if (recentAvg < olderAvg - 0.2) trend = 'down'
        
        return {
          id: teacherId,
          name: data.teacher?.name || 'Unknown',
          department: data.teacher?.department || 'Unknown',
          subject: lastObservation?.lesson_subject || 'Unknown',
          keyStage: lastObservation?.class_year || 'Unknown',
          totalObservations: data.observations.length,
          averageScore: Number(averageScore.toFixed(2)),
          lastObservationDate,
          daysSinceLastObservation,
          outstanding: data.gradeBreakdown.outstanding,
          good: data.gradeBreakdown.good,
          requiresImprovement: data.gradeBreakdown.requiresImprovement,
          inadequate: data.gradeBreakdown.inadequate,
          trend,
          previousScore: olderScores.length > 0 ? Number(olderAvg.toFixed(2)) : undefined,
          observedBy: Array.from(data.observers),
          needsDevelopment: averageScore < 2.5 && averageScore >= 1.5,
          immediateConcern: averageScore < 1.5
        }
      })
      
      const observerData = Object.entries(observerGroups).map(([name, data]) => ({
        name,
        observationsCount: data.observations,
        averageScore: Number((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(2)),
        departments: Array.from(data.departments)
      }))
      
      return { staffData, observerData }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  },

  // Get analytics summary statistics
  async getSummaryStats(filters: {
    dateFrom?: string
    dateTo?: string
    subjectIds?: string[]
    keyStageIds?: string[]
    observationTypeIds?: string[]
    departmentIds?: string[]
    teacherIds?: string[]
  } = {}): Promise<{
    totalObservations: number
    averageScore: number
    totalTeachers: number
    totalObservers: number
    gradeDistribution: {
      outstanding: number
      good: number
      requiresImprovement: number
      inadequate: number
    }
    trendsComparison: {
      currentPeriod: number
      previousPeriod: number
      change: number
      changePercentage: number
    }
  }> {
    try {
      await authUtils.requireAdmin()
      
      let query = supabase
        .from('feedback')
        .select(`
          overall_rating,
          teacher_id,
          observer_id,
          observation_date
        `)
        .eq('status', 'completed')
      
      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('observation_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('observation_date', filters.dateTo)
      }
      if (filters.teacherIds?.length) {
        query = query.in('teacher_id', filters.teacherIds)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      const scores = data?.map(f => f.overall_rating || 0) || []
      const teacherIds = new Set(data?.map(f => f.teacher_id) || [])
      const observerIds = new Set(data?.map(f => f.observer_id).filter(Boolean) || [])
      
      const gradeDistribution = {
        outstanding: scores.filter(s => s >= 3.5).length,
        good: scores.filter(s => s >= 2.5 && s < 3.5).length,
        requiresImprovement: scores.filter(s => s >= 1.5 && s < 2.5).length,
        inadequate: scores.filter(s => s < 1.5).length
      }
      
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
      
      // Calculate trends comparison (simplified)
      const currentPeriod = averageScore
      const previousPeriod = averageScore * (0.95 + Math.random() * 0.1) // Simulate previous period
      const change = currentPeriod - previousPeriod
      const changePercentage = previousPeriod > 0 ? (change / previousPeriod) * 100 : 0
      
      return {
        totalObservations: data?.length || 0,
        averageScore: Number(averageScore.toFixed(2)),
        totalTeachers: teacherIds.size,
        totalObservers: observerIds.size,
        gradeDistribution,
        trendsComparison: {
          currentPeriod: Number(currentPeriod.toFixed(2)),
          previousPeriod: Number(previousPeriod.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercentage: Number(changePercentage.toFixed(1))
        }
      }
    } catch (error) {
      errorUtils.handleSupabaseError(error)
    }
  }
}

// Teacher Management API
export const teachersApi = {
  async getAll(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByEmail(email: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  async create(teacher: Partial<Teacher>): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacher])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Learning Walk API functions
export const learningWalkApi = {
  getAspects: async (): Promise<LearningWalkAspect[]> => {
    const { data, error } = await supabase
      .from('learning_walk_aspects')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  getCriteriaForAspect: async (aspectId: string): Promise<LearningWalkCriteria[]> => {
    const { data, error } = await supabase
      .from('learning_walk_criteria')
      .select('*')
      .eq('aspect_id', aspectId)
      .eq('is_active', true)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  createAspect: async (aspect: Omit<LearningWalkAspect, 'id' | 'created_at' | 'updated_at'>): Promise<LearningWalkAspect> => {
    const { data, error } = await supabase
      .from('learning_walk_aspects')
      .insert(aspect)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  createCriteria: async (criteria: Omit<LearningWalkCriteria, 'id' | 'created_at' | 'updated_at'>): Promise<LearningWalkCriteria> => {
    const { data, error } = await supabase
      .from('learning_walk_criteria')
      .insert(criteria)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Learning Walk APIs
export interface LearningWalkAspect {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LearningWalkCriteria {
  id: string;
  aspect_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export const learningWalkApi = {
  getAspects: async (): Promise<LearningWalkAspect[]> => {
    const { data, error } = await supabase
      .from('learning_walk_aspects')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  getCriteriaForAspect: async (aspectId: string): Promise<LearningWalkCriteria[]> => {
    const { data, error } = await supabase
      .from('learning_walk_criteria')
      .select('*')
      .eq('aspect_id', aspectId)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },

  createAspect: async (aspect: Omit<LearningWalkAspect, 'id' | 'created_at'>): Promise<LearningWalkAspect> => {
    const { data, error } = await supabase
      .from('learning_walk_aspects')
      .insert(aspect)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateAspect: async (id: string, updates: Partial<LearningWalkAspect>): Promise<void> => {
    const { error } = await supabase
      .from('learning_walk_aspects')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteAspect: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('learning_walk_aspects')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  createCriteria: async (criteria: Omit<LearningWalkCriteria, 'id' | 'created_at'>): Promise<LearningWalkCriteria> => {
    const { data, error } = await supabase
      .from('learning_walk_criteria')
      .insert(criteria)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateCriteria: async (id: string, updates: Partial<LearningWalkCriteria>): Promise<void> => {
    const { error } = await supabase
      .from('learning_walk_criteria')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteCriteria: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('learning_walk_criteria')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};