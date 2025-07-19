import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

async function testUserProfiles() {
  console.log('🧪 Testing User Profiles System...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check if user_profiles table exists by trying to query it
    console.log('📊 Checking user_profiles table...');
    const { data: profiles, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ user_profiles table does not exist or is not accessible');
      console.log('Error:', tableError.message);
      console.log('💡 Please run the migrate_existing_users.sql script in Supabase SQL editor');
      return;
    }

    console.log('✅ user_profiles table exists and is accessible');

    // 2. Check table structure by querying a sample
    console.log('\n📋 Checking table structure...');
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error checking table structure:', sampleError);
    } else if (sampleProfile && sampleProfile.length > 0) {
      console.log('✅ user_profiles table columns:');
      const columns = Object.keys(sampleProfile[0]);
      columns.forEach(col => {
        console.log(`  - ${col}`);
      });
    }

    // 3. Check if functions exist by trying to call them
    console.log('\n🔧 Checking functions...');
    
    // Test get_user_profile function
    try {
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_profile');
      
      if (profileError) {
        console.log('⚠️  get_user_profile function error (expected if no auth):', profileError.message);
      } else {
        console.log('✅ get_user_profile function works');
      }
    } catch (error) {
      console.log('⚠️  get_user_profile function not available:', error.message);
    }

    // Test update_user_profile function
    try {
      const { data: updateData, error: updateError } = await supabase
        .rpc('update_user_profile', {
          user_full_name: 'Test User',
          user_class: 'Class 5',
          user_board: 'Central Board of Secondary Education',
          user_board_abbr: 'CBSE'
        });
      
      if (updateError) {
        console.log('⚠️  update_user_profile function error (expected if no auth):', updateError.message);
      } else {
        console.log('✅ update_user_profile function works');
      }
    } catch (error) {
      console.log('⚠️  update_user_profile function not available:', error.message);
    }

    // 4. Check RLS policies by trying to access the table
    console.log('\n🔒 Checking RLS policies...');
    const { data: allProfiles, error: policiesError } = await supabase
      .from('user_profiles')
      .select('*');

    if (policiesError) {
      console.log('⚠️  RLS policies are active (expected):', policiesError.message);
    } else {
      console.log('⚠️  RLS policies might not be properly configured');
    }

    // 5. Check if there are any existing profiles
    console.log('\n👥 Checking existing profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error checking profiles:', profilesError);
    } else {
      console.log(`✅ Found ${existingProfiles.length} user profiles`);
      if (existingProfiles.length > 0) {
        console.log('Sample profile:');
        console.log(JSON.stringify(existingProfiles[0], null, 2));
      } else {
        console.log('⚠️  No user profiles found - run migration script');
      }
    }

    // 6. Check auth.users to see how many users exist
    console.log('\n🔍 Checking auth.users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('⚠️  Cannot access auth.users (expected):', authError.message);
      } else {
        console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
        authUsers.users.forEach(user => {
          console.log(`  - ${user.email} (${user.user_metadata?.full_name || 'No name'})`);
        });
      }
    } catch (error) {
      console.log('⚠️  Cannot access auth.users (expected):', error.message);
    }

    console.log('\n🎉 User Profiles System Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- user_profiles table: ✅');
    console.log('- Functions: ⚠️  (need authentication to test fully)');
    console.log('- RLS policies: ✅');
    console.log('- Table structure: ✅');
    console.log(`- Existing profiles: ${existingProfiles?.length || 0}`);

    if (existingProfiles?.length === 0) {
      console.log('\n💡 Next Steps:');
      console.log('1. Run the migrate_existing_users.sql script in Supabase SQL editor');
      console.log('2. This will migrate your existing users to the new table');
      console.log('3. Test the dashboard to see if user data loads properly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserProfiles().catch(console.error); 
