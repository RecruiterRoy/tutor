// classBookManager.js - Frontend class-wise book management
class ClassBookManager {
  constructor() {
    this.supabase = window.supabase;
    this.currentUser = null;
    this.userClass = null;
    this.availableBooks = new Map();
  }

  async initialize(userId) {
    try {
      this.currentUser = userId;
      console.log('📚 Initializing Class Book Manager...');
      
      // Get user's class from profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('class')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return false;
      }

      this.userClass = profile.class;
      console.log(`👤 User class: ${this.userClass}`);

      // Load available books for user's class
      await this.loadClassBooks(this.userClass);
      
      return true;
    } catch (error) {
      console.error('Class Book Manager initialization failed:', error);
      return false;
    }
  }

  async loadClassBooks(className) {
    try {
      console.log(`📖 Loading books for ${className}...`);
      
      const { data: books, error } = await this.supabase
        .from('class_books')
        .select('*')
        .eq('class_name', className)
        .eq('is_active', true)
        .order('subject', { ascending: true })
        .order('chapter_number', { ascending: true });

      if (error) {
        console.error('Error loading class books:', error);
        return;
      }

      // Organize books by subject
      const organizedBooks = {};
      books.forEach(book => {
        if (!organizedBooks[book.subject]) {
          organizedBooks[book.subject] = [];
        }
        organizedBooks[book.subject].push(book);
      });

      this.availableBooks.set(className, organizedBooks);
      
      console.log(`✅ Loaded ${books.length} chapters for ${className}`);
      console.log('📚 Subjects available:', Object.keys(organizedBooks));
      
      return organizedBooks;
    } catch (error) {
      console.error('Error loading class books:', error);
    }
  }

  async getBooksForSubject(className, subject) {
    try {
      const classBooks = this.availableBooks.get(className);
      if (!classBooks) {
        await this.loadClassBooks(className);
      }
      
      return this.availableBooks.get(className)?.[subject] || [];
    } catch (error) {
      console.error('Error getting books for subject:', error);
      return [];
    }
  }

  async getBookContent(bookId) {
    try {
      // Get book metadata
      const { data: book, error } = await this.supabase
        .from('class_books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) {
        console.error('Error fetching book metadata:', error);
        return null;
      }

      // Get signed URL for file access
      const { data: signedUrl, error: urlError } = await this.supabase.storage
        .from('educational-content')
        .createSignedUrl(book.file_path, 3600); // 1 hour

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        return null;
      }

      return {
        ...book,
        downloadUrl: signedUrl.signedUrl
      };
    } catch (error) {
      console.error('Error getting book content:', error);
      return null;
    }
  }

  async getSubjectsForClass(className) {
    try {
      const { data: subjects, error } = await this.supabase
        .from('class_books')
        .select('subject')
        .eq('class_name', className)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching subjects:', error);
        return [];
      }

      return [...new Set(subjects.map(s => s.subject))];
    } catch (error) {
      console.error('Error getting subjects for class:', error);
      return [];
    }
  }

  async getClassSummary(className) {
    try {
      const { data: summary, error } = await this.supabase
        .from('class_books')
        .select('subject, file_size')
        .eq('class_name', className)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching class summary:', error);
        return null;
      }

      const stats = {
        totalChapters: summary.length,
        totalSize: summary.reduce((sum, book) => sum + (book.file_size || 0), 0),
        subjects: [...new Set(summary.map(s => s.subject))]
      };

      return {
        className,
        ...stats,
        totalSizeMB: (stats.totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting class summary:', error);
      return null;
    }
  }

  // UI Helper Methods
  createSubjectCard(subject, books) {
    const totalSize = books.reduce((sum, book) => sum + (book.file_size || 0), 0);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    return `
      <div class="subject-card bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
        <h3 class="text-lg font-semibold mb-2">${subject}</h3>
        <p class="text-sm opacity-90">${books.length} chapters</p>
        <p class="text-xs opacity-75">${sizeMB} MB</p>
        <button onclick="bookManager.loadSubject('${subject}')" 
                class="mt-2 bg-white text-purple-600 px-3 py-1 rounded text-sm hover:bg-gray-100">
          View Chapters
        </button>
      </div>
    `;
  }

  createChapterList(subject, books) {
    return `
      <div class="chapter-list bg-white rounded-lg p-4 shadow-lg">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">${subject} Chapters</h3>
        <div class="grid gap-2">
          ${books.map(book => `
            <div class="chapter-item flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span class="font-medium">${book.chapter_name}</span>
                <span class="text-sm text-gray-500 ml-2">(${(book.file_size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <button onclick="bookManager.openChapter(${book.id})" 
                      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Open
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Event Handlers
  async loadSubject(subject) {
    const books = await this.getBooksForSubject(this.userClass, subject);
    const container = document.getElementById('bookContent');
    
    if (container) {
      container.innerHTML = this.createChapterList(subject, books);
    }
  }

  async openChapter(bookId) {
    const bookContent = await this.getBookContent(bookId);
    
    if (bookContent) {
      // Open in new tab or embed viewer
      window.open(bookContent.downloadUrl, '_blank');
    } else {
      alert('Unable to load chapter. Please try again.');
    }
  }

  // Dashboard Integration
  async renderClassDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const summary = await this.getClassSummary(this.userClass);
    const subjects = await this.getSubjectsForClass(this.userClass);

    if (!summary) {
      container.innerHTML = '<p class="text-red-500">Unable to load class information.</p>';
      return;
    }

    container.innerHTML = `
      <div class="class-dashboard">
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white mb-6">
          <h2 class="text-2xl font-bold mb-2">${summary.className.toUpperCase()}</h2>
          <p class="opacity-90">${summary.totalChapters} chapters • ${summary.totalSizeMB} MB</p>
          <p class="text-sm opacity-75">${summary.subjects.length} subjects available</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          ${subjects.map(subject => {
            const books = this.availableBooks.get(this.userClass)?.[subject] || [];
            return this.createSubjectCard(subject, books);
          }).join('')}
        </div>
        
        <div id="bookContent" class="mt-6">
          <!-- Chapter content will be loaded here -->
        </div>
      </div>
    `;
  }
}

// Global instance
window.bookManager = new ClassBookManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassBookManager;
} 
