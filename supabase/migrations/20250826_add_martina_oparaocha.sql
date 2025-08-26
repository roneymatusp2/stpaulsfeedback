-- Ensure teacher record for Martina Oparaocha exists with correct title and subjects
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE email = 'mo1@stpauls.br') THEN
        INSERT INTO public.teachers (
            name,
            email,
            department,
            title,
            subjects,
            key_stages,
            active,
            admin_role,
            is_admin,
            created_at,
            updated_at
        ) VALUES (
            'Martina Oparaocha',
            'mo1@stpauls.br',
            'Senior School',
            'Head of Senior School',
            ARRAY['IGCSE Global Perspectives'],
            ARRAY['KS4'],
            true,
            'teacher',
            false,
            NOW(),
            NOW()
        );
    ELSE
        UPDATE public.teachers
        SET 
            name = 'Martina Oparaocha',
            department = 'Senior School',
            title = 'Head of Senior School',
            subjects = ARRAY['IGCSE Global Perspectives'],
            key_stages = ARRAY['KS4'],
            active = true,
            admin_role = COALESCE(admin_role, 'teacher'),
            is_admin = COALESCE(is_admin, false),
            updated_at = NOW()
        WHERE email = 'mo1@stpauls.br';
    END IF;
END $$;

-- Verify
SELECT id, name, email, department, title, subjects, key_stages, active
FROM public.teachers
WHERE email = 'mo1@stpauls.br';


