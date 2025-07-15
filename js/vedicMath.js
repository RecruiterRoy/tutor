// Vedic Mathematics Database
// Complete collection of Vedic math tricks and techniques

class VedicMathDatabase {
    constructor() {
        this.tricks = {
            multiplication: {
                ekadhikena: {
                    name: "Ekadhikena Purvena (One More Than Previous)",
                    formula: "For numbers ending in 5: (ab5)² = a(a+1)25",
                    description: "Square of numbers ending with 5",
                    examples: [
                        {
                            problem: "25²",
                            solution: "2 × (2+1) = 2 × 3 = 6, so 625",
                            steps: ["Take the first digit: 2", "Multiply by one more: 2 × 3 = 6", "Append 25: 625"]
                        },
                        {
                            problem: "35²", 
                            solution: "3 × (3+1) = 3 × 4 = 12, so 1225",
                            steps: ["Take the first digit: 3", "Multiply by one more: 3 × 4 = 12", "Append 25: 1225"]
                        },
                        {
                            problem: "85²",
                            solution: "8 × (8+1) = 8 × 9 = 72, so 7225", 
                            steps: ["Take the first digit: 8", "Multiply by one more: 8 × 9 = 72", "Append 25: 7225"]
                        }
                    ],
                    difficulty: "easy",
                    applicability: "Numbers ending with 5",
                    timesSaved: "70% faster than traditional method"
                },
                
                nikhilam: {
                    name: "Nikhilam Navatashcharamam Dashatah",
                    formula: "All from 9 and last from 10",
                    description: "Multiplication of numbers close to powers of 10",
                    examples: [
                        {
                            problem: "97 × 98",
                            solution: "97-3=94, 98-2=96, 94×96=9024, 3×2=6, so 9506",
                            steps: [
                                "Base = 100, deficiencies: 97-100=-3, 98-100=-2",
                                "Cross subtract: 97-2 = 95 or 98-3 = 95",
                                "Multiply deficiencies: (-3)×(-2) = 6",
                                "Result: 9506"
                            ]
                        },
                        {
                            problem: "103 × 104",
                            solution: "Base=100, excesses: +3, +4. 103+4=107, 3×4=12, so 10712",
                            steps: [
                                "Base = 100, excesses: +3, +4", 
                                "Cross add: 103+4 = 107",
                                "Multiply excesses: 3×4 = 12",
                                "Result: 10712"
                            ]
                        }
                    ],
                    difficulty: "medium",
                    applicability: "Numbers close to 10, 100, 1000",
                    timesSaved: "60% faster than traditional method"
                },
                
                urdhva_tiryak: {
                    name: "Urdhva Tiryakbyham (Vertically and Crosswise)",
                    formula: "Cross multiplication pattern",
                    description: "General multiplication technique using cross pattern",
                    examples: [
                        {
                            problem: "23 × 45",
                            solution: "2×4=8, (2×5+3×4)=22, 3×5=15, carry over: 1035",
                            steps: [
                                "Vertically: 2×4 = 8 (hundreds place)",
                                "Crosswise: 2×5 + 3×4 = 10 + 12 = 22 (tens place)",
                                "Vertically: 3×5 = 15 (units place)",
                                "Write: 8, 22+1, 5 = 1035"
                            ]
                        },
                        {
                            problem: "34 × 67",
                            solution: "3×6=18, (3×7+4×6)=45, 4×7=28, result: 2278",
                            steps: [
                                "Vertically: 3×6 = 18",
                                "Crosswise: 3×7 + 4×6 = 21 + 24 = 45", 
                                "Vertically: 4×7 = 28",
                                "Combine with carries: 2278"
                            ]
                        }
                    ],
                    difficulty: "medium",
                    applicability: "Any multiplication",
                    timesSaved: "50% faster than traditional method"
                },
                
                duplex: {
                    name: "Duplex Method",
                    formula: "D(abc) = 2(ab + bc) + a² + c²",
                    description: "Alternative method for squares and multiplication",
                    examples: [
                        {
                            problem: "43²",
                            solution: "D(43) = 2×4×3 + 4² + 3² = 24 + 16 + 9 = 49, but calculated step by step gives 1849",
                            steps: [
                                "Split: 4|3",
                                "Square first: 4² = 16",
                                "Double product: 2×4×3 = 24", 
                                "Square last: 3² = 9",
                                "Combine: 16|24|9 = 1849"
                            ]
                        }
                    ],
                    difficulty: "hard", 
                    applicability: "Squares of any numbers",
                    timesSaved: "40% faster for complex squares"
                }
            },
            
            division: {
                paravartya: {
                    name: "Paravartya Yojayet",
                    formula: "Transpose and apply",
                    description: "Division using flag method",
                    examples: [
                        {
                            problem: "1 ÷ 19",
                            solution: "Use flag method with base 20",
                            steps: [
                                "Rewrite as 1 ÷ (20-1)",
                                "Use flag method: 0.052631578...",
                                "Pattern emerges in recurring decimal"
                            ]
                        }
                    ],
                    difficulty: "hard",
                    applicability: "Division by numbers close to powers of 10",
                    timesSaved: "Advanced technique for specific cases"
                },
                
                dhvajanka: {
                    name: "Dhvajanka (Flag Method)",
                    formula: "Using flags for division",
                    description: "Systematic division using flag notation",
                    examples: [
                        {
                            problem: "123 ÷ 11",
                            solution: "Using flag method: 11.18...",
                            steps: [
                                "Set up flag system",
                                "Divide systematically",
                                "Handle remainders with flags"
                            ]
                        }
                    ],
                    difficulty: "hard",
                    applicability: "Complex division problems",
                    timesSaved: "Useful for long division"
                }
            },
            
            addition: {
                khanda: {
                    name: "Khanda Method",
                    formula: "Breaking numbers into convenient parts",
                    description: "Addition by breaking into parts",
                    examples: [
                        {
                            problem: "297 + 398",
                            solution: "(300-3) + (400-2) = 700-5 = 695",
                            steps: [
                                "Round up: 297 → 300, 398 → 400",
                                "Add rounded: 300 + 400 = 700",
                                "Subtract excess: 700 - 3 - 2 = 695"
                            ]
                        }
                    ],
                    difficulty: "easy",
                    applicability: "Large number addition",
                    timesSaved: "Mental math becomes easier"
                }
            },
            
            subtraction: {
                complement: {
                    name: "Complement Method",
                    formula: "Using complements for easier subtraction",
                    description: "Subtraction using 9's and 10's complements",
                    examples: [
                        {
                            problem: "1000 - 347",
                            solution: "Complement of 347 = 653, so answer = 653",
                            steps: [
                                "Find 9's complement: 999 - 347 = 652",
                                "Add 1 for 10's complement: 653",
                                "For 1000 - 347 = 653"
                            ]
                        }
                    ],
                    difficulty: "easy",
                    applicability: "Subtraction from powers of 10",
                    timesSaved: "Instant results for many problems"
                }
            },
            
            squares: {
                special_squares: {
                    name: "Special Square Patterns",
                    formula: "Various patterns for different number types",
                    description: "Quick methods for specific square patterns",
                    examples: [
                        {
                            problem: "Numbers near 50: 47²",
                            solution: "(50-3)² = 50² - 2×50×3 + 3² = 2500 - 300 + 9 = 2209",
                            steps: [
                                "Base = 50, deviation = -3",
                                "Square base: 50² = 2500", 
                                "Twice base times deviation: 2×50×(-3) = -300",
                                "Square deviation: (-3)² = 9",
                                "Sum: 2500 - 300 + 9 = 2209"
                            ]
                        },
                        {
                            problem: "Numbers ending in 1: 31²", 
                            solution: "30² + 2×30×1 + 1² = 900 + 60 + 1 = 961",
                            steps: [
                                "Split as (30+1)²",
                                "Use (a+b)² = a² + 2ab + b²",
                                "30² + 2×30×1 + 1² = 961"
                            ]
                        }
                    ],
                    difficulty: "medium",
                    applicability: "Numbers with specific patterns",
                    timesSaved: "Pattern recognition speeds calculation"
                }
            }
        };
        
        this.tips = {
            general: [
                "Always look for patterns in numbers before calculating",
                "Round numbers to make calculations easier, then adjust",
                "Use the base 10 system advantages in Vedic methods",
                "Practice mental visualization of the techniques",
                "Start with easier examples before complex ones"
            ],
            multiplication: [
                "For numbers ending in 5, use Ekadhikena method",
                "For numbers near 100, use Nikhilam method", 
                "For general multiplication, Urdhva Tiryak is most versatile",
                "Always check if numbers are close to a base (10, 100, 1000)"
            ],
            division: [
                "Look for patterns in divisors",
                "Use complements when possible",
                "Flag method works well for recurring decimals",
                "Consider if multiplication method can be reversed"
            ]
        };
        
        this.applications = {
            competitive_exams: {
                name: "Competitive Exams",
                benefits: ["Save 50-70% time", "Reduce calculation errors", "Mental math improvement"],
                recommended_tricks: ["ekadhikena", "nikhilam", "urdhva_tiryak"]
            },
            daily_life: {
                name: "Daily Life Calculations", 
                benefits: ["Quick bill calculations", "Percentage calculations", "Area measurements"],
                recommended_tricks: ["complement", "khanda", "special_squares"]
            },
            advanced_math: {
                name: "Advanced Mathematics",
                benefits: ["Algebraic manipulation", "Calculus shortcuts", "Number theory"],
                recommended_tricks: ["duplex", "paravartya", "dhvajanka"]
            }
        };
    }
    
