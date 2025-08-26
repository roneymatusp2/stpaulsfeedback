-- Migration: Add additional subjects from screenshots (safe version)
-- Created: 2024
-- Description: Adding BTEC, IB, IGCSE, KS3, KS4 and Core subjects in English with conflict handling

INSERT INTO subjects (name, description) VALUES
-- BTEC Subjects
('BTEC Creative Media Production', 'BTEC Creative Media Production course'),
('BTEC Music', 'BTEC Music course'),
('Design Skills plus Enterprise', 'Design Skills plus Enterprise course'),

-- Core Subjects
('Careers', 'Careers guidance and education'),
('Dance', 'Dance and movement studies'),
('Design & Technology', 'Design and Technology'),
('English', 'English language and literature'),
('French', 'French language studies'),
('Learning Support', 'Learning Support and Special Educational Needs'),
('Personal, Social and Health Education', 'Personal, Social and Health Education'),
('Physical Education', 'Physical Education and Sports'),
('Portuguese', 'Portuguese language studies'),
('Prep Music', 'Preparatory Music'),
('Science', 'General Science'),
('Self Assessment', 'Self Assessment and Reflection'),
('Spanish', 'Spanish language studies'),
('Tutorial', 'Tutorial and Pastoral Care'),

-- IB Subjects
('IB Biology', 'International Baccalaureate Biology'),
('IB Brazilian Social Studies', 'International Baccalaureate Brazilian Social Studies'),
('IB Business Management', 'International Baccalaureate Business Management'),
('IB CAS', 'International Baccalaureate Creativity, Activity, Service'),
('IB Chemistry', 'International Baccalaureate Chemistry'),
('IB Computer Science', 'International Baccalaureate Computer Science'),
('IB Economics', 'International Baccalaureate Economics'),
('IB English', 'International Baccalaureate English'),
('IB Env Sys Soc', 'International Baccalaureate Environmental Systems and Societies'),
('IB Extended Essay', 'International Baccalaureate Extended Essay'),
('IB Film', 'International Baccalaureate Film Studies'),
('IB French', 'International Baccalaureate French'),
('IB Geography', 'International Baccalaureate Geography'),
('IB Global Politics', 'International Baccalaureate Global Politics'),
('IB History', 'International Baccalaureate History'),
('IB Music', 'International Baccalaureate Music'),
('IB Physics', 'International Baccalaureate Physics'),
('IB Portuguese', 'International Baccalaureate Portuguese'),
('IB Portuguese B', 'International Baccalaureate Portuguese B'),
('IB Spanish', 'International Baccalaureate Spanish'),
('IB Theatre', 'International Baccalaureate Theatre'),
('IB Theory of Knowledge', 'International Baccalaureate Theory of Knowledge'),
('IB Vis Arts', 'International Baccalaureate Visual Arts'),

-- IGCSE Subjects
('IGCSE Art', 'IGCSE Art and Design'),
('IGCSE Biology', 'IGCSE Biology'),
('IGCSE Chemistry', 'IGCSE Chemistry'),
('IGCSE Computer Science', 'IGCSE Computer Science'),
('IGCSE Coord Biology', 'IGCSE Coordinated Biology'),
('IGCSE Coord Chemistry', 'IGCSE Coordinated Chemistry'),
('IGCSE Coord Physics', 'IGCSE Coordinated Physics'),
('IGCSE Drama', 'IGCSE Drama'),
('IGCSE English', 'IGCSE English Language'),
('IGCSE English Literature', 'IGCSE English Literature'),
('IGCSE French', 'IGCSE French'),
('IGCSE Geography', 'IGCSE Geography'),
('IGCSE Global Perspectives', 'IGCSE Global Perspectives'),
('IGCSE History', 'IGCSE History'),
('IGCSE Music', 'IGCSE Music'),
('IGCSE PE', 'IGCSE Physical Education'),
('IGCSE Physics', 'IGCSE Physics'),
('IGCSE Portuguese as a Foreign Language', 'IGCSE Portuguese as a Foreign Language'),
('IGCSE Spanish', 'IGCSE Spanish'),

-- KS3 Subjects
('KS3 Art', 'Key Stage 3 Art'),
('KS3 Computer Studies', 'Key Stage 3 Computer Studies'),
('KS3 Drama', 'Key Stage 3 Drama'),
('KS3 English', 'Key Stage 3 English'),
('KS3 French', 'Key Stage 3 French'),
('KS3 Geography', 'Key Stage 3 Geography'),
('KS3 History', 'Key Stage 3 History'),
('KS3 Music', 'Key Stage 3 Music'),
('KS3 Portuguese', 'Key Stage 3 Portuguese'),
('KS3 Portuguese Second Language', 'Key Stage 3 Portuguese as Second Language'),
('KS3 Science', 'Key Stage 3 Science'),

-- KS4 Subjects
('KS4 Portuguese', 'Key Stage 4 Portuguese'),
('KS4 Portuguese Literature', 'Key Stage 4 Portuguese Literature'),

-- Additional Subjects
('Brazilian Social Studies', 'Brazilian Social Studies')
ON CONFLICT (name) DO NOTHING;