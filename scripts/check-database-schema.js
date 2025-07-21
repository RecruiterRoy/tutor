// Check Database Schema
// Run this script to see what columns exist in your user_profiles table

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
    try {
        console.log('🔍 Checking Database Schema...');
        
        // Check all columns in user_profiles table
        console.log('\n1. All columns in user_profiles table:');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'user_profiles')
            .eq('table_schema', 'public')
            .order('ordinal_position');
        
        if (columnsError) {
            console.error('❌ Error checking columns:', columnsError);
        } else {
            console.log(`✅ Found ${columns.length} columns:`);
            columns.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
            });
        }
        
        // Check if specific columns exist
        console.log('\n2. Checking specific columns:');
        const requiredColumns = [
            'subscription_status',
            'subscription_plan', 
            'trial_start',
            'trial_end',
            'trial_status',
            'role'
        ];
        
        const existingColumns = columns.map(c => c.column_name);
        requiredColumns.forEach(col => {
            if (existingColumns.includes(col)) {
                console.log(`   ✅ ${col} - EXISTS`);
            } else {
                console.log(`   ❌ ${col} - MISSING`);
            }
        });
        
        // Check sample user data
        console.log('\n3. Sample user data:');
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
        
        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
        } else if (users.length > 0) {
            console.log('✅ Sample user data:');
            Object.keys(users[0]).forEach(key => {
                console.log(`   - ${key}: ${users[0][key]}`);
            });
        } else {
            console.log('⚠️  No users found in database');
        }
        
        // Check all tables
        console.log('\n4. All tables in public schema:');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .order('table_name');
        
        if (tablesError) {
            console.error('❌ Error checking tables:', tablesError);
        } else {
            console.log(`✅ Found ${tables.length} tables:`);
            tables.forEach(table => {
                console.log(`   - ${table.table_name}`);
            });
        }
        
        console.log('\n📋 Summary:');
        console.log('This will help you understand your current database structure');
        console.log('Use this information to update the trial system SQL if needed');
        
    } catch (error) {
        console.error('❌ Schema check failed:', error);
    }
}

// Run the check
checkDatabaseSchema(); 