// AR Learning System (Placeholder)
// Augmented reality for science experiments and interactive learning

class ARLearning {
    constructor() {
        this.isSupported = this.checkARSupport();
        this.isActive = false;
        this.currentExperiment = null;
        this.experiments = this.setupExperiments();
        
        this.init();
    }

    init() {
        if (!this.isSupported) {
            console.log('❌ AR features not supported on this device');
            return;
        }

        console.log('🔬 AR Learning System initialized');
    }

    checkARSupport() {
        // Check for basic AR support
        return 'getUserMedia' in navigator && 
               'MediaDevices' in navigator &&
               'WebGLRenderingContext' in window;
    }

    setupExperiments() {
        return {
            'chemistry': {
                title: 'Chemistry Lab',
                description: 'Virtual chemistry experiments with 3D molecules',
                experiments: [
                    {
                        id: 'water_molecule',
                        name: 'Water Molecule (H₂O)',
                        description: 'Explore the structure of water molecules',
                        instructions: 'Point your camera at a flat surface to place the molecule'
                    },
                    {
                        id: 'carbon_dioxide',
                        name: 'Carbon Dioxide (CO₂)',
                        description: 'Learn about CO₂ molecular structure',
                        instructions: 'Point your camera at a flat surface to place the molecule'
                    },
                    {
                        id: 'methane',
                        name: 'Methane (CH₄)',
                        description: 'Explore methane molecular structure',
                        instructions: 'Point your camera at a flat surface to place the molecule'
                    }
                ]
            },
            'physics': {
                title: 'Physics Lab',
                description: 'Interactive physics simulations',
                experiments: [
                    {
                        id: 'pendulum',
                        name: 'Simple Pendulum',
                        description: 'Study pendulum motion and oscillation',
                        instructions: 'Point your camera at a flat surface to place the pendulum'
                    },
                    {
                        id: 'wave_motion',
                        name: 'Wave Motion',
                        description: 'Visualize wave propagation',
                        instructions: 'Point your camera at a flat surface to place the wave'
                    },
                    {
                        id: 'gravity',
                        name: 'Gravity Simulation',
                        description: 'Explore gravitational forces',
                        instructions: 'Point your camera at a flat surface to place the simulation'
                    }
                ]
            },
            'biology': {
                title: 'Biology Lab',
                description: '3D biological structures and cells',
                experiments: [
                    {
                        id: 'cell_structure',
                        name: 'Animal Cell',
                        description: 'Explore cell organelles in 3D',
                        instructions: 'Point your camera at a flat surface to place the cell'
                    },
                    {
                        id: 'dna_helix',
                        name: 'DNA Double Helix',
                        description: 'Study DNA structure and replication',
                        instructions: 'Point your camera at a flat surface to place the DNA'
                    },
                    {
                        id: 'plant_cell',
                        name: 'Plant Cell',
                        description: 'Compare plant and animal cells',
                        instructions: 'Point your camera at a flat surface to place the cell'
                    }
                ]
            }
        };
    }

