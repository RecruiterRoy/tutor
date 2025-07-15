// Hindu Stories and Educational Tales Database
// Collection of Panchatantra, Ramayana, Mahabharata, and Krishna stories

class StoryDatabase {
    constructor() {
        this.stories = {
            panchatantra: {
                category: "Panchatantra Tales",
                description: "Ancient Indian collection of moral stories",
                stories: [
                    {
                        id: "monkey_crocodile",
                        title: "The Monkey and the Crocodile",
                        duration: 4,
                        moral: "Wit and presence of mind can save you from danger",
                        subject_relevance: ["english", "moral_science", "critical_thinking"],
                        age_group: "8-15",
                        story: `Once upon a time, there was a clever monkey who lived on a jamun tree by the river. Every day, he would eat the sweet jamuns and enjoy life.

One day, a crocodile came to rest under the tree. The kind monkey offered him some jamuns. The crocodile loved them and came back every day. Soon they became good friends.

The crocodile's wife heard about the monkey and his sweet jamuns. She became jealous and said, "If the jamuns are so sweet, imagine how sweet the monkey's heart would be! Bring me the monkey's heart to eat."

The crocodile was sad but couldn't refuse his wife. He went to the monkey and said, "My friend, my wife wants to meet you. Come to my home for dinner."

The monkey agreed and climbed on the crocodile's back. In the middle of the river, the crocodile said, "Friend, I must tell you the truth. My wife wants to eat your heart."

The clever monkey didn't panic. Instead, he said, "Oh dear friend! You should have told me earlier. I keep my heart safe in the jamun tree. Let's go back and get it."

The foolish crocodile believed him and swam back. As soon as they reached the shore, the monkey jumped to safety and said, "You fool! Hearts cannot be kept outside the body. You betrayed our friendship. Now leave and never come back!"

**Educational Connection:** This story teaches us about problem-solving under pressure, just like in mathematics when we need to think quickly during exams.`,
                        
                        questions: [
                            "What would you have done if you were the monkey?",
                            "How did the monkey use his intelligence to escape?",
                            "What does this teach us about making decisions under pressure?"
                        ],
                        vocabulary: ["wit", "presence of mind", "betrayal", "clever", "panic"],
                        grammar_points: ["past tense narration", "direct speech", "dialogue writing"]
                    },
                    
                    {
                        id: "lion_mouse",
                        title: "The Lion and the Mouse",
                        duration: 3,
                        moral: "Small acts of kindness are never wasted - even the mighty need help sometimes",
                        subject_relevance: ["english", "moral_science", "social_studies"],
                        age_group: "6-12",
                        story: `A mighty lion was sleeping in the forest when a tiny mouse ran over his nose. The lion woke up angrily and caught the mouse in his powerful paw.

"Please let me go, O King of Beasts!" squeaked the mouse. "I didn't mean to disturb you. If you spare my life, I promise to help you someday."

The lion laughed loudly. "How can a tiny creature like you help the mighty king of the jungle?" But he was amused by the mouse's courage and let him go.

A few days later, the lion was caught in a hunter's net. He roared and struggled but couldn't break free. The little mouse heard the lion's roars and ran to help.

"Don't worry, my king," said the mouse. "I'll save you!" The mouse quickly gnawed through the ropes with his sharp teeth and freed the lion.

"Thank you, little friend," said the lion gratefully. "I was wrong to think that someone small couldn't help someone big. I've learned that kindness always comes back to us."

**Educational Connection:** In science, we learn that even the smallest particles (atoms) are essential for building everything in the universe, just like how the small mouse was essential for saving the mighty lion.`,
                        
                        questions: [
                            "Why did the lion let the mouse go initially?",
                            "How did the mouse's small size become an advantage?",
                            "What does this story teach us about judging people by their size or appearance?"
                        ],
                        vocabulary: ["mighty", "squeaked", "amused", "gnawed", "gratefully"],
                        grammar_points: ["comparative adjectives", "direct and indirect speech"]
                    },
                    
                    {
                        id: "crow_pitcher",
                        title: "The Thirsty Crow", 
                        duration: 3,
                        moral: "Necessity is the mother of invention - never give up, find creative solutions",
                        subject_relevance: ["science", "english", "physics"],
                        age_group: "6-10",
                        story: `It was a hot summer day. A thirsty crow was flying here and there, looking for water. He had been flying for hours under the blazing sun.

Finally, he spotted a pitcher near a house. He flew down quickly, hoping to find water. The pitcher had water, but it was very low - the crow's beak couldn't reach it.

The crow tried to push the pitcher over, but it was too heavy. He tried to break it, but it was too strong. The poor crow was about to give up when he noticed some small stones nearby.

Suddenly, he had an idea! He picked up a stone in his beak and dropped it into the pitcher. The water level rose a little. He dropped another stone, and another, and another.

Slowly, the water level kept rising. After dropping many stones, the water finally reached the top. The clever crow drank the sweet water and felt refreshed.

"My persistence and creativity saved me!" thought the crow happily as he flew away.

**Educational Connection:** This demonstrates the scientific principle of displacement - when objects are added to water, they displace their volume and raise the water level. This is the same principle Archimedes discovered!`,
                        
                        questions: [
                            "What scientific principle did the crow use?",
                            "Why didn't the crow give up after the first failed attempts?",
                            "How can we apply this 'never give up' attitude in our studies?"
                        ],
                        vocabulary: ["blazing", "spotted", "persistence", "creativity", "displacement"],
                        science_connection: "Archimedes' principle, volume and displacement"
                    }
                ]
            },
            
            ramayana: {
                category: "Ramayana Stories",
                description: "Epic tales of duty, courage, and righteousness",
                stories: [
                    {
                        id: "hanuman_courage",
                        title: "Hanuman's Leap to Lanka",
                        duration: 5,
                        moral: "Courage and devotion can overcome any obstacle",
                        subject_relevance: ["hindi", "moral_science", "physics", "geography"],
                        age_group: "8-16",
                        story: `When Sita was kidnapped by Ravana and taken to Lanka, the monkey army gathered at the southern shore of India. The ocean stretched endlessly before them - 100 yojanas (about 800 miles) wide!

"How will we cross this vast ocean?" worried the monkeys. "We need to find Sita quickly!"

The wise bear Jambavan looked at Hanuman and said, "O son of the Wind God, you have forgotten your own strength! When you were a child, you tried to eat the sun thinking it was a fruit. You have the power to leap across oceans!"

As Jambavan spoke about his powers, Hanuman began to remember. His body started to grow larger and more powerful. His confidence returned.

"Yes!" declared Hanuman. "For Lord Rama and Sita, I can cross any ocean!"

Hanuman climbed to the peak of Mount Mahendra. He pressed his feet firmly on the ground, took a deep breath, and with a mighty roar, leaped into the sky!

The force of his jump was so powerful that trees bent backward and rocks flew in all directions. Hanuman soared through the clouds like a flying mountain, his red cape flowing in the wind.

During his flight, many obstacles tried to stop him:
- Surasa, the mother of serpents, opened her huge mouth to swallow him
- Simhika, a sea monster, tried to catch his shadow
- Mountains rose from the sea to block his path

But Hanuman's devotion to Rama gave him strength to overcome everything. After flying for hours, he finally saw the golden city of Lanka in the distance.

**Educational Connection:** This story teaches us about the physics of projectile motion - the angle, force, and speed needed for long-distance flight. It also shows us geography - the actual distance between India and Sri Lanka!`,
                        
                        questions: [
                            "What gave Hanuman the confidence to attempt the impossible leap?",
                            "How did devotion help him overcome obstacles?",
                            "What can we learn about believing in ourselves from this story?"
                        ],
                        vocabulary: ["vast", "devotion", "obstacle", "projectile", "confidence"],
                        science_connection: "Projectile motion, force and momentum, geography of India-Sri Lanka",
                        math_connection: "Distance calculation, angles, speed and time"
                    },
                    
                    {
                        id: "rama_setu",
                        title: "Building the Bridge to Lanka",
                        duration: 6,
                        moral: "Teamwork and determination can achieve impossible goals",
                        subject_relevance: ["science", "hindi", "engineering", "teamwork"],
                        age_group: "10-16",
                        story: `After Hanuman returned with news of Sita's location, the monkey army faced a huge challenge: How could they all cross the ocean to Lanka?

"We need a bridge," said Rama. "But how can we build a bridge across 100 yojanas of ocean?"

Nala and Nila, two monkey engineers, stepped forward. "We can do it, Lord Rama! We have a plan!"

The entire monkey army worked together with amazing coordination:

**The Engineering Team:**
- Nala designed the bridge structure
- Nila calculated the measurements  
- Hanuman led the heavy-lifting team

**The Material Collection:**
- Some monkeys uprooted huge trees
- Others brought massive rocks from mountains
- Even small squirrels helped by bringing tiny pebbles

**The Construction Process:**
1. They drove wooden pillars deep into the ocean floor
2. Large rocks were placed as foundation stones
3. Trees were laid horizontally as the bridge deck
4. Smaller stones filled the gaps

But something magical happened - when the monkeys chanted "Rama! Rama!" while placing stones, the stones didn't sink! They floated on water!

A small squirrel was also helping by bringing tiny stones. Some monkeys laughed at its small contribution. But Rama gently picked up the squirrel and said, "Every contribution matters, no matter how small."

In just five days, they built a 10-mile-long bridge! The ocean itself seemed to help, keeping the structure stable.

**Educational Connection:** This demonstrates principles of civil engineering - foundation laying, load distribution, and teamwork in large projects. Modern bridges still use similar principles of foundation and support structures!`,
                        
                        questions: [
                            "What engineering principles were used in building the bridge?",
                            "Why was teamwork essential for this project?",
                            "What does Rama's treatment of the squirrel teach us about valuing everyone's contribution?"
                        ],
                        vocabulary: ["coordination", "foundation", "structure", "contribution", "engineering"],
                        science_connection: "Civil engineering, buoyancy, structural design",
                        math_connection: "Measurement, load calculation, geometry"
                    }
                ]
            },
            
            mahabharata: {
                category: "Mahabharata Stories", 
                description: "Epic tales of duty, strategy, and moral dilemmas",
                stories: [
                    {
                        id: "abhimanyu_chakravyuh",
                        title: "Abhimanyu and the Chakravyuh",
                        duration: 7,
                        moral: "Knowledge without complete understanding can be dangerous - always ask questions",
                        subject_relevance: ["mathematics", "strategy", "moral_science"],
                        age_group: "12-18",
                        story: `Abhimanyu was Arjuna's brave son, known for his fearless spirit and quick learning. When he was still in his mother's womb, he had learned the secret of entering the Chakravyuh (a complex military formation) by listening to his father explain it to his mother.

The Chakravyuh was like a complex mathematical spiral - seven concentric circles of warriors, each more deadly than the last. It was designed like a labyrinth where:
- Circle 1: Light infantry
- Circle 2: Heavy cavalry  
- Circle 3: Elephant warriors
- Circle 4: Chariot fighters
- Circle 5: Elite archers
- Circle 6: Veteran warriors
- Circle 7: Supreme commanders

On the 13th day of the Kurukshetra war, the Kauravas created this deadly formation to trap and kill key Pandava warriors.

"Only four people know how to break this formation," said Dronacharya, "Arjuna, Krishna, Pradyumna, and young Abhimanyu."

Since Arjuna was away fighting elsewhere, the Pandavas were in trouble. Young Abhimanyu, only 16 years old, volunteered to break the formation.

"I know how to enter," said Abhimanyu confidently, "but..." he paused, "I never heard the complete explanation. I don't know how to exit."

The Pandava elders made a fateful decision: "Don't worry, child. You break open the formation from inside, and we'll follow you and fight our way out together."

Abhimanyu agreed. Like solving a complex equation, he systematically broke through each circle:
- He used different tactics for each circle
- Adapted his strategy based on the enemy formation
- Applied his knowledge of geometry to find weak points

But once inside, a disaster occurred. The Pandava army couldn't follow him - they were blocked by the Kauravas who quickly sealed the entrance.

Abhimanyu was trapped alone inside, facing the greatest warriors of the Kaurava army. Despite his incomplete knowledge, he fought valiantly but was eventually overwhelmed.

**Educational Connection:** This story is like a mathematical problem where knowing only part of the solution can lead to trouble. In mathematics, we must understand both how to solve a problem AND how to verify our answer!`,
                        
                        questions: [
                            "What was wrong with Abhimanyu's knowledge of the Chakravyuh?",
                            "How is incomplete learning like knowing only half of a math formula?",
                            "What should we do when we don't understand something completely?"
                        ],
                        vocabulary: ["concentric", "formation", "strategy", "systematically", "valiantly"],
                        math_connection: "Geometric patterns, spiral formations, strategic planning",
                        life_lesson: "Always seek complete knowledge before taking action"
                    },
                    
                    {
                        id: "eklavya_dedication",
                        title: "Eklavya's Dedication to Learning",
                        duration: 5,
                        moral: "True learning comes from dedication and practice, not just formal teaching",
                        subject_relevance: ["any", "self_study", "determination"],
                        age_group: "10-18",
                        story: `In the forest kingdom of Hastinapura, there lived a tribal boy named Eklavya. He had heard stories of the great teacher Dronacharya and dreamed of learning archery from him.

One day, Eklavya gathered courage and approached Dronacharya's ashram. "Guruji," he said respectfully, "please teach me archery. I want to become a great archer like Arjuna."

Dronacharya looked at the tribal boy and refused. "I only teach princes and Kshatriyas. You cannot be my student."

Eklavya's heart was broken, but his determination was not. He went back to the forest and made a clay statue of Dronacharya. 

"If you won't teach me in person," said Eklavya to the statue, "I'll learn by considering you as my guru in spirit."

Every day, Eklavya practiced archery in front of the statue:
- He started by learning to hold the bow correctly
- He practiced his stance and posture
- He made his own arrows from forest materials
- He created moving targets using leaves and fruits
- He practiced in all weather conditions

**His Self-Learning Method:**
1. **Observation**: He watched birds and animals to understand movement
2. **Practice**: He shot thousands of arrows daily
3. **Innovation**: He invented new techniques for difficult shots
4. **Persistence**: He never missed a day of practice
5. **Self-correction**: He analyzed his mistakes and improved

Years passed. Eklavya became incredibly skilled - more skilled than even Arjuna!

One day, Dronacharya and his students were hunting in the forest when they encountered a dog whose mouth was filled with arrows, but the dog was unharmed. The arrows were placed so precisely that they didn't hurt the dog but stopped it from barking.

"Who could shoot with such impossible precision?" wondered Dronacharya.

They found Eklavya practicing. Dronacharya was amazed by the boy's skill.

"Who is your teacher?" asked Dronacharya.

"You are, Guruji," said Eklavya, pointing to the clay statue. "I learned everything by considering you my guru."

**Educational Connection:** Eklavya's story shows us that self-study, dedication, and practice can sometimes achieve more than formal classroom learning. Today's online education and self-learning apps work on the same principle!`,
                        
                        questions: [
                            "How did Eklavya overcome the obstacle of not having a formal teacher?",
                            "What self-learning techniques did he use that we can apply to our studies?",
                            "How is Eklavya's method similar to modern online learning?"
                        ],
                        vocabulary: ["dedication", "persistence", "precision", "innovation", "self-correction"],
                        study_techniques: ["Self-observation", "Daily practice", "Creating your own materials", "Learning from mistakes"],
                        modern_connection: "Online learning, MOOCs, self-paced education"
                    }
                ]
            },
            
            krishna_stories: {
                category: "Krishna Stories",
                description: "Divine tales with practical wisdom and scientific insights",
                stories: [
                    {
                        id: "krishna_mathematics", 
                        title: "Krishna and the Butter Mathematics",
                        duration: 4,
                        moral: "Mathematics is everywhere in daily life - even in stealing butter!",
                        subject_relevance: ["mathematics", "logical_thinking"],
                        age_group: "8-14",
                        story: `Little Krishna was famous in Gokul for his butter-stealing adventures. But did you know that Krishna was actually a mathematical genius?

One day, Mother Yashoda hung the butter pot high on the ceiling, thinking Krishna couldn't reach it. 

"Aha!" thought Krishna. "This is a problem of height, distance, and angles!"

**Krishna's Mathematical Approach:**

**Step 1: Measurement**
- Height of pot from ground: 8 feet
- Krishna's height: 3 feet  
- Height needed: 8 - 3 = 5 feet

**Step 2: Resource Calculation**  
- Each friend can add: 2 feet (standing on shoulders)
- Number of friends needed: 5 ÷ 2 = 2.5, so 3 friends

**Step 3: Weight Distribution**
- Krishna's weight: 20 kg
- Each friend can support: 25 kg
- Safety factor: 25 - 20 = 5 kg extra support

**Step 4: Angle Calculation**
- The pot was hanging at a slight angle
- Krishna calculated the swing needed: 30 degrees
- Force required for swing: F = mg sin(30°)

**Step 5: Timing**
- Mother Yashoda's market trip: 1 hour
- Time to form pyramid: 5 minutes
- Time to get butter: 2 minutes  
- Time to clean evidence: 10 minutes
- Safety buffer: 43 minutes

Krishna called his friends and explained the plan like a math problem:

"If we form a human pyramid with 3 levels, and I climb to the top, I can reach the pot. But we need to account for the pot's swinging motion and grab it at the right angle!"

The plan worked perfectly! Krishna got the butter and even shared it equally among all friends using division.

**When Mother Yashoda returned:**
"Krishna, did you take the butter?"
"Mother, I was just practicing mathematics! We learned addition, subtraction, division, angles, and time management!"

**Educational Connection:** This shows how mathematical thinking applies to everyday problem-solving - measurement, calculation, planning, and execution!`,
                        
                        questions: [
                            "What mathematical concepts did Krishna use in his plan?",
                            "How can we apply mathematical thinking to solve daily problems?", 
                            "What does this story teach us about planning and teamwork?"
                        ],
                        vocabulary: ["measurement", "calculation", "distribution", "angle", "execution"],
                        math_connection: "Height/distance calculation, division, angles, time management",
                        life_skills: "Problem-solving, planning, teamwork, resource management"
                    },
                    
                    {
                        id: "govardhan_physics",
                        title: "Krishna Lifts Govardhan Hill",
                        duration: 5,
                        moral: "Understanding physics helps us understand divine leelas and natural phenomena",
                        subject_relevance: ["physics", "science", "environmental_science"],
                        age_group: "10-16",
                        story: `When Krishna was just seven years old, the people of Vrindavan faced a terrible crisis. Indra, the king of gods, was angry because they had stopped worshipping him and started worshipping Govardhan hill instead.

Indra sent terrible storms and floods to destroy Vrindavan. The rain was so heavy that in just one hour, the water level rose by 3 feet!

**The Physics Problem:**
- Rainfall rate: 50 cm per hour (extremely dangerous level)
- Area to protect: 100 square kilometers  
- Number of people: 10,000 villagers plus thousands of cattle
- Weight of water falling: 50 million tons per hour

"We need shelter immediately!" cried the villagers. "The flood will wash away everything!"

Little Krishna observed the situation like a scientist:

**Krishna's Scientific Analysis:**

**1. Load Distribution Physics:**
- Weight of Govardhan hill: Approximately 1 billion tons
- Surface area of Krishna's finger: 2 square cm
- Pressure = Force ÷ Area
- By using his finger tip, Krishna concentrated the lifting force at one point

**2. Lever Principle:**
- Krishna used the principle of leverage
- His finger acted as a fulcrum point
- The hill became a giant lever
- Small force at one end lifted massive weight

**3. Center of Gravity:**
- Krishna found the exact center of gravity of the hill
- By lifting from this point, the hill remained perfectly balanced
- Like balancing a scale, the weight was distributed evenly

**4. Structural Engineering:**
- The hill's natural cave system provided strong support
- Krishna ensured load-bearing rocks remained in place
- Created a stable umbrella-like structure

**5. Atmospheric Pressure:**
- The raised hill created a low-pressure zone underneath
- This helped in deflecting rain away from the shelter area
- Similar to how modern umbrellas work

For seven days and nights, Krishna held the massive hill on his little finger while everyone took shelter underneath. The villagers were amazed!

"How is this possible?" they wondered.

Krishna smiled and said, "When you understand the laws of nature (physics) and use them with pure intention and divine strength, even impossible things become possible!"

**Educational Connection:** This story demonstrates advanced physics concepts - leverage, center of gravity, pressure distribution, and structural engineering. Modern cranes and lifting equipment work on similar principles!`,
                        
                        questions: [
                            "What physics principles did Krishna use to lift the hill?",
                            "How do modern cranes and lifting equipment use similar principles?", 
                            "What does this teach us about using scientific knowledge for helping others?"
                        ],
                        vocabulary: ["leverage", "fulcrum", "gravity", "pressure", "engineering"],
                        physics_connection: "Lever systems, center of gravity, pressure distribution, structural mechanics",
                        environmental_connection: "Flood management, natural disasters, community protection"
                    }
                ]
            }
        };
        
        this.subjects = {
            mathematics: ["krishna_mathematics", "abhimanyu_chakravyuh"],
            science: ["crow_pitcher", "govardhan_physics", "rama_setu"],
            english: ["monkey_crocodile", "lion_mouse", "crow_pitcher"],
            hindi: ["hanuman_courage", "eklavya_dedication"],
            moral_science: ["lion_mouse", "eklavya_dedication", "monkey_crocodile"],
            physics: ["govardhan_physics", "hanuman_courage"],
            engineering: ["rama_setu"],
            critical_thinking: ["monkey_crocodile", "abhimanyu_chakravyuh"]
        };
        
        this.age_groups = {
            "6-10": ["lion_mouse", "crow_pitcher"],
            "8-14": ["monkey_crocodile", "krishna_mathematics", "hanuman_courage"],
            "10-16": ["rama_setu", "govardhan_physics", "eklavya_dedication"],
            "12-18": ["abhimanyu_chakravyuh"]
        };
        
        this.morals = {
            "problem_solving": ["monkey_crocodile", "crow_pitcher", "krishna_mathematics"],
            "perseverance": ["eklavya_dedication", "rama_setu"],
            "teamwork": ["rama_setu", "lion_mouse"],
            "courage": ["hanuman_courage", "abhimanyu_chakravyuh"],
            "learning": ["eklavya_dedication", "abhimanyu_chakravyuh"],
            "helping_others": ["lion_mouse", "govardhan_physics"]
        };
    }
    
