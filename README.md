# tution.app - AI-Powered Educational Assistant

An intelligent AI tutor that uses NCERT books to provide personalized learning experiences for Indian students.

## Features

- 🤖 **AI-Powered Tutoring**: GPT-4 integration with NCERT curriculum
- 📚 **Local Book Access**: Direct access to NCERT books from local drive
- 🎤 **Voice Interaction**: Speech recognition and text-to-speech
- 👥 **Group Learning**: Collaborative study sessions
- 📊 **Learning Progress**: Track and visualize learning progress
- 🎭 **Regional Avatars**: Culturally diverse avatar options
- 🔐 **OAuth Authentication**: Google and GitHub login
- ♿ **Accessibility**: Dyslexia-friendly fonts, high contrast, screen reader support

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Supabase account

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd tutor

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
```

### 4. Database Setup

Run the SQL commands in `database/schema.sql` in your Supabase SQL editor to create the required tables.

### 5. Book Setup

Place your NCERT books in the `books/` directory. The application will automatically process them on first run.

### 6. Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
tutor/
├── books/                 # NCERT books directory
├── js/                   # Frontend JavaScript files
│   ├── dashboard.js      # Main dashboard functionality
│   ├── voiceRecognition.js # Voice interaction
│   ├── learningProgress.js # Progress tracking
│   ├── groupLearning.js  # Group features
│   └── supabaseClient.js # Supabase configuration
├── utils/
│   └── pdfExtractor.js   # PDF processing
├── database/
│   └── schema.sql        # Database schema
├── server.js             # Express server
├── dashboard.html        # Main dashboard
└── package.json
```

## Features in Detail

### AI Tutor
- Connects to GPT-4 API
- Uses local NCERT books for context
- Provides syllabus-specific responses
- Supports multiple languages (Hindi, English, Hinglish)

### Voice Interaction
- Speech recognition for input
- Text-to-speech for responses
- Ambient listening mode
- Wake word detection

### Regional Avatars
- 30+ culturally diverse avatars
- Covers all major Indian regions
- Male and female options
- Region-appropriate attire

### Learning Progress
- Subject-wise progress tracking
- Strengths and weaknesses analysis
- Study session history
- Personalized recommendations

### Group Learning
- Real-time collaborative sessions
- Shared notes and discussions
- Speaker identification
- Group progress tracking

### Accessibility
- Dyslexia-friendly fonts
- High contrast mode
- Screen reader support
- Keyboard navigation

## API Endpoints

- `POST /api/chat` - AI chat with book context
- `GET /api/books` - Get available books
- `POST /api/search` - Search book content
- `POST /api/preferences` - Save user preferences
- `POST /api/study-session` - Save study sessions
- `GET /api/avatars` - Get available avatars

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
# Force deploy 07/11/2025 15:20:44
