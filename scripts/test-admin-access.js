import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function testAdminAccess() {
  console.log('🔧 Testing Admin Access...\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // 1. Check all user profiles
    console.log('👥 Checking user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`✅ Found ${profiles.length} user profiles:\n`);
    
    // Find admin users
    const adminUsers = profiles.filter(p => p.full_name === 'Admin');
    const nonAdminUsers = profiles.filter(p => p.full_name !== 'Admin');
    
    if (adminUsers.length > 0) {
      console.log('🎯 ADMIN USERS FOUND:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.full_name} (${admin.email || 'No email'})`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Created: ${new Date(admin.created_at).toLocaleDateString()}`);
        console.log(`   Economic Status: ${admin.economic_status || 'Not set'}`);
        console.log(`   Verification Status: ${admin.verification_status || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('❌ NO ADMIN USERS FOUND');
    }

    if (nonAdminUsers.length > 0) {
      console.log('👤 OTHER USERS:');
      nonAdminUsers.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email || 'No email'})`);
        console.log(`   Profile name: "${user.full_name}"`);
        console.log('');
      });
      
      if (nonAdminUsers.length > 5) {
        console.log(`... and ${nonAdminUsers.length - 5} more users`);
      }
    }

    // 2. Check auth.users for email confirmation
    console.log('\n📧 Checking email confirmation status...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('⚠️  Cannot access auth.users:', usersError.message);
      } else {
        console.log(`✅ Found ${users.users.length} users in auth system`);
        
        // Check admin users in auth system
        const authAdminUsers = users.users.filter(user => {
          const profile = profiles.find(p => p.id === user.id);
          return profile && profile.full_name === 'Admin';
        });
        
        if (authAdminUsers.length > 0) {
          console.log('\n🎯 ADMIN USERS IN AUTH SYSTEM:');
          authAdminUsers.forEach(user => {
            console.log(`   - ${user.email}`);
            console.log(`     Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
            console.log(`     Created: ${new Date(user.created_at).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log('❌ No admin users found in auth system');
        }
      }
    } catch (err) {
      console.log('⚠️  Cannot access auth.users:', err.message);
    }

    // 3. Provide specific instructions
    console.log('\n💡 ADMIN ACCESS INSTRUCTIONS:\n');
    console.log('=' .repeat(50));
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. You need to:');
      console.log('1. Go to: http://localhost:3000/register.html');
      console.log('2. Register with Full Name: "Admin" (exactly)');
      console.log('3. Complete registration and confirm email');
      console.log('4. Try accessing admin dashboard again');
    } else {
      console.log('✅ Admin users found! To access admin dashboard:');
      console.log('1. Go to: http://localhost:3000/login.html');
      console.log('2. Log in with admin account email');
      console.log('3. Go to: http://localhost:3000/admin.html');
      console.log('4. The page should now load with proper authentication');
    }

    console.log('\n🔍 TROUBLESHOOTING:');
    console.log('- If you get "Access denied", check that profile name is exactly "Admin"');
    console.log('- If page doesn\'t load, check browser console for errors');
    console.log('- If email not confirmed, check your email for confirmation link');
    console.log('- Clear browser cache if issues persist');

    console.log('\n🎉 Admin Access Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminAccess().catch(console.error); 