    // Get story by ID
    getStory(storyId) {
        for (const [category, data] of Object.entries(this.stories)) {
            const story = data.stories.find(s => s.id === storyId);
            if (story) {
                return { ...story, category: data.category };
            }
        }
        return null;
    }
    
    // Get stories by subject
    getStoriesBySubject(subject) {
        const storyIds = this.subjects[subject] || [];
        return storyIds.map(id => this.getStory(id)).filter(Boolean);
    }
    
    // Get stories by age group
    getStoriesByAge(ageGroup) {
        const storyIds = this.age_groups[ageGroup] || [];
        return storyIds.map(id => this.getStory(id)).filter(Boolean);
    }
    
    // Get stories by moral/theme
    getStoriesByMoral(moral) {
        const storyIds = this.morals[moral] || [];
        return storyIds.map(id => this.getStory(id)).filter(Boolean);
    }
    
    // Get random story
    getRandomStory(filters = {}) {
        let availableStories = [];
        
        // Collect all stories
        for (const [category, data] of Object.entries(this.stories)) {
            availableStories.push(...data.stories.map(s => ({ ...s, category: data.category })));
        }
        
        // Apply filters
        if (filters.subject) {
            availableStories = availableStories.filter(s => 
                s.subject_relevance.includes(filters.subject)
            );
        }
        
        if (filters.age_group) {
            const [minAge, maxAge] = filters.age_group.split('-').map(Number);
            availableStories = availableStories.filter(s => {
                const [storyMin, storyMax] = s.age_group.split('-').map(Number);
                return minAge <= storyMax && maxAge >= storyMin;
            });
        }
        
        if (filters.duration_max) {
            availableStories = availableStories.filter(s => 
                s.duration <= filters.duration_max
            );
        }
        
        if (availableStories.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * availableStories.length);
        return availableStories[randomIndex];
    }
    
