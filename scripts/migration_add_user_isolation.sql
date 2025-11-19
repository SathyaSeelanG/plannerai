-- Migration to add user_id columns for proper data isolation

-- Add user_id column to roadmaps table
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS user_id text;

-- Add user_id column to stats table
ALTER TABLE stats ADD COLUMN IF NOT EXISTS user_id text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_user_id ON stats(user_id);

-- Add Row Level Security (RLS) policies to ensure users can only see their own data
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Since we're using Clerk instead of Supabase Auth, we'll handle user isolation in the application layer
-- For now, we disable RLS and handle filtering in the queries

-- Disable RLS for now since we're using Clerk authentication
ALTER TABLE roadmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Note: User isolation is handled in the application layer through filtered queries
-- All database queries include WHERE user_id = current_user_id to ensure data isolation