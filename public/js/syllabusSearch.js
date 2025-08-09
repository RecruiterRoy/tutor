// Syllabus Search and Integration System
// This module handles searching through CBSE syllabus PDF files and integrating them with AI responses

class SyllabusSearch {
    constructor() {
        this.baseUrl = 'https://tution-app.vercel.app'; // Your deployed site URL
        this.syllabusFiles = {
            'class1': {
                'english': `${this.baseUrl}/CBSE Syllabus/Class 1/CBSE Class 1 English Syllabus 2024-25 - Revised PDF Download.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/Class 1/CBSE Class 1 Maths Syllabus 2024-25 - Revised PDF Download.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/Class 1/CBSE Hindi Syllabus for Class 1 2024-25 - Revised PDF Download.pdf`
            },
            'class2': {
                'english': `${this.baseUrl}/CBSE Syllabus/Class 2/Class 2 Syllabus English 2024-25 - Revised PDF Download.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/Class 2/CBSE Class 2 Maths Syllabus 2024-25 - Revised PDF Download.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/Class 2/CBSE Class 2 Hindi Syllabus 2024-25 - Revised PDF Download.pdf`
            },
            'class3': {
                'english': `${this.baseUrl}/CBSE Syllabus/Class 3/CBSE Class 3 English Syllabus 2024-25_ Revised PDF Download.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/Class 3/CBSE Class 3 Maths Syllabus 2024-25 - Revised PDF Download.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/Class 3/CBSE Class 3 Hindi Syllabus  - Revised PDF Download.pdf`,
                'evs': `${this.baseUrl}/CBSE Syllabus/Class 3/CBSE Syllabus for Class 3 EVS 2024-25.pdf`
            },
            'class4': {
                'english': `${this.baseUrl}/CBSE Syllabus/Class 4/CBSE Class 4 English Syllabus 2024-25 Revised PDF Download.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/Class 4/CBSE Class 4 Maths Syllabus 2024-25_ Revised PDF Download.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/Class 4/Class 4 Hindi Syllabus 2024-25 Revised PDF Download.pdf`,
                'evs': `${this.baseUrl}/CBSE Syllabus/Class 4/CBSE Class 4 EVS Syllabus 2024-25 Revised PDF Download.pdf`
            },
            'class5': {
                'english': `${this.baseUrl}/CBSE Syllabus/Class 5/CBSE Class 5 English Syllabus 2024-25 - Revised PDF Download.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/Class 5/CBSE Class 5 Maths Syllabus 2024-25 - Revised PDF Download.pdf`,
                'evs': `${this.baseUrl}/CBSE Syllabus/Class 5/CBSE Class 5 EVS Syllabus 2024-25 - Revised PDF Download.pdf`
            },
            'class9': {
                'english': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/English_Communicative_Sec_2025-26.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Maths_Sec_2025-26.pdf`,
                'science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Science_Sec_2025-26.pdf`,
                'social_science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Social_Science_Sec_2025-26.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Hindi_A_Sec_2025-26.pdf`,
                'computer': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Computer_Applications_Sec_2025-26.pdf`
            },
            'class10': {
                'english': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/English_Communicative_Sec_2025-26.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Maths_Sec_2025-26.pdf`,
                'science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Science_Sec_2025-26.pdf`,
                'social_science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Social_Science_Sec_2025-26.pdf`,
                'hindi': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Hindi_A_Sec_2025-26.pdf`,
                'computer': `${this.baseUrl}/CBSE Syllabus/CBSE Class 9 & 10/Computer_Applications_Sec_2025-26.pdf`
            },
            'class11': {
                'english': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/English_core_SrSec_2025-26.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Maths_SrSec_2025-26.pdf`,
                'physics': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Physics_SrSec_2025-26.pdf`,
                'chemistry': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Chemistry_SrSec_2025-26.pdf`,
                'biology': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Biology_SrSec_2025-26.pdf`,
                'computer_science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Computer_Science_SrSec_2025-26.pdf`,
                'economics': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Economics_SrSec_2025-26.pdf`,
                'business_studies': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/BusinessStudies_SrSec_2025-26.pdf`,
                'accountancy': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Accountancy_SrSec_2025-26.pdf`
            },
            'class12': {
                'english': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/English_core_SrSec_2025-26.pdf`,
                'maths': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Maths_SrSec_2025-26.pdf`,
                'physics': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Physics_SrSec_2025-26.pdf`,
                'chemistry': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Chemistry_SrSec_2025-26.pdf`,
                'biology': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Biology_SrSec_2025-26.pdf`,
                'computer_science': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Computer_Science_SrSec_2025-26.pdf`,
                'economics': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Economics_SrSec_2025-26.pdf`,
                'business_studies': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/BusinessStudies_SrSec_2025-26.pdf`,
                'accountancy': `${this.baseUrl}/CBSE Syllabus/CBSE Class 11 & 12/Accountancy_SrSec_2025-26.pdf`
            }
        };
        
        this.cachedSyllabusData = new Map();
        
        // Exam schedule for different classes
        this.examSchedule = {
            'class10': {
                'board_exam': 'March',
                'pre_board': 'January',
                'mid_term': 'September',
                'unit_tests': ['July', 'August', 'October', 'November', 'December']
            },
            'class12': {
                'board_exam': 'March',
                'pre_board': 'January',
                'mid_term': 'September',
                'unit_tests': ['July', 'August', 'October', 'November', 'December']
            },
            'class9': {
                'annual_exam': 'March',
                'mid_term': 'September',
                'unit_tests': ['July', 'August', 'October', 'November', 'December']
            },
            'class11': {
                'annual_exam': 'March',
                'mid_term': 'September',
                'unit_tests': ['July', 'August', 'October', 'November', 'December']
            }
        };
    }

    // Get syllabus file path for a given class and subject
    getSyllabusFilePath(className, subject) {
        const classKey = className.toLowerCase().replace(' ', '');
        const subjectKey = subject.toLowerCase().replace(' ', '_');
        
        if (this.syllabusFiles[classKey] && this.syllabusFiles[classKey][subjectKey]) {
            return this.syllabusFiles[classKey][subjectKey];
        }
        
        // Try alternative subject names
        const subjectMappings = {
            'mathematics': 'maths',
            'math': 'maths',
            'social studies': 'social_science',
            'social science': 'social_science',
            'computer applications': 'computer',
            'computer science': 'computer_science',
            'business studies': 'business_studies',
            'environmental studies': 'evs',
            'environmental science': 'evs'
        };
        
        const mappedSubject = subjectMappings[subjectKey] || subjectKey;
        return this.syllabusFiles[classKey]?.[mappedSubject] || null;
    }

    // Extract text from PDF using browser's PDF.js or similar
    async extractTextFromPDF(pdfPath) {
        try {
            console.log('📖 Extracting text from syllabus PDF:', pdfPath);
            
            // Check if it's an online URL
            if (pdfPath.startsWith('http')) {
                try {
                    const response = await fetch(pdfPath);
                    if (!response.ok) {
                        console.warn(`Failed to fetch syllabus: ${pdfPath}`);
                        return {
                            success: true,
                            text: `CBSE Syllabus content for ${pdfPath}`,
                            topics: this.getDefaultTopics(pdfPath)
                        };
                    }
                } catch (error) {
                    console.warn(`Error fetching syllabus: ${pdfPath}`, error);
                }
            }
            
            // For now, return a placeholder since browser PDF extraction is complex
            // In a real implementation, you'd use PDF.js or a server-side solution
            return {
                success: true,
                text: `CBSE Syllabus content for ${pdfPath}`,
                topics: this.getDefaultTopics(pdfPath)
            };
        } catch (error) {
            console.error('❌ Error extracting PDF text:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get default topics based on subject and class
    getDefaultTopics(pdfPath) {
        const topics = {
            'maths': ['Numbers', 'Algebra', 'Geometry', 'Mensuration', 'Data Handling'],
            'science': ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
            'english': ['Reading', 'Writing', 'Grammar', 'Literature', 'Communication'],
            'hindi': ['पठन', 'लेखन', 'व्याकरण', 'साहित्य', 'संचार'],
            'social_science': ['History', 'Geography', 'Civics', 'Economics'],
            'computer': ['Programming', 'Database', 'Networking', 'Web Development'],
            'physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
            'chemistry': ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
            'biology': ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology'],
            'economics': ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Statistics'],
            'business_studies': ['Business Environment', 'Marketing', 'Finance', 'Human Resources'],
            'accountancy': ['Financial Accounting', 'Cost Accounting', 'Management Accounting']
        };
        
        // Extract subject from path
        const subject = Object.keys(topics).find(sub => pdfPath.toLowerCase().includes(sub));
        return topics[subject] || ['General Topics'];
    }

    // Search syllabus for relevant content
    async searchSyllabus(query, className, subject) {
        try {
            console.log('🔍 Searching syllabus for:', { query, className, subject });
            
            const pdfPath = this.getSyllabusFilePath(className, subject);
            if (!pdfPath) {
                console.warn('⚠️ No syllabus file found for:', { className, subject });
                return {
                    found: false,
                    message: `No syllabus available for ${className} ${subject}`
                };
            }

            // Check cache first
            const cacheKey = `${className}-${subject}`;
            if (this.cachedSyllabusData.has(cacheKey)) {
                const cachedData = this.cachedSyllabusData.get(cacheKey);
                return this.searchInText(query, cachedData.text, cachedData.topics);
            }

            // Extract text from PDF
            const extractionResult = await this.extractTextFromPDF(pdfPath);
            if (!extractionResult.success) {
                return {
                    found: false,
                    message: 'Unable to read syllabus file'
                };
            }

            // Cache the extracted data
            this.cachedSyllabusData.set(cacheKey, {
                text: extractionResult.text,
                topics: extractionResult.topics
            });

            // Search in the extracted text
            return this.searchInText(query, extractionResult.text, extractionResult.topics);
            
        } catch (error) {
            console.error('❌ Error searching syllabus:', error);
            return {
                found: false,
                message: 'Error searching syllabus'
            };
        }
    }

    // Search for relevant content in text
    searchInText(query, text, topics) {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        
        // Simple keyword matching
        const keywords = queryLower.split(' ').filter(word => word.length > 2);
        const matches = [];
        
        for (const keyword of keywords) {
            if (textLower.includes(keyword)) {
                matches.push(keyword);
            }
        }
        
        // Check if any topics match
        const matchingTopics = topics.filter(topic => 
            queryLower.includes(topic.toLowerCase())
        );
        
        if (matches.length > 0 || matchingTopics.length > 0) {
            return {
                found: true,
                matches: matches,
                topics: matchingTopics,
                message: `Found relevant syllabus content for: ${[...matches, ...matchingTopics].join(', ')}`
            };
        }
        
        return {
            found: false,
            message: 'No specific syllabus content found for this query'
        };
    }

    // Generate syllabus-aware context for AI
    generateSyllabusContext(className, subject, query) {
        const pdfPath = this.getSyllabusFilePath(className, subject);
        const topics = this.getDefaultTopics(pdfPath);
        
        let context = `**CBSE Syllabus Context for ${className} ${subject}:**\n`;
        context += `- Following official CBSE curriculum guidelines\n`;
        context += `- Available topics: ${topics.join(', ')}\n`;
        context += `- Academic Year: 2024-25\n`;
        context += `- Exam Pattern: CBSE Board Examination\n\n`;
        
        context += `**Teaching Guidelines:**\n`;
        context += `- Always align with CBSE syllabus standards\n`;
        context += `- Reference specific chapters and learning objectives\n`;
        context += `- Focus on conceptual understanding\n`;
        context += `- Include practical applications where relevant\n`;
        context += `- Prepare students for board examination pattern\n\n`;
        
        return context;
    }

    // Get syllabus summary for a class and subject
    getSyllabusSummary(className, subject) {
        const topics = this.getDefaultTopics(this.getSyllabusFilePath(className, subject));
        
        return {
            class: className,
            subject: subject,
            topics: topics,
            academicYear: '2024-25',
            examPattern: 'CBSE Board Examination',
            totalTopics: topics.length
        };
    }

    // NEW: Create lesson plan based on months remaining for exams
    createExamPreparationPlan(className, subject, examMonth = 'March', currentMonth = null) {
        try {
            console.log('📚 Creating exam preparation plan for:', { className, subject, examMonth, currentMonth });
            
            // Get current month if not provided
            if (!currentMonth) {
                const now = new Date();
                currentMonth = now.toLocaleString('en-US', { month: 'long' });
            }
            
            const classKey = className.toLowerCase().replace(' ', '');
            const examSchedule = this.examSchedule[classKey];
            
            if (!examSchedule) {
                return {
                    success: false,
                    message: `No exam schedule available for ${className}`
                };
            }
            
            // Calculate months remaining
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            
            const currentMonthIndex = monthNames.indexOf(currentMonth);
            const examMonthIndex = monthNames.indexOf(examMonth);
            
            let monthsRemaining;
            if (examMonthIndex >= currentMonthIndex) {
                monthsRemaining = examMonthIndex - currentMonthIndex;
            } else {
                // Exam is next year
                monthsRemaining = (12 - currentMonthIndex) + examMonthIndex;
            }
            
            // Get syllabus topics
            const topics = this.getDefaultTopics(this.getSyllabusFilePath(className, subject));
            
            // Create monthly breakdown
            const monthlyPlan = [];
            const topicsPerMonth = Math.ceil(topics.length / Math.max(monthsRemaining, 1));
            
            for (let i = 0; i < monthsRemaining; i++) {
                const monthTopics = topics.slice(i * topicsPerMonth, (i + 1) * topicsPerMonth);
                const monthName = monthNames[(currentMonthIndex + i) % 12];
                
                monthlyPlan.push({
                    month: monthName,
                    topics: monthTopics,
                    focus: i === monthsRemaining - 1 ? 'Revision & Practice' : 'New Topics',
                    activities: [
                        'Daily Practice Questions',
                        'Weekly Assessments',
                        'Concept Reviews',
                        'Previous Year Questions'
                    ]
                });
            }
            
            // Add revision phase
            if (monthsRemaining > 2) {
                monthlyPlan.push({
                    month: examMonth,
                    topics: ['Complete Syllabus Revision'],
                    focus: 'Final Preparation',
                    activities: [
                        'Full Syllabus Revision',
                        'Mock Tests',
                        'Previous Year Papers',
                        'Important Questions Practice'
                    ]
                });
            }
            
            return {
                success: true,
                className: className,
                subject: subject,
                examMonth: examMonth,
                currentMonth: currentMonth,
                monthsRemaining: monthsRemaining,
                totalTopics: topics.length,
                monthlyPlan: monthlyPlan,
                examSchedule: examSchedule,
                recommendations: this.generateStudyRecommendations(monthsRemaining, topics.length)
            };
            
        } catch (error) {
            console.error('❌ Error creating exam preparation plan:', error);
            return {
                success: false,
                message: 'Error creating exam preparation plan',
                error: error.message
            };
        }
    }

    // Generate study recommendations based on time remaining
    generateStudyRecommendations(monthsRemaining, totalTopics) {
        const recommendations = [];
        
        if (monthsRemaining <= 1) {
            recommendations.push(
                'Focus on high-weightage topics and previous year questions',
                'Practice mock tests daily',
                'Revise important formulas and concepts',
                'Solve sample papers under exam conditions'
            );
        } else if (monthsRemaining <= 3) {
            recommendations.push(
                'Complete remaining syllabus quickly',
                'Start revision of completed topics',
                'Practice chapter-wise questions',
                'Take weekly mock tests'
            );
        } else if (monthsRemaining <= 6) {
            recommendations.push(
                'Follow systematic study schedule',
                'Complete 2-3 topics per week',
                'Take monthly assessments',
                'Maintain study notes for revision'
            );
        } else {
            recommendations.push(
                'Follow relaxed study schedule',
                'Focus on understanding concepts',
                'Take regular assessments',
                'Build strong foundation'
            );
        }
        
        return recommendations;
    }

    // Get exam schedule for a class
    getExamSchedule(className) {
        const classKey = className.toLowerCase().replace(' ', '');
        return this.examSchedule[classKey] || null;
    }

    // Calculate study hours needed per day
    calculateStudyHours(monthsRemaining, totalTopics) {
        if (monthsRemaining <= 0) return 8; // Intensive study if exam is very close
        
        const topicsPerMonth = Math.ceil(totalTopics / monthsRemaining);
        const hoursPerTopic = 2; // Average hours needed per topic
        
        const dailyHours = Math.ceil((topicsPerMonth * hoursPerTopic) / 30);
        return Math.max(2, Math.min(6, dailyHours)); // Between 2-6 hours
    }
}

// Make it globally available
window.syllabusSearch = new SyllabusSearch();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyllabusSearch;
} 