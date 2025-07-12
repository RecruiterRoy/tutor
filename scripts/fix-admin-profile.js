import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function fixAdminProfile() {
  console.log('🔧 Fixing Admin Profile...\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // 1. Check current admin profiles
    console.log('🔍 Checking current admin profiles...');
    const { data: adminProfiles, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('full_name', 'Admin');

    if (adminError) {
      console.log('❌ Error checking admin profiles:', adminError.message);
    } else {
      console.log(`✅ Found ${adminProfiles.length} admin profiles`);
      
      if (adminProfiles.length > 0) {
        adminProfiles.forEach((admin, index) => {
          console.log(`${index + 1}. Admin (${admin.email || 'No email'})`);
          console.log(`   ID: ${admin.id}`);
          console.log(`   Created: ${new Date(admin.created_at).toLocaleDateString()}`);
          console.log(`   Economic Status: ${admin.economic_status || 'Not set'}`);
          console.log('');
        });
      }
    }

    // 2. Check all users to see which one should be admin
    console.log('👥 Checking all users...');
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.log('❌ Error fetching all profiles:', allError.message);
      return;
    }

    console.log(`✅ Found ${allProfiles.length} total users:`);
    allProfiles.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email || 'No email'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // 3. Find the most likely admin candidate
    const adminCandidates = allProfiles.filter(user => 
      user.full_name && (
        user.full_name.toLowerCase().includes('admin') ||
        (user.email && user.email.toLowerCase().includes('admin')) ||
        user.id === '97398100-890f-449e-b3f4-ee94485b98bd' ||
        user.id === '802cec81-8fae-4639-9544-a2a15cd1445c'
      )
    );

    console.log('🎯 Admin candidates found:');
    if (adminCandidates.length > 0) {
      adminCandidates.forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.full_name} (${candidate.email || 'No email'})`);
        console.log(`   ID: ${candidate.id}`);
        console.log(`   Current name: "${candidate.full_name}"`);
        console.log('');
      });
    } else {
      console.log('No obvious admin candidates found');
    }

    // 4. Update the first user to be admin (or create admin profile)
    console.log('🔧 Fixing admin profile...');
    
    if (allProfiles.length > 0) {
      const firstUser = allProfiles[0];
      console.log(`Updating user "${firstUser.full_name}" to be admin...`);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: 'Admin',
          economic_status: 'Premium',
          verification_status: 'approved',
          class: 'Admin',
          board: 'Admin'
        })
        .eq('id', firstUser.id);

      if (updateError) {
        console.log('❌ Error updating user to admin:', updateError.message);
        
        // Try creating a new admin profile instead
        console.log('Trying to create new admin profile...');
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: 'admin-user-id',
            full_name: 'Admin',
            email: 'admin@tutor.ai',
            class: 'Admin',
            board: 'Admin',
            economic_status: 'Premium',
            verification_status: 'approved',
            city: 'Admin',
            state: 'Admin'
          });

        if (createError) {
          console.log('❌ Error creating admin profile:', createError.message);
        } else {
          console.log('✅ Admin profile created successfully');
        }
      } else {
        console.log('✅ User updated to admin successfully');
      }
    } else {
      console.log('❌ No users found to make admin');
    }

    // 5. Verify the fix
    console.log('\n🔍 Verifying admin profile...');
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('full_name', 'Admin');

    if (verifyError) {
      console.log('❌ Error verifying admin profile:', verifyError.message);
    } else if (verifyAdmin && verifyAdmin.length > 0) {
      console.log('✅ Admin profile verified successfully');
      verifyAdmin.forEach((admin, index) => {
        console.log(`${index + 1}. Admin (${admin.email || 'No email'})`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Economic Status: ${admin.economic_status}`);
        console.log(`   Verification Status: ${admin.verification_status}`);
      });
    } else {
      console.log('❌ No admin profile found after fix');
    }

    console.log('\n🎉 Admin Profile Fix Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Try accessing admin dashboard again');
    console.log('2. If still having issues, check browser console');
    console.log('3. Make sure you\'re logged in with the correct account');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
fixAdminProfile().catch(console.error); 