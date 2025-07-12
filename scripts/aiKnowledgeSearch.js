import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhuljxuxnlwtocfmwiid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodWxqeHV4bmx3dG9jZm13aWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczNDgxNiwiZXhwIjoyMDY3MzEwODE2fQ.zWM_bFG_5ugzORG-hedkwuZ5sUxyJVj--zcf1UCMrow'
);

const bucket = 'educational-content';

class AIKnowledgeSearch {
  constructor() {
    this.knowledgeBank = null;
    this.searchIndex = null;
    this.isLoaded = false;
  }

  async loadKnowledgeBank() {
    try {
      console.log('📚 Loading knowledge bank...');
      
      // Load main knowledge bank
      const { data: mainData, error: mainError } = await supabase.storage
        .from(bucket)
        .download('knowledge-bank/index.json');
      
      if (mainError) {
        console.error('Error loading knowledge bank:', mainError);
        return false;
      }
      
      const mainText = await mainData.text();
      this.knowledgeBank = JSON.parse(mainText);
      
      // Load search index
      const { data: searchData, error: searchError } = await supabase.storage
        .from(bucket)
        .download('knowledge-bank/search-index.json');
      
      if (!searchError) {
        const searchText = await searchData.text();
        this.searchIndex = JSON.parse(searchText);
      }
      
      this.isLoaded = true;
      console.log('✅ Knowledge bank loaded successfully');
      return true;
      
    } catch (error) {
      console.error('Error loading knowledge bank:', error);
      return false;
    }
  }

  async searchKnowledge(query, options = {}) {
    if (!this.isLoaded) {
      await this.loadKnowledgeBank();
    }

    const {
      subject = null,
      grade = null,
      maxResults = 5,
      includeImages = true,
      includeBooks = true
    } = options;

    const results = {
      books: [],
      images: [],
      topics: [],
      suggestions: []
    };

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    try {
      // Search in books
      if (includeBooks) {
        results.books = await this.searchBooks(queryWords, subject, grade, maxResults);
      }

      // Search in images
      if (includeImages) {
        results.images = await this.searchImages(queryWords, subject, grade, maxResults);
      }

      // Generate suggestions
      results.suggestions = this.generateSuggestions(query, subject, grade);

      return results;

    } catch (error) {
      console.error('Search error:', error);
      return results;
    }
  }

