import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSubjectTables() {
    try {
        console.log('Setting up subject management tables...');
        
        // Read the SQL file
        const sqlPath = path.join(process.cwd(), 'database', 'create_subject_tables.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
                
                const { error } = await supabase.rpc('exec_sql', { sql: statement });
                
                if (error) {
                    console.error(`Error executing statement ${i + 1}:`, error);
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        console.log('Subject tables setup completed!');
        
    } catch (error) {
        console.error('Error setting up subject tables:', error);
    }
}

setupSubjectTables(); 