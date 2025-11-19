# Database Migration Instructions

## Fix User Data Isolation

The application now includes proper user data isolation. To fix the existing data and enable user-specific roadmaps:

### 1. Run the Migration Script

Execute the SQL migration script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of scripts/migration_add_user_isolation.sql
```

This will:
- Add `user_id` columns to `roadmaps` and `stats` tables
- Create indexes for better performance
- Set up proper data isolation

### 2. Update Existing Data (if any)

If you have existing roadmaps in the database that don't have user_id set, you'll need to either:

**Option A: Clear existing data (recommended for development)**
```sql
-- Clear all existing roadmaps and stats
DELETE FROM tasks;
DELETE FROM milestones;
DELETE FROM roadmaps;
DELETE FROM stats;
```

**Option B: Assign existing data to a specific user**
```sql
-- Replace 'your_clerk_user_id' with an actual Clerk user ID
UPDATE roadmaps SET user_id = 'your_clerk_user_id' WHERE user_id IS NULL;
UPDATE stats SET user_id = 'your_clerk_user_id' WHERE user_id IS NULL;
```

### 3. Restart the Application

After running the migration, restart your development server:

```bash
npm run dev
```

## What's Fixed

- ✅ Roadmaps are now filtered by user ID
- ✅ Stats are user-specific
- ✅ Guest users have separate local storage
- ✅ Data migration from guest to authenticated account
- ✅ Proper user isolation in all database operations

## Testing

1. **As Guest**: Create roadmaps - they should be stored locally
2. **Sign In**: Should see only your authenticated roadmaps
3. **Save to Account**: Guest roadmaps should migrate to your account
4. **Sign Out/In**: Should see the same roadmaps across sessions