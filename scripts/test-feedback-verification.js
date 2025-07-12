import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

async function testFeedbackAndVerification() {
  console.log('🧪 Testing Feedback and Verification Features...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check user_feedback table
    console.log('💬 Checking user_feedback table...');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.log('❌ Error accessing user_feedback:', feedbackError.message);
    } else {
      console.log(`✅ user_feedback table accessible - found ${feedback.length} messages`);
      
      if (feedback.length > 0) {
        console.log('\n📋 Recent feedback messages:');
        feedback.slice(0, 3).forEach((msg, index) => {
          console.log(`${index + 1}. ${msg.subject} (${msg.category})`);
          console.log(`   From: ${msg.user_id}`);
          console.log(`   Status: ${msg.status}`);
          console.log(`   Date: ${new Date(msg.created_at).toLocaleDateString()}`);
          console.log(`   Message: ${msg.message.substring(0, 50)}...`);
          console.log('');
        });
      }
    }

    // 2. Check bpl_apl_verifications table
    console.log('🔍 Checking bpl_apl_verifications table...');
    const { data: verifications, error: verError } = await supabase
      .from('bpl_apl_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (verError) {
      console.log('❌ Error accessing bpl_apl_verifications:', verError.message);
    } else {
      console.log(`✅ bpl_apl_verifications table accessible - found ${verifications.length} requests`);
      
      if (verifications.length > 0) {
        console.log('\n📋 Recent verification requests:');
        verifications.slice(0, 3).forEach((ver, index) => {
          console.log(`${index + 1}. ${ver.document_type} (${ver.verification_status})`);
          console.log(`   User: ${ver.user_id}`);
          console.log(`   Card: ${ver.card_number}`);
          console.log(`   Date: ${new Date(ver.created_at).toLocaleDateString()}`);
          console.log('');
        });
      }
    }

    // 3. Check user_profiles for users who might submit feedback/verifications
    console.log('👥 Checking user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.log('❌ Error accessing user_profiles:', profilesError.message);
    } else {
      console.log(`✅ user_profiles table accessible - found ${profiles.length} users`);
      
      // Find users who are not admin
      const nonAdminUsers = profiles.filter(p => p.full_name !== 'Admin');
      console.log(`📊 Non-admin users: ${nonAdminUsers.length}`);
      
      if (nonAdminUsers.length > 0) {
        console.log('\n👤 Users who can submit feedback/verifications:');
        nonAdminUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email || 'No email'})`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Class: ${user.class || 'Not set'}`);
          console.log(`   Economic Status: ${user.economic_status || 'Not set'}`);
          console.log('');
        });
      }
    }

    // 4. Test creating a sample feedback message
    console.log('🧪 Testing feedback submission...');
    if (profiles && profiles.length > 0) {
      const testUser = profiles.find(p => p.full_name !== 'Admin');
      if (testUser) {
        console.log(`Creating test feedback for user: ${testUser.full_name}`);
        
        const { data: newFeedback, error: createFeedbackError } = await supabase
          .from('user_feedback')
          .insert({
            user_id: testUser.id,
            subject: 'Test Feedback - Feature Testing',
            message: 'This is a test feedback message to verify the feedback system is working properly.',
            category: 'general',
            status: 'unread'
          })
          .select();

        if (createFeedbackError) {
          console.log('❌ Error creating test feedback:', createFeedbackError.message);
        } else {
          console.log('✅ Test feedback created successfully');
          console.log(`   ID: ${newFeedback[0].id}`);
          console.log(`   Subject: ${newFeedback[0].subject}`);
        }
      }
    }

    // 5. Test creating a sample verification request
    console.log('\n🧪 Testing verification request...');
    if (profiles && profiles.length > 0) {
      const testUser = profiles.find(p => p.full_name !== 'Admin');
      if (testUser) {
        console.log(`Creating test verification for user: ${testUser.full_name}`);
        
        const { data: newVerification, error: createVerError } = await supabase
          .from('bpl_apl_verifications')
          .insert({
            user_id: testUser.id,
            document_type: 'bpl_card',
            card_number: 'TEST123456',
            document_url: 'https://example.com/test-card.jpg', // Required field
            verification_status: 'pending',
            admin_notes: 'Test verification request'
          })
          .select();

        if (createVerError) {
          console.log('❌ Error creating test verification:', createVerError.message);
        } else {
          console.log('✅ Test verification created successfully');
          console.log(`   ID: ${newVerification[0].id}`);
          console.log(`   Type: ${newVerification[0].document_type}`);
          console.log(`   Status: ${newVerification[0].verification_status}`);
        }
      }
    }

    // 6. Verify admin dashboard can see the data
    console.log('\n🔍 Verifying admin dashboard data access...');
    
    // Check if admin can see all feedback
    const { data: adminFeedback, error: adminFeedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('status', 'unread');

    if (adminFeedbackError) {
      console.log('❌ Admin cannot access feedback:', adminFeedbackError.message);
    } else {
      console.log(`✅ Admin can see ${adminFeedback.length} unread feedback messages`);
    }

    // Check if admin can see all verifications
    const { data: adminVerifications, error: adminVerError } = await supabase
      .from('bpl_apl_verifications')
      .select('*')
      .eq('verification_status', 'pending');

    if (adminVerError) {
      console.log('❌ Admin cannot access verifications:', adminVerError.message);
    } else {
      console.log(`✅ Admin can see ${adminVerifications.length} pending verification requests`);
    }

    console.log('\n🎉 Feedback and Verification Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`- Feedback messages: ${feedback?.length || 0}`);
    console.log(`- Verification requests: ${verifications?.length || 0}`);
    console.log(`- Users available: ${profiles?.length || 0}`);
    console.log(`- Unread feedback: ${adminFeedback?.length || 0}`);
    console.log(`- Pending verifications: ${adminVerifications?.length || 0}`);

    console.log('\n💡 Next Steps:');
    console.log('1. Test feedback submission from user dashboard');
    console.log('2. Test verification requests from registration');
    console.log('3. Verify admin dashboard shows the data');
    console.log('4. Deploy to Vercel and create APK');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFeedbackAndVerification().catch(console.error); 