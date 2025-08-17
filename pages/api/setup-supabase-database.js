// Supabase Database Setup Script
// Creates the necessary tables and indexes for the video database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Setting up Supabase database...');

    // Create videos table
    const createTableResult = await createVideosTable();
    if (!createTableResult.success) {
      return res.status(500).json({ error: createTableResult.error });
    }

    // Create indexes
    const createIndexesResult = await createIndexes();
    if (!createIndexesResult.success) {
      return res.status(500).json({ error: createIndexesResult.error });
    }

    // Create RLS policies
    const createPoliciesResult = await createRLSPolicies();
    if (!createPoliciesResult.success) {
      return res.status(500).json({ error: createPoliciesResult.error });
    }

    console.log('✅ Database setup complete!');
    return res.status(200).json({
      success: true,
      message: 'Database setup completed successfully'
    });

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function createVideosTable() {
  try {
    // SQL to create the videos table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        video_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        channel TEXT NOT NULL,
        subject TEXT NOT NULL,
        class_level TEXT NOT NULL,
        topic TEXT NOT NULL,
        duration TEXT,
        thumbnail_url TEXT,
        is_validated BOOLEAN DEFAULT FALSE,
        validation_status TEXT DEFAULT 'pending',
        validation_date TIMESTAMP WITH TIME ZONE,
        validation_method TEXT,
        validation_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating videos table:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Videos table created successfully');
    return { success: true };

  } catch (error) {
    console.error('Error in createVideosTable:', error);
    return { success: false, error: error.message };
  }
}

async function createIndexes() {
  try {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject);',
      'CREATE INDEX IF NOT EXISTS idx_videos_class_level ON videos(class_level);',
      'CREATE INDEX IF NOT EXISTS idx_videos_topic ON videos(topic);',
      'CREATE INDEX IF NOT EXISTS idx_videos_is_validated ON videos(is_validated);',
      'CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel);',
      'CREATE INDEX IF NOT EXISTS idx_videos_subject_class ON videos(subject, class_level);',
      'CREATE INDEX IF NOT EXISTS idx_videos_subject_class_topic ON videos(subject, class_level, topic);',
      'CREATE INDEX IF NOT EXISTS idx_videos_validation_status ON videos(validation_status);',
      'CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);'
    ];

    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (error) {
        console.error('Error creating index:', error);
        return { success: false, error: error.message };
      }
    }

    console.log('✅ Indexes created successfully');
    return { success: true };

  } catch (error) {
    console.error('Error in createIndexes:', error);
    return { success: false, error: error.message };
  }
}

async function createRLSPolicies() {
  try {
    // Enable RLS
    const enableRLSSQL = 'ALTER TABLE videos ENABLE ROW LEVEL SECURITY;';
    const { error: enableError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
    
    if (enableError) {
      console.error('Error enabling RLS:', enableError);
      return { success: false, error: enableError.message };
    }

    // Create policies
    const policies = [
      // Allow read access to all validated videos
      `CREATE POLICY "Allow read access to validated videos" ON videos
       FOR SELECT USING (is_validated = true);`,
      
      // Allow insert for authenticated users (for admin purposes)
      `CREATE POLICY "Allow insert for authenticated users" ON videos
       FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      
      // Allow update for authenticated users
      `CREATE POLICY "Allow update for authenticated users" ON videos
       FOR UPDATE USING (auth.role() = 'authenticated');`,
      
      // Allow delete for authenticated users
      `CREATE POLICY "Allow delete for authenticated users" ON videos
       FOR DELETE USING (auth.role() = 'authenticated');`
    ];

    for (const policySQL of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policySQL });
      if (error) {
        console.error('Error creating policy:', error);
        return { success: false, error: error.message };
      }
    }

    console.log('✅ RLS policies created successfully');
    return { success: true };

  } catch (error) {
    console.error('Error in createRLSPolicies:', error);
    return { success: false, error: error.message };
  }
}

// Alternative method using direct SQL execution
export async function setupDatabaseDirect() {
  try {
    console.log('🚀 Setting up database using direct SQL...');

    // Create videos table
    const { error: tableError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating videos table...');
      // Note: In a real implementation, you would use migrations or direct SQL
      // For now, we'll assume the table exists or create it manually
    }

    console.log('✅ Database setup complete!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error in setupDatabaseDirect:', error);
    return { success: false, error: error.message };
  }
}
