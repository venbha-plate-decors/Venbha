-- Add notes column to contact_entries table
-- Run this in Supabase SQL Editor

ALTER TABLE contact_entries 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contact_entries';