    // Get trick by name
    getTrick(category, trickName) {
        return this.tricks[category]?.[trickName] || null;
    }
    
    // Get all tricks for a category
    getCategory(category) {
        return this.tricks[category] || {};
    }
    
    // Find applicable tricks for a given problem
    findApplicableTricks(problem) {
        const applicable = [];
        const numStr = problem.toString();
        
        // Check for numbers ending in 5 (squares)
        if (numStr.includes('²') && numStr.includes('5²')) {
            applicable.push({
                trick: this.tricks.multiplication.ekadhikena,
                category: 'multiplication',
                name: 'ekadhikena',
                reason: 'Number ends with 5 - perfect for Ekadhikena method'
            });
        }
        
        // Check for numbers close to 100
        const numbers = numStr.match(/\d+/g);
        if (numbers) {
            for (const num of numbers) {
                const n = parseInt(num);
                if (Math.abs(n - 100) <= 15 && numbers.length >= 2) {
                    applicable.push({
                        trick: this.tricks.multiplication.nikhilam,
                        category: 'multiplication', 
                        name: 'nikhilam',
                        reason: 'Numbers close to 100 - use Nikhilam method'
                    });
                    break;
                }
            }
        }
        
        // Check for general multiplication
        if (problem.includes('×') && applicable.length === 0) {
            applicable.push({
                trick: this.tricks.multiplication.urdhva_tiryak,
                category: 'multiplication',
                name: 'urdhva_tiryak', 
                reason: 'General multiplication - Urdhva Tiryak is versatile'
            });
        }
        
        return applicable;
    }
    
