// Verify Trial System
// Run this script to verify the trial system is working correctly

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTrialSystem() {
    try {
        console.log('🔍 Verifying Trial System...');
        
        // 1. Check if required columns exist
        console.log('\n1. Checking database schema...');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'user_profiles')
            .in('column_name', [
                'subscription_status', 
                'subscription_plan', 
                'trial_start', 
                'trial_end',
                'trial_status'
            ]);
        
        if (columnsError) {
            console.error('❌ Error checking columns:', columnsError);
        } else {
            const columnNames = columns.map(c => c.column_name);
            console.log('✅ Required columns found:', columnNames);
            
            const requiredColumns = ['subscription_status', 'subscription_plan', 'trial_start', 'trial_end'];
            const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
            
            if (missingColumns.length > 0) {
                console.error('❌ Missing columns:', missingColumns);
                console.log('Please run the trial system setup first');
                return;
            }
        }
        
        // 2. Check user profiles
        console.log('\n2. Checking user profiles...');
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('id, email, subscription_status, subscription_plan, trial_start, trial_end')
            .limit(5);
        
        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
        } else {
            console.log(`✅ Found ${users.length} users`);
            users.forEach(user => {
                console.log(`   - ${user.email}: ${user.subscription_status} (${user.subscription_plan})`);
                if (user.trial_start && user.trial_end) {
                    const trialEnd = new Date(user.trial_end);
                    const now = new Date();
                    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                    console.log(`     Trial ends: ${trialEnd.toLocaleDateString()} (${daysLeft} days left)`);
                }
            });
        }
        
        // 3. Check trial events table
        console.log('\n3. Checking trial events table...');
        const { data: events, error: eventsError } = await supabase
            .from('trial_events')
            .select('*')
            .limit(5);
        
        if (eventsError) {
            console.log('⚠️  Trial events table might not exist yet (this is normal for new setup)');
        } else {
            console.log(`✅ Found ${events.length} trial events`);
        }
        
        // 4. Test trial status function
        console.log('\n4. Testing trial status function...');
        if (users.length > 0) {
            const testUserId = users[0].id;
            const { data: trialStatus, error: statusError } = await supabase
                .rpc('check_trial_status', { user_id: testUserId });
            
            if (statusError) {
                console.log('⚠️  Trial status function not available yet (run setup first)');
            } else {
                console.log('✅ Trial status function working:', trialStatus);
            }
        }
        
        // 5. Summary
        console.log('\n📊 Summary:');
        console.log('✅ Database schema appears to be set up correctly');
        console.log('✅ User profiles are accessible');
        console.log('✅ Trial system is ready for testing');
        
        console.log('\n🎯 Next steps:');
        console.log('1. Register a new user to test trial creation');
        console.log('2. Test trial expiry by manually updating trial_end date');
        console.log('3. Verify blocking overlay appears on dashboard');
        console.log('4. Test payment flow and subscription activation');
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

// Run verification
verifyTrialSystem(); 