import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'process.env.SUPABASE_SERVICE_KEY'
);

const bucket = 'educational-content';

async function updateKnowledgeBankWithSyllabus() {
  console.log('📚 Updating Knowledge Bank with CBSE Syllabus...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Load existing knowledge bank
    console.log('📖 Loading existing knowledge bank...');
    const { data: kbData, error: kbError } = await supabase.storage
      .from(bucket)
      .download('knowledge-bank/index.json');

    if (kbError) {
      console.error('Error loading knowledge bank:', kbError);
      return;
    }

    const knowledgeBank = JSON.parse(await kbData.text());
    console.log('✅ Knowledge bank loaded');

    // 2. Add syllabus structure
    if (!knowledgeBank.syllabus) {
      knowledgeBank.syllabus = {};
    }

    // 3. Scan CBSE Syllabus folder
    console.log('📋 Scanning CBSE Syllabus...');
    const { data: syllabusFiles, error: syllabusError } = await supabase.storage
      .from(bucket)
      .list('CBSE Syllabus');

    if (syllabusError) {
      console.log('⚠️  Error accessing CBSE Syllabus:', syllabusError.message);
    } else {
      console.log(`Found ${syllabusFiles.length} syllabus files`);

      for (const syllabusFile of syllabusFiles) {
        const pathParts = syllabusFile.name.split('/');
        const grade = pathParts[0]; // Class 1, Class 2, etc.
        const fileName = pathParts[pathParts.length - 1];

        if (!knowledgeBank.syllabus[grade]) {
          knowledgeBank.syllabus[grade] = {
            grade: grade,
            subjects: {},
            academicYear: '2024-25',
            examMonth: 'March', // Default, can be customized
            totalWeeks: 40, // Academic year weeks
            revisionWeeks: 8 // Last 2 months for revision
          };
        }

        // Extract subject from filename
        const subjectMatch = fileName.match(/Class\s+\d+\s+(\w+)\s+Syllabus/);
        if (subjectMatch) {
          const subject = subjectMatch[1];
          knowledgeBank.syllabus[grade].subjects[subject] = {
            name: subject,
            syllabusFile: `CBSE Syllabus/${syllabusFile.name}`,
            fileName: fileName,
            fileSize: syllabusFile.metadata?.size || 0,
            lastUpdated: new Date().toISOString()
          };
        }
      }
    }

    // 4. Add lesson planning structure
    if (!knowledgeBank.lessonPlans) {
      knowledgeBank.lessonPlans = {};
    }

    // 5. Add assessment structure
    if (!knowledgeBank.assessments) {
      knowledgeBank.assessments = {
        weeklyRevisions: {},
        monthlyTests: {},
        progressTracking: {}
      };
    }

    // 6. Update search index
    console.log('🔍 Updating search index...');
    if (!knowledgeBank.searchIndex.bySyllabus) {
      knowledgeBank.searchIndex.bySyllabus = {};
    }

    // Index syllabus by grade and subject
    for (const [grade, gradeData] of Object.entries(knowledgeBank.syllabus)) {
      for (const [subject, subjectData] of Object.entries(gradeData.subjects)) {
        const key = `${grade}-${subject}`.toLowerCase();
        knowledgeBank.searchIndex.bySyllabus[key] = {
          grade: grade,
          subject: subject,
          syllabus: subjectData
        };
      }
    }

    // 7. Save updated knowledge bank
    console.log('💾 Saving updated knowledge bank...');
    const updatedKnowledgeBankJson = JSON.stringify(knowledgeBank, null, 2);
    const { error: saveError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/index.json', updatedKnowledgeBankJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (saveError) {
      console.error('Error saving updated knowledge bank:', saveError);
      return;
    }

    // Save updated search index
    const searchIndexJson = JSON.stringify(knowledgeBank.searchIndex, null, 2);
    const { error: searchError } = await supabase.storage
      .from(bucket)
      .upload('knowledge-bank/search-index.json', searchIndexJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (searchError) {
      console.error('Error saving search index:', searchError);
    }

    console.log('\n🎉 Knowledge Bank Updated Successfully!');
    console.log('\n📊 Updated Summary:');
    console.log(`- Subjects: ${Object.keys(knowledgeBank.subjects).length}`);
    console.log(`- Grades: ${Object.keys(knowledgeBank.grades).length}`);
    console.log(`- Books: ${Object.keys(knowledgeBank.books).length}`);
    console.log(`- Syllabus Grades: ${Object.keys(knowledgeBank.syllabus).length}`);
    console.log(`- Total Chapters: ${Object.values(knowledgeBank.books).reduce((sum, book) => sum + book.chapters.length, 0)}`);

    // Display syllabus info
    console.log('\n📋 Syllabus Coverage:');
    for (const [grade, gradeData] of Object.entries(knowledgeBank.syllabus)) {
      const subjects = Object.keys(gradeData.subjects);
      console.log(`  - ${grade}: ${subjects.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Knowledge bank update failed:', error);
  }
}

// Run the update
updateKnowledgeBankWithSyllabus().catch(console.error); 
