
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: 
// 1. Create a project on https://supabase.com/
// 2. Go to Project Settings > API
// 3. Find your Project URL and anon key and add them to your .env file

// Get Supabase credentials from environment variables
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';






let supabase: SupabaseClient | null = null;
let supabaseError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
    supabaseError = "Supabase credentials are not set. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.";
    console.warn(supabaseError);
} else {
    try {
        // The createClient function throws an error for invalid URLs, so we catch it.
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e: any) {
        supabaseError = `Invalid Supabase configuration: ${e.message}`;
        console.error(supabaseError);
    }
}

export { supabase, supabaseError };