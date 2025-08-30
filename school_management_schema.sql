-- School Management System Database Schema
-- Updated for proper school isolation and mobile number uniqueness

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table (main school registry)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    principal_name VARCHAR(255),
    established_year INTEGER,
    school_type VARCHAR(50), -- primary, secondary, higher_secondary, etc.
    board VARCHAR(100), -- CBSE, ICSE, State Board, etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School admins table (separate from schools for better security)
CREATE TABLE IF NOT EXISTS school_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table (school-specific)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    qualification VARCHAR(255),
    experience_years INTEGER,
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    is_class_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, email),
    UNIQUE(school_id, phone)
);

-- Classes table (school-specific)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL, -- e.g., "Class 10", "Grade 5"
    section VARCHAR(10), -- e.g., "A", "B", "C"
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-25"
    class_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    total_students INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, class_name, section, academic_year)
);

-- Students table (school-specific)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    address TEXT,
    admission_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, class_id, roll_number),
    UNIQUE(school_id, phone)
);

-- Subjects table (school-specific)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, name)
);

-- Class subjects mapping (which subjects are taught in which class)
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, subject_id)
);

-- Homework table (school-specific)
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homework submissions table
CREATE TABLE IF NOT EXISTS homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachment_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    grade VARCHAR(10),
    feedback TEXT
);

-- Attendance table (school-specific)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day')),
    marked_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id, date)
);

-- Exams table (school-specific)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    exam_name VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50), -- unit_test, mid_term, final, etc.
    exam_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_marks INTEGER,
    syllabus TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'conducted', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam results table
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2),
    total_marks DECIMAL(5,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Fees table (school-specific)
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    fee_type VARCHAR(100) NOT NULL, -- tuition_fee, library_fee, sports_fee, etc.
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    academic_year VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_id UUID REFERENCES fees(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50), -- cash, online, cheque, etc.
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (school-specific)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- sms, email, whatsapp, in_app
    target_audience VARCHAR(50), -- all, teachers, students, parents
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Holidays and events table (school-specific)
CREATE TABLE IF NOT EXISTS holidays_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    event_type VARCHAR(50), -- holiday, exam, function, sports_day, etc.
    is_holiday BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays_events ENABLE ROW LEVEL SECURITY;

-- School admins can access all data for their school
CREATE POLICY "School admins can access their school data" ON schools
    FOR ALL USING (id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can manage teachers" ON teachers
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can manage students" ON students
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can manage classes" ON classes
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can manage homework" ON homework
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can view homework submissions" ON homework_submissions
    FOR SELECT USING (homework_id IN (
        SELECT id FROM homework WHERE school_id IN (
            SELECT school_id FROM school_admins 
            WHERE auth.uid()::text = id::text
        )
    ));

CREATE POLICY "School admins can manage attendance" ON attendance
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can manage exams" ON exams
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can view exam results" ON exam_results
    FOR SELECT USING (exam_id IN (
        SELECT id FROM exams WHERE school_id IN (
            SELECT school_id FROM school_admins 
            WHERE auth.uid()::text = id::text
        )
    ));

CREATE POLICY "School admins can manage fees" ON fees
    FOR ALL USING (school_id IN (
        SELECT school_id FROM school_admins 
        WHERE auth.uid()::text = id::text
    ));

CREATE POLICY "School admins can view fee payments" ON fee_payments
    FOR SELECT USING (fee_id IN (
        SELECT id FROM fees WHERE school_id IN (
            SELECT school_id FROM school_admins 
            WHERE auth.uid()::text = id::text
        )
    ));

-- Teachers can access their school's data
CREATE POLICY "Teachers can access their school data" ON teachers
    FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Teachers can access their classes" ON classes
    FOR SELECT USING (school_id IN (
        SELECT school_id FROM teachers 
        WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Teachers can access their students" ON students
    FOR SELECT USING (school_id IN (
        SELECT school_id FROM teachers 
        WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Teachers can manage homework" ON homework
    FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view homework submissions" ON homework_submissions
    FOR SELECT USING (homework_id IN (
        SELECT id FROM homework WHERE teacher_id::text = auth.uid()::text
    ));

CREATE POLICY "Teachers can manage attendance" ON attendance
    FOR ALL USING (school_id IN (
        SELECT school_id FROM teachers 
        WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Teachers can manage exams" ON exams
    FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can manage exam results" ON exam_results
    FOR ALL USING (exam_id IN (
        SELECT id FROM exams WHERE teacher_id::text = auth.uid()::text
    ));

-- Students can access their own data
CREATE POLICY "Students can access their own data" ON students
    FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Students can view their homework" ON homework
    FOR SELECT USING (class_id IN (
        SELECT class_id FROM students 
        WHERE id::text = auth.uid()::text
    ));

CREATE POLICY "Students can submit homework" ON homework_submissions
    FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

CREATE POLICY "Students can view their submissions" ON homework_submissions
    FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE POLICY "Students can view their attendance" ON attendance
    FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE POLICY "Students can view their exam results" ON exam_results
    FOR SELECT USING (student_id::text = auth.uid()::text);

-- Indexes for better performance
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_homework_school_id ON homework(school_id);
CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_attendance_school_id ON attendance(school_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_exams_school_id ON exams(school_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX idx_fees_school_id ON fees(school_id);
CREATE INDEX idx_fee_payments_student_id ON fee_payments(student_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update student count in classes
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE classes SET total_students = total_students + 1 WHERE id = NEW.class_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE classes SET total_students = total_students - 1 WHERE id = OLD.class_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.class_id != OLD.class_id THEN
            UPDATE classes SET total_students = total_students - 1 WHERE id = OLD.class_id;
            UPDATE classes SET total_students = total_students + 1 WHERE id = NEW.class_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_class_student_count_trigger
    AFTER INSERT OR DELETE OR UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_class_student_count();
