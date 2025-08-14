// enhancedaiservice.js
// A robust, scalable Enhanced AI Service for tution.app

class EnhancedAIService {
  constructor(baseUrl = window.location.origin) {
    this.baseUrl = baseUrl;
    this.currentGrade = null;
    this.currentSubject = null;
    this.examMonth = 'March';
    this.lessonPlan = null;
    this.isInitializing = false;
    this.styleInjected = false;

    // Optional Event Hooks - frontend can bind to these
    this.onLessonPlanCreated = () => {};
    this.onWeeklyReminderShown = () => {};
    this.onMonthlyTestReminderShown = () => {};
  }

  async initialize(grade, subject) {
    this.isInitializing = true;
    this.currentGrade = grade;
    this.currentSubject = subject;

    // Load existing preferences
    const preferences = this.loadUserPreferences();
    this.examMonth = preferences.examMonth || 'March';

    // Validate loaded lesson plan
    if (!preferences.lessonPlan || !this.isLessonPlanValid(preferences.lessonPlan)) {
      await this.createLessonPlan();
    } else {
      this.lessonPlan = preferences.lessonPlan;
    }

    this.injectStylesOnce();
    this.isInitializing = false;
  }

  isLessonPlanValid(plan) {
    return plan && Array.isArray(plan.weeklySchedule) && typeof plan.totalWeeks === 'number';
  }

  async sendMessage(message, action = 'chat', retries = 2) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const payload = {
        message,
        subject: this.currentSubject,
        grade: this.currentGrade,
        action,
        examMonth: this.examMonth,
        weekNumber: this.getCurrentWeek(),
        month: this.getCurrentMonth()
      };

