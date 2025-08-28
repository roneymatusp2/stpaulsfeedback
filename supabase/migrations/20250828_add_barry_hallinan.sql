-- Add or update teacher Barry Hallinan as an active admin
-- Ensures presence in teachers and admin roles using the provided email

INSERT INTO public.teachers (
  name,
  email,
  department,
  title,
  subjects,
  key_stages,
  active,
  is_admin,
  admin_role,
  created_at,
  updated_at
)
VALUES (
  'Barry Hallinan',
  LOWER('BJH@stpauls.br'),
  'Teaching & Learning',
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  TRUE,
  TRUE,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  title = EXCLUDED.title,
  subjects = EXCLUDED.subjects,
  key_stages = EXCLUDED.key_stages,
  active = TRUE,
  is_admin = TRUE,
  admin_role = EXCLUDED.admin_role,
  updated_at = NOW();


