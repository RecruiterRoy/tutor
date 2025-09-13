// API Module for School Management System
// This module handles all database operations and API calls

class SchoolManagementAPI {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userRole = null;
        this.schoolId = null;
    }

    // Initialize Supabase client
    async initialize() {
        if (this.supabase) return true;
        
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            
            if (config.error) {
                console.error('Failed to load Supabase config:', config.error);
                return false;
            }
            
            this.supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            return true;
        } catch (error) {
            console.error('Error loading Supabase config:', error);
            return false;
        }
    }

    // Helper method to ensure Supabase is initialized
    async ensureInitialized() {
        if (!this.supabase) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize Supabase client');
            }
        }
    }

    // Authentication Methods
    async signUp(email, password, userData, role) {
        await this.ensureInitialized();
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                        ...userData
                    }
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        await this.ensureInitialized();
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Set current user and role
            this.currentUser = data.user;
            this.userRole = data.user.user_metadata.role;
            
            // Get school ID for school admins and teachers
            if (this.userRole === 'school_admin' || this.userRole === 'teacher') {
                await this.getSchoolId();
            }

            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        await this.ensureInitialized();
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            this.userRole = null;
            this.schoolId = null;
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        await this.ensureInitialized();
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            
            this.currentUser = user;
            if (user) {
                this.userRole = user.user_metadata.role;
                if (this.userRole === 'school_admin' || this.userRole === 'teacher') {
                    await this.getSchoolId();
                }
            }
            
            return { success: true, user };
        } catch (error) {
            console.error('Get current user error:', error);
            return { success: false, error: error.message };
        }
    }

    // School Management Methods
    async createSchool(schoolData) {
        await this.ensureInitialized();
        try {
            const { data, error } = await this.supabase
                .from('schools')
                .insert([schoolData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create school error:', error);
            return { success: false, error: error.message };
        }
    }

    async getSchool(schoolId) {
        try {
            const { data, error } = await this.supabase
                .from('schools')
                .select('*')
                .eq('id', schoolId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get school error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateSchool(schoolId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('schools')
                .update(updates)
                .eq('id', schoolId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update school error:', error);
            return { success: false, error: error.message };
        }
    }

    // Teacher Management Methods
    async createTeacher(teacherData) {
        try {
            const { data, error } = await this.supabase
                .from('teachers')
                .insert([teacherData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create teacher error:', error);
            return { success: false, error: error.message };
        }
    }

    async getTeachers(schoolId) {
        try {
            const { data, error } = await this.supabase
                .from('teachers')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get teachers error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateTeacherStatus(teacherId, status) {
        try {
            const { data, error } = await this.supabase
                .from('teachers')
                .update({ status })
                .eq('id', teacherId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update teacher status error:', error);
            return { success: false, error: error.message };
        }
    }

    async getTeacherById(teacherId) {
        try {
            const { data, error } = await this.supabase
                .from('teachers')
                .select('*')
                .eq('id', teacherId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get teacher error:', error);
            return { success: false, error: error.message };
        }
    }

    // Student Management Methods
    async createStudent(studentData) {
        try {
            const { data, error } = await this.supabase
                .from('students')
                .insert([studentData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create student error:', error);
            return { success: false, error: error.message };
        }
    }

    async getStudents(schoolId, filters = {}) {
        try {
            let query = this.supabase
                .from('students')
                .select('*')
                .eq('school_id', schoolId);

            if (filters.class) {
                query = query.eq('class', filters.class);
            }
            if (filters.section) {
                query = query.eq('section', filters.section);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get students error:', error);
            return { success: false, error: error.message };
        }
    }

    async getStudentById(studentId) {
        try {
            const { data, error } = await this.supabase
                .from('students')
                .select('*')
                .eq('id', studentId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get student error:', error);
            return { success: false, error: error.message };
        }
    }

    // Homework Methods
    async createHomework(homeworkData) {
        try {
            const { data, error } = await this.supabase
                .from('homework')
                .insert([homeworkData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create homework error:', error);
            return { success: false, error: error.message };
        }
    }

    async getHomeworkForClass(classId) {
        try {
            const { data, error } = await this.supabase
                .from('homework')
                .select(`
                    *,
                    subjects(name),
                    teachers(full_name)
                `)
                .eq('class_id', classId)
                .eq('status', 'active')
                .order('due_date', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get homework error:', error);
            return { success: false, error: error.message };
        }
    }

    async getHomeworkForStudent(studentId) {
        try {
            // Get student's class first
            const studentResult = await this.getStudentById(studentId);
            if (!studentResult.success) throw new Error('Student not found');

            const student = studentResult.data;
            
            // Get class ID
            const classResult = await this.getClassesBySchoolAndClass(
                student.school_id, 
                student.class, 
                student.section
            );
            
            if (!classResult.success || classResult.data.length === 0) {
                throw new Error('Class not found');
            }

            const classId = classResult.data[0].id;
            
            // Get homework for the class
            return await this.getHomeworkForClass(classId);
        } catch (error) {
            console.error('Get homework for student error:', error);
            return { success: false, error: error.message };
        }
    }

    async submitHomework(homeworkId, studentId, submissionData) {
        try {
            const { data, error } = await this.supabase
                .from('homework_submissions')
                .insert([{
                    homework_id: homeworkId,
                    student_id: studentId,
                    ...submissionData
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Submit homework error:', error);
            return { success: false, error: error.message };
        }
    }

    async getHomeworkSubmissions(homeworkId) {
        try {
            const { data, error } = await this.supabase
                .from('homework_submissions')
                .select(`
                    *,
                    students(full_name, roll_number),
                    homework(title)
                `)
                .eq('homework_id', homeworkId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get homework submissions error:', error);
            return { success: false, error: error.message };
        }
    }

    // Exam Methods
    async createExam(examData) {
        try {
            const { data, error } = await this.supabase
                .from('exams')
                .insert([examData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create exam error:', error);
            return { success: false, error: error.message };
        }
    }

    async getExamsForClass(classId) {
        try {
            const { data, error } = await this.supabase
                .from('exams')
                .select(`
                    *,
                    subjects(name),
                    teachers(full_name)
                `)
                .eq('class_id', classId)
                .order('exam_date', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get exams error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUpcomingExams(schoolId, limit = 5) {
        try {
            const { data, error } = await this.supabase
                .from('exams')
                .select(`
                    *,
                    subjects(name),
                    classes(class_number, section),
                    teachers(full_name)
                `)
                .gte('exam_date', new Date().toISOString().split('T')[0])
                .order('exam_date', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get upcoming exams error:', error);
            return { success: false, error: error.message };
        }
    }

    async getExamResults(studentId) {
        try {
            const { data, error } = await this.supabase
                .from('exam_results')
                .select(`
                    *,
                    exams(title, exam_date, total_marks, subjects(name))
                `)
                .eq('student_id', studentId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get exam results error:', error);
            return { success: false, error: error.message };
        }
    }

    // Attendance Methods
    async markAttendance(attendanceData) {
        try {
            const { data, error } = await this.supabase
                .from('attendance')
                .upsert([attendanceData], { 
                    onConflict: 'student_id,class_id,date' 
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Mark attendance error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAttendanceForClass(classId, date) {
        try {
            const { data, error } = await this.supabase
                .from('attendance')
                .select(`
                    *,
                    students(full_name, roll_number)
                `)
                .eq('class_id', classId)
                .eq('date', date);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get attendance error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAbsentStudents(schoolId, date) {
        try {
            const { data, error } = await this.supabase
                .from('attendance')
                .select(`
                    *,
                    students(full_name, roll_number, parent_phone, parent_email),
                    classes(class_number, section)
                `)
                .eq('date', date)
                .eq('status', 'absent');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get absent students error:', error);
            return { success: false, error: error.message };
        }
    }

    // Class Methods
    async getClassesBySchool(schoolId) {
        try {
            const { data, error } = await this.supabase
                .from('classes')
                .select(`
                    *,
                    teachers(full_name)
                `)
                .eq('school_id', schoolId)
                .order('class_number', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get classes error:', error);
            return { success: false, error: error.message };
        }
    }

    async getClassesBySchoolAndClass(schoolId, classNumber, section) {
        try {
            const { data, error } = await this.supabase
                .from('classes')
                .select('*')
                .eq('school_id', schoolId)
                .eq('class_number', classNumber)
                .eq('section', section);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get classes by school and class error:', error);
            return { success: false, error: error.message };
        }
    }

    // Subject Methods
    async getSubjects() {
        try {
            const { data, error } = await this.supabase
                .from('subjects')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get subjects error:', error);
            return { success: false, error: error.message };
        }
    }

    // Lesson Plan Methods
    async createLessonPlan(lessonPlanData) {
        try {
            const { data, error } = await this.supabase
                .from('lesson_plans')
                .insert([lessonPlanData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Create lesson plan error:', error);
            return { success: false, error: error.message };
        }
    }

    async getLessonPlans(teacherId) {
        try {
            const { data, error } = await this.supabase
                .from('lesson_plans')
                .select(`
                    *,
                    subjects(name),
                    classes(class_number, section)
                `)
                .eq('teacher_id', teacherId)
                .order('date', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get lesson plans error:', error);
            return { success: false, error: error.message };
        }
    }

    // Dashboard Statistics
    async getDashboardStats(schoolId) {
        try {
            const [teachersResult, studentsResult, classesResult] = await Promise.all([
                this.supabase.from('teachers').select('id', { count: 'exact' }).eq('school_id', schoolId),
                this.supabase.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId),
                this.supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', schoolId)
            ]);

            return {
                success: true,
                data: {
                    totalTeachers: teachersResult.count || 0,
                    totalStudents: studentsResult.count || 0,
                    totalClasses: classesResult.count || 0
                }
            };
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper Methods
    async getSchoolId() {
        if (this.userRole === 'school_admin') {
            // For school admin, get their school ID
            const { data, error } = await this.supabase
                .from('schools')
                .select('id')
                .eq('principal_email', this.currentUser.email)
                .single();

            if (!error && data) {
                this.schoolId = data.id;
            }
        } else if (this.userRole === 'teacher') {
            // For teacher, get their school ID
            const { data, error } = await this.supabase
                .from('teachers')
                .select('school_id')
                .eq('email', this.currentUser.email)
                .single();

            if (!error && data) {
                this.schoolId = data.school_id;
            }
        }
    }

    // File Upload Methods (for homework attachments)
    async uploadFile(file, path) {
        try {
            const { data, error } = await this.supabase.storage
                .from('homework-attachments')
                .upload(path, file);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('homework-attachments')
                .getPublicUrl(path);

            return { success: true, data: urlData.publicUrl };
        } catch (error) {
            console.error('Upload file error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.schoolAPI = new SchoolManagementAPI();