      const response = await fetch(`${this.baseUrl}/api/enhanced-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();

    } catch (error) {
      console.warn(`sendMessage failed (${retries} retries left):`, error);
      if (retries > 0) return this.sendMessage(message, action, retries - 1);
      throw error;
    }
  }

  async createLessonPlan() {
    try {
      const data = await this.sendMessage('Create lesson plan', 'lessonPlan');
      if (data.success && data.lessonPlan) {
        this.lessonPlan = data.lessonPlan;
        this.saveUserPreferences();
        this.onLessonPlanCreated(data.lessonPlan);
        return data.lessonPlan;
      }
    } catch (error) {
      console.error('Error creating lesson plan:', error);
    }
    return null;
  }

  async getWeeklyRevision(weekNumber = null) {
    const week = weekNumber || this.getCurrentWeek();
    try {
      const data = await this.sendMessage(`Get revision for week ${week}`, 'weeklyRevision');
      return data.success ? data.revision : null;
    } catch (error) {
      console.error('Error getting weekly revision:', error);
      return null;
    }
  }

  async getMonthlyTest(month = null) {
    const currentMonth = month || this.getCurrentMonth();
    try {
      const data = await this.sendMessage(`Get test for month ${currentMonth}`, 'monthlyTest');
      return data.success ? data.test : null;
    } catch (error) {
      console.error('Error getting monthly test:', error);
      return null;
    }
  }

  async generateExamPaper(chapters, questionTypes = 'all') {
    try {
      const payload = {
        message: `Generate exam paper for chapters: ${chapters.join(', ')}`,
        subject: this.currentSubject,
        grade: this.currentGrade,
        action: 'generateExamPaper',
        chapters: chapters,
        questionTypes: questionTypes
      };

      const response = await fetch(`${this.baseUrl}/api/enhanced-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      return data.success ? data.examPaper : null;
    } catch (error) {
      console.error('Error generating exam paper:', error);
      return null;
    }
  }

  getCurrentWeek() {
    const startDate = new Date('2024-06-01');
    const today = new Date();
    const weeks = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(40, weeks + 1));
  }

  getCurrentMonth() {
    return new Date().getMonth() + 1;
  }

  isSaturdayEvening() {
    const now = new Date();
    return now.getDay() === 6 && now.getHours() >= 18;
  }

  shouldShowWeeklyReminder() {
    if (!this.isSaturdayEvening()) return false;
    const key = `weeklyReminder_${this.currentGrade}_${this.currentSubject}`;
    const today = new Date().toDateString();
    const lastReminder = localStorage.getItem(key);
    if (lastReminder !== today) {
      localStorage.setItem(key, today);
      return true;
    }
    return false;
  }

  shouldShowMonthlyTest() {
    const currentMonth = this.getCurrentMonth();
    const key = `monthlyTest_${this.currentGrade}_${this.currentSubject}_${currentMonth}`;
    const today = new Date().getDate();
    if (today >= 25 && !localStorage.getItem(key)) {
      localStorage.setItem(key, 'true');
      return true;
    }
    return false;
  }

  async showProactiveReminders() {
    // Weekly Reminder
    if (this.shouldShowWeeklyReminder()) {
      const revision = await this.getWeeklyRevision();
      if (revision) {
        this.showWeeklyReminder(revision);
        this.onWeeklyReminderShown(revision);
      }
    }

    // Monthly Test Reminder
    if (this.shouldShowMonthlyTest()) {
      const test = await this.getMonthlyTest();
      if (test) {
        this.showMonthlyTestReminder(test);
        this.onMonthlyTestReminderShown(test);
      }
    }
  }

  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  showWeeklyReminder(revision) {
    const reminder = document.createElement('div');
    reminder.className = 'weekly-reminder';
    reminder.innerHTML = `
      <div class="reminder-content">
        <h3>📚 Weekly Revision Reminder</h3>
        <p>It's Saturday evening! Time to revise what you learned in ${this.sanitizeHTML(this.currentSubject)}.</p>
        <div class="revision-topics">
          <h4>Topics to revise:</h4>
          <ul>${revision.topics.map(t => `<li>${this.sanitizeHTML(t)}</li>`).join('')}</ul>
        </div>
        <div class="revision-activities">
          <h4>Suggested activities:</h4>
          <ul>${revision.activities.map(a => `<li>${this.sanitizeHTML(a)}</li>`).join('')}</ul>
        </div>
        <button onclick="this.closest('.weekly-reminder').remove()">Got it!</button>
      </div>
    `;
    document.body.appendChild(reminder);
  }

  showMonthlyTestReminder(test) {
    const reminder = document.createElement('div');
    reminder.className = 'monthly-test-reminder';
    reminder.innerHTML = `
      <div class="reminder-content">
        <h3>📝 Monthly Test Reminder</h3>
        <p>It's time for your monthly ${this.sanitizeHTML(this.currentSubject)} test!</p>
        <div class="test-info">
          <h4>Test Details:</h4>
          <p><strong>Duration:</strong> ${this.sanitizeHTML(test.testStructure.duration)}</p>
          <p><strong>Total Marks:</strong> ${this.sanitizeHTML(test.testStructure.totalMarks)}</p>
          <p><strong>Topics:</strong> ${test.topics.map(t => this.sanitizeHTML(t)).join(', ')}</p>
        </div>
        <button onclick="this.closest('.monthly-test-reminder').remove()">Start Test</button>
        <button onclick="this.closest('.monthly-test-reminder').remove()">Remind Later</button>
      </div>
    `;
    document.body.appendChild(reminder);
  }

  saveUserPreferences() {
    const preferences = {
      grade: this.currentGrade,
      subject: this.currentSubject,
      examMonth: this.examMonth,
      lessonPlan: this.lessonPlan,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`aiPreferences_${this.currentGrade}_${this.currentSubject}`, JSON.stringify(preferences));
  }

  loadUserPreferences() {
    const key = `aiPreferences_${this.currentGrade}_${this.currentSubject}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }

  getNextLesson() {
    if (!this.lessonPlan) return null;
    const nextWeek = this.lessonPlan.weeklySchedule.find(w => w.week === this.getCurrentWeek() + 1);
    return nextWeek || null;
  }

  getProgress() {
    if (!this.lessonPlan) return null;
    const currentWeek = this.getCurrentWeek();
    const totalWeeks = this.lessonPlan.totalWeeks || 40;
    const progress = Math.min(100, (currentWeek / totalWeeks) * 100);
    return {
      currentWeek,
      totalWeeks,
      progress,
      weeksRemaining: Math.max(0, totalWeeks - currentWeek),
      examMonth: this.examMonth
    };
  }

  injectStylesOnce() {
    if (this.styleInjected) return;
    const style = document.createElement('style');
    style.textContent = `
      .weekly-reminder, .monthly-test-reminder {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.5s ease-out;
      }
      .reminder-content h3 { margin: 0 0 15px; font-size: 18px; }
      .reminder-content h4 { margin: 15px 0 8px; font-size: 14px; }
      .reminder-content ul { margin: 8px 0; padding-left: 20px; }
      .reminder-content li { margin: 4px 0; font-size: 13px; }
      .reminder-content button {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white; padding: 8px 16px;
        border-radius: 5px; margin: 10px 5px 0 0;
        cursor: pointer; transition: background 0.3s;
      }
      .reminder-content button:hover { background: rgba(255,255,255,0.3); }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
    this.styleInjected = true;
  }
}

// For ES module export
window.EnhancedAIService = EnhancedAIService; 
