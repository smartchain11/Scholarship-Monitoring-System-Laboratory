-- Scholarship Monitoring System Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'scholar')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: scholarship_programs
-- ============================================
CREATE TABLE scholarship_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name TEXT NOT NULL UNIQUE,
    required_gwa NUMERIC(3,2) NOT NULL CHECK (required_gwa >= 1.00 AND required_gwa <= 5.00),
    min_units INTEGER NOT NULL CHECK (min_units > 0),
    allow_failing_grade BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: scholars
-- ============================================
CREATE TABLE scholars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    degree_program TEXT NOT NULL,
    year_level INTEGER NOT NULL CHECK (year_level >= 1 AND year_level <= 10),
    scholarship_id UUID NOT NULL REFERENCES scholarship_programs(id),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN (
        'Active', 'Pending Submission', 'For Verification', 
        'Compliant', 'With Deficiency', 'Probationary', 
        'For Renewal', 'Renewed', 'Disqualified'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: grade_submissions
-- ============================================
CREATE TABLE grade_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scholar_id UUID NOT NULL REFERENCES scholars(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL, -- e.g., '2024-2025'
    semester TEXT NOT NULL CHECK (semester IN ('1st', '2nd', 'Summer')),
    gwa NUMERIC(3,2) NOT NULL CHECK (gwa >= 1.00 AND gwa <= 5.00),
    units_enrolled INTEGER NOT NULL CHECK (units_enrolled >= 0),
    failed_subjects INTEGER NOT NULL DEFAULT 0 CHECK (failed_subjects >= 0),
    incomplete_subjects INTEGER NOT NULL DEFAULT 0 CHECK (incomplete_subjects >= 0),
    submission_status TEXT NOT NULL DEFAULT 'Pending' CHECK (submission_status IN ('Pending', 'Verified', 'Returned')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    compliance_result TEXT CHECK (compliance_result IN ('Compliant', 'With Deficiency')),
    evaluated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scholar_id, academic_year, semester)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_scholars_student_id ON scholars(student_id);
CREATE INDEX idx_scholars_scholarship_id ON scholars(scholarship_id);
CREATE INDEX idx_scholars_status ON scholars(status);
CREATE INDEX idx_grade_submissions_scholar_id ON grade_submissions(scholar_id);
CREATE INDEX idx_grade_submissions_status ON grade_submissions(submission_status);
CREATE INDEX idx_grade_submissions_academic_year_semester ON grade_submissions(academic_year, semester);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view profiles (fixes infinite recursion)
CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Scholarship Programs: Everyone can read active programs, only admins can modify
CREATE POLICY "Anyone can view active scholarship programs" ON scholarship_programs
    FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage scholarship programs" ON scholarship_programs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Scholars: Staff/admins can manage, scholars can view their own
CREATE POLICY "Staff and admins can manage scholars" ON scholars
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Scholars can view own record" ON scholars
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'scholar'
        )
    );

-- Grade Submissions: Staff/admins can manage, scholars can view own
CREATE POLICY "Staff and admins can manage grade submissions" ON grade_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Scholars can view own submissions" ON grade_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            JOIN scholars s ON s.id = grade_submissions.scholar_id
            WHERE p.id = auth.uid() AND p.role = 'scholar'
        )
    );

CREATE POLICY "Scholars can insert submissions" ON grade_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'scholar'
        )
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarship_programs_updated_at BEFORE UPDATE ON scholarship_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholars_updated_at BEFORE UPDATE ON scholars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_submissions_updated_at BEFORE UPDATE ON grade_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
INSERT INTO scholarship_programs (program_name, required_gwa, min_units, allow_failing_grade, active) VALUES
    ('University Merit Scholarship', 1.75, 18, FALSE, TRUE),
    ('Government Scholarship Program', 2.00, 15, FALSE, TRUE),
    ('Private Foundation Grant', 2.25, 12, TRUE, TRUE),
    ('Athletic Scholarship', 2.50, 15, TRUE, TRUE),
    ('Academic Excellence Award', 1.50, 21, FALSE, TRUE);