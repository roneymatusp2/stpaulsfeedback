-- Add optional teacher profile fields: title, subjects taught, key stages
ALTER TABLE IF EXISTS public.teachers
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS key_stages text[] DEFAULT '{}';

-- Update Sam Bishop's official title and teaching subjects
UPDATE public.teachers
SET 
  title = 'Assistant Head – Learning & Teaching',
  department = 'Teaching & Learning',
  subjects = ARRAY['IB History','IGCSE History','KS3 History'],
  key_stages = ARRAY['KS3','KS4','IB'],
  updated_at = NOW()
WHERE email = 'sb8@stpauls.br';