    // Start AR session
    async startARSession(subject, experimentId) {
        if (!this.isSupported) {
            this.showARNotSupported();
            return;
        }

        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });

            this.isActive = true;
            this.currentExperiment = this.findExperiment(subject, experimentId);
            
            this.showARInterface(stream);
            console.log('🔬 AR session started:', this.currentExperiment.name);
            
        } catch (error) {
            console.error('❌ Failed to start AR session:', error);
            this.showARCameraError();
        }
    }

    findExperiment(subject, experimentId) {
        const subjectData = this.experiments[subject];
        if (!subjectData) return null;
        
        return subjectData.experiments.find(exp => exp.id === experimentId);
    }

    showARInterface(stream) {
        // Create AR interface modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black z-50 flex flex-col';
        modal.id = 'arInterface';
        
        modal.innerHTML = `
            <div class="flex-1 relative">
                <!-- Camera View -->
                <video id="arCamera" class="w-full h-full object-cover" autoplay muted></video>
                
                <!-- AR Overlay -->
                <div id="arOverlay" class="absolute inset-0 pointer-events-none">
                    <!-- AR content will be placed here -->
                </div>
                
                <!-- AR Controls -->
                <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <button onclick="window.arLearning.stopARSession()" class="bg-red-600 text-white px-4 py-2 rounded-lg">
                        ❌ Close
                    </button>
                    <div class="text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                        ${this.currentExperiment.name}
                    </div>
                    <button onclick="window.arLearning.toggleARInfo()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
                        ℹ️ Info
                    </button>
                </div>
                
                <!-- AR Instructions -->
                <div id="arInstructions" class="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                    <h3 class="font-semibold mb-2">${this.currentExperiment.name}</h3>
                    <p class="text-sm mb-2">${this.currentExperiment.description}</p>
                    <p class="text-xs text-yellow-300">${this.currentExperiment.instructions}</p>
                </div>
                
                <!-- AR Info Panel -->
                <div id="arInfoPanel" class="absolute top-16 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg hidden">
                    <h3 class="font-semibold mb-2">AR Learning Tips:</h3>
                    <ul class="text-sm space-y-1">
                        <li>• Move your device slowly to explore the 3D model</li>
                        <li>• Tap on different parts to learn more</li>
                        <li>• Use pinch gestures to zoom in/out</li>
                        <li>• Rotate your device to see different angles</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up video stream
        const video = document.getElementById('arCamera');
        video.srcObject = stream;
        
        // Add AR content based on experiment
        this.addARContent();
        
        // Add touch interactions
        this.setupARInteractions();
    }

    addARContent() {
        const overlay = document.getElementById('arOverlay');
        const experiment = this.currentExperiment;
        
        // Create placeholder AR content (in real implementation, this would be 3D models)
        const arContent = document.createElement('div');
        arContent.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto';
        
        switch (experiment.id) {
            case 'water_molecule':
                arContent.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">💧</div>
                        <div class="bg-white bg-opacity-90 text-black p-4 rounded-lg max-w-xs">
                            <h4 class="font-bold mb-2">Water Molecule (H₂O)</h4>
                            <p class="text-sm mb-2">Two hydrogen atoms bonded to one oxygen atom</p>
                            <div class="text-xs text-gray-600">
                                <div>• Oxygen: 8 protons, 8 neutrons</div>
                                <div>• Hydrogen: 1 proton each</div>
                                <div>• Bond angle: 104.5°</div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'cell_structure':
                arContent.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">🔬</div>
                        <div class="bg-white bg-opacity-90 text-black p-4 rounded-lg max-w-xs">
                            <h4 class="font-bold mb-2">Animal Cell</h4>
                            <p class="text-sm mb-2">Basic unit of life</p>
                            <div class="text-xs text-gray-600">
                                <div>• Nucleus: Contains DNA</div>
                                <div>• Mitochondria: Energy production</div>
                                <div>• Cell membrane: Protection</div>
                                <div>• Cytoplasm: Cell fluid</div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'pendulum':
                arContent.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">⏰</div>
                        <div class="bg-white bg-opacity-90 text-black p-4 rounded-lg max-w-xs">
                            <h4 class="font-bold mb-2">Simple Pendulum</h4>
                            <p class="text-sm mb-2">Oscillating motion demonstration</p>
                            <div class="text-xs text-gray-600">
                                <div>• Period depends on length</div>
                                <div>• Independent of mass</div>
                                <div>• Energy conservation</div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            default:
                arContent.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">🔬</div>
                        <div class="bg-white bg-opacity-90 text-black p-4 rounded-lg max-w-xs">
                            <h4 class="font-bold mb-2">${experiment.name}</h4>
                            <p class="text-sm">${experiment.description}</p>
                            <p class="text-xs text-gray-600 mt-2">Tap to interact with the 3D model</p>
                        </div>
                    </div>
                `;
        }
        
        overlay.appendChild(arContent);
    }

    setupARInteractions() {
        const arContent = document.querySelector('#arOverlay > div');
        if (!arContent) return;
        
        // Add click interaction
        arContent.addEventListener('click', () => {
            this.showExperimentDetails();
        });
        
        // Add touch gestures
        let startY = 0;
        let startX = 0;
        
        arContent.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        arContent.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const deltaY = e.touches[0].clientY - startY;
            const deltaX = e.touches[0].clientX - startX;
            
            // Simple rotation simulation
            arContent.style.transform = `translate(-50%, -50%) rotateY(${deltaX * 0.5}deg) rotateX(${-deltaY * 0.5}deg)`;
        });
    }

    showExperimentDetails() {
        const experiment = this.currentExperiment;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4">${experiment.name}</h3>
                <p class="text-gray-600 mb-4">${experiment.description}</p>
                
                <div class="space-y-2 text-sm">
                    <h4 class="font-semibold">Key Concepts:</h4>
                    <ul class="list-disc list-inside text-gray-600 space-y-1">
                        ${this.getExperimentConcepts(experiment.id).map(concept => 
                            `<li>${concept}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="mt-4 flex space-x-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Continue Exploring
                    </button>
                    <button onclick="window.arLearning.startQuiz()" class="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                        Take Quiz
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getExperimentConcepts(experimentId) {
        const concepts = {
            'water_molecule': [
                'Covalent bonding between hydrogen and oxygen',
                'Polar molecule with partial charges',
                'Hydrogen bonding in liquid water',
                'Universal solvent properties'
            ],
            'cell_structure': [
                'Cell is the basic unit of life',
                'Organelles have specific functions',
                'Nucleus contains genetic material',
                'Mitochondria produce energy'
            ],
            'pendulum': [
                'Simple harmonic motion',
                'Period depends on length and gravity',
                'Energy conservation in oscillation',
                'Amplitude affects motion but not period'
            ]
        };
        
        return concepts[experimentId] || ['Explore the 3D model to learn more'];
    }

    toggleARInfo() {
        const infoPanel = document.getElementById('arInfoPanel');
        infoPanel.classList.toggle('hidden');
    }

    startQuiz() {
        // Close AR session and start quiz
        this.stopARSession();
        
        // Start quiz related to the experiment
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = `Start a quiz about ${this.currentExperiment.name}`;
            chatInput.dispatchEvent(new Event('input'));
            
            const sendButton = document.getElementById('sendButton');
            if (sendButton) {
                sendButton.click();
            }
        }
    }

    stopARSession() {
        this.isActive = false;
        this.currentExperiment = null;
        
        // Stop camera stream
        const video = document.getElementById('arCamera');
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        // Remove AR interface
        const arInterface = document.getElementById('arInterface');
        if (arInterface) {
            arInterface.remove();
        }
        
        console.log('🔬 AR session stopped');
    }

    showARNotSupported() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
                <div class="text-6xl mb-4">📱</div>
                <h3 class="text-lg font-semibold mb-2">AR Not Supported</h3>
                <p class="text-gray-600 mb-4">Your device doesn't support AR features. Try using a mobile device with a camera.</p>
                <button onclick="this.closest('.fixed').remove()" class="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showARCameraError() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
                <div class="text-6xl mb-4">📷</div>
                <h3 class="text-lg font-semibold mb-2">Camera Access Required</h3>
                <p class="text-gray-600 mb-4">AR features need camera access. Please allow camera permissions and try again.</p>
                <button onclick="this.closest('.fixed').remove()" class="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Public methods
    getAvailableExperiments() {
        return this.experiments;
    }

    isExperimentAvailable(subject, experimentId) {
        return this.findExperiment(subject, experimentId) !== null;
    }
}

// Initialize AR Learning
let arLearning;

document.addEventListener('DOMContentLoaded', () => {
    arLearning = new ARLearning();
    
    // Make it globally available
    window.arLearning = arLearning;
});

console.log('🔬 AR Learning System loaded');
