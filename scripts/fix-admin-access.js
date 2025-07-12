import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function fixAdminAccess() {
  console.log('🔧 Fixing Admin Access Issues...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check all user profiles
    console.log('👥 Checking all user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`✅ Found ${profiles.length} user profiles:\n`);
    
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'No name'} (${profile.email || 'No email'})`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Class: ${profile.class || 'Not set'}`);
      console.log(`   Board: ${profile.board || 'Not set'}`);
      console.log(`   Economic Status: ${profile.economic_status || 'Not set'}`);
      console.log(`   Verification Status: ${profile.verification_status || 'Not set'}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // 2. Check for existing admin users
    console.log('🔍 Checking for existing admin users...');
    const adminProfiles = profiles.filter(p => p.full_name === 'Admin');
    
    if (adminProfiles.length > 0) {
      console.log(`✅ Found ${adminProfiles.length} admin user(s):`);
      adminProfiles.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
    } else {
      console.log('❌ No admin users found');
    }

    // 3. Check auth.users for email confirmation status
    console.log('\n📧 Checking email confirmation status...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('⚠️  Cannot access auth.users:', usersError.message);
      } else {
        console.log(`✅ Found ${users.users.length} users in auth system`);
        
        const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at);
        const confirmedUsers = users.users.filter(user => user.email_confirmed_at);
        
        console.log(`   - Confirmed emails: ${confirmedUsers.length}`);
        console.log(`   - Unconfirmed emails: ${unconfirmedUsers.length}`);
        
        if (unconfirmedUsers.length > 0) {
          console.log('\n⚠️  Users with unconfirmed emails:');
          unconfirmedUsers.forEach(user => {
            console.log(`   - ${user.email} (created: ${new Date(user.created_at).toLocaleDateString()})`);
          });
        }
      }
    } catch (err) {
      console.log('⚠️  Cannot access auth.users:', err.message);
    }

    // 4. Provide specific solutions
    console.log('\n💡 SOLUTIONS FOR ADMIN ACCESS:\n');
    console.log('=' .repeat(60));

    if (adminProfiles.length === 0) {
      console.log('\n🔧 SOLUTION 1: Create Admin User');
      console.log('1. Go to: http://localhost:3000/register.html');
      console.log('2. Register with these exact details:');
      console.log('   - Full Name: Admin (exactly like this)');
      console.log('   - Email: admin@tutor.ai (or your preferred email)');
      console.log('   - Class: Class 1');
      console.log('   - Board: CBSE');
      console.log('   - Economic Status: Premium');
      console.log('   - Phone: 1234567890');
      console.log('   - City: Your City');
      console.log('   - State: Your State');
      console.log('3. Complete registration');
      console.log('4. Check your email and confirm the account');
      console.log('5. Try accessing admin dashboard again');
    } else {
      console.log('\n🔧 SOLUTION 2: Fix Existing Admin User');
      console.log('If you already registered as admin but still get access denied:');
      console.log('1. Check if your email is confirmed in Supabase');
      console.log('2. Make sure you\'re logged in with the correct account');
      console.log('3. Try logging out and logging back in');
      console.log('4. Clear browser cache and cookies');
    }

    // 5. Manual SQL fix option
    console.log('\n🔧 SOLUTION 3: Manual SQL Fix (if above doesn\'t work)');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run this SQL command (replace with your email):');
    console.log('');
    console.log('UPDATE user_profiles SET full_name = \'Admin\' WHERE email = \'your-admin-email@example.com\';');
    console.log('');
    console.log('3. Also ensure email confirmation:');
    console.log('UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = \'your-admin-email@example.com\';');

    // 6. Check for common issues
    console.log('\n🔍 COMMON ISSUES & FIXES:\n');
    console.log('1. Email not confirmed:');
    console.log('   - Check your email for confirmation link');
    console.log('   - Or use manual SQL fix above');
    console.log('');
    console.log('2. Wrong account logged in:');
    console.log('   - Log out completely');
    console.log('   - Log in with admin account');
    console.log('');
    console.log('3. Profile not created:');
    console.log('   - Run migration script in Supabase SQL editor');
    console.log('   - Check if user_profiles table exists');
    console.log('');
    console.log('4. RLS policies blocking access:');
    console.log('   - Check if RLS policies are properly configured');
    console.log('   - Ensure admin user has proper permissions');

    // 7. Test current user session
    console.log('\n🧪 Testing Current Session...');
    try {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError) {
        console.log('❌ No active session found');
        console.log('   - Please log in first');
      } else if (user) {
        console.log(`✅ Active session found for: ${user.email}`);
        
        // Check if this user has admin profile
        const userProfile = profiles.find(p => p.id === user.id);
        if (userProfile) {
          console.log(`   - Profile name: ${userProfile.full_name}`);
          console.log(`   - Is admin: ${userProfile.full_name === 'Admin' ? 'YES' : 'NO'}`);
          
          if (userProfile.full_name === 'Admin') {
            console.log('   ✅ This user should have admin access!');
          } else {
            console.log('   ❌ This user is not an admin');
            console.log('   💡 Run the SQL fix to make this user admin');
          }
        } else {
          console.log('   ❌ No profile found for this user');
        }
      }
    } catch (err) {
      console.log('❌ Error checking session:', err.message);
    }

    console.log('\n🎉 Admin Access Fix Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Follow one of the solutions above');
    console.log('2. Try accessing admin dashboard again');
    console.log('3. If still having issues, check browser console for errors');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
fixAdminAccess().catch(console.error); 