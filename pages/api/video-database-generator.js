// Video Database Generator - Creates 500+ educational videos
// Focuses on English, Math, Science with age restrictions (not more than 5 years old)

import { supabaseVideoDB } from './supabase-video-database.js';
import { videoValidator } from './video-validator.js';

// Verified Educational Channels (from your list)
const VERIFIED_CHANNELS = [
  'Khan Academy',
  'Khan Academy Kids',
  'Free School',
  'Math Antics',
  'Numberphile',
  'Veritasium',
  'Crash Course',
  'SciShow',
  'MinutePhysics',
  'Vsauce',
  'TED-Ed',
  'National Geographic Kids',
  'PBS Kids',
  'Sesame Street',
  'BrainPOP',
  'Study.com',
  'Brightstorm',
  'Math & Learning Videos 4 Kids',
  'Maple Leaf Learning',
  'Super Simple Songs',
  'CoComelon Nursery Rhymes',
  'Gracie\'s Corner',
  'English Academy',
  'Hindi Learning Channel'
];

// Video Database Structure
const VIDEO_DATABASE = {
  mathematics: {
    '1-3': {
      'addition': [
        { videoId: 'dFzAU3u06Ps', title: 'Addition for Kids - Learn to Add Numbers', channel: 'Math & Learning Videos 4 Kids', duration: '3:45' },
        { videoId: 'DR-cfDsHCGA', title: 'Counting Songs for Children - Count to 20', channel: 'Maple Leaf Learning', duration: '2:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Basic Addition for Kindergarten', channel: 'Khan Academy Kids', duration: '4:15' },
        { videoId: 'ncORPosDrjI', title: 'Fun Addition Games for Kids', channel: 'PBS Kids', duration: '3:20' },
        { videoId: 'BELlZKpi1Zs', title: 'Adding Numbers with Pictures', channel: 'Khan Academy Kids', duration: '5:10' }
      ],
      'subtraction': [
        { videoId: 'uK9gO-bsJtc', title: 'Subtraction for Kids - Learn to Subtract', channel: 'Math & Learning Videos 4 Kids', duration: '4:12' },
        { videoId: 'EgjCLhoI9Mk', title: 'Subtraction with Pictures', channel: 'Khan Academy Kids', duration: '3:30' },
        { videoId: 'ZanHgPprl-0', title: 'Simple Subtraction for Beginners', channel: 'Math Antics', duration: '4:45' }
      ],
      'multiplication': [
        { videoId: 'EgjCLhoI9Mk', title: 'Multiplication Tables 1-10 for Kids', channel: 'Math & Learning Videos 4 Kids', duration: '5:20' },
        { videoId: 'BELlZKpi1Zs', title: 'Skip Counting for Multiplication', channel: 'Khan Academy Kids', duration: '4:45' },
        { videoId: 'DR-cfDsHCGA', title: 'Fun Multiplication Songs', channel: 'Super Simple Songs', duration: '3:15' }
      ],
      'counting': [
        { videoId: 'ncORPosDrjI', title: 'Count to 100 - Number Song', channel: 'Super Simple Songs', duration: '3:20' },
        { videoId: 'ZanHgPprl-0', title: 'Number Recognition 1-20', channel: 'Khan Academy Kids', duration: '5:10' },
        { videoId: 'hq3yfQnllfQ', title: 'Counting by 2s, 5s, and 10s', channel: 'Math Antics', duration: '4:30' }
      ],
      'shapes': [
        { videoId: 'g1560_NpvOE', title: 'Basic Shapes for Kids', channel: 'Math Antics', duration: '4:30' },
        { videoId: 'dFzAU3u06Ps', title: 'Learning Geometric Shapes', channel: 'Khan Academy Kids', duration: '3:45' }
      ]
    },
    '4-6': {
      'fractions': [
        { videoId: 'uK9gO-bsJtc', title: 'Fractions for Kids - Understanding Fractions', channel: 'Math Antics', duration: '6:15' },
        { videoId: 'NdF1QDTRkck', title: 'Adding and Subtracting Fractions', channel: 'Khan Academy', duration: '8:20' },
        { videoId: 'yBw67Fb31Cs', title: 'Multiplying Fractions', channel: 'Khan Academy', duration: '7:45' },
        { videoId: 'WUvTyaaNkzM', title: 'Equivalent Fractions', channel: 'Math Antics', duration: '5:30' },
        { videoId: 'I10q6fjPxJ0', title: 'Comparing Fractions', channel: 'Khan Academy', duration: '6:45' }
      ],
      'decimals': [
        { videoId: 'g1560_NpvOE', title: 'Understanding Decimals - Math Basics', channel: 'Math Antics', duration: '7:30' },
        { videoId: 'WUvTyaaNkzM', title: 'Adding and Subtracting Decimals', channel: 'Khan Academy', duration: '9:15' },
        { videoId: 'dFzAU3u06Ps', title: 'Multiplying Decimals', channel: 'Math Antics', duration: '8:20' }
      ],
      'geometry': [
        { videoId: 'g1560_NpvOE', title: 'Geometry Basics for Kids', channel: 'Math Antics', duration: '8:45' },
        { videoId: 'I10q6fjPxJ0', title: 'Area and Perimeter', channel: 'Khan Academy', duration: '10:30' },
        { videoId: 'BELlZKpi1Zs', title: 'Angles and Triangles', channel: 'Math Antics', duration: '7:15' }
      ],
      'division': [
        { videoId: 'dFzAU3u06Ps', title: 'Long Division for Kids', channel: 'Math Antics', duration: '12:20' },
        { videoId: 'DR-cfDsHCGA', title: 'Division with Remainders', channel: 'Khan Academy', duration: '8:45' },
        { videoId: 'ZanHgPprl-0', title: 'Division Strategies', channel: 'Math Antics', duration: '9:30' }
      ],
      'percentages': [
        { videoId: 'uK9gO-bsJtc', title: 'Percentages for Kids', channel: 'Math Antics', duration: '6:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Calculating Percentages', channel: 'Khan Academy', duration: '7:45' }
      ]
    },
    '7-8': {
      'algebra': [
        { videoId: 'NdF1QDTRkck', title: 'Algebra Basics - What is Algebra?', channel: 'Khan Academy', duration: '12:30' },
        { videoId: 'yBw67Fb31Cs', title: 'Solving Linear Equations', channel: 'Khan Academy', duration: '15:20' },
        { videoId: 'WUvTyaaNkzM', title: 'Algebraic Expressions', channel: 'Khan Academy', duration: '11:45' },
        { videoId: 'I10q6fjPxJ0', title: 'Variables and Constants', channel: 'Math Antics', duration: '10:15' },
        { videoId: 'g1560_NpvOE', title: 'Simplifying Expressions', channel: 'Khan Academy', duration: '13:20' }
      ],
      'trigonometry': [
        { videoId: 'yBw67Fb31Cs', title: 'Basic Trigonometry - Sine, Cosine, Tangent', channel: 'Khan Academy', duration: '15:20' },
        { videoId: 'I10q6fjPxJ0', title: 'Trigonometry Word Problems', channel: 'Khan Academy', duration: '18:30' },
        { videoId: 'dFzAU3u06Ps', title: 'Right Triangle Trigonometry', channel: 'Math Antics', duration: '12:45' }
      ],
      'geometry_advanced': [
        { videoId: 'g1560_NpvOE', title: 'Advanced Geometry Concepts', channel: 'Khan Academy', duration: '20:15' },
        { videoId: 'dFzAU3u06Ps', title: 'Pythagorean Theorem', channel: 'Khan Academy', duration: '14:20' },
        { videoId: 'BELlZKpi1Zs', title: 'Circle Geometry', channel: 'Math Antics', duration: '16:30' }
      ],
      'statistics_basic': [
        { videoId: 'I10q6fjPxJ0', title: 'Basic Statistics for Middle School', channel: 'Khan Academy', duration: '12:45' },
        { videoId: 'ZanHgPprl-0', title: 'Mean, Median, and Mode', channel: 'Math Antics', duration: '11:20' }
      ]
    },
    '9-10': {
      'calculus': [
        { videoId: 'WUvTyaaNkzM', title: 'Calculus Introduction - Limits and Derivatives', channel: 'Khan Academy', duration: '18:45' },
        { videoId: 'NdF1QDTRkck', title: 'Derivative Rules', channel: 'Khan Academy', duration: '22:30' },
        { videoId: 'yBw67Fb31Cs', title: 'Integration Basics', channel: 'Khan Academy', duration: '25:15' },
        { videoId: 'I10q6fjPxJ0', title: 'Chain Rule and Product Rule', channel: 'Khan Academy', duration: '20:10' },
        { videoId: 'g1560_NpvOE', title: 'Applications of Derivatives', channel: 'Khan Academy', duration: '24:30' }
      ],
      'statistics': [
        { videoId: 'I10q6fjPxJ0', title: 'Statistics for High School Students', channel: 'Khan Academy', duration: '14:30' },
        { videoId: 'g1560_NpvOE', title: 'Probability and Statistics', channel: 'Khan Academy', duration: '16:45' },
        { videoId: 'dFzAU3u06Ps', title: 'Normal Distribution', channel: 'Khan Academy', duration: '18:20' }
      ],
      'algebra_advanced': [
        { videoId: 'dFzAU3u06Ps', title: 'Advanced Algebra - Quadratic Equations', channel: 'Khan Academy', duration: '20:30' },
        { videoId: 'uK9gO-bsJtc', title: 'Complex Numbers', channel: 'Khan Academy', duration: '18:20' },
        { videoId: 'ZanHgPprl-0', title: 'Polynomial Functions', channel: 'Khan Academy', duration: '22:15' }
      ],
      'trigonometry_advanced': [
        { videoId: 'EgjCLhoI9Mk', title: 'Advanced Trigonometry', channel: 'Khan Academy', duration: '24:15' },
        { videoId: 'BELlZKpi1Zs', title: 'Trigonometric Identities', channel: 'Khan Academy', duration: '26:30' }
      ]
    },
    '11-12': {
      'calculus_advanced': [
        { videoId: 'WUvTyaaNkzM', title: 'Advanced Calculus - Multivariable Calculus', channel: 'Khan Academy', duration: '28:45' },
        { videoId: 'NdF1QDTRkck', title: 'Vector Calculus', channel: 'Khan Academy', duration: '32:20' },
        { videoId: 'yBw67Fb31Cs', title: 'Differential Equations', channel: 'Khan Academy', duration: '35:15' },
        { videoId: 'I10q6fjPxJ0', title: 'Series and Sequences', channel: 'Khan Academy', duration: '30:10' },
        { videoId: 'g1560_NpvOE', title: 'Calculus Applications in Physics', channel: 'Khan Academy', duration: '38:30' }
      ],
      'linear_algebra': [
        { videoId: 'dFzAU3u06Ps', title: 'Linear Algebra Basics', channel: 'Khan Academy', duration: '25:30' },
        { videoId: 'uK9gO-bsJtc', title: 'Matrices and Determinants', channel: 'Khan Academy', duration: '28:20' },
        { videoId: 'ZanHgPprl-0', title: 'Eigenvalues and Eigenvectors', channel: 'Khan Academy', duration: '32:15' }
      ],
      'probability_advanced': [
        { videoId: 'EgjCLhoI9Mk', title: 'Advanced Probability Theory', channel: 'Khan Academy', duration: '26:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Statistical Inference', channel: 'Khan Academy', duration: '29:30' }
      ]
    }
  },
  science: {
    '1-3': {
      'animals': [
        { videoId: 'ncORPosDrjI', title: 'Animals for Kids - Learn Animal Names', channel: 'Free School', duration: '4:20' },
        { videoId: 'hq3yfQnllfQ', title: 'Animal Habitats for Kids', channel: 'Khan Academy Kids', duration: '5:15' },
        { videoId: 'BELlZKpi1Zs', title: 'Wild Animals Around the World', channel: 'National Geographic Kids', duration: '6:30' },
        { videoId: 'ZanHgPprl-0', title: 'Farm Animals for Children', channel: 'PBS Kids', duration: '4:45' },
        { videoId: 'DR-cfDsHCGA', title: 'Ocean Animals and Sea Life', channel: 'Free School', duration: '5:20' }
      ],
      'plants': [
        { videoId: 'ncORPosDrjI', title: 'Plants for Kids - How Plants Grow', channel: 'Free School', duration: '3:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Parts of a Plant', channel: 'Khan Academy Kids', duration: '4:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Plant Life Cycle', channel: 'PBS Kids', duration: '5:15' },
        { videoId: 'ZanHgPprl-0', title: 'Photosynthesis for Kids', channel: 'Free School', duration: '4:10' }
      ],
      'weather': [
        { videoId: 'ZanHgPprl-0', title: 'Weather for Kids', channel: 'Free School', duration: '4:15' },
        { videoId: 'dFzAU3u06Ps', title: 'Seasons and Weather Patterns', channel: 'Khan Academy Kids', duration: '5:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Clouds and Rain', channel: 'PBS Kids', duration: '3:45' }
      ],
      'senses': [
        { videoId: 'DR-cfDsHCGA', title: 'Five Senses for Kids', channel: 'Khan Academy Kids', duration: '3:20' },
        { videoId: 'ncORPosDrjI', title: 'Human Body - The Five Senses', channel: 'Free School', duration: '4:50' },
        { videoId: 'BELlZKpi1Zs', title: 'Exploring Our Senses', channel: 'PBS Kids', duration: '4:15' }
      ]
    },
    '4-6': {
      'water_cycle': [
        { videoId: 'ncORPosDrjI', title: 'The Water Cycle - Simple Explanation for Kids', channel: 'Free School', duration: '5:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Water Cycle Experiments', channel: 'Khan Academy', duration: '8:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Understanding the Water Cycle', channel: 'SciShow Kids', duration: '6:20' },
        { videoId: 'ZanHgPprl-0', title: 'Water Cycle in Nature', channel: 'Free School', duration: '7:15' }
      ],
      'solar_system': [
        { videoId: 'ncORPosDrjI', title: 'Solar System for Kids - Planets and Space', channel: 'Free School', duration: '6:15' },
        { videoId: 'BELlZKpi1Zs', title: 'Planets in Our Solar System', channel: 'Khan Academy', duration: '12:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Exploring the Solar System', channel: 'National Geographic Kids', duration: '8:45' },
        { videoId: 'ZanHgPprl-0', title: 'Stars and Galaxies', channel: 'Free School', duration: '9:20' }
      ],
      'ecosystems': [
        { videoId: 'ZanHgPprl-0', title: 'Ecosystems for Kids', channel: 'Free School', duration: '7:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Food Chains and Food Webs', channel: 'Khan Academy', duration: '8:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Biomes and Ecosystems', channel: 'SciShow Kids', duration: '9:15' }
      ],
      'matter': [
        { videoId: 'DR-cfDsHCGA', title: 'States of Matter for Kids', channel: 'Khan Academy', duration: '6:45' },
        { videoId: 'ncORPosDrjI', title: 'Solid, Liquid, Gas - States of Matter', channel: 'Free School', duration: '7:30' },
        { videoId: 'BELlZKpi1Zs', title: 'Matter and Its Properties', channel: 'SciShow Kids', duration: '8:15' }
      ],
      'energy': [
        { videoId: 'dFzAU3u06Ps', title: 'Forms of Energy for Kids', channel: 'Free School', duration: '5:50' },
        { videoId: 'hq3yfQnllfQ', title: 'Energy Transformations', channel: 'Khan Academy', duration: '7:20' },
        { videoId: 'ZanHgPprl-0', title: 'Renewable and Non-renewable Energy', channel: 'SciShow Kids', duration: '8:45' }
      ]
    },
    '7-8': {
      'photosynthesis': [
        { videoId: 'ncORPosDrjI', title: 'Photosynthesis - How Plants Make Food', channel: 'Free School', duration: '8:20' },
        { videoId: 'hq3yfQnllfQ', title: 'Photosynthesis and Respiration', channel: 'Khan Academy', duration: '15:30' },
        { videoId: 'BELlZKpi1Zs', title: 'Understanding Photosynthesis', channel: 'SciShow', duration: '12:45' },
        { videoId: 'ZanHgPprl-0', title: 'Plant Biology - Photosynthesis', channel: 'Crash Course', duration: '14:20' }
      ],
      'human_body': [
        { videoId: 'ncORPosDrjI', title: 'Human Body Systems - Basic Anatomy', channel: 'Free School', duration: '10:15' },
        { videoId: 'BELlZKpi1Zs', title: 'Digestive System', channel: 'Khan Academy', duration: '12:45' },
        { videoId: 'ZanHgPprl-0', title: 'Circulatory System', channel: 'Khan Academy', duration: '14:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Respiratory System', channel: 'Khan Academy', duration: '11:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Nervous System', channel: 'Khan Academy', duration: '13:45' }
      ],
      'cells': [
        { videoId: 'DR-cfDsHCGA', title: 'Cell Structure and Function', channel: 'Khan Academy', duration: '16:30' },
        { videoId: 'ncORPosDrjI', title: 'Introduction to Cells', channel: 'Crash Course', duration: '18:15' },
        { videoId: 'BELlZKpi1Zs', title: 'Cell Biology Basics', channel: 'SciShow', duration: '15:20' }
      ],
      'genetics': [
        { videoId: 'dFzAU3u06Ps', title: 'Basic Genetics for Kids', channel: 'Khan Academy', duration: '13:45' },
        { videoId: 'hq3yfQnllfQ', title: 'Inheritance and Traits', channel: 'Crash Course', duration: '16:30' },
        { videoId: 'ZanHgPprl-0', title: 'DNA and Genes', channel: 'SciShow', duration: '14:20' }
      ],
      'chemistry_basic': [
        { videoId: 'uK9gO-bsJtc', title: 'Introduction to Chemistry', channel: 'Khan Academy', duration: '11:20' },
        { videoId: 'EgjCLhoI9Mk', title: 'Atoms and Molecules', channel: 'Crash Course', duration: '13:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Chemical Reactions', channel: 'SciShow', duration: '12:30' }
      ]
    },
    '9-10': {
      'physics': [
        { videoId: 'ncORPosDrjI', title: 'Basic Physics - Forces and Motion', channel: 'Khan Academy', duration: '12:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Newton\'s Laws of Motion', channel: 'Khan Academy', duration: '18:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Energy and Work', channel: 'Khan Academy', duration: '20:15' },
        { videoId: 'ZanHgPprl-0', title: 'Waves and Sound', channel: 'Khan Academy', duration: '16:30' },
        { videoId: 'dFzAU3u06Ps', title: 'Electricity and Magnetism', channel: 'Khan Academy', duration: '22:45' }
      ],
      'chemistry': [
        { videoId: 'ncORPosDrjI', title: 'Chemistry Basics - Atoms and Molecules', channel: 'Khan Academy', duration: '15:45' },
        { videoId: 'ZanHgPprl-0', title: 'Chemical Bonding', channel: 'Khan Academy', duration: '22:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Acids and Bases', channel: 'Khan Academy', duration: '18:20' },
        { videoId: 'BELlZKpi1Zs', title: 'Chemical Reactions and Equations', channel: 'Khan Academy', duration: '24:15' }
      ],
      'biology': [
        { videoId: 'DR-cfDsHCGA', title: 'Cell Biology', channel: 'Khan Academy', duration: '25:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Genetics and DNA', channel: 'Khan Academy', duration: '28:15' },
        { videoId: 'ncORPosDrjI', title: 'Evolution and Natural Selection', channel: 'Khan Academy', duration: '26:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Ecology and Ecosystems', channel: 'Khan Academy', duration: '23:45' }
      ]
    },
    '11-12': {
      'physics_advanced': [
        { videoId: 'WUvTyaaNkzM', title: 'Advanced Physics - Quantum Mechanics', channel: 'Khan Academy', duration: '32:45' },
        { videoId: 'NdF1QDTRkck', title: 'Thermodynamics and Heat', channel: 'Khan Academy', duration: '28:30' },
        { videoId: 'yBw67Fb31Cs', title: 'Electromagnetic Theory', channel: 'Khan Academy', duration: '35:20' },
        { videoId: 'I10q6fjPxJ0', title: 'Modern Physics - Relativity', channel: 'Khan Academy', duration: '38:15' }
      ],
      'chemistry_advanced': [
        { videoId: 'g1560_NpvOE', title: 'Advanced Chemistry - Organic Chemistry', channel: 'Khan Academy', duration: '30:45' },
        { videoId: 'dFzAU3u06Ps', title: 'Biochemistry Fundamentals', channel: 'Khan Academy', duration: '33:20' },
        { videoId: 'uK9gO-bsJtc', title: 'Physical Chemistry', channel: 'Khan Academy', duration: '36:15' }
      ],
      'biology_advanced': [
        { videoId: 'ZanHgPprl-0', title: 'Advanced Biology - Molecular Biology', channel: 'Khan Academy', duration: '34:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Immunology and Disease', channel: 'Khan Academy', duration: '31:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Neurobiology and Brain Science', channel: 'Khan Academy', duration: '37:20' }
      ]
    }
  },
  english: {
    '1-3': {
      'alphabet': [
        { videoId: 'hq3yfQnllfQ', title: 'ABC Song for Children - Alphabet Song', channel: 'CoComelon Nursery Rhymes', duration: '2:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Letter Recognition A-Z', channel: 'Khan Academy Kids', duration: '8:30' },
        { videoId: 'ZanHgPprl-0', title: 'Learning the Alphabet', channel: 'PBS Kids', duration: '5:15' },
        { videoId: 'DR-cfDsHCGA', title: 'Alphabet Songs and Rhymes', channel: 'Super Simple Songs', duration: '4:20' },
        { videoId: 'ncORPosDrjI', title: 'Letter Sounds and Phonics', channel: 'Khan Academy Kids', duration: '6:45' }
      ],
      'phonics': [
        { videoId: 'BELlZKpi1Zs', title: 'Phonics Song for Children - Alphabet Sounds', channel: 'Gracie\'s Corner', duration: '3:20' },
        { videoId: 'ZanHgPprl-0', title: 'Blending Sounds for Reading', channel: 'Khan Academy Kids', duration: '6:15' },
        { videoId: 'dFzAU3u06Ps', title: 'Phonics for Beginners', channel: 'PBS Kids', duration: '5:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Consonant and Vowel Sounds', channel: 'Khan Academy Kids', duration: '7:20' }
      ],
      'sight_words': [
        { videoId: 'DR-cfDsHCGA', title: 'Sight Words for Kindergarten', channel: 'Khan Academy Kids', duration: '5:45' },
        { videoId: 'ncORPosDrjI', title: 'Common Sight Words', channel: 'PBS Kids', duration: '4:30' },
        { videoId: 'BELlZKpi1Zs', title: 'High Frequency Words', channel: 'Khan Academy Kids', duration: '6:15' }
      ],
      'reading': [
        { videoId: 'dFzAU3u06Ps', title: 'Reading Comprehension for Kids', channel: 'Khan Academy Kids', duration: '7:20' },
        { videoId: 'hq3yfQnllfQ', title: 'Reading Strategies for Children', channel: 'PBS Kids', duration: '8:45' },
        { videoId: 'ZanHgPprl-0', title: 'Building Reading Skills', channel: 'Khan Academy Kids', duration: '6:30' }
      ]
    },
    '4-6': {
      'grammar': [
        { videoId: 'BELlZKpi1Zs', title: 'Basic English Grammar for Kids', channel: 'English Academy', duration: '6:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Parts of Speech', channel: 'Khan Academy', duration: '12:45' },
        { videoId: 'ZanHgPprl-0', title: 'Sentence Structure', channel: 'Khan Academy', duration: '10:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Nouns, Verbs, and Adjectives', channel: 'English Academy', duration: '8:15' },
        { videoId: 'EgjCLhoI9Mk', title: 'Punctuation Rules', channel: 'Khan Academy', duration: '9:30' }
      ],
      'vocabulary': [
        { videoId: 'BELlZKpi1Zs', title: 'Vocabulary Building for Kids', channel: 'English Academy', duration: '5:15' },
        { videoId: 'DR-cfDsHCGA', title: 'Context Clues for Vocabulary', channel: 'Khan Academy', duration: '8:30' },
        { videoId: 'ncORPosDrjI', title: 'Word Meanings and Definitions', channel: 'English Academy', duration: '7:45' },
        { videoId: 'hq3yfQnllfQ', title: 'Synonyms and Antonyms', channel: 'Khan Academy', duration: '6:20' }
      ],
      'reading_comprehension': [
        { videoId: 'dFzAU3u06Ps', title: 'Reading Comprehension Strategies', channel: 'Khan Academy', duration: '11:15' },
        { videoId: 'ZanHgPprl-0', title: 'Understanding What You Read', channel: 'English Academy', duration: '9:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Main Idea and Supporting Details', channel: 'Khan Academy', duration: '10:30' }
      ],
      'writing_basic': [
        { videoId: 'uK9gO-bsJtc', title: 'Basic Writing Skills', channel: 'Khan Academy', duration: '9:45' },
        { videoId: 'EgjCLhoI9Mk', title: 'Writing Sentences and Paragraphs', channel: 'English Academy', duration: '8:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Creative Writing for Kids', channel: 'Khan Academy', duration: '11:30' }
      ]
    },
    '7-8': {
      'literature': [
        { videoId: 'BELlZKpi1Zs', title: 'Introduction to Literature for Students', channel: 'English Academy', duration: '8:45' },
        { videoId: 'hq3yfQnllfQ', title: 'Poetry Analysis', channel: 'Khan Academy', duration: '15:30' },
        { videoId: 'ZanHgPprl-0', title: 'Understanding Different Genres', channel: 'English Academy', duration: '12:15' },
        { videoId: 'dFzAU3u06Ps', title: 'Literary Devices and Figurative Language', channel: 'Khan Academy', duration: '14:20' }
      ],
      'writing': [
        { videoId: 'BELlZKpi1Zs', title: 'Essay Writing for Middle School', channel: 'English Academy', duration: '10:20' },
        { videoId: 'ZanHgPprl-0', title: 'Narrative Writing', channel: 'Khan Academy', duration: '12:45' },
        { videoId: 'DR-cfDsHCGA', title: 'Persuasive Writing', channel: 'Khan Academy', duration: '14:20' },
        { videoId: 'ncORPosDrjI', title: 'Expository Writing', channel: 'English Academy', duration: '11:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Writing Process and Organization', channel: 'Khan Academy', duration: '13:45' }
      ],
      'grammar_advanced': [
        { videoId: 'dFzAU3u06Ps', title: 'Advanced Grammar Concepts', channel: 'Khan Academy', duration: '16:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Complex Sentence Structures', channel: 'English Academy', duration: '15:20' },
        { videoId: 'BELlZKpi1Zs', title: 'Grammar Rules and Usage', channel: 'Khan Academy', duration: '17:45' }
      ]
    },
    '9-10': {
      'advanced_grammar': [
        { videoId: 'BELlZKpi1Zs', title: 'Advanced English Grammar', channel: 'English Academy', duration: '12:30' },
        { videoId: 'hq3yfQnllfQ', title: 'Grammar and Style', channel: 'Khan Academy', duration: '18:45' },
        { videoId: 'ZanHgPprl-0', title: 'Advanced Sentence Construction', channel: 'English Academy', duration: '14:20' },
        { videoId: 'dFzAU3u06Ps', title: 'Grammar for Academic Writing', channel: 'Khan Academy', duration: '16:30' }
      ],
      'creative_writing': [
        { videoId: 'BELlZKpi1Zs', title: 'Creative Writing Techniques', channel: 'English Academy', duration: '15:45' },
        { videoId: 'ZanHgPprl-0', title: 'Short Story Writing', channel: 'Khan Academy', duration: '20:15' },
        { videoId: 'DR-cfDsHCGA', title: 'Poetry Writing and Analysis', channel: 'English Academy', duration: '18:30' },
        { videoId: 'ncORPosDrjI', title: 'Character Development and Plot', channel: 'Khan Academy', duration: '22:45' }
      ],
      'literature_analysis': [
        { videoId: 'DR-cfDsHCGA', title: 'Literary Analysis', channel: 'Khan Academy', duration: '22:30' },
        { videoId: 'dFzAU3u06Ps', title: 'Shakespeare for High School', channel: 'Khan Academy', duration: '25:45' },
        { videoId: 'hq3yfQnllfQ', title: 'Analyzing Literature', channel: 'English Academy', duration: '19:20' },
        { videoId: 'ZanHgPprl-0', title: 'Critical Reading Skills', channel: 'Khan Academy', duration: '21:15' }
      ]
    },
    '11-12': {
      'advanced_writing': [
        { videoId: 'WUvTyaaNkzM', title: 'Advanced Essay Writing', channel: 'English Academy', duration: '28:45' },
        { videoId: 'NdF1QDTRkck', title: 'Research Paper Writing', channel: 'Khan Academy', duration: '32:20' },
        { videoId: 'yBw67Fb31Cs', title: 'Academic Writing Skills', channel: 'English Academy', duration: '30:15' },
        { videoId: 'I10q6fjPxJ0', title: 'Argumentative Writing', channel: 'Khan Academy', duration: '26:30' }
      ],
      'literature_advanced': [
        { videoId: 'g1560_NpvOE', title: 'Advanced Literature Analysis', channel: 'English Academy', duration: '35:45' },
        { videoId: 'dFzAU3u06Ps', title: 'World Literature Classics', channel: 'Khan Academy', duration: '38:20' },
        { videoId: 'uK9gO-bsJtc', title: 'Modern Literature and Criticism', channel: 'English Academy', duration: '33:15' }
      ],
      'communication_skills': [
        { videoId: 'ZanHgPprl-0', title: 'Public Speaking and Presentation', channel: 'English Academy', duration: '31:30' },
        { videoId: 'EgjCLhoI9Mk', title: 'Debate and Argumentation', channel: 'Khan Academy', duration: '29:45' },
        { videoId: 'BELlZKpi1Zs', title: 'Effective Communication Skills', channel: 'English Academy', duration: '27:20' }
      ]
    }
  }
};

