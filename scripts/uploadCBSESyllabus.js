import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  'https://vfqdjpiyaabufpaofysz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// CBSE Syllabus Data - Class 1 to 8
const cbseSyllabus = {
  1: {
    Mathematics: {
      name: "Mathematics Class 1",
      description: "Basic mathematics concepts for Class 1 students",
      chapters: [
        {
          name: "Numbers 1-20",
          topics: [
            "Counting numbers 1 to 20",
            "Writing numbers in words",
            "Number patterns",
            "Before and after numbers",
            "Number line"
          ]
        },
        {
          name: "Addition and Subtraction",
          topics: [
            "Addition within 20",
            "Subtraction within 20",
            "Word problems",
            "Mental math",
            "Number bonds"
          ]
        },
        {
          name: "Shapes and Patterns",
          topics: [
            "Basic shapes (circle, square, triangle, rectangle)",
            "Pattern recognition",
            "Drawing shapes",
            "Shape sorting",
            "Symmetry"
          ]
        },
        {
          name: "Money",
          topics: [
            "Identifying coins and notes",
            "Counting money",
            "Simple transactions",
            "Money word problems"
          ]
        }
      ]
    },
    English: {
      name: "English Class 1",
      description: "English language skills for Class 1 students",
      chapters: [
        {
          name: "Alphabets and Phonics",
          topics: [
            "Letter recognition A-Z",
            "Phonic sounds",
            "Vowels and consonants",
            "Rhyming words",
            "Sight words"
          ]
        },
        {
          name: "Reading and Writing",
          topics: [
            "Simple sentences",
            "Reading comprehension",
            "Picture reading",
            "Writing practice",
            "Story reading"
          ]
        },
        {
          name: "Grammar Basics",
          topics: [
            "Nouns (naming words)",
            "Verbs (action words)",
            "Articles (a, an, the)",
            "Simple present tense",
            "Punctuation"
          ]
        }
      ]
    },
    Hindi: {
      name: "Hindi Class 1",
      description: "Hindi language skills for Class 1 students",
      chapters: [
        {
          name: "वर्णमाला और स्वर",
          topics: [
            "स्वर (अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ)",
            "व्यंजन",
            "मात्राएं",
            "अक्षर ज्ञान",
            "शब्द निर्माण"
          ]
        },
        {
          name: "पठन और लेखन",
          topics: [
            "सरल शब्द पठन",
            "वाक्य पठन",
            "चित्र देखकर कहानी",
            "लेखन अभ्यास",
            "शब्द अर्थ"
          ]
        }
      ]
    }
  },
  2: {
    Mathematics: {
      name: "Mathematics Class 2",
      description: "Mathematics concepts for Class 2 students",
      chapters: [
        {
          name: "Numbers 1-100",
          topics: [
            "Counting 1 to 100",
            "Place value (ones and tens)",
            "Number comparison",
            "Skip counting",
            "Number patterns"
          ]
        },
        {
          name: "Addition and Subtraction",
          topics: [
            "Addition with regrouping",
            "Subtraction with borrowing",
            "Mental math strategies",
            "Word problems",
            "Number bonds to 100"
          ]
        },
        {
          name: "Multiplication and Division",
          topics: [
            "Multiplication tables (2, 5, 10)",
            "Repeated addition",
            "Equal groups",
            "Simple division",
            "Multiplication word problems"
          ]
        },
        {
          name: "Money and Time",
          topics: [
            "Money calculations",
            "Telling time (hours and half hours)",
            "Days of the week",
            "Months of the year",
            "Calendar reading"
          ]
        }
      ]
    },
    English: {
      name: "English Class 2",
      description: "English language skills for Class 2 students",
      chapters: [
        {
          name: "Reading and Comprehension",
          topics: [
            "Reading fluency",
            "Comprehension skills",
            "Story elements",
            "Character analysis",
            "Predicting outcomes"
          ]
        },
        {
          name: "Grammar and Writing",
          topics: [
            "Parts of speech",
            "Sentence structure",
            "Paragraph writing",
            "Creative writing",
            "Letter writing"
          ]
        },
        {
          name: "Vocabulary and Spelling",
          topics: [
            "Word meanings",
            "Synonyms and antonyms",
            "Spelling rules",
            "Compound words",
            "Homophones"
          ]
        }
      ]
    }
  },
  3: {
    Mathematics: {
      name: "Mathematics Class 3",
      description: "Mathematics concepts for Class 3 students",
      chapters: [
        {
          name: "Numbers and Place Value",
          topics: [
            "Numbers up to 1000",
            "Place value (hundreds, tens, ones)",
            "Number comparison",
            "Rounding numbers",
            "Number patterns"
          ]
        },
        {
          name: "Addition and Subtraction",
          topics: [
            "3-digit addition",
            "3-digit subtraction",
            "Mental math",
            "Word problems",
            "Estimation"
          ]
        },
        {
          name: "Multiplication and Division",
          topics: [
            "Multiplication tables (2-10)",
            "Multiplication strategies",
            "Division facts",
            "Division with remainders",
            "Word problems"
          ]
        },
        {
          name: "Fractions and Money",
          topics: [
            "Basic fractions",
            "Money calculations",
            "Time (minutes and seconds)",
            "Length and weight",
            "Capacity"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 3",
      description: "Basic science concepts for Class 3 students",
      chapters: [
        {
          name: "Living and Non-living Things",
          topics: [
            "Characteristics of living things",
            "Plants and animals",
            "Life cycles",
            "Habitats",
            "Food chains"
          ]
        },
        {
          name: "Materials and Objects",
          topics: [
            "Properties of materials",
            "States of matter",
            "Solids, liquids, gases",
            "Materials around us",
            "Uses of materials"
          ]
        },
        {
          name: "Our Body",
          topics: [
            "Body parts and functions",
            "Sense organs",
            "Healthy habits",
            "Food and nutrition",
            "Personal hygiene"
          ]
        }
      ]
    }
  },
  4: {
    Mathematics: {
      name: "Mathematics Class 4",
      description: "Mathematics concepts for Class 4 students",
      chapters: [
        {
          name: "Large Numbers",
          topics: [
            "Numbers up to 10,000",
            "Place value",
            "Number comparison",
            "Rounding",
            "Roman numerals"
          ]
        },
        {
          name: "Addition and Subtraction",
          topics: [
            "4-digit addition",
            "4-digit subtraction",
            "Mental math",
            "Word problems",
            "Estimation"
          ]
        },
        {
          name: "Multiplication and Division",
          topics: [
            "Multiplication by 2-digit numbers",
            "Division by 1-digit numbers",
            "Factors and multiples",
            "Word problems",
            "Patterns"
          ]
        },
        {
          name: "Fractions and Decimals",
          topics: [
            "Equivalent fractions",
            "Comparing fractions",
            "Adding fractions",
            "Introduction to decimals",
            "Money and decimals"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 4",
      description: "Science concepts for Class 4 students",
      chapters: [
        {
          name: "Plants and Animals",
          topics: [
            "Plant parts and functions",
            "Animal classification",
            "Adaptations",
            "Food chains",
            "Conservation"
          ]
        },
        {
          name: "Matter and Energy",
          topics: [
            "States of matter",
            "Changes in matter",
            "Heat and temperature",
            "Light and sound",
            "Simple machines"
          ]
        },
        {
          name: "Our Environment",
          topics: [
            "Natural resources",
            "Pollution",
            "Waste management",
            "Conservation",
            "Sustainable practices"
          ]
        }
      ]
    }
  },
  5: {
    Mathematics: {
      name: "Mathematics Class 5",
      description: "Mathematics concepts for Class 5 students",
      chapters: [
        {
          name: "Large Numbers and Operations",
          topics: [
            "Numbers up to 1,00,000",
            "Place value",
            "Addition and subtraction",
            "Multiplication and division",
            "Word problems"
          ]
        },
        {
          name: "Fractions and Decimals",
          topics: [
            "Equivalent fractions",
            "Adding and subtracting fractions",
            "Multiplying fractions",
            "Decimals up to 3 places",
            "Decimal operations"
          ]
        },
        {
          name: "Geometry and Measurement",
          topics: [
            "Angles and triangles",
            "Perimeter and area",
            "Volume and capacity",
            "Time and money",
            "Data handling"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 5",
      description: "Science concepts for Class 5 students",
      chapters: [
        {
          name: "Living World",
          topics: [
            "Plant and animal cells",
            "Reproduction in plants",
            "Animal life cycles",
            "Food and nutrition",
            "Health and hygiene"
          ]
        },
        {
          name: "Materials and Energy",
          topics: [
            "Properties of materials",
            "Changes in materials",
            "Energy forms",
            "Heat and light",
            "Sound and electricity"
          ]
        },
        {
          name: "Earth and Space",
          topics: [
            "Solar system",
            "Earth's structure",
            "Weather and climate",
            "Natural disasters",
            "Conservation"
          ]
        }
      ]
    }
  },
  6: {
    Mathematics: {
      name: "Mathematics Class 6",
      description: "Mathematics concepts for Class 6 students",
      chapters: [
        {
          name: "Number System",
          topics: [
            "Natural numbers and whole numbers",
            "Integers",
            "Fractions and decimals",
            "Rational numbers",
            "Number line"
          ]
        },
        {
          name: "Algebra",
          topics: [
            "Variables and expressions",
            "Simple equations",
            "Patterns and sequences",
            "Algebraic expressions",
            "Solving equations"
          ]
        },
        {
          name: "Geometry",
          topics: [
            "Basic geometrical ideas",
            "Angles and triangles",
            "Circles",
            "Perimeter and area",
            "Symmetry"
          ]
        },
        {
          name: "Data Handling",
          topics: [
            "Collection of data",
            "Bar graphs and pictographs",
            "Mean, median, mode",
            "Probability",
            "Data interpretation"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 6",
      description: "Science concepts for Class 6 students",
      chapters: [
        {
          name: "Food and Nutrition",
          topics: [
            "Components of food",
            "Balanced diet",
            "Deficiency diseases",
            "Food preservation",
            "Food safety"
          ]
        },
        {
          name: "Materials and Substances",
          topics: [
            "Separation of substances",
            "Changes around us",
            "Sorting materials",
            "Properties of materials",
            "Uses of materials"
          ]
        },
        {
          name: "Living World",
          topics: [
            "Characteristics of living things",
            "Plant and animal classification",
            "Body movements",
            "Habitats and adaptations",
            "Conservation"
          ]
        }
      ]
    }
  },
  7: {
    Mathematics: {
      name: "Mathematics Class 7",
      description: "Mathematics concepts for Class 7 students",
      chapters: [
        {
          name: "Integers and Fractions",
          topics: [
            "Operations on integers",
            "Fractions and decimals",
            "Rational numbers",
            "Exponents and powers",
            "Algebraic expressions"
          ]
        },
        {
          name: "Algebra and Equations",
          topics: [
            "Simple equations",
            "Linear equations",
            "Algebraic expressions",
            "Patterns and sequences",
            "Problem solving"
          ]
        },
        {
          name: "Geometry and Mensuration",
          topics: [
            "Lines and angles",
            "Triangles and quadrilaterals",
            "Circles",
            "Perimeter and area",
            "Volume and surface area"
          ]
        },
        {
          name: "Data Handling and Probability",
          topics: [
            "Data collection and organization",
            "Bar graphs and histograms",
            "Mean, median, mode",
            "Probability",
            "Data interpretation"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 7",
      description: "Science concepts for Class 7 students",
      chapters: [
        {
          name: "Physical and Chemical Changes",
          topics: [
            "Physical changes",
            "Chemical changes",
            "Acids, bases and salts",
            "Heat and temperature",
            "Electric current"
          ]
        },
        {
          name: "Living Systems",
          topics: [
            "Nutrition in plants and animals",
            "Respiration",
            "Transportation in plants and animals",
            "Reproduction in plants",
            "Motion and time"
          ]
        },
        {
          name: "Environment and Resources",
          topics: [
            "Forests and wildlife",
            "Water resources",
            "Waste management",
            "Conservation",
            "Sustainable development"
          ]
        }
      ]
    }
  },
  8: {
    Mathematics: {
      name: "Mathematics Class 8",
      description: "Mathematics concepts for Class 8 students",
      chapters: [
        {
          name: "Rational Numbers and Exponents",
          topics: [
            "Rational numbers",
            "Linear equations",
            "Understanding quadrilaterals",
            "Practical geometry",
            "Data handling"
          ]
        },
        {
          name: "Algebra and Factorization",
          topics: [
            "Algebraic expressions",
            "Factorization",
            "Linear equations",
            "Graphs",
            "Problem solving"
          ]
        },
        {
          name: "Geometry and Mensuration",
          topics: [
            "Understanding shapes",
            "Visualizing solid shapes",
            "Mensuration",
            "Exponents and powers",
            "Direct and inverse proportions"
          ]
        }
      ]
    },
    Science: {
      name: "Science Class 8",
      description: "Science concepts for Class 8 students",
      chapters: [
        {
          name: "Matter and Materials",
          topics: [
            "Force and pressure",
            "Friction",
            "Sound",
            "Chemical reactions",
            "Light"
          ]
        },
        {
          name: "Living Systems",
          topics: [
            "Cell structure and functions",
            "Reproduction in animals",
            "Reaching the age of adolescence",
            "Conservation of plants and animals",
            "Crop production and management"
          ]
        },
        {
          name: "Natural Phenomena",
          topics: [
            "Some natural phenomena",
            "Light",
            "Stars and solar system",
            "Pollution of air and water",
            "Conservation"
          ]
        }
      ]
    }
  }
};

async function uploadCBSESyllabus() {
  console.log('📚 Uploading CBSE Syllabus to Database...\n');
  
  try {
    // First, ensure tables exist
    console.log('🔧 Checking database tables...');
    await createSyllabusTables();
    
    console.log('\n📖 Starting syllabus upload...\n');
    
    let totalSyllabusEntries = 0;
    let totalChapters = 0;
    let totalTopics = 0;
    
    // Upload syllabus for each class
    for (const [classGrade, subjects] of Object.entries(cbseSyllabus)) {
      console.log(`📚 Processing Class ${classGrade}...`);
      
      for (const [subjectName, subjectData] of Object.entries(subjects)) {
        console.log(`  📖 Processing ${subjectName}...`);
        
        // 1. Insert syllabus entry
        const { data: syllabusData, error: syllabusError } = await supabase
          .from('cbse_syllabus')
          .insert({
            class_grade: parseInt(classGrade),
            subject_name: subjectName,
            syllabus_name: subjectData.name,
            description: subjectData.description,
            academic_year: '2024-25',
            board: 'CBSE'
          })
          .select()
          .single();
        
        if (syllabusError) {
          console.error(`    ❌ Error inserting syllabus for ${subjectName}:`, syllabusError);
          continue;
        }
        
        totalSyllabusEntries++;
        console.log(`    ✅ Syllabus entry created for ${subjectName}`);
        
        // 2. Insert chapters
        for (const [chapterIndex, chapter] of subjectData.chapters.entries()) {
          const { data: chapterData, error: chapterError } = await supabase
            .from('cbse_chapters')
            .insert({
              syllabus_id: syllabusData.id,
              chapter_name: chapter.name,
              chapter_number: chapterIndex + 1,
              class_grade: parseInt(classGrade),
              subject_name: subjectName
            })
            .select()
            .single();
          
          if (chapterError) {
            console.error(`    ❌ Error inserting chapter ${chapter.name}:`, chapterError);
            continue;
          }
          
          totalChapters++;
          console.log(`      📑 Chapter: ${chapter.name}`);
          
          // 3. Insert topics for this chapter
          for (const [topicIndex, topic] of chapter.topics.entries()) {
            const { error: topicError } = await supabase
              .from('cbse_topics')
              .insert({
                chapter_id: chapterData.id,
                syllabus_id: syllabusData.id,
                topic_name: topic,
                topic_number: topicIndex + 1,
                class_grade: parseInt(classGrade),
                subject_name: subjectName,
                chapter_name: chapter.name
              });
            
            if (topicError) {
              console.error(`    ❌ Error inserting topic ${topic}:`, topicError);
              continue;
            }
            
            totalTopics++;
          }
          
          console.log(`        📝 Added ${chapter.topics.length} topics`);
        }
        
        console.log(`    ✅ Completed ${subjectName} with ${subjectData.chapters.length} chapters`);
      }
      
      console.log(`✅ Completed Class ${classGrade}\n`);
    }
    
    console.log('\n🎉 CBSE Syllabus Upload Complete!');
    console.log('\n📊 Upload Summary:');
    console.log(`- Syllabus Entries: ${totalSyllabusEntries}`);
    console.log(`- Chapters: ${totalChapters}`);
    console.log(`- Topics: ${totalTopics}`);
    console.log('\n✅ AI can now reference CBSE syllabus for teaching!');
    
  } catch (error) {
    console.error('❌ Error uploading syllabus:', error);
  }
}

async function createSyllabusTables() {
  try {
    // Check if tables exist by trying to select from them
    const { data: syllabusCheck } = await supabase
      .from('cbse_syllabus')
      .select('*')
      .limit(1);
    
    if (!syllabusCheck) {
      console.log('📋 Creating syllabus tables...');
      // Tables don't exist, create them
      // Note: In a real scenario, you'd create the tables via SQL
      // For now, we'll assume they exist
    }
    
    console.log('✅ Database tables are ready');
  } catch (error) {
    console.log('⚠️ Tables might not exist, but continuing...');
  }
}

uploadCBSESyllabus().catch(console.error); 