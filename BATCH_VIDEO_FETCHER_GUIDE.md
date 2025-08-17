# Batch Video Fetcher System Guide

## 🎯 Overview

This system automatically fetches and saves **20 unique educational videos** for each subject and class combination from top YouTube educational channels. It systematically processes all combinations and saves them to your Supabase database.

## 📋 Subject-Class Combinations

The system processes **20 combinations** total:

### English Videos (4 classes)
- English Class 1-3: 20 videos
- English Class 4-6: 20 videos  
- English Class 7-8: 20 videos
- English Class 9-10: 20 videos

### Hindi Videos (4 classes)
- Hindi Class 1-3: 20 videos
- Hindi Class 4-6: 20 videos
- Hindi Class 7-8: 20 videos
- Hindi Class 9-10: 20 videos

### Mathematics Videos (4 classes)
- Mathematics Class 1-3: 20 videos
- Mathematics Class 4-6: 20 videos
- Mathematics Class 7-8: 20 videos
- Mathematics Class 9-10: 20 videos

### Science Videos (4 classes)
- Science Class 1-3: 20 videos
- Science Class 4-6: 20 videos
- Science Class 7-8: 20 videos
- Science Class 9-10: 20 videos

### Social Studies Videos (4 classes)
- Social Studies Class 1-3: 20 videos
- Social Studies Class 4-6: 20 videos
- Social Studies Class 7-8: 20 videos
- Social Studies Class 9-10: 20 videos

**Total Target: 400 unique educational videos**

## 🚀 How to Use

### 1. Start All Batch Processing

```powershell
# Start processing all 20 combinations
.\batch-video-fetcher.ps1 -Action start_all
```

This will:
- ✅ Check existing videos in database
- ✅ Skip combinations that already have 20+ videos
- ✅ Fetch new videos from YouTube educational channels
- ✅ Save unique videos to Supabase database
- ✅ Process in background (non-blocking)

### 2. Check Progress

```powershell
# Check current processing progress
.\batch-video-fetcher.ps1 -Action get_progress
```

Shows:
- Total combinations to process
- Completed combinations
- Failed combinations
- Recent results

### 3. Get Database Statistics

```powershell
# Get comprehensive database stats
.\batch-video-fetcher.ps1 -Action get_stats
```

Shows:
- Total videos in database
- Validation status
- Breakdown by subject and class
- Progress towards 20 videos per combination

### 4. Process Specific Combination

```powershell
# Process specific subject and class
.\batch-video-fetcher.ps1 -Action process_specific -Subject english -ClassLevel 1-3
```

### 5. View All Combinations

```powershell
# See all subject-class combinations
.\batch-video-fetcher.ps1 -Action get_combinations
```

## 📺 Indian Educational Channels Used

The system fetches from top **Indian educational channels** dedicated to Indian student content:

### Indian Educational Channels
- **ChuChuTV Nursery Rhymes** - Indian nursery rhymes and early learning
- **Infobells** - Indian educational content for kids
- **Khan Academy Kids** - International but adapted for Indian curriculum
- **BYJUS Early Learn** - Indian educational company content
- **Peekaboo Kidz** - Indian educational animations
- **Math Learning 4 Kids** - Indian math education
- **Cocomelon** - International but widely used in India
- **Smart Kid Learning** - Indian smart learning content
- **Kids Maths Tricks** - Indian math tricks and techniques
- **Lakshya juniors** - Indian junior learning content

These channels are specifically chosen because they:
- ✅ Create content for Indian students
- ✅ Follow Indian curriculum standards
- ✅ Use Indian examples and contexts
- ✅ Provide culturally relevant educational content
- ✅ Cover all subjects (English, Hindi, Mathematics, Science, Social Studies)

## 🎯 Subject Keywords by Class Level

### English
- **Class 1-3**: alphabet, abc, phonics, reading, spelling, grammar, nursery rhymes, songs, stories
- **Class 4-6**: grammar, vocabulary, comprehension, writing, literature, poetry
- **Class 7-8**: grammar, literature, writing, comprehension, vocabulary, essay
- **Class 9-10**: literature, grammar, writing, comprehension, poetry, drama, novel

### Hindi
- **Class 1-3**: hindi, vyakaran, barakhadi, vyanjan, matra, swar, hindi rhymes
- **Class 4-6**: hindi, vyakaran, grammar, comprehension, writing
- **Class 7-8**: hindi, vyakaran, literature, grammar, writing
- **Class 9-10**: hindi, literature, vyakaran, grammar, writing

### Mathematics
- **Class 1-3**: counting, numbers, addition, subtraction, shapes, tables, multiplication
- **Class 4-6**: addition, subtraction, multiplication, division, fractions, decimals, geometry
- **Class 7-8**: algebra, geometry, fractions, percentages, statistics, trigonometry
- **Class 9-10**: algebra, geometry, trigonometry, calculus, statistics, probability

### Science
- **Class 1-3**: plants, animals, body, environment, weather, seasons, evs
- **Class 4-6**: plants, animals, human body, environment, matter, energy
- **Class 7-8**: physics, chemistry, biology, environment, matter, energy
- **Class 9-10**: physics, chemistry, biology, environmental science, astronomy

### Social Studies
- **Class 1-3**: community, family, places, transport, festivals
- **Class 4-6**: history, geography, civics, culture, heritage
- **Class 7-8**: history, geography, civics, economics, culture
- **Class 9-10**: history, geography, civics, economics, political science

## 🔧 System Features

### ✅ Smart Duplicate Detection
- Checks if video already exists in database
- Skips duplicates automatically
- Ensures unique video collection

### ✅ Progress Tracking
- Real-time progress monitoring
- Detailed success/failure reporting
- Background processing support

### ✅ API Rate Limiting
- Respects YouTube API limits
- Automatic delays between requests
- Batch processing optimization

### ✅ Database Integration
- Direct Supabase integration
- Automatic validation status
- Structured data storage

### ✅ Error Handling
- Graceful error recovery
- Detailed error reporting
- Failed batch retry capability

## 📊 Expected Results

After running the complete batch process, you should have:

- **400 total videos** (20 per combination)
- **5 subjects** × **4 class levels** = **20 combinations**
- **Unique, high-quality educational content**
- **Properly categorized and tagged videos**
- **Ready for topic-based video selection**

## 🚨 Important Notes

1. **YouTube API Key Required**: Make sure your `YOUTUBE_DATA_API_KEY` is set in environment variables
2. **Supabase Connection**: Ensure Supabase is properly configured
3. **Processing Time**: Full batch processing may take 30-60 minutes
4. **Background Processing**: The system runs in background, check progress regularly
5. **Duplicate Prevention**: System automatically skips existing videos

## 🎉 Success Indicators

- ✅ All combinations show 20 videos in database stats
- ✅ Validation rate approaches 100%
- ✅ Topic-based video selection works properly
- ✅ Videos are properly categorized by subject and class

## 🔄 Maintenance

- Run `get_stats` regularly to monitor video counts
- Use `process_specific` to top up any combinations below 20 videos
- Check `get_progress` during batch processing
- Monitor YouTube API usage and limits

This system ensures you have a comprehensive, high-quality educational video database for your tutoring platform!
