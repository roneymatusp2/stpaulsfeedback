/*
  # Create Learning Walk System

  1. New Tables
    - `learning_walk_aspects`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    - `learning_walk_criteria`
      - `id` (uuid, primary key)
      - `aspect_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `order_index` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin management

  3. Initial Data
    - Subject knowledge and subject pedagogies aspect with 7 criteria
    - Quality of instruction aspect with 8 criteria
*/

-- Create learning_walk_aspects table
CREATE TABLE IF NOT EXISTS learning_walk_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create learning_walk_criteria table
CREATE TABLE IF NOT EXISTS learning_walk_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspect_id uuid NOT NULL REFERENCES learning_walk_aspects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE learning_walk_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_walk_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_walk_aspects
CREATE POLICY "Public can read learning walk aspects"
  ON learning_walk_aspects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage aspects"
  ON learning_walk_aspects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for learning_walk_criteria
CREATE POLICY "Public can read learning walk criteria"
  ON learning_walk_criteria
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage criteria"
  ON learning_walk_criteria
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial aspects
INSERT INTO learning_walk_aspects (name, description) VALUES 
('Subject knowledge and subject pedagogies', 'Teacher knowledge and understanding of subject content and teaching methods'),
('Quality of instruction', 'Effectiveness of teaching delivery and instructional practices')
ON CONFLICT (name) DO NOTHING;

-- Get aspect IDs for inserting criteria
DO $$
DECLARE
    subject_knowledge_id uuid;
    quality_instruction_id uuid;
BEGIN
    -- Get aspect IDs
    SELECT id INTO subject_knowledge_id FROM learning_walk_aspects WHERE name = 'Subject knowledge and subject pedagogies';
    SELECT id INTO quality_instruction_id FROM learning_walk_aspects WHERE name = 'Quality of instruction';
    
    -- Insert criteria for Subject knowledge and subject pedagogies
    INSERT INTO learning_walk_criteria (aspect_id, title, description, order_index) VALUES 
    (subject_knowledge_id, 'Teacher knowledge is secure', 'Teacher knowledge is secure allowing effective explanations of concepts', 1),
    (subject_knowledge_id, 'Students are interested in the topic', 'Students are interested in the topic and the teacher knowledge supports this engagement', 2),
    (subject_knowledge_id, 'Student misunderstandings are addressed', 'Student misunderstandings are addressed', 3),
    (subject_knowledge_id, 'Students can articulate their learning journey', 'Students can articulate their learning journey along a sequenced curriculum including the progress that they have made', 4),
    (subject_knowledge_id, 'Students can articulate subject-specific skills', 'Students can articulate subject-specific skills and knowledge that are important for the course', 5),
    (subject_knowledge_id, 'Teacher uses high standard of literacy', 'Teacher uses and promotes a high standard of literacy, articulacy and correct use of the language of instruction whatever the teacher''s specialist subject', 6),
    (subject_knowledge_id, 'Teacher promotes love of learning', 'Teacher promotes a love of learning and children''s intellectual curiosity', 7)
    ON CONFLICT DO NOTHING;
    
    -- Insert criteria for Quality of instruction
    INSERT INTO learning_walk_criteria (aspect_id, title, description, order_index) VALUES 
    (quality_instruction_id, 'Lessons begin with short review', 'Lessons begin with a short review of learning', 1),
    (quality_instruction_id, 'New information presented in small steps', 'New information is presented in small steps and pupils practice each step before more information is introduced', 2),
    (quality_instruction_id, 'Dual coding and analogies used', 'Dual coding and analogies are used to aid pupil memory', 3),
    (quality_instruction_id, 'Instructions are clear and detailed', 'Instructions are clear and detailed', 4),
    (quality_instruction_id, 'Students asked many questions', 'Students are asked many questions to assess their learning and material is re-taught when necessary', 5),
    (quality_instruction_id, 'Student practice is guided', 'Student practice is guided by models and worked examples', 6),
    (quality_instruction_id, 'Students challenged but supported', 'Students are challenged by the content but supported to achieve a high success rate', 7),
    (quality_instruction_id, 'Students work independently', 'Students work independently to practice new knowledge/skills following teacher input', 8)
    ON CONFLICT DO NOTHING;
END $$;