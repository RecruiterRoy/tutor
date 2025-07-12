// Admin Setup Script
// This script helps set up the admin system and create an admin user

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function setupAdminSystem() {
    console.log('🚀 Setting up Admin System...\n');

    try {
        // 1. Check if admin tables exist
        console.log('📋 Checking database tables...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['bpl_apl_verifications', 'user_feedback']);

        if (tablesError) {
            console.log('⚠️ Could not check tables, proceeding with setup...');
        } else {
            console.log('✅ Database connection successful');
        }

        // 2. Create admin user instructions
        console.log('\n👤 Admin User Setup Instructions:');
        console.log('=====================================');
        console.log('1. Go to your registration page: http://localhost:3000/register');
        console.log('2. Register a new user with these details:');
        console.log('   - Full Name: Admin');
        console.log('   - Email: admin@tutor.ai (or your preferred email)');
        console.log('   - Class: Class 1 (or any class)');
        console.log('   - Board: CBSE');
        console.log('   - Economic Status: Premium');
        console.log('3. After registration, run this command to update the user:');
        console.log('   UPDATE user_profiles SET full_name = \'Admin\' WHERE email = \'your-admin-email@example.com\';');
        console.log('4. Access admin dashboard at: http://localhost:3000/admin');

        // 3. Show current users
        console.log('\n👥 Current Users:');
        console.log('==================');
        
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select('full_name, email, class, board, created_at')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.log('❌ Error fetching users:', usersError.message);
        } else if (users && users.length > 0) {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name} (${user.email})`);
                console.log(`   Class: ${user.class}, Board: ${user.board}`);
                console.log(`   Joined: ${new Date(user.created_at).toLocaleDateString()}`);
                console.log('');
            });
        } else {
            console.log('No users found in the system.');
        }

        // 4. Check for existing admin
        console.log('🔍 Checking for existing admin user...');
        const { data: adminUser, error: adminError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('full_name', 'Admin')
            .single();

        if (adminError && adminError.code !== 'PGRST116') {
            console.log('❌ Error checking admin user:', adminError.message);
        } else if (adminUser) {
            console.log('✅ Admin user found:', adminUser.email);
            console.log('   You can access admin dashboard at: http://localhost:3000/admin');
        } else {
            console.log('❌ No admin user found. Please create one using the instructions above.');
        }

        // 5. Show verification status
        console.log('\n📋 Verification System Status:');
        console.log('===============================');
        
        const { data: verifications, error: verError } = await supabase
            .from('bpl_apl_verifications')
            .select('verification_status')
            .order('created_at', { ascending: false });

        if (verError) {
            console.log('❌ Error fetching verifications:', verError.message);
        } else if (verifications && verifications.length > 0) {
            const pending = verifications.filter(v => v.verification_status === 'pending').length;
            const approved = verifications.filter(v => v.verification_status === 'approved').length;
            const rejected = verifications.filter(v => v.verification_status === 'rejected').length;
            
            console.log(`Pending: ${pending}`);
            console.log(`Approved: ${approved}`);
            console.log(`Rejected: ${rejected}`);
            console.log(`Total: ${verifications.length}`);
        } else {
            console.log('No verification requests found.');
        }

        // 6. Show feedback status
        console.log('\n💬 Feedback System Status:');
        console.log('===========================');
        
        const { data: feedback, error: feedbackError } = await supabase
            .from('user_feedback')
            .select('status')
            .order('created_at', { ascending: false });

        if (feedbackError) {
            console.log('❌ Error fetching feedback:', feedbackError.message);
        } else if (feedback && feedback.length > 0) {
            const unread = feedback.filter(f => f.status === 'unread').length;
            const read = feedback.filter(f => f.status === 'read').length;
            const replied = feedback.filter(f => f.status === 'replied').length;
            
            console.log(`Unread: ${unread}`);
            console.log(`Read: ${read}`);
            console.log(`Replied: ${replied}`);
            console.log(`Total: ${feedback.length}`);
        } else {
            console.log('No feedback messages found.');
        }

        console.log('\n✅ Admin system setup complete!');
        console.log('\n📝 Next Steps:');
        console.log('1. Create admin user through registration');
        console.log('2. Update user profile to set full_name = "Admin"');
        console.log('3. Access admin dashboard at /admin');
        console.log('4. Test verification and feedback systems');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run the setup
setupAdminSystem(); 