// Migration script for existing tution.app users
// This script helps migrate existing users to the new BGSMS system

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vfqdjpiyaabufpaofysz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDkzMDEsImV4cCI6MjA2OTE4NTMwMX0.SVY1Kf7D1nbXssuxCnnHcvaDAIintOpCLfhxV6rHvjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateExistingUsers() {
    console.log('Starting migration of existing tution.app users...');
    
    try {
        // Check for existing users in the auth system
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching auth users:', authError);
            return;
        }
        
        console.log(`Found ${authUsers.users.length} existing auth users`);
        
        // For each existing user, ensure they have proper profiles
        for (const user of authUsers.users) {
            console.log(`Processing user: ${user.email}`);
            
            // Check if user exists in students table
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (studentError && studentError.code !== 'PGRST116') {
                console.error(`Error checking student profile for ${user.email}:`, studentError);
                continue;
            }
            
            // Check if user exists in teachers table
            const { data: teacherData, error: teacherError } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (teacherError && teacherError.code !== 'PGRST116') {
                console.error(`Error checking teacher profile for ${user.email}:`, teacherError);
                continue;
            }
            
            // Check if user exists in school_admins table
            const { data: adminData, error: adminError } = await supabase
                .from('school_admins')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (adminError && adminError.code !== 'PGRST116') {
                console.error(`Error checking admin profile for ${user.email}:`, adminError);
                continue;
            }
            
            // If user doesn't exist in any table, create a basic student profile
            if (!studentData && !teacherData && !adminData) {
                console.log(`Creating basic student profile for ${user.email}`);
                
                const basicProfile = {
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email.split('@')[0],
                    email: user.email,
                    phone: user.phone || '',
                    status: 'active',
                    created_at: user.created_at,
                    updated_at: new Date().toISOString()
                };
                
                const { error: insertError } = await supabase
                    .from('students')
                    .insert([basicProfile]);
                
                if (insertError) {
                    console.error(`Error creating profile for ${user.email}:`, insertError);
                } else {
                    console.log(`Successfully created profile for ${user.email}`);
                }
            } else {
                console.log(`User ${user.email} already has a profile`);
            }
        }
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Function to help existing users log in
async function helpExistingUserLogin(email, password) {
    try {
        // Try to sign in with existing credentials
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
        
        if (data.user) {
            // Check which table the user exists in
            let userRole = 'student';
            let userData = null;
            
            // Check school admins
            const { data: adminData } = await supabase
                .from('school_admins')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (adminData) {
                userRole = 'school_admin';
                userData = adminData;
            } else {
                // Check teachers
                const { data: teacherData } = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                if (teacherData) {
                    userRole = 'teacher';
                    userData = teacherData;
                } else {
                    // Check students
                    const { data: studentData } = await supabase
                        .from('students')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();
                    
                    if (studentData) {
                        userRole = 'student';
                        userData = studentData;
                    }
                }
            }
            
            return {
                success: true,
                user: data.user,
                role: userRole,
                userData: userData
            };
        }
        
    } catch (error) {
        console.error('Error in helpExistingUserLogin:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in other parts of the application
module.exports = {
    migrateExistingUsers,
    helpExistingUserLogin
};

// Run migration if this script is executed directly
if (require.main === module) {
    migrateExistingUsers();
}
