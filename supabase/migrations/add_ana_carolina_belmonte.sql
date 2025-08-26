-- Check if Ana Carolina Belmonte exists and create/update her record with teacher and admin permissions

-- First, check if the user exists in the teachers table
DO $$
BEGIN
    -- Check if Ana Carolina Belmonte already exists
    IF EXISTS (SELECT 1 FROM teachers WHERE email = 'acb@stpauls.br') THEN
        -- Update existing record to ensure admin permissions
        UPDATE teachers 
        SET 
            name = 'Ana Carolina Belmonte',
            department = 'Administration',
            active = true,
            is_admin = true,
            admin_role = 'admin',
            updated_at = NOW()
        WHERE email = 'acb@stpauls.br';
        
        RAISE NOTICE 'Updated Ana Carolina Belmonte with admin permissions';
    ELSE
        -- Insert new record for Ana Carolina Belmonte
        INSERT INTO teachers (
            name,
            email,
            department,
            active,
            is_admin,
            admin_role,
            created_at,
            updated_at
        ) VALUES (
            'Ana Carolina Belmonte',
            'acb@stpauls.br',
            'Administration',
            true,
            true,
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new record for Ana Carolina Belmonte with admin permissions';
    END IF;
END $$;

-- Verify the record exists with correct permissions
SELECT 
    id,
    name,
    email,
    department,
    active,
    is_admin,
    admin_role,
    created_at,
    updated_at
FROM teachers 
WHERE email = 'acb@stpauls.br';