    // Search stories
    searchStories(keyword) {
        const results = [];
        const keywordLower = keyword.toLowerCase();
        
        for (const [category, data] of Object.entries(this.stories)) {
            for (const story of data.stories) {
                let matchScore = 0;
                let matchReasons = [];
                
                // Check title
                if (story.title.toLowerCase().includes(keywordLower)) {
                    matchScore += 10;
                    matchReasons.push('title');
                }
                
                // Check moral
                if (story.moral.toLowerCase().includes(keywordLower)) {
                    matchScore += 8;
                    matchReasons.push('moral');
                }
                
                // Check story content
                if (story.story.toLowerCase().includes(keywordLower)) {
                    matchScore += 5;
                    matchReasons.push('content');
                }
                
                // Check subject relevance
                if (story.subject_relevance.some(subj => subj.includes(keywordLower))) {
                    matchScore += 7;
                    matchReasons.push('subject');
                }
                
                if (matchScore > 0) {
                    results.push({
                        story: { ...story, category: data.category },
                        matchScore,
                        matchReasons
                    });
                }
            }
        }
        
        // Sort by match score
        return results.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Get story formatted for teaching
    formatStoryForTeaching(storyId, includeQuestions = true) {
        const story = this.getStory(storyId);
        if (!story) return null;
        
        let formatted = `📚 **${story.title}**\n\n`;
        formatted += `⏱️ **Duration:** ${story.duration} minutes\n`;
        formatted += `🎯 **Moral:** ${story.moral}\n`;
        formatted += `📖 **Subjects:** ${story.subject_relevance.join(', ')}\n`;
        formatted += `👥 **Age Group:** ${story.age_group}\n\n`;
        
        formatted += `**Story:**\n${story.story}\n\n`;
        
        if (includeQuestions && story.questions) {
            formatted += `**Discussion Questions:**\n`;
            story.questions.forEach((q, i) => {
                formatted += `${i + 1}. ${q}\n`;
            });
            formatted += `\n`;
        }
        
        if (story.vocabulary) {
            formatted += `**New Vocabulary:**\n`;
            formatted += story.vocabulary.join(', ') + '\n\n';
        }
        
        if (story.science_connection) {
            formatted += `🔬 **Science Connection:** ${story.science_connection}\n`;
        }
        
        if (story.math_connection) {
            formatted += `🔢 **Math Connection:** ${story.math_connection}\n`;
        }
        
        return formatted;
    }
    
    // Get categories
    getCategories() {
        return Object.keys(this.stories);
    }
    
    // Get all available subjects
    getSubjects() {
        return Object.keys(this.subjects);
    }
    
    // Get story recommendations based on recent topics
    getRecommendations(recentTopics = [], currentSubject = null) {
        let recommendations = [];
        
        // Get stories related to current subject
        if (currentSubject) {
            recommendations.push(...this.getStoriesBySubject(currentSubject));
        }
        
        // Get stories related to recent topics
        for (const topic of recentTopics) {
            const searchResults = this.searchStories(topic);
            recommendations.push(...searchResults.slice(0, 2).map(r => r.story));
        }
        
        // Remove duplicates
        const uniqueRecommendations = recommendations.filter((story, index, arr) => 
            arr.findIndex(s => s.id === story.id) === index
        );
        
        return uniqueRecommendations.slice(0, 5); // Return top 5 recommendations
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryDatabase;
} else {
    window.StoryDatabase = StoryDatabase;
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.storyDB = new StoryDatabase();
} 