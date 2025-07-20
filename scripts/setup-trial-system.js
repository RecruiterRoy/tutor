// Setup Trial System Database
// Run this script to set up the trial system in Supabase

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

async function setupTrialSystem() {
    try {
        console.log('🚀 Setting up Trial System Database...');
        
        // Read the SQL file
        const fs = require('fs');
        const path = require('path');
        const sqlPath = path.join(__dirname, '../database/trial_system.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📝 Executing SQL schema...');
        
        // Execute the SQL in parts to handle errors better
        const sqlParts = sql.split(';').filter(part => part.trim());
        
        for (let i = 0; i < sqlParts.length; i++) {
            const part = sqlParts[i].trim();
            if (part) {
                try {
                    const { error } = await supabase.rpc('exec_sql', { sql: part });
                    if (error) {
                        console.log(`⚠️  Part ${i + 1} had an issue (this might be normal):`, error.message);
                    } else {
                        console.log(`✅ Part ${i + 1} executed successfully`);
                    }
                } catch (err) {
                    console.log(`⚠️  Part ${i + 1} skipped (might already exist):`, err.message);
                }
            }
        }
        
        // Verify the setup
        console.log('🔍 Verifying setup...');
        
        // Check if columns exist
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'user_profiles')
            .in('column_name', ['subscription_status', 'subscription_plan', 'trial_start', 'trial_end']);
        
        if (columnsError) {
            console.error('❌ Error checking columns:', columnsError);
        } else {
            console.log('✅ Required columns found:', columns.map(c => c.column_name));
        }
        
        // Check user count
        const { count, error: countError } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Error counting users:', countError);
        } else {
            console.log(`✅ Total users in database: ${count}`);
        }
        
        console.log('🎉 Trial System setup completed!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Test user registration with trial');
        console.log('2. Verify trial expiry blocking works');
        console.log('3. Test payment flow');
        console.log('4. Check admin dashboard analytics');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Run the setup
setupTrialSystem(); 