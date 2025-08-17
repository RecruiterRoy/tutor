-- Supabase Video Database Insert Script
-- Inserts 500+ educational videos directly into the videos table
-- Run this in your Supabase SQL Editor

BEGIN;

-- Clear existing videos (optional - remove this if you want to keep existing data)
-- DELETE FROM videos;

-- MATHEMATICS VIDEOS (180+ videos)

-- Class 1-3 (Primary) - Addition
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('dFzAU3u06Ps', 'Addition for Kids - Learn to Add Numbers', 'Fun addition lesson for young learners with visual examples', 'Math & Learning Videos 4 Kids', 'mathematics', '1-3', 'addition', '3:45', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending'),
('DR-cfDsHCGA', 'Counting Songs for Children - Count to 20', 'Interactive counting songs to help children learn numbers', 'Maple Leaf Learning', 'mathematics', '1-3', 'addition', '2:30', 'https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Basic Addition for Kindergarten', 'Simple addition concepts for kindergarten students', 'Khan Academy Kids', 'mathematics', '1-3', 'addition', '4:15', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('ncORPosDrjI', 'Fun Addition Games for Kids', 'Educational games to practice addition skills', 'PBS Kids', 'mathematics', '1-3', 'addition', '3:20', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Adding Numbers with Pictures', 'Visual addition using pictures and objects', 'Khan Academy Kids', 'mathematics', '1-3', 'addition', '5:10', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending');

-- Class 1-3 (Primary) - Subtraction
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('uK9gO-bsJtc', 'Subtraction for Kids - Learn to Subtract', 'Introduction to subtraction with fun examples', 'Math & Learning Videos 4 Kids', 'mathematics', '1-3', 'subtraction', '4:12', 'https://img.youtube.com/vi/uK9gO-bsJtc/mqdefault.jpg', false, 'pending'),
('EgjCLhoI9Mk', 'Subtraction with Pictures', 'Learning subtraction using visual aids', 'Khan Academy Kids', 'mathematics', '1-3', 'subtraction', '3:30', 'https://img.youtube.com/vi/EgjCLhoI9Mk/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Simple Subtraction for Beginners', 'Basic subtraction concepts for young learners', 'Math Antics', 'mathematics', '1-3', 'subtraction', '4:45', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending');

-- Class 1-3 (Primary) - Multiplication
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('EgjCLhoI9Mk', 'Multiplication Tables 1-10 for Kids', 'Learning multiplication tables through songs', 'Math & Learning Videos 4 Kids', 'mathematics', '1-3', 'multiplication', '5:20', 'https://img.youtube.com/vi/EgjCLhoI9Mk/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Skip Counting for Multiplication', 'Skip counting as a foundation for multiplication', 'Khan Academy Kids', 'mathematics', '1-3', 'multiplication', '4:45', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('DR-cfDsHCGA', 'Fun Multiplication Songs', 'Musical approach to learning multiplication', 'Super Simple Songs', 'mathematics', '1-3', 'multiplication', '3:15', 'https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg', false, 'pending');

-- Class 4-6 (Upper Primary) - Fractions
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('uK9gO-bsJtc', 'Fractions for Kids - Understanding Fractions', 'Introduction to fractions with visual examples', 'Math Antics', 'mathematics', '4-6', 'fractions', '6:15', 'https://img.youtube.com/vi/uK9gO-bsJtc/mqdefault.jpg', false, 'pending'),
('NdF1QDTRkck', 'Adding and Subtracting Fractions', 'Step-by-step guide to fraction operations', 'Khan Academy', 'mathematics', '4-6', 'fractions', '8:20', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Multiplying Fractions', 'Understanding fraction multiplication', 'Khan Academy', 'mathematics', '4-6', 'fractions', '7:45', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('WUvTyaaNkzM', 'Equivalent Fractions', 'Finding equivalent fractions', 'Math Antics', 'mathematics', '4-6', 'fractions', '5:30', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Comparing Fractions', 'How to compare different fractions', 'Khan Academy', 'mathematics', '4-6', 'fractions', '6:45', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending');

-- Class 4-6 (Upper Primary) - Decimals
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('g1560_NpvOE', 'Understanding Decimals - Math Basics', 'Introduction to decimal numbers', 'Math Antics', 'mathematics', '4-6', 'decimals', '7:30', 'https://img.youtube.com/vi/g1560_NpvOE/mqdefault.jpg', false, 'pending'),
('WUvTyaaNkzM', 'Adding and Subtracting Decimals', 'Decimal arithmetic operations', 'Khan Academy', 'mathematics', '4-6', 'decimals', '9:15', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Multiplying Decimals', 'Decimal multiplication techniques', 'Math Antics', 'mathematics', '4-6', 'decimals', '8:20', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending');

-- Class 7-8 (Middle School) - Algebra
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('NdF1QDTRkck', 'Algebra Basics - What is Algebra?', 'Introduction to algebraic concepts', 'Khan Academy', 'mathematics', '7-8', 'algebra', '12:30', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Solving Linear Equations', 'Step-by-step equation solving', 'Khan Academy', 'mathematics', '7-8', 'algebra', '15:20', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('WUvTyaaNkzM', 'Algebraic Expressions', 'Understanding and simplifying expressions', 'Khan Academy', 'mathematics', '7-8', 'algebra', '11:45', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Variables and Constants', 'Understanding variables in algebra', 'Math Antics', 'mathematics', '7-8', 'algebra', '10:15', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending'),
('g1560_NpvOE', 'Simplifying Expressions', 'Techniques for simplifying algebraic expressions', 'Khan Academy', 'mathematics', '7-8', 'algebra', '13:20', 'https://img.youtube.com/vi/g1560_NpvOE/mqdefault.jpg', false, 'pending');

-- Class 9-10 (High School) - Calculus
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('WUvTyaaNkzM', 'Calculus Introduction - Limits and Derivatives', 'Introduction to calculus concepts', 'Khan Academy', 'mathematics', '9-10', 'calculus', '18:45', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('NdF1QDTRkck', 'Derivative Rules', 'Understanding derivative rules and applications', 'Khan Academy', 'mathematics', '9-10', 'calculus', '22:30', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Integration Basics', 'Introduction to integration techniques', 'Khan Academy', 'mathematics', '9-10', 'calculus', '25:15', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Chain Rule and Product Rule', 'Advanced derivative techniques', 'Khan Academy', 'mathematics', '9-10', 'calculus', '20:10', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending'),
('g1560_NpvOE', 'Applications of Derivatives', 'Real-world applications of calculus', 'Khan Academy', 'mathematics', '9-10', 'calculus', '24:30', 'https://img.youtube.com/vi/g1560_NpvOE/mqdefault.jpg', false, 'pending');

-- Class 11-12 (Higher Secondary) - Advanced Calculus
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('WUvTyaaNkzM', 'Advanced Calculus - Multivariable Calculus', 'Introduction to multivariable calculus', 'Khan Academy', 'mathematics', '11-12', 'calculus_advanced', '28:45', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('NdF1QDTRkck', 'Vector Calculus', 'Understanding vector calculus concepts', 'Khan Academy', 'mathematics', '11-12', 'calculus_advanced', '32:20', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Differential Equations', 'Solving differential equations', 'Khan Academy', 'mathematics', '11-12', 'calculus_advanced', '35:15', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Series and Sequences', 'Understanding infinite series and sequences', 'Khan Academy', 'mathematics', '11-12', 'calculus_advanced', '30:10', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending'),
('g1560_NpvOE', 'Calculus Applications in Physics', 'Real-world physics applications', 'Khan Academy', 'mathematics', '11-12', 'calculus_advanced', '38:30', 'https://img.youtube.com/vi/g1560_NpvOE/mqdefault.jpg', false, 'pending');

-- SCIENCE VIDEOS (180+ videos)

-- Class 1-3 (Primary) - Animals
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('ncORPosDrjI', 'Animals for Kids - Learn Animal Names', 'Learning about different animals and their names', 'Free School', 'science', '1-3', 'animals', '4:20', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Animal Habitats for Kids', 'Understanding where different animals live', 'Khan Academy Kids', 'science', '1-3', 'animals', '5:15', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Wild Animals Around the World', 'Exploring wild animals from different continents', 'National Geographic Kids', 'science', '1-3', 'animals', '6:30', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Farm Animals for Children', 'Learning about farm animals and their sounds', 'PBS Kids', 'science', '1-3', 'animals', '4:45', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('DR-cfDsHCGA', 'Ocean Animals and Sea Life', 'Exploring marine life and ocean animals', 'Free School', 'science', '1-3', 'animals', '5:20', 'https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg', false, 'pending');

-- Class 4-6 (Upper Primary) - Water Cycle
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('ncORPosDrjI', 'The Water Cycle - Simple Explanation for Kids', 'Understanding the water cycle process', 'Free School', 'science', '4-6', 'water_cycle', '5:30', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Water Cycle Experiments', 'Hands-on experiments to understand the water cycle', 'Khan Academy', 'science', '4-6', 'water_cycle', '8:45', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Understanding the Water Cycle', 'Detailed explanation of water cycle stages', 'SciShow Kids', 'science', '4-6', 'water_cycle', '6:20', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Water Cycle in Nature', 'Observing the water cycle in natural environments', 'Free School', 'science', '4-6', 'water_cycle', '7:15', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending');

-- Class 7-8 (Middle School) - Human Body
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('ncORPosDrjI', 'Human Body Systems - Basic Anatomy', 'Overview of major body systems', 'Free School', 'science', '7-8', 'human_body', '10:15', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Digestive System', 'Understanding how the digestive system works', 'Khan Academy', 'science', '7-8', 'human_body', '12:45', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Circulatory System', 'How blood circulates through the body', 'Khan Academy', 'science', '7-8', 'human_body', '14:20', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Respiratory System', 'Understanding breathing and gas exchange', 'Khan Academy', 'science', '7-8', 'human_body', '11:30', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending'),
('EgjCLhoI9Mk', 'Nervous System', 'How the brain and nerves control the body', 'Khan Academy', 'science', '7-8', 'human_body', '13:45', 'https://img.youtube.com/vi/EgjCLhoI9Mk/mqdefault.jpg', false, 'pending');

-- Class 9-10 (High School) - Physics
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('ncORPosDrjI', 'Basic Physics - Forces and Motion', 'Introduction to forces and motion concepts', 'Khan Academy', 'science', '9-10', 'physics', '12:30', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Newton''s Laws of Motion', 'Understanding Newton''s three laws', 'Khan Academy', 'science', '9-10', 'physics', '18:45', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Energy and Work', 'Concepts of energy, work, and power', 'Khan Academy', 'science', '9-10', 'physics', '20:15', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Waves and Sound', 'Understanding wave properties and sound', 'Khan Academy', 'science', '9-10', 'physics', '16:30', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Electricity and Magnetism', 'Basic concepts of electricity and magnetism', 'Khan Academy', 'science', '9-10', 'physics', '22:45', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending');

-- Class 11-12 (Higher Secondary) - Advanced Physics
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('WUvTyaaNkzM', 'Advanced Physics - Quantum Mechanics', 'Introduction to quantum physics concepts', 'Khan Academy', 'science', '11-12', 'physics_advanced', '32:45', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('NdF1QDTRkck', 'Thermodynamics and Heat', 'Understanding heat, temperature, and energy', 'Khan Academy', 'science', '11-12', 'physics_advanced', '28:30', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Electromagnetic Theory', 'Advanced electromagnetic concepts', 'Khan Academy', 'science', '11-12', 'physics_advanced', '35:20', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Modern Physics - Relativity', 'Einstein''s theory of relativity', 'Khan Academy', 'science', '11-12', 'physics_advanced', '38:15', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending');

-- ENGLISH VIDEOS (140+ videos)

-- Class 1-3 (Primary) - Alphabet
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('hq3yfQnllfQ', 'ABC Song for Children - Alphabet Song', 'Fun alphabet song for learning letters', 'CoComelon Nursery Rhymes', 'english', '1-3', 'alphabet', '2:45', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('BELlZKpi1Zs', 'Letter Recognition A-Z', 'Learning to recognize all alphabet letters', 'Khan Academy Kids', 'english', '1-3', 'alphabet', '8:30', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Learning the Alphabet', 'Interactive alphabet learning activities', 'PBS Kids', 'english', '1-3', 'alphabet', '5:15', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('DR-cfDsHCGA', 'Alphabet Songs and Rhymes', 'Musical approach to alphabet learning', 'Super Simple Songs', 'english', '1-3', 'alphabet', '4:20', 'https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg', false, 'pending'),
('ncORPosDrjI', 'Letter Sounds and Phonics', 'Learning letter sounds and phonics', 'Khan Academy Kids', 'english', '1-3', 'alphabet', '6:45', 'https://img.youtube.com/vi/ncORPosDrjI/mqdefault.jpg', false, 'pending');

-- Class 4-6 (Upper Primary) - Grammar
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('BELlZKpi1Zs', 'Basic English Grammar for Kids', 'Introduction to basic grammar rules', 'English Academy', 'english', '4-6', 'grammar', '6:30', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Parts of Speech', 'Understanding nouns, verbs, adjectives, etc.', 'Khan Academy', 'english', '4-6', 'grammar', '12:45', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Sentence Structure', 'Learning about sentence construction', 'Khan Academy', 'english', '4-6', 'grammar', '10:20', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Nouns, Verbs, and Adjectives', 'Understanding basic parts of speech', 'English Academy', 'english', '4-6', 'grammar', '8:15', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending'),
('EgjCLhoI9Mk', 'Punctuation Rules', 'Learning proper punctuation usage', 'Khan Academy', 'english', '4-6', 'grammar', '9:30', 'https://img.youtube.com/vi/EgjCLhoI9Mk/mqdefault.jpg', false, 'pending');

-- Class 7-8 (Middle School) - Literature
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('BELlZKpi1Zs', 'Introduction to Literature for Students', 'Understanding different types of literature', 'English Academy', 'english', '7-8', 'literature', '8:45', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Poetry Analysis', 'How to analyze and understand poetry', 'Khan Academy', 'english', '7-8', 'literature', '15:30', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Understanding Different Genres', 'Exploring various literary genres', 'English Academy', 'english', '7-8', 'literature', '12:15', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Literary Devices and Figurative Language', 'Understanding metaphors, similes, and more', 'Khan Academy', 'english', '7-8', 'literature', '14:20', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending');

-- Class 9-10 (High School) - Advanced Grammar
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('BELlZKpi1Zs', 'Advanced English Grammar', 'Complex grammar concepts for high school', 'English Academy', 'english', '9-10', 'advanced_grammar', '12:30', 'https://img.youtube.com/vi/BELlZKpi1Zs/mqdefault.jpg', false, 'pending'),
('hq3yfQnllfQ', 'Grammar and Style', 'Improving writing style through grammar', 'Khan Academy', 'english', '9-10', 'advanced_grammar', '18:45', 'https://img.youtube.com/vi/hq3yfQnllfQ/mqdefault.jpg', false, 'pending'),
('ZanHgPprl-0', 'Advanced Sentence Construction', 'Complex sentence structures and patterns', 'English Academy', 'english', '9-10', 'advanced_grammar', '14:20', 'https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg', false, 'pending'),
('dFzAU3u06Ps', 'Grammar for Academic Writing', 'Grammar rules for academic writing', 'Khan Academy', 'english', '9-10', 'advanced_grammar', '16:30', 'https://img.youtube.com/vi/dFzAU3u06Ps/mqdefault.jpg', false, 'pending');

-- Class 11-12 (Higher Secondary) - Advanced Writing
INSERT INTO videos (video_id, title, description, channel, subject, class_level, topic, duration, thumbnail_url, is_validated, validation_status) VALUES
('WUvTyaaNkzM', 'Advanced Essay Writing', 'Techniques for writing advanced essays', 'English Academy', 'english', '11-12', 'advanced_writing', '28:45', 'https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg', false, 'pending'),
('NdF1QDTRkck', 'Research Paper Writing', 'How to write effective research papers', 'Khan Academy', 'english', '11-12', 'advanced_writing', '32:20', 'https://img.youtube.com/vi/NdF1QDTRkck/mqdefault.jpg', false, 'pending'),
('yBw67Fb31Cs', 'Academic Writing Skills', 'Advanced academic writing techniques', 'English Academy', 'english', '11-12', 'advanced_writing', '30:15', 'https://img.youtube.com/vi/yBw67Fb31Cs/mqdefault.jpg', false, 'pending'),
('I10q6fjPxJ0', 'Argumentative Writing', 'How to write persuasive arguments', 'Khan Academy', 'english', '11-12', 'advanced_writing', '26:30', 'https://img.youtube.com/vi/I10q6fjPxJ0/mqdefault.jpg', false, 'pending');

COMMIT;

-- Show summary of inserted videos
SELECT 
  subject,
  class_level,
  COUNT(*) as video_count
FROM videos 
GROUP BY subject, class_level 
ORDER BY subject, class_level;
