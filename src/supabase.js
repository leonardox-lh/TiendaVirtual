import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oegycaxrzcstuefbfinc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ3ljYXhyemNzdHVlZmJmaW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODU5MjAsImV4cCI6MjA2MzQ2MTkyMH0.B5iHwwDgqwbSHOysoTWRQUumF5uJpk20Cn-WF7CZJt4'

export const supabase = createClient(supabaseUrl, supabaseKey)
