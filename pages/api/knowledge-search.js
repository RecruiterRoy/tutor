import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const bucket = 'educational-content';

class KnowledgeSearch {
  constructor() {
    this.knowledgeBank = null;
    this.isLoaded = false;
  }

  async loadKnowledgeBank() {
    if (this.isLoaded) return true;
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download('knowledge-bank/index.json');
      
      if (error) {
        console.error('Error loading knowledge bank:', error);
        return false;
      }
      
      const text = await data.text();
      this.knowledgeBank = JSON.parse(text);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading knowledge bank:', error);
      return false;
    }
  }

  async searchKnowledge(query, grade, subject) {
    if (!this.isLoaded) {
      await this.loadKnowledgeBank();
    }

    if (!this.knowledgeBank) {
      return { books: [], images: [], context: '' };
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    
    const results = {
      books: [],
      images: [],
      context: ''
    };

    // Search books
    for (const [bookName, bookData] of Object.entries(this.knowledgeBank.books)) {
      // Filter by grade and subject
      if (grade && bookData.grade !== grade) continue;
      if (subject && bookData.subject.toLowerCase() !== subject.toLowerCase()) continue;

      let score = 0;
      const searchText = `${bookName} ${bookData.subject} ${bookData.grade}`.toLowerCase();

      for (const word of queryWords) {
        if (searchText.includes(word)) score += 1;
      }

      // Check chapter names
      for (const chapter of bookData.chapters) {
        const chapterText = `${chapter.chapterName} ${chapter.fileName}`.toLowerCase();
        for (const word of queryWords) {
          if (chapterText.includes(word)) score += 0.5;
        }
      }

      if (score > 0) {
        results.books.push({
          ...bookData,
          relevanceScore: score
        });
      }
    }

    // Search images
    if (this.knowledgeBank.images[subject]) {
      const gradeImages = this.knowledgeBank.images[subject][grade] || [];
      for (const image of gradeImages) {
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

    // Limit results
    results.books = results.books.slice(0, 3);
    results.images = results.images.slice(0, 3);

    // Generate context
    results.context = this.generateContext(results, grade, subject);

    return results;
  }

  generateContext(results, grade, subject) {
    let context = `Based on the available educational content for ${grade} ${subject}:\n\n`;

    if (results.books.length > 0) {
      context += "**Available Books:**\n";
      for (const book of results.books) {
        context += `- ${book.name}: ${book.chapters.length} chapters\n`;
      }
      context += "\n";
    }

    if (results.images.length > 0) {
      context += "**Relevant Images:**\n";
      for (const image of results.images) {
        context += `- ${image.description}\n`;
      }
      context += "\n";
    }

    context += "Please use this context to provide accurate, grade-appropriate information. ";
    context += "If relevant images are available, mention them in your response. ";
    context += "If specific book chapters are relevant, reference them appropriately.";

    return context;
  }
}

const knowledgeSearch = new KnowledgeSearch();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, grade, subject } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await knowledgeSearch.searchKnowledge(query, grade, subject);

    res.status(200).json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Knowledge search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      results: { books: [], images: [], context: '' }
    });
  }
} 
