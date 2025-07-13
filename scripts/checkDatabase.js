import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

async function checkDatabase() {
  console.log('🔍 Checking Database Tables...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Try different table names
    const tableNames = ['books', 'user_books', 'educational_books', 'book_data', 'content'];
    
    for (const tableName of tableNames) {
      console.log(`📊 Checking table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`  ✅ ${tableName}: Found ${data.length} records`);
        
        // Get column names
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`     Columns: ${columns.join(', ')}`);
        }
      }
    }

    // Check for any tables with 'book' in the name
    console.log('\n🔍 Searching for tables with "book" in name...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_with_book');

    if (tablesError) {
      console.log('Could not search for book tables:', tablesError.message);
    } else if (tables) {
      console.log('Found tables:', tables);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

// Run the check
checkDatabase().catch(console.error); 