  async searchBooks(queryWords, subject, grade, maxResults) {
    const bookResults = [];

    for (const [bookName, bookData] of Object.entries(this.knowledgeBank.books)) {
      // Filter by subject and grade if specified
      if (subject && bookData.subject.toLowerCase() !== subject.toLowerCase()) continue;
      if (grade && bookData.grade !== grade) continue;

      // Calculate relevance score
      let score = 0;
      const searchText = `${bookName} ${bookData.subject} ${bookData.grade}`.toLowerCase();

      for (const word of queryWords) {
        if (searchText.includes(word)) {
          score += 1;
        }
      }

      // Check chapter names
      for (const chapter of bookData.chapters) {
        const chapterText = `${chapter.chapterName} ${chapter.fileName}`.toLowerCase();
        for (const word of queryWords) {
          if (chapterText.includes(word)) {
            score += 0.5;
          }
        }
      }

      if (score > 0) {
        bookResults.push({
          ...bookData,
          relevanceScore: score,
          searchQuery: queryWords.join(' ')
        });
      }
    }

    // Sort by relevance and return top results
    return bookResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  async searchImages(queryWords, subject, grade, maxResults) {
    const imageResults = [];

    for (const [subjectKey, grades] of Object.entries(this.knowledgeBank.images)) {
      // Filter by subject if specified
      if (subject && subjectKey.toLowerCase() !== subject.toLowerCase()) continue;

      for (const [gradeKey, images] of Object.entries(grades)) {
        // Filter by grade if specified
        if (grade && gradeKey !== grade) continue;

        for (const image of images) {
          // Calculate relevance score
          let score = 0;
          const searchText = `${image.description} ${image.fileName} ${image.subject} ${image.grade}`.toLowerCase();

          for (const word of queryWords) {
            if (searchText.includes(word)) {
              score += 1;
            }
          }

          if (score > 0) {
            imageResults.push({
              ...image,
              relevanceScore: score,
              searchQuery: queryWords.join(' ')
            });
          }
        }
      }
    }

    // Sort by relevance and return top results
    return imageResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  generateSuggestions(query, subject, grade) {
    const suggestions = [];
    const queryLower = query.toLowerCase();

    // Subject suggestions
    if (!subject) {
      for (const subjectName of Object.keys(this.knowledgeBank.subjects)) {
        if (subjectName.toLowerCase().includes(queryLower)) {
          suggestions.push(`Learn about ${subjectName}`);
        }
      }
    }

    // Grade suggestions
    if (!grade) {
      for (const gradeName of Object.keys(this.knowledgeBank.grades)) {
        if (gradeName.toLowerCase().includes(queryLower)) {
          suggestions.push(`Explore ${gradeName} content`);
        }
      }
    }

    // Book suggestions
    for (const [bookName, bookData] of Object.entries(this.knowledgeBank.books)) {
      if (bookName.toLowerCase().includes(queryLower)) {
        suggestions.push(`Read ${bookName} (${bookData.subject}, ${bookData.grade})`);
      }
    }

    return suggestions.slice(0, 5);
  }

  async getContextForResponse(query, userGrade, userSubject) {
    const searchResults = await this.searchKnowledge(query, {
      subject: userSubject,
      grade: userGrade,
      maxResults: 3,
      includeImages: true,
      includeBooks: true
    });

    let context = `Based on the available educational content for ${userGrade} ${userSubject}:\n\n`;

    // Add book context
    if (searchResults.books.length > 0) {
      context += "**Relevant Books:**\n";
      for (const book of searchResults.books) {
        context += `- ${book.name}: ${book.chapters.length} chapters available\n`;
      }
      context += "\n";
    }

    // Add image context
    if (searchResults.images.length > 0) {
      context += "**Relevant Images:**\n";
      for (const image of searchResults.images) {
        context += `- ${image.description}\n`;
      }
      context += "\n";
    }

    // Add suggestions
    if (searchResults.suggestions.length > 0) {
      context += "**Suggestions:**\n";
      for (const suggestion of searchResults.suggestions) {
        context += `- ${suggestion}\n`;
      }
    }

    return context;
  }

  async getRelevantImages(query, userGrade, userSubject) {
    const searchResults = await this.searchImages(
      query.toLowerCase().split(/\s+/),
      userSubject,
      userGrade,
      3
    );

    return searchResults.map(image => ({
      src: `/api/storage/${bucket}/${image.path}`,
      alt: image.description,
      description: image.description
    }));
  }

  async getBookContent(bookName, chapterNumber = null) {
    if (!this.knowledgeBank.books[bookName]) {
      return null;
    }

    const book = this.knowledgeBank.books[bookName];
    
    if (chapterNumber) {
      const chapter = book.chapters.find(ch => ch.chapterNumber === chapterNumber);
      return chapter ? { book, chapter } : null;
    }

    return book;
  }
}

// Export for use in other files
export default AIKnowledgeSearch;

// Test function
async function testKnowledgeSearch() {
  console.log('🧪 Testing Knowledge Search...\n');
  
  const search = new AIKnowledgeSearch();
  const loaded = await search.loadKnowledgeBank();
  
  if (!loaded) {
    console.log('❌ Failed to load knowledge bank');
    return;
  }

  // Test search
  const results = await search.searchKnowledge('mathematics', {
    subject: 'Mathematics',
    grade: 'class6',
    maxResults: 3
  });

  console.log('📊 Search Results:');
  console.log(`Books found: ${results.books.length}`);
  console.log(`Images found: ${results.images.length}`);
  console.log(`Suggestions: ${results.suggestions.length}`);

  if (results.books.length > 0) {
    console.log('\n📚 Sample Book:');
    console.log(results.books[0]);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testKnowledgeSearch().catch(console.error);
} 