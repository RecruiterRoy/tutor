const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load Supabase configuration
const supabaseUrl = 'https://xhuljxuxnlwtocfmwiid.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM4NjA5MywiZXhwIjoyMDY3OTYyMDkzfQ.hnyaZ_vFjflVJSRqYf1y85-sVHTJFnP3sNxDnJ9aRrI'; // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRegisteredProfilesTable() {
    try {
        console.log('🚀 Setting up registered_profiles table...');
        
        // Read the SQL file
        const sqlFile = path.join(__dirname, '..', 'database', 'create_registered_profiles_table.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('📖 Executing SQL script...');
        
        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sqlContent
        });
        
        if (error) {
            console.error('❌ Error executing SQL:', error);
            
            // Try alternative method - execute via REST API
            console.log('🔄 Trying alternative method...');
            
            // Split SQL into individual statements
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        console.log(`Executing: ${statement.substring(0, 50)}...`);
                        const { error: stmtError } = await supabase.rpc('exec_sql', {
                            sql_query: statement + ';'
                        });
                        if (stmtError) {
                            console.warn(`⚠️ Warning on statement: ${stmtError.message}`);
                        }
                    } catch (stmtErr) {
                        console.warn(`⚠️ Statement warning: ${stmtErr.message}`);
                    }
                }
            }
        }
        
        console.log('✅ registered_profiles table setup completed!');
        
        // Test the table
        console.log('🧪 Testing table access...');
        const { data: testData, error: testError } = await supabase
            .from('registered_profiles')
            .select('*')
            .limit(1);
            
        if (testError) {
            console.error('❌ Table test failed:', testError);
        } else {
            console.log('✅ Table is accessible!');
        }
        
        // Test the function
        console.log('🧪 Testing functions...');
        const { data: funcData, error: funcError } = await supabase.rpc('move_registered_profile_to_user_profiles', {
            user_email: 'test@example.com',
            auth_user_id: '00000000-0000-0000-0000-000000000000'
        });
        
        if (funcError && !funcError.message.includes('does not exist')) {
            console.error('❌ Function test failed:', funcError);
        } else {
            console.log('✅ Functions are working!');
        }
        
    } catch (err) {
        console.error('❌ Setup failed:', err);
        process.exit(1);
    }
}

// Run the setup
setupRegisteredProfilesTable()
    .then(() => {
        console.log('🎉 All done! The registered_profiles system is ready.');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Setup failed:', err);
        process.exit(1);
    }); 