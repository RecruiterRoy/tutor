import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

async function testKnowledgeBank() {
  console.log('🧪 Testing Knowledge Bank System...\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // 1. Check if knowledge bank exists
    console.log('📁 Checking knowledge bank files...');
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('knowledge-bank');

    if (error) {
      console.error('❌ Error accessing knowledge bank:', error);
      return;
    }

    if (!files || files.length === 0) {
      console.log('❌ No knowledge bank files found. Please run createKnowledgeBank.js first.');
      return;
    }

    console.log(`✅ Found ${files.length} knowledge bank files:`);
    files.forEach(file => console.log(`  - ${file.name}`));
    console.log();

    // 2. Load and test knowledge bank
    console.log('📚 Loading knowledge bank...');
    const { data: kbData, error: kbError } = await supabase.storage
      .from(bucket)
      .download('knowledge-bank/index.json');

    if (kbError) {
      console.error('❌ Error loading knowledge bank:', kbError);
      return;
    }

    const knowledgeBank = JSON.parse(await kbData.text());
    console.log('✅ Knowledge bank loaded successfully\n');

    // 3. Display knowledge bank summary
    console.log('📊 Knowledge Bank Summary:');
    console.log(`- Subjects: ${Object.keys(knowledgeBank.subjects).length}`);
    console.log(`- Grades: ${Object.keys(knowledgeBank.grades).length}`);
    console.log(`- Books: ${Object.keys(knowledgeBank.books).length}`);
    console.log(`- Image Categories: ${Object.keys(knowledgeBank.images).length}`);
    console.log();

    // 4. Test search functionality
    console.log('🔍 Testing search functionality...');
    await testSearchFunctionality(knowledgeBank);

    // 5. Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    await testAPIEndpoint();

    console.log('\n🎉 Knowledge Bank System Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testSearchFunctionality(knowledgeBank) {
  const testQueries = [
    { query: 'mathematics', subject: 'Mathematics', grade: 'class6' },
    { query: 'english', subject: 'English', grade: 'class1' },
    { query: 'science', subject: 'Science', grade: 'class8' }
  ];

  for (const test of testQueries) {
    console.log(`\nTesting: "${test.query}" for ${test.grade} ${test.subject}`);
    
    const results = await searchKnowledge(knowledgeBank, test.query, test.grade, test.subject);
    
    console.log(`  Books found: ${results.books.length}`);
    console.log(`  Images found: ${results.images.length}`);
    
    if (results.books.length > 0) {
      console.log(`  Top book: ${results.books[0].name} (${results.books[0].chapters.length} chapters)`);
    }
    
    if (results.images.length > 0) {
      console.log(`  Top image: ${results.images[0].description}`);
    }
  }
}

async function searchKnowledge(knowledgeBank, query, grade, subject) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  const results = {
    books: [],
    images: [],
    context: ''
  };

  // Search books
  for (const [bookName, bookData] of Object.entries(knowledgeBank.books)) {
    if (bookData.grade !== grade) continue;
    if (bookData.subject.toLowerCase() !== subject.toLowerCase()) continue;

    let score = 0;
    const searchText = `${bookName} ${bookData.subject} ${bookData.grade}`.toLowerCase();

    for (const word of queryWords) {
      if (searchText.includes(word)) score += 1;
    }

    if (score > 0) {
      results.books.push({
        ...bookData,
        relevanceScore: score
      });
    }
  }

  // Search images
  if (knowledgeBank.images[subject] && knowledgeBank.images[subject][grade]) {
    for (const image of knowledgeBank.images[subject][grade]) {
      let score = 0;
      const searchText = `${image.description} ${image.fileName}`.toLowerCase();
      
      for (const word of queryWords) {
        if (searchText.includes(word)) score += 1;
      }

      if (score > 0) {
        results.images.push({
          ...image,
          relevanceScore: score
        });
      }
    }
  }

  // Sort by relevance
  results.books.sort((a, b) => b.relevanceScore - a.relevanceScore);
  results.images.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

async function testAPIEndpoint() {
  try {
    // Test the knowledge search API
    const response = await fetch('http://localhost:3000/api/knowledge-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'mathematics',
        grade: 'class6',
        subject: 'Mathematics'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint working');
      console.log(`  Books found: ${data.results.books.length}`);
      console.log(`  Images found: ${data.results.images.length}`);
    } else {
      console.log('⚠️  API endpoint returned error:', response.status);
    }
  } catch (error) {
    console.log('⚠️  API endpoint test failed (server might not be running):', error.message);
  }
}

// Run the test
testKnowledgeBank().catch(console.error); 