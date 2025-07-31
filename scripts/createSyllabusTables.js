import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

async function createSyllabusTables() {
  console.log('📚 Creating CBSE Syllabus Database Tables...\n');
  
  try {
    // 1. Create subjects table
    console.log('📋 Creating subjects table...');
    const { error: subjectsError } = await supabase.rpc('create_subjects_table', {});
    
    if (subjectsError) {
      console.log('Subjects table might already exist, creating manually...');
      const { error: createSubjectsError } = await supabase
        .from('subjects')
        .insert([
          { id: 1, name: 'Mathematics', code: 'MATH' },
          { id: 2, name: 'Science', code: 'SCI' },
          { id: 3, name: 'English', code: 'ENG' },
          { id: 4, name: 'Hindi', code: 'HIN' },
          { id: 5, name: 'Social Studies', code: 'SST' },
          { id: 6, name: 'Computer Science', code: 'CS' }
        ])
        .select();
      
      if (createSubjectsError && !createSubjectsError.message.includes('duplicate')) {
        console.error('❌ Error creating subjects:', createSubjectsError);
      } else {
        console.log('✅ Subjects table ready');
      }
    } else {
      console.log('✅ Subjects table created');
    }

    // 2. Create classes table
    console.log('📚 Creating classes table...');
    const { error: classesError } = await supabase.rpc('create_classes_table', {});
    
    if (classesError) {
      console.log('Classes table might already exist, creating manually...');
      const { error: createClassesError } = await supabase
        .from('classes')
        .insert([
          { id: 1, name: 'Class 1', grade: 1 },
          { id: 2, name: 'Class 2', grade: 2 },
          { id: 3, name: 'Class 3', grade: 3 },
          { id: 4, name: 'Class 4', grade: 4 },
          { id: 5, name: 'Class 5', grade: 5 },
          { id: 6, name: 'Class 6', grade: 6 },
          { id: 7, name: 'Class 7', grade: 7 },
          { id: 8, name: 'Class 8', grade: 8 },
          { id: 9, name: 'Class 9', grade: 9 },
          { id: 10, name: 'Class 10', grade: 10 },
          { id: 11, name: 'Class 11', grade: 11 },
          { id: 12, name: 'Class 12', grade: 12 }
        ])
        .select();
      
      if (createClassesError && !createClassesError.message.includes('duplicate')) {
        console.error('❌ Error creating classes:', createClassesError);
      } else {
        console.log('✅ Classes table ready');
      }
    } else {
      console.log('✅ Classes table created');
    }

    // 3. Create syllabus table
    console.log('📖 Creating syllabus table...');
    const { error: syllabusError } = await supabase.rpc('create_syllabus_table', {});
    
    if (syllabusError) {
      console.log('Syllabus table might already exist, checking structure...');
      const { data: syllabusData, error: checkError } = await supabase
        .from('cbse_syllabus')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Syllabus table not accessible:', checkError);
      } else {
        console.log('✅ Syllabus table ready');
      }
    } else {
      console.log('✅ Syllabus table created');
    }

    // 4. Create chapters table
    console.log('📑 Creating chapters table...');
    const { error: chaptersError } = await supabase.rpc('create_chapters_table', {});
    
    if (chaptersError) {
      console.log('Chapters table might already exist, checking structure...');
      const { data: chaptersData, error: checkError } = await supabase
        .from('cbse_chapters')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Chapters table not accessible:', checkError);
      } else {
        console.log('✅ Chapters table ready');
      }
    } else {
      console.log('✅ Chapters table created');
    }

    // 5. Create topics table
    console.log('📝 Creating topics table...');
    const { error: topicsError } = await supabase.rpc('create_topics_table', {});
    
    if (topicsError) {
      console.log('Topics table might already exist, checking structure...');
      const { data: topicsData, error: checkError } = await supabase
        .from('cbse_topics')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Topics table not accessible:', checkError);
      } else {
        console.log('✅ Topics table ready');
      }
    } else {
      console.log('✅ Topics table created');
    }

    console.log('\n🎉 All syllabus tables are ready!');
    console.log('\n📊 Table Structure:');
    console.log('- subjects: Basic subject information');
    console.log('- classes: Class/grade information');
    console.log('- cbse_syllabus: Main syllabus entries');
    console.log('- cbse_chapters: Chapter-wise content');
    console.log('- cbse_topics: Topic-wise detailed content');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

createSyllabusTables().catch(console.error); 