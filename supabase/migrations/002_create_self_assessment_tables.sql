-- Create observation_types table
CREATE TABLE observation_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create key_stages table
CREATE TABLE key_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create self_assessments table
CREATE TABLE self_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    observation_type_id UUID REFERENCES observation_types(id),
    key_stage_id UUID REFERENCES key_stages(id),
    subject_id UUID REFERENCES subjects(id),
    assessment_date DATE NOT NULL,
    assessment_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default observation types
INSERT INTO observation_types (name, description) VALUES
('Senior School Learning Observation', 'Standard learning observation for senior school'),
('Senior School Learning Walk', 'Learning walk observation for senior school'),
('Senior School Self Assessment', 'Self-assessment for senior school teachers'),
('Senior School Support Plan', 'Support plan observation for senior school'),
('Senior School Peer Observation Reflection', 'Peer observation reflection for senior school');

-- Insert default key stages
INSERT INTO key_stages (name, description) VALUES
('Key Stage 3', 'Years 7-9'),
('Key Stage 4', 'Years 10-11'),
('Key Stage 5', 'Years 12-13'),
('Primary', 'Primary school years'),
('NA', 'Not applicable');

-- Insert default subjects
INSERT INTO subjects (name, description) VALUES
('Mathematics', 'Mathematics subject'),
('English Literature', 'English Literature subject'),
('Physics', 'Physics subject'),
('Chemistry', 'Chemistry subject'),
('Biology', 'Biology subject'),
('History', 'History subject'),
('Geography', 'Geography subject'),
('Art', 'Art subject'),
('Music', 'Music subject'),
('PE', 'Physical Education'),
('Computer Science', 'Computer Science subject'),
('Business Studies', 'Business Studies subject'),
('Economics', 'Economics subject'),
('Psychology', 'Psychology subject'),
('Sociology', 'Sociology subject'),
('Religious Studies', 'Religious Studies subject'),
('Modern Foreign Languages', 'Modern Foreign Languages'),
('Drama', 'Drama subject'),
('Design Technology', 'Design Technology subject'),
('Food Technology', 'Food Technology subject'),
('IB Maths', 'International Baccalaureate Mathematics'),
('IGCSE Maths', 'IGCSE Mathematics'),
('KS3 Maths', 'Key Stage 3 Mathematics');

-- Create indexes for better performance
CREATE INDEX idx_observation_types_active ON observation_types(is_active);
CREATE INDEX idx_key_stages_active ON key_stages(is_active);
CREATE INDEX idx_subjects_active ON subjects(is_active);
CREATE INDEX idx_self_assessments_teacher ON self_assessments(teacher_id);
CREATE INDEX idx_self_assessments_date ON self_assessments(assessment_date);
CREATE INDEX idx_self_assessments_status ON self_assessments(status);

-- Enable Row Level Security
ALTER TABLE observation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for observation_types
CREATE POLICY "observation_types_select_policy" ON observation_types
    FOR SELECT USING (true);

CREATE POLICY "observation_types_insert_policy" ON observation_types
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "observation_types_update_policy" ON observation_types
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "observation_types_delete_policy" ON observation_types
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for key_stages
CREATE POLICY "key_stages_select_policy" ON key_stages
    FOR SELECT USING (true);

CREATE POLICY "key_stages_insert_policy" ON key_stages
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "key_stages_update_policy" ON key_stages
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "key_stages_delete_policy" ON key_stages
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for subjects
CREATE POLICY "subjects_select_policy" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "subjects_insert_policy" ON subjects
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "subjects_update_policy" ON subjects
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "subjects_delete_policy" ON subjects
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for self_assessments
CREATE POLICY "self_assessments_select_policy" ON self_assessments
    FOR SELECT USING (
        auth.uid()::text = teacher_id::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "self_assessments_insert_policy" ON self_assessments
    FOR INSERT WITH CHECK (
        auth.uid()::text = teacher_id::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "self_assessments_update_policy" ON self_assessments
    FOR UPDATE USING (
        auth.uid()::text = teacher_id::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "self_assessments_delete_policy" ON self_assessments
    FOR DELETE USING (
        auth.uid()::text = teacher_id::text OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON observation_types TO anon, authenticated;
GRANT SELECT ON key_stages TO anon, authenticated;
GRANT SELECT ON subjects TO anon, authenticated;
GRANT ALL PRIVILEGES ON self_assessments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON observation_types TO authenticated;
GRANT INSERT, UPDATE, DELETE ON key_stages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON subjects TO authenticated;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_observation_types_updated_at BEFORE UPDATE ON observation_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_key_stages_updated_at BEFORE UPDATE ON key_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_self_assessments_updated_at BEFORE UPDATE ON self_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();