    // Get random trick for practice
    getRandomTrick() {
        const categories = Object.keys(this.tricks);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const tricks = Object.keys(this.tricks[randomCategory]);
        const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
        
        return {
            category: randomCategory,
            name: randomTrick,
            trick: this.tricks[randomCategory][randomTrick]
        };
    }
    
    // Get tips for a category
    getTips(category = 'general') {
        return this.tips[category] || this.tips.general;
    }
    
    // Search tricks by keyword
    searchTricks(keyword) {
        const results = [];
        const keywordLower = keyword.toLowerCase();
        
        for (const [category, tricks] of Object.entries(this.tricks)) {
            for (const [name, trick] of Object.entries(tricks)) {
                if (
                    trick.name.toLowerCase().includes(keywordLower) ||
                    trick.description.toLowerCase().includes(keywordLower) ||
                    trick.applicability.toLowerCase().includes(keywordLower)
                ) {
                    results.push({
                        category,
                        name,
                        trick,
                        matchType: 'description'
                    });
                }
                
                // Search in examples
                for (const example of trick.examples) {
                    if (example.problem.toLowerCase().includes(keywordLower)) {
                        results.push({
                            category,
                            name, 
                            trick,
                            matchType: 'example',
                            matchedExample: example
                        });
                        break;
                    }
                }
            }
        }
        
        return results;
    }
    
    // Format trick for display
    formatTrickForDisplay(trick, includeExamples = true) {
        let formatted = `**${trick.name}**\n\n`;
        formatted += `📝 **Formula:** ${trick.formula}\n`;
        formatted += `📖 **Description:** ${trick.description}\n`;
        formatted += `⚡ **Time Saved:** ${trick.timesSaved}\n`;
        formatted += `🎯 **Difficulty:** ${trick.difficulty}\n`;
        formatted += `✅ **Best For:** ${trick.applicability}\n\n`;
        
        if (includeExamples && trick.examples.length > 0) {
            formatted += `**Examples:**\n\n`;
            for (let i = 0; i < Math.min(2, trick.examples.length); i++) {
                const example = trick.examples[i];
                formatted += `${i + 1}. **Problem:** ${example.problem}\n`;
                formatted += `   **Solution:** ${example.solution}\n`;
                if (example.steps) {
                    formatted += `   **Steps:**\n`;
                    example.steps.forEach((step, idx) => {
                        formatted += `   ${idx + 1}. ${step}\n`;
                    });
                }
                formatted += `\n`;
            }
        }
        
        return formatted;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VedicMathDatabase;
} else {
    window.VedicMathDatabase = VedicMathDatabase;
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.vedicMathDB = new VedicMathDatabase();
} 