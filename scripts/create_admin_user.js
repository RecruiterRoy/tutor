// Create Admin User Script
// This script helps create an admin user for the system

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function createAdminUser() {
    console.log('🚀 Creating Admin User...\n');

    try {
        // Check if admin user already exists
        const { data: existingAdmin, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('full_name', 'Admin')
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.log('❌ Error checking for existing admin:', checkError.message);
            return;
        }

        if (existingAdmin) {
            console.log('✅ Admin user already exists:');
            console.log(`   Email: ${existingAdmin.email || 'Not set'}`);
            console.log(`   ID: ${existingAdmin.id}`);
            console.log(`   Created: ${new Date(existingAdmin.created_at).toLocaleDateString()}`);
            return;
        }

        console.log('📝 Admin user not found. Please follow these steps:');
        console.log('==================================================');
        console.log('1. Go to: http://localhost:3000/register');
        console.log('2. Register with these details:');
        console.log('   - Full Name: Admin');
        console.log('   - Email: admin@tutor.ai (or your preferred email)');
        console.log('   - Class: Class 1');
        console.log('   - Board: CBSE');
        console.log('   - Economic Status: Premium');
        console.log('   - Phone: 1234567890');
        console.log('   - City: Your City');
        console.log('   - State: Your State');
        console.log('3. After registration, run this SQL command in Supabase:');
        console.log('   UPDATE user_profiles SET full_name = \'Admin\' WHERE email = \'your-admin-email@example.com\';');
        console.log('4. Access admin dashboard at: http://localhost:3000/admin');

        // Show current users
        console.log('\n👥 Current Users in System:');
        console.log('============================');
        
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('full_name, email, class, board, created_at')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.log('❌ Error fetching users:', usersError.message);
        } else if (users && users.length > 0) {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email || 'No email'})`);
                console.log(`   Class: ${user.class}, Board: ${user.board}`);
                console.log(`   Joined: ${new Date(user.created_at).toLocaleDateString()}`);
                console.log('');
            });
        } else {
            console.log('No users found in the system.');
        }

        // Check database tables
        console.log('\n📋 Database Tables Status:');
        console.log('==========================');
        
        const tables = ['user_profiles', 'bpl_apl_verifications', 'user_feedback'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ ${table}: ${error.message}`);
                } else {
                    console.log(`✅ ${table}: Table accessible`);
                }
            } catch (err) {
                console.log(`❌ ${table}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
createAdminUser(); 