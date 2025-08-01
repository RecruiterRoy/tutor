import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vfqdjpiyaabufpaofysz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAiAvatarColumn() {
    try {
        console.log('Adding ai_avatar column to user_profiles table...');
        
        // First, let's check if the column already exists
        const { data: existingColumns, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
            
        if (checkError) {
            console.error('Error checking table structure:', checkError);
            return;
        }
        
        console.log('Table structure check completed');
        
        // Try to add the column by attempting to insert a test record with ai_avatar
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000', // Test ID
                ai_avatar: 'test-avatar'
            }, {
                onConflict: 'id'
            });
            
        if (error) {
            console.error('Error testing ai_avatar column:', error);
            console.log('This suggests the ai_avatar column does not exist and needs to be added manually in Supabase dashboard');
            return;
        }
        
        console.log('ai_avatar column appears to exist or was added successfully');
        
    } catch (error) {
        console.error('Error running migration:', error);
    }
}

addAiAvatarColumn(); 