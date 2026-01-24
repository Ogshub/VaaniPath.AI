import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
// You can find these in Project Settings -> API
const supabaseUrl = 'https://yamsbobotytqyhzqfxzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbXNib2JvdHl0cXloenFmeHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDYxNTAsImV4cCI6MjA4NDgyMjE1MH0.yf6aRsE4Skk3GmhtVW0Cs5zb8h_h4hw0q61MCvAntGU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
