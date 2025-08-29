/*
  # Create Learning Walk Aspects and Criteria Tables

  1. New Tables
    - `learning_walk_aspects`
      - `id` (uuid, primary key)
      - `name` (text, aspect name)
      - `description` (text, description)
      - `order_index` (integer, display order)
      - `is_active` (boolean, whether active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `learning_walk_criteria`
      - `id` (uuid, primary key)
      - `aspect_id` (uuid, foreign key to aspects)
      - `title` (text, criteria title)
      - `description` (text, criteria description)
      - `order_index` (integer, display order)
      - `is_active` (boolean, whether active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read and authenticated write
*/

CREATE TABLE IF NOT EXISTS learning_walk_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_walk_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspect_id uuid NOT NULL REFERENCES learning_walk_aspects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_walk_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_walk_criteria ENABLE ROW LEVEL SECURITY;

-- Policies for learning_walk_aspects
CREATE POLICY "Public can read learning walk aspects"
  ON learning_walk_aspects
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage learning walk aspects"
  ON learning_walk_aspects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for learning_walk_criteria  
CREATE POLICY "Public can read learning walk criteria"
  ON learning_walk_criteria
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage learning walk criteria"
  ON learning_walk_criteria
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial data for Learning Walk aspects
INSERT INTO learning_walk_aspects (name, description, order_index) VALUES
('Subject knowledge and subject pedagogies', 'Teacher knowledge and pedagogical expertise in their specialist subject', 1),
('Quality of instruction', 'Effective teaching methods and instructional practices', 2),
('Assessment for learning', 'Use of assessment to support and enhance student learning', 3),
('Behaviour for learning and student attitude', 'Classroom management and student engagement approaches', 4),
('Progress for all students', 'Ensuring all students make appropriate progress', 5),
('Literacy and Oracy', 'Development of reading, writing, speaking and listening skills', 6),
('General', 'Overall teaching effectiveness and classroom environment', 7),
('Metacognition and self-regulation', 'Teaching students to think about their own thinking and learning', 8),
('Deep Learning', 'Facilitating deep understanding and meaningful learning experiences', 9);

-- Insert initial criteria for "Subject knowledge and subject pedagogies"
DO $$
DECLARE
    subject_aspect_id uuid;
BEGIN
    SELECT id INTO subject_aspect_id FROM learning_walk_aspects WHERE name = 'Subject knowledge and subject pedagogies';
    
    INSERT INTO learning_walk_criteria (aspect_id, title, description, order_index) VALUES
    (subject_aspect_id, 'Teacher knowledge is secure', 'Teacher knowledge is secure allowing effective explanations of concepts', 1),
    (subject_aspect_id, 'Students are interested in the topic', 'Students are interested in the topic and the teacher knowledge supports this engagement', 2),
    (subject_aspect_id, 'Student misunderstandings are addressed', 'Student misunderstandings are addressed', 3),
    (subject_aspect_id, 'Students can articulate their learning journey', 'Students can articulate their learning journey along a sequenced curriculum including the progress that they have made', 4),
    (subject_aspect_id, 'Students can articulate subject-specific skills', 'Students can articulate subject-specific skills and knowledge that are important for the course', 5),
    (subject_aspect_id, 'High standard of literacy and language', 'Teacher uses and promotes a high standard of literacy, articulacy and correct use of the language of instruction whatever the teacher''s specialist subject', 6),
    (subject_aspect_id, 'Teacher promotes love of learning', 'Teacher promotes a love of learning and children''s intellectual curiosity', 7);
END $$;

-- Insert initial criteria for "Quality of instruction"
DO $$
DECLARE
    quality_aspect_id uuid;
BEGIN
    SELECT id INTO quality_aspect_id FROM learning_walk_aspects WHERE name = 'Quality of instruction';
    
    INSERT INTO learning_walk_criteria (aspect_id, title, description, order_index) VALUES
    (quality_aspect_id, 'Lessons begin with short review', 'Lessons begin with a short review of learning', 1),
    (quality_aspect_id, 'New information in small steps', 'New information is presented in small steps and students practice each step before more information is introduced', 2),
    (quality_aspect_id, 'Dual coding and analogies used', 'Dual coding and analogies are used to aid student memory', 3),
    (quality_aspect_id, 'Instructions are clear and detailed', 'Instructions are clear and detailed', 4),
    (quality_aspect_id, 'Students asked many questions', 'Students are asked many questions to assess their learning and material is re-taught when necessary', 5),
    (quality_aspect_id, 'Student practice is guided', 'Student practice is guided by models and worked examples', 6),
    (quality_aspect_id, 'Students challenged but supported', 'Students are challenged by the content but supported to achieve a high success rate', 7),
    (quality_aspect_id, 'Students work independently', 'Students work independently to practice new knowledge/skills following teacher input', 8),
    (quality_aspect_id, 'All students can explain learning', 'All students can explain their learning through a plenary activity at the end of the lesson', 9);
END $$;