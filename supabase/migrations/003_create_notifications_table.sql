-- Update notifications table to match the interface field names
-- Rename recipient_id to user_id and is_read to read

-- First, drop the existing foreign key constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

-- Rename the columns
ALTER TABLE notifications RENAME COLUMN recipient_id TO user_id;
ALTER TABLE notifications RENAME COLUMN is_read TO read;

-- Add missing columns if they don't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Recreate the foreign key constraint with the new column name
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES teachers(id) ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS idx_notifications_recipient_id;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Update RLS policies to use the new column names
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;

-- Recreate policies with updated column names
-- For now, allow authenticated users to access notifications
-- This can be refined later based on the actual auth structure
CREATE POLICY "Users can view notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Ensure permissions are granted
GRANT SELECT, INSERT, UPDATE ON notifications TO anon;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;