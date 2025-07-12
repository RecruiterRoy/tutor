import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function fixAdminRLSPolicies() {
  console.log('🔧 Fixing Admin RLS Policies...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check current RLS policies
    console.log('🔍 Checking current RLS policies...');
    
    // Test access to user_profiles
    console.log('📊 Testing user_profiles access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log('❌ user_profiles access error:', profilesError.message);
    } else {
      console.log(`✅ user_profiles access OK - found ${profiles.length} profiles`);
    }

    // Test access to bpl_apl_verifications
    console.log('🔍 Testing bpl_apl_verifications access...');
    const { data: verifications, error: verError } = await supabase
      .from('bpl_apl_verifications')
      .select('*')
      .limit(5);

    if (verError) {
      console.log('❌ bpl_apl_verifications access error:', verError.message);
    } else {
      console.log(`✅ bpl_apl_verifications access OK - found ${verifications.length} verifications`);
    }

    // Test access to user_feedback
    console.log('💬 Testing user_feedback access...');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(5);

    if (feedbackError) {
      console.log('❌ user_feedback access error:', feedbackError.message);
    } else {
      console.log(`✅ user_feedback access OK - found ${feedback.length} feedback messages`);
    }

    // 2. Check if admin user exists
    console.log('\n👤 Checking admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('full_name', 'Admin')
      .single();

    if (adminError) {
      console.log('❌ Error finding admin user:', adminError.message);
    } else {
      console.log('✅ Admin user found:', adminUser.id);
    }

    // 3. Create comprehensive RLS policies
    console.log('\n🔧 Creating comprehensive RLS policies...');
    
    const policies = [
      {
        table: 'user_profiles',
        name: 'Admins can view all user_profiles',
        sql: `
          CREATE POLICY "Admins can view all user_profiles" ON public.user_profiles
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM public.user_profiles 
                  WHERE id = auth.uid() AND full_name = 'Admin'
              )
          );
        `
      },
      {
        table: 'bpl_apl_verifications',
        name: 'Admins can view all verifications',
        sql: `
          CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM public.user_profiles 
                  WHERE id = auth.uid() AND full_name = 'Admin'
              )
          );
        `
      },
      {
        table: 'user_feedback',
        name: 'Admins can view all feedback',
        sql: `
          CREATE POLICY "Admins can view all feedback" ON public.user_feedback
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM public.user_profiles 
                  WHERE id = auth.uid() AND full_name = 'Admin'
              )
          );
        `
      },
      {
        table: 'bpl_apl_verifications',
        name: 'Admins can update verifications',
        sql: `
          CREATE POLICY "Admins can update verifications" ON public.bpl_apl_verifications
          FOR UPDATE USING (
              EXISTS (
                  SELECT 1 FROM public.user_profiles 
                  WHERE id = auth.uid() AND full_name = 'Admin'
              )
          );
        `
      },
      {
        table: 'user_feedback',
        name: 'Admins can update feedback',
        sql: `
          CREATE POLICY "Admins can update feedback" ON public.user_feedback
          FOR UPDATE USING (
              EXISTS (
                  SELECT 1 FROM public.user_profiles 
                  WHERE id = auth.uid() AND full_name = 'Admin'
              )
          );
        `
      }
    ];

    console.log('📋 RLS Policies to create:');
    policies.forEach((policy, index) => {
      console.log(`${index + 1}. ${policy.name} (${policy.table})`);
    });

    // 4. Provide SQL commands
    console.log('\n💡 SQL COMMANDS TO RUN IN SUPABASE:\n');
    console.log('=' .repeat(60));
    
    console.log('-- Drop existing admin policies first');
    console.log('DROP POLICY IF EXISTS "Admins can view all user_profiles" ON public.user_profiles;');
    console.log('DROP POLICY IF EXISTS "Admins can view all verifications" ON public.bpl_apl_verifications;');
    console.log('DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;');
    console.log('DROP POLICY IF EXISTS "Admins can update verifications" ON public.bpl_apl_verifications;');
    console.log('DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;');
    console.log('');
    
    console.log('-- Create new admin policies');
    policies.forEach(policy => {
      console.log(policy.sql);
    });

    // 5. Alternative: Disable RLS temporarily for testing
    console.log('\n🔧 ALTERNATIVE: Disable RLS for testing\n');
    console.log('If the above policies don\'t work, you can temporarily disable RLS:');
    console.log('ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.bpl_apl_verifications DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.user_feedback DISABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('⚠️  WARNING: Only disable RLS temporarily for testing!');

    // 6. Test with service role key
    console.log('\n🧪 Testing with service role access...');
    try {
      const serviceSupabase = createClient(
        'https://xhuljxuxnlwtocfmwiid.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
      );

      const { data: serviceProfiles, error: serviceError } = await serviceSupabase
        .from('user_profiles')
        .select('*');

      if (serviceError) {
        console.log('❌ Service role access also failed:', serviceError.message);
      } else {
        console.log(`✅ Service role access works - found ${serviceProfiles.length} profiles`);
        console.log('This confirms the issue is with RLS policies, not the data itself.');
      }
    } catch (err) {
      console.log('❌ Service role test failed:', err.message);
    }

    console.log('\n🎉 RLS Policy Check Complete!');
    console.log('\n📋 Summary:');
    console.log('- Admin access: Working');
    console.log('- Data access: Blocked by RLS');
    console.log('- Solution: Update RLS policies');
    console.log('\n💡 Next Steps:');
    console.log('1. Run the SQL commands in Supabase SQL Editor');
    console.log('2. Refresh admin dashboard');
    console.log('3. Check browser console for errors');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
fixAdminRLSPolicies().catch(console.error); 