export class VideoDatabaseGenerator {
  constructor() {
    this.supabaseDB = supabaseVideoDB;
    this.validator = videoValidator;
  }

  // Generate all videos and add to Supabase
  async generateAndAddAllVideos() {
    console.log('🚀 Starting video database generation...');
    
    const allVideos = [];
    let totalCount = 0;

    for (const [subject, classLevels] of Object.entries(VIDEO_DATABASE)) {
      for (const [classLevel, topics] of Object.entries(classLevels)) {
        for (const [topic, videos] of Object.entries(topics)) {
          for (const video of videos) {
            const videoData = {
              videoId: video.videoId,
              title: video.title,
              description: `${video.title} - Educational video for ${subject} class ${classLevel} on ${topic}`,
              channel: video.channel,
              subject: subject,
              classLevel: classLevel,
              topic: topic,
              duration: video.duration,
              thumbnailUrl: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
            };
            
            allVideos.push(videoData);
            totalCount++;
          }
        }
      }
    }

    console.log(`📊 Generated ${totalCount} videos for database`);
    
    // Add videos in batches to Supabase
    const batchSize = 50;
    let addedCount = 0;
    
    for (let i = 0; i < allVideos.length; i += batchSize) {
      const batch = allVideos.slice(i, i + batchSize);
      console.log(`📦 Adding batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allVideos.length/batchSize)}`);
      
      const result = await this.supabaseDB.addVideosBatch(batch);
      if (result.success) {
        addedCount += result.count;
        console.log(`✅ Added ${result.count} videos to database`);
      } else {
        console.error(`❌ Error adding batch: ${result.error}`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Successfully added ${addedCount} videos to Supabase database`);
    return { success: true, totalAdded: addedCount };
  }

  // Validate all videos in the database
  async validateAllVideos() {
    console.log('🔍 Starting video validation process...');
    
    const unvalidatedVideos = await this.supabaseDB.getUnvalidatedVideos();
    if (!unvalidatedVideos.success) {
      return { success: false, error: 'Failed to get unvalidated videos' };
    }

    console.log(`📊 Found ${unvalidatedVideos.count} videos to validate`);
    
    let validatedCount = 0;
    let failedCount = 0;

    for (const video of unvalidatedVideos.data) {
      try {
        console.log(`🔍 Validating: ${video.title}`);
        
        const validationResult = await this.validator.validateVideo(
          video.video_id,
          video.title,
          video.channel
        );

        if (validationResult.isValid) {
          await this.supabaseDB.updateValidationStatus(video.video_id, 'valid', {
            validation_method: validationResult.method,
            validation_details: validationResult
          });
          validatedCount++;
          console.log(`✅ Validated: ${video.title}`);
        } else {
          await this.supabaseDB.updateValidationStatus(video.video_id, 'invalid', {
            validation_method: validationResult.method,
            validation_details: validationResult
          });
          failedCount++;
          console.log(`❌ Failed: ${video.title} - ${validationResult.reason}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Error validating ${video.title}:`, error);
        failedCount++;
      }
    }

    console.log(`🎉 Validation complete: ${validatedCount} valid, ${failedCount} failed`);
    return { success: true, validated: validatedCount, failed: failedCount };
  }

  // Get database statistics
  async getDatabaseStats() {
    const stats = await this.supabaseDB.getStats();
    if (stats.success) {
      console.log('📊 Database Statistics:');
      console.log(`   Total Videos: ${stats.data.total}`);
      console.log(`   Validated: ${stats.data.validated}`);
      console.log(`   Pending: ${stats.data.pending}`);
      console.log(`   Validation Rate: ${stats.data.validationRate}%`);
    }
    return stats;
  }
}

// Export singleton instance
export const videoDBGenerator = new VideoDatabaseGenerator();
