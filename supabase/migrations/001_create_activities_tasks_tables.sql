-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.teachers(id),
    assigned_to UUID[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.teachers(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_priority ON public.activities(priority);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON public.activities(created_by);
CREATE INDEX IF NOT EXISTS idx_activities_dates ON public.activities(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_tasks_activity_id ON public.tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities
CREATE POLICY "Activities are viewable by authenticated users" ON public.activities
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Activities are manageable by admins" ON public.activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teachers 
            WHERE teachers.id = auth.uid() 
            AND teachers.is_admin = true 
            AND teachers.active = true
        )
    );

-- Create RLS policies for tasks
CREATE POLICY "Tasks are viewable by authenticated users" ON public.tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tasks are manageable by admins" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teachers 
            WHERE teachers.id = auth.uid() 
            AND teachers.is_admin = true 
            AND teachers.active = true
        )
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.activities TO anon;
GRANT ALL PRIVILEGES ON public.activities TO authenticated;
GRANT SELECT ON public.tasks TO anon;
GRANT ALL PRIVILEGES ON public.tasks TO authenticated;

-- Create activity_tasks view for easier querying
CREATE OR REPLACE VIEW public.activity_tasks_summary AS
SELECT 
    a.id as activity_id,
    a.title as activity_title,
    a.description as activity_description,
    a.status as activity_status,
    a.priority as activity_priority,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    a.created_at,
    a.updated_at
FROM public.activities a
LEFT JOIN public.tasks t ON a.id = t.activity_id
GROUP BY a.id, a.title, a.description, a.status, a.priority, a.created_at, a.updated_at;

GRANT SELECT ON public.activity_tasks_summary TO authenticated;
GRANT SELECT ON public.activity_tasks_summary TO anon;