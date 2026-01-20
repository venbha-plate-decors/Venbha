-- POLICY: Allow authenticated users (Admin) to DELETE contact entries

-- 1. Enable RLS on the table (ensure it's active)
ALTER TABLE contact_entries ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing delete policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable delete for users based on email" ON contact_entries;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON contact_entries;

-- 3. Create the DELETE policy
-- This allows any user who is logged in (authenticated) to delete rows
CREATE POLICY "Allow delete for authenticated users"
ON contact_entries
FOR DELETE
TO authenticated
USING (true);

-- 4. Verify/Ensure SELECT permissions exist too (so you can see what you delete)
CREATE POLICY "Allow select for authenticated users"
ON contact_entries
FOR SELECT
TO authenticated
USING (true);
