import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function fixAdminDataAccess() {
  console.log('🔧 Fixing Admin Data Access...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check how many users exist in the database
    console.log('📊 Checking total users in database...');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`✅ Found ${allProfiles.length} total user profiles in database`);
    
    if (allProfiles.length > 0) {
      console.log('\n📋 Sample users:');
      allProfiles.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email || 'No email'})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Class: ${user.class || 'Not set'}`);
        console.log(`   Board: ${user.board || 'Not set'}`);
        console.log(`   Economic Status: ${user.economic_status || 'Not set'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // 2. Check auth.users to see total registered users
    console.log('🔍 Checking auth.users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('⚠️  Cannot access auth.users:', authError.message);
      } else {
        console.log(`✅ Found ${authUsers.users.length} users in auth system`);
        
        const confirmedUsers = authUsers.users.filter(user => user.email_confirmed_at);
        const unconfirmedUsers = authUsers.users.filter(user => !user.email_confirmed_at);
        
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

    // 3. Check for orphaned profiles (profiles without auth users)
    console.log('\n🔗 Checking for orphaned profiles...');
    let orphanedCount = 0;
    const orphanedProfiles = [];
    
    for (const profile of allProfiles) {
      try {
        const { data: user, error } = await supabase.auth.admin.getUserById(profile.id);
        if (error) {
          orphanedCount++;
          orphanedProfiles.push(profile);
        }
      } catch (err) {
        orphanedCount++;
        orphanedProfiles.push(profile);
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`⚠️  Found ${orphanedCount} orphaned profiles:`);
      orphanedProfiles.forEach(profile => {
        console.log(`   - ${profile.full_name || 'No name'} (ID: ${profile.id})`);
      });
    } else {
      console.log('✅ No orphaned profiles found');
    }

    // 4. Check verification data
    console.log('\n🔍 Checking verification data...');
    try {
      const { data: verifications, error: verError } = await supabase
        .from('bpl_apl_verifications')
        .select('*');

      if (verError) {
        console.log('❌ Error fetching verifications:', verError.message);
      } else {
        console.log(`✅ Found ${verifications.length} verification requests`);
        
        const pendingVerifications = verifications.filter(v => v.verification_status === 'pending');
        const approvedVerifications = verifications.filter(v => v.verification_status === 'approved');
        const rejectedVerifications = verifications.filter(v => v.verification_status === 'rejected');
        
        console.log(`   - Pending: ${pendingVerifications.length}`);
        console.log(`   - Approved: ${approvedVerifications.length}`);
        console.log(`   - Rejected: ${rejectedVerifications.length}`);
      }
    } catch (err) {
      console.log('❌ Error checking verifications:', err.message);
    }

    // 5. Check feedback data
    console.log('\n💬 Checking feedback data...');
    try {
      const { data: feedback, error: feedbackError } = await supabase
        .from('user_feedback')
        .select('*');

      if (feedbackError) {
        console.log('❌ Error fetching feedback:', feedbackError.message);
      } else {
        console.log(`✅ Found ${feedback.length} feedback messages`);
        
        const unreadFeedback = feedback.filter(f => f.status === 'unread');
        const readFeedback = feedback.filter(f => f.status === 'read');
        const repliedFeedback = feedback.filter(f => f.status === 'replied');
        
        console.log(`   - Unread: ${unreadFeedback.length}`);
        console.log(`   - Read: ${readFeedback.length}`);
        console.log(`   - Replied: ${repliedFeedback.length}`);
      }
    } catch (err) {
      console.log('❌ Error checking feedback:', err.message);
    }

    // 6. Provide solutions
    console.log('\n💡 SOLUTIONS FOR ADMIN DATA ACCESS:\n');
    console.log('=' .repeat(60));

    if (allProfiles.length === 0) {
      console.log('❌ No user profiles found. Possible issues:');
      console.log('1. No users have registered yet');
      console.log('2. RLS policies are blocking access');
      console.log('3. user_profiles table is empty');
      console.log('\n🔧 Solutions:');
      console.log('1. Register some test users');
      console.log('2. Check RLS policies in Supabase');
      console.log('3. Run migration scripts');
    } else if (allProfiles.length === 1) {
      console.log('⚠️  Only one user found. This might be just the admin user.');
      console.log('\n🔧 Solutions:');
      console.log('1. Register more test users');
      console.log('2. Check if other users have profiles created');
      console.log('3. Verify RLS policies allow admin to see all users');
    } else {
      console.log(`✅ Found ${allProfiles.length} users. Admin should be able to see all of them.`);
      console.log('\n🔧 If admin dashboard shows only one user:');
      console.log('1. Check browser console for errors');
      console.log('2. Verify RLS policies are correct');
      console.log('3. Clear browser cache and reload');
    }

    // 7. RLS Policy Check
    console.log('\n🔒 RLS POLICY CHECK:');
    console.log('The admin dashboard needs these RLS policies to work:');
    console.log('1. Admin can view all user_profiles');
    console.log('2. Admin can view all bpl_apl_verifications');
    console.log('3. Admin can view all user_feedback');
    console.log('\n💡 If policies are missing, run this SQL in Supabase:');
    console.log(`
-- Grant admin access to all data
CREATE POLICY "Admins can view all user_profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );
    `);

    console.log('\n🎉 Admin Data Access Check Complete!');
    console.log('\n📋 Summary:');
    console.log(`- Total profiles: ${allProfiles.length}`);
    console.log(`- Orphaned profiles: ${orphanedCount}`);
    console.log(`- Verification requests: ${verifications?.length || 0}`);
    console.log(`- Feedback messages: ${feedback?.length || 0}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
fixAdminDataAccess().catch(console.error); 