/**
 * Idle Story System
 * Triggers after 5 minutes of inactivity with teacher stories
 */
class IdleStorySystem {
    constructor() {
        this.idleTimer = null;
        this.storyTimer = null;
        this.lastActivity = Date.now();
        this.isIdleMessageShown = false;
        this.isStoryShown = false;
        this.idleThreshold = 5 * 60 * 1000; // 5 minutes
        this.storyDelay = 2 * 60 * 1000; // 2 minutes after idle message
        this.init();
    }

    init() {
        this.resetTimers();
        this.setupActivityListeners();
        console.log('📚 Idle Story System initialized');
    }

    setupActivityListeners() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => this.resetActivity(), { passive: true });
        });
        
        // Track chat activity
        if (window.gptService) {
            const originalSendMessage = window.gptService.sendMessage;
            window.gptService.sendMessage = async function(...args) {
                // Only reset activity if this is not a recursive call
                if (window.idleStorySystem && !window.idleStorySystem._isResetting) {
                    window.idleStorySystem._isResetting = true;
                    try {
                        window.idleStorySystem.resetActivity();
                    } finally {
                        window.idleStorySystem._isResetting = false;
                    }
                }
                return originalSendMessage.apply(this, args);
            };
        }
    }

    resetActivity() {
        this.lastActivity = Date.now();
        this.resetTimers();
        if (this.isIdleMessageShown || this.isStoryShown) {
            this.isIdleMessageShown = false;
            this.isStoryShown = false;
        }
    }

    resetTimers() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (this.storyTimer) clearTimeout(this.storyTimer);
        
        this.idleTimer = setTimeout(() => this.showIdleMessage(), this.idleThreshold);
    }

    showIdleMessage() {
        if (this.isIdleMessageShown) return;
        
        this.isIdleMessageShown = true;
        const currentAvatar = window.selectedAvatar || 'roy-sir';
        const teacherName = this.getTeacherNameFromAvatar(currentAvatar);
        
        let message = '';
        if (teacherName === 'Miss Sapna') {
            message = "Hey, if you are bored then I can tell you a nice story. Would you like to hear one?";
        } else {
            message = "अरे, अगर आप बोर हो रहे हैं तो मैं आपको एक अच्छी कहानी सुना सकता हूं। क्या आप सुनना चाहेंगे?";
        }

        this.sendIdleMessage(message);
        
        this.storyTimer = setTimeout(() => this.showStory(), this.storyDelay);
    }

    showStory() {
        if (this.isStoryShown) return;
        
        this.isStoryShown = true;
        const currentAvatar = window.selectedAvatar || 'roy-sir';
        const teacherName = this.getTeacherNameFromAvatar(currentAvatar);
        const userClass = window.userData?.class || '6';
        
        const story = this.getStoryForClass(userClass, teacherName);
        this.sendStoryMessage(story);
    }

    getTeacherNameFromAvatar(avatar) {
        return avatar === 'miss-sapna' ? 'Miss Sapna' : 'Roy Sir';
    }

    getStoryForClass(userClass, teacherName) {
        const classNum = parseInt(userClass) || 6;
        const isSeniorClass = classNum >= 5;
        
        if (teacherName === 'Miss Sapna') {
            return this.getEnglishStory(isSeniorClass);
        } else {
            return this.getHindiStory(isSeniorClass);
        }
    }

    getEnglishStory(isSeniorClass) {
        if (isSeniorClass) {
            return {
                title: "The Story of Lord Krishna and Sudama",
                content: `Let me tell you a beautiful story about true friendship from Hindu mythology. This is the story of Lord Krishna and his childhood friend Sudama.

Long ago, in the ancient city of Dwarka, there lived two best friends - Krishna and Sudama. They studied together at the ashram of Guru Sandipani. While Krishna was a prince, Sudama came from a very poor family. But their friendship knew no boundaries of wealth or status.

Years passed, and they went their separate ways. Krishna became the king of Dwarka, while Sudama remained poor and struggled to feed his family. Despite his poverty, Sudama never asked Krishna for help, as he was too proud to ask for favors.

One day, Sudama's wife suggested, "Why don't you visit your old friend Krishna? He is now a great king and might help us." Sudama was hesitant but finally agreed. He had nothing to offer except a small bundle of beaten rice (poha) that his wife had prepared.

When Sudama reached Dwarka, he was amazed by its grandeur. The guards at the palace gate asked who he was. "I am Sudama, an old friend of Krishna," he said humbly. The guards laughed, thinking how could a poor man be friends with the great king?

But when Krishna heard that Sudama had come, he ran barefoot to welcome his friend. He embraced Sudama warmly and treated him with great respect. Sudama was overwhelmed by Krishna's love and felt ashamed to offer his simple gift of beaten rice.

Krishna noticed the bundle and asked, "What have you brought for me, dear friend?" Sudama tried to hide it, but Krishna insisted and ate the rice with great joy, saying it was the most delicious food he had ever tasted.

When Sudama returned home, he was shocked to find his small hut transformed into a magnificent palace. His family was no longer poor. Krishna had blessed his friend with wealth and prosperity, not because Sudama had asked, but because of his pure heart and true friendship.

This story teaches us that true friendship is based on love and trust, not on wealth or status. It also shows that God rewards those who have pure hearts and genuine intentions. The story reminds us that helping others without expecting anything in return brings the greatest rewards.

The moral of this story is: True friendship is priceless, and God always rewards pure hearts and selfless actions.`
            };
        } else {
            return {
                title: "The Clever Rabbit",
                content: `Once upon a time, there was a clever rabbit who lived in a forest. One day, a hungry lion came to the forest and started eating all the animals. The animals were very scared.

The rabbit had an idea. He went to the lion and said, "Oh great lion, I was coming to be your food, but another lion stopped me and said he was the king of this forest."

The lion was very angry. "Take me to this other lion!" he roared.

The rabbit took the lion to a deep well and said, "The other lion is inside there." When the lion looked into the well, he saw his own reflection in the water. Thinking it was another lion, he roared loudly. The reflection roared back.

The lion jumped into the well to fight the other lion and drowned. The clever rabbit had saved all the animals!

Moral: Intelligence is more powerful than strength.`
            };
        }
    }

    getHindiStory(isSeniorClass) {
        if (isSeniorClass) {
            return {
                title: "भगवान कृष्ण और सुदामा की कहानी",
                content: `मैं आपको हिंदू पुराणों से एक सुंदर कहानी सुनाता हूं जो सच्ची दोस्ती के बारे में है। यह भगवान कृष्ण और उनके बचपन के दोस्त सुदामा की कहानी है।

बहुत पहले, प्राचीन नगर द्वारका में दो बेहतरीन दोस्त रहते थे - कृष्ण और सुदामा। वे गुरु सांदीपनी के आश्रम में एक साथ पढ़ते थे। जहां कृष्ण एक राजकुमार थे, वहीं सुदामा बहुत गरीब परिवार से आते थे। लेकिन उनकी दोस्ती धन या स्थिति की सीमाओं को नहीं जानती थी।

साल बीत गए, और वे अलग-अलग हो गए। कृष्ण द्वारका के राजा बन गए, जबकि सुदामा गरीब रहे और अपने परिवार को खिलाने के लिए संघर्ष करते रहे। अपनी गरीबी के बावजूद, सुदामा ने कभी कृष्ण से मदद नहीं मांगी।

एक दिन, सुदामा की पत्नी ने सुझाव दिया, "क्यों न आप अपने पुराने दोस्त कृष्ण से मिलने जाएं?" सुदामा हिचकिचाए लेकिन अंत में मान गए। उनके पास देने के लिए कुछ नहीं था सिवाय एक छोटे से बंडल के जिसमें उनकी पत्नी ने पोहा तैयार किया था।

जब सुदामा द्वारका पहुंचे, तो वे इसकी भव्यता से आश्चर्यचकित हो गए। महल के द्वार पर पहरेदारों ने पूछा कि वे कौन हैं। "मैं सुदामा हूं, कृष्ण का पुराना दोस्त," उन्होंने विनम्रता से कहा। पहरेदार हंस पड़े।

लेकिन जब कृष्ण ने सुना कि सुदामा आए हैं, तो वे नंगे पैर दौड़कर अपने दोस्त का स्वागत करने आए। उन्होंने सुदामा को गर्मजोशी से गले लगाया और उनके साथ बहुत सम्मान से पेश आए।

कृष्ण ने बंडल को देखा और पूछा, "तुम मेरे लिए क्या लाए हो, प्रिय दोस्त?" सुदामा ने इसे छिपाने की कोशिश की, लेकिन कृष्ण ने जोर दिया और बड़े आनंद से चावल खाया।

जब सुदामा घर लौटे, तो वे यह देखकर हैरान हो गए कि उनकी छोटी झोपड़ी एक भव्य महल में बदल गई थी। उनका परिवार अब गरीब नहीं था। कृष्ण ने अपने दोस्त को धन और समृद्धि से आशीर्वाद दिया था।

यह कहानी हमें सिखाती है कि सच्ची दोस्ती प्यार और विश्वास पर आधारित होती है, धन या स्थिति पर नहीं। यह यह भी दिखाती है कि भगवान उन लोगों को पुरस्कृत करते हैं जिनके पास शुद्ध हृदय और वास्तविक इरादे होते हैं।

इस कहानी का सार है: सच्ची दोस्ती अमूल्य है, और भगवान हमेशा शुद्ध हृदय और निस्वार्थ कार्यों को पुरस्कृत करते हैं।`
            };
        } else {
            return {
                title: "चतुर खरगोश",
                content: `एक बार की बात है, एक जंगल में एक चतुर खरगोश रहता था। एक दिन, एक भूखा शेर जंगल में आया और सभी जानवरों को खाने लगा। जानवर बहुत डरे हुए थे।

खरगोश के पास एक विचार आया। वह शेर के पास गया और बोला, "हे महान शेर, मैं आपका भोजन बनने आ रहा था, लेकिन एक और शेर ने मुझे रोक दिया और कहा कि वह इस जंगल का राजा है।"

शेर बहुत गुस्से में था। "मुझे उस दूसरे शेर के पास ले चलो!" वह दहाड़ा।

खरगोश शेर को एक गहरे कुएं के पास ले गया और बोला, "दूसरा शेर अंदर है।" जब शेर ने कुएं में देखा, तो उसे पानी में अपना प्रतिबिंब दिखाई दिया। सोचते हुए कि यह कोई और शेर है, वह जोर से दहाड़ा। प्रतिबिंब ने भी दहाड़ा।

शेर कुएं में कूद गया दूसरे शेर से लड़ने के लिए और डूब गया। चतुर खरगोश ने सभी जानवरों को बचा लिया था!

सीख: बुद्धि ताकत से ज्यादा शक्तिशाली होती है।`
            };
        }
    }

    sendIdleMessage(message) {
        if (window.addMessageToChat) {
            window.addMessageToChat('assistant', message, 'idle-message');
        }
        if (window.speakMessage) {
            window.speakMessage(message);
        }
    }

    sendStoryMessage(story) {
        const message = `${story.title}\n\n${story.content}`;
        if (window.addMessageToChat) {
            window.addMessageToChat('assistant', message, 'story-message');
        }
        if (window.speakMessage) {
            window.speakMessage(message);
        }
    }
}

// Initialize Idle Story System when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.idleStorySystem = new IdleStorySystem();
    console.log('✅ Idle Story System ready');
});

// Export for use in other modules
window.IdleStorySystem = IdleStorySystem;
