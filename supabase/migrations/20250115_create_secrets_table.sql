-- Create secrets table and get_secret function for storing API keys

-- Create secrets table to store API keys securely
CREATE TABLE IF NOT EXISTS public.secrets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on secrets table
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access secrets
CREATE POLICY "Service role can access secrets" ON public.secrets
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to read secrets (for frontend use)
CREATE POLICY "Authenticated users can read secrets" ON public.secrets
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to get secret by name
CREATE OR REPLACE FUNCTION public.get_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    secret_value TEXT;
BEGIN
    SELECT value INTO secret_value
    FROM public.secrets
    WHERE name = secret_name;
    
    RETURN secret_value;
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_secret(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secret(TEXT) TO anon;

-- Insert the OPENAI_FEEDBACK key (you'll need to update this with the actual key)
INSERT INTO public.secrets (name, value) 
VALUES ('OPENAI_FEEDBACK', 'REDACTED')
ON CONFLICT (name) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Grant permissions to the secrets table
GRANT SELECT ON public.secrets TO authenticated;
GRANT SELECT ON public.secrets TO anon;
GRANT ALL PRIVILEGES ON public.secrets TO service_role;