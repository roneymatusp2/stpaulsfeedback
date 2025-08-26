-- Check if Sam Bishop exists and create/update his record with teacher and admin permissions

-- First, check if Sam Bishop already exists
DO $$
BEGIN
    -- Check if Sam Bishop exists
    IF NOT EXISTS (SELECT 1 FROM teachers WHERE email = 'sb8@stpauls.br') THEN
        -- Insert Sam Bishop if he doesn't exist
        INSERT INTO teachers (
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
            'Sam Bishop',
            'sb8@stpauls.br',
            'Teaching & Learning',
            'Assistant Head – Learning & Teaching',
            ARRAY['IB History','IGCSE History','KS3 History'],
            ARRAY['KS3','KS4','IB'],
            true,
            'admin',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Sam Bishop has been created successfully with teacher and admin permissions.';
    ELSE
        -- Update existing record to ensure correct permissions
        UPDATE teachers 
        SET 
            name = 'Sam Bishop',
            department = 'Teaching & Learning',
            title = 'Assistant Head – Learning & Teaching',
            subjects = ARRAY['IB History','IGCSE History','KS3 History'],
            key_stages = ARRAY['KS3','KS4','IB'],
            active = true,
            admin_role = 'admin',
            is_admin = true,
            updated_at = NOW()
        WHERE email = 'sb8@stpauls.br';
        
        RAISE NOTICE 'Sam Bishop record has been updated with teacher and admin permissions.';
    END IF;
END $$;

-- Verify the record was created/updated correctly
SELECT 
    id,
    name,
    email,
    department,
    active,
    admin_role,
    is_admin,
    created_at,
    updated_at
FROM teachers 
WHERE email = 'sb8@stpauls.br';

-- Also verify Ana Carolina Belmonte's record for comparison
SELECT 
    id,
    name,
    email,
    department,
    active,
    admin_role,
    is_admin,
    created_at,
    updated_at
FROM teachers 
WHERE email = 'acb@stpauls.br';