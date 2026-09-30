# Student Scholarship Monitoring and Academic Compliance System

A web-based system for monitoring student scholarship compliance, built as part of the SAD Laboratory Exercise.

## 🎯 Project Overview

**Course:** Systems Analysis and Design (SAD)  
**Lab:** Scholarship Monitoring Analysis and Development  
**Duration:** 2.5 Hours  
**Stack:** HTML/CSS/JavaScript + Supabase + GitHub Pages

## 📋 Features Implemented

### Core Modules (Per Lab Requirements)
1. **Authentication** - Login/Logout with role-based access (Admin, Staff, Scholar)
2. **Scholar Management** - Create, Read, Update scholar records
3. **Scholarship Programs** - Configure requirements (GWA, Units, Failing Policy)
4. **Grade Submissions** - Semester grade submission with validation
5. **Verification** - Staff verification of pending submissions
6. **Compliance Evaluation** - Automatic evaluation against program requirements
7. **Dashboard** - Live monitoring with stats and recent submissions
8. **Search & Filter** - By Student ID, Name, Program, Status

### Compliance Logic
- **GWA Check**: Submission GWA ≤ Program Required GWA
- **Units Check**: Units Enrolled ≥ Program Minimum Units
- **Failing Grades**: Program allows failing OR zero failed subjects
- **Incomplete Subjects**: Zero incomplete subjects required
- **Result**: All checks pass → "Compliant", otherwise → "With Deficiency"

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6 Modules) |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting | GitHub Pages |
| Version Control | Git/GitHub |

## 📁 Project Structure

```
scholarship-system/
├── index.html              # Main entry point
├── css/
│   └── main.css           # All styles
├── js/
│   ├── app.js             # Main app initialization
│   ├── supabase.js        # Supabase config & helpers
│   ├── auth.js            # Authentication module
│   └── pages/             # Page modules
│       ├── dashboard.js
│       ├── scholars.js
│       ├── programs.js
│       ├── submissions.js
│       └── compliance.js
├── sql/
│   └── schema.sql         # Database schema
└── docs/
    ├── readme.md
    ├── use-case-descriptions.md
    ├── requirements-traceability.md
    ├── functional-test-results.md
    ├── business-rules.md
    ├── functional-requirements.md
    └── non-functional-requirements.md
```

## 🚀 Quick Start

### Prerequisites
- Supabase account (free tier)
- GitHub account

### 1. Database Setup
1. Create new Supabase project
2. Go to SQL Editor
3. Run `sql/schema.sql`
4. Note your Project URL and Anon Key

### 2. Configure Application
Edit `js/supabase.js`:
```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Create Demo Users
In Supabase Auth → Users, create:
- `admin@test.com` / `admin123` (Admin)
- `staff@test.com` / `staff123` (Staff)
- `scholar@test.com` / `scholar123` (Scholar)

Then in SQL Editor, add profiles:
```sql
INSERT INTO profiles (id, full_name, role) VALUES
  ('admin-user-id', 'Admin User', 'admin'),
  ('staff-user-id', 'Staff User', 'staff'),
  ('scholar-user-id', 'Scholar User', 'scholar');
```

### 4. Deploy to GitHub Pages
1. Push to GitHub repository
2. Settings → Pages → Deploy from branch (main)
3. Access at `https://username.github.io/repo-name`

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access: Programs, Scholars, Submissions, Compliance |
| **Staff** | Scholars, Submissions, Verification, Compliance |
| **Scholar** | View own submissions and compliance status only |

## 📊 Database Schema

### Tables
- **profiles** - Extends Supabase auth.users with role
- **scholarship_programs** - Program requirements (GWA, units, failing policy)
- **scholars** - Student records linked to programs
- **grade_submissions** - Semester grades with verification & compliance

### Key Relationships
```
profiles (1) ───< (M) scholars
scholarship_programs (1) ───< (M) scholars
scholars (1) ───< (M) grade_submissions
profiles (1) ───< (M) grade_submissions (verified_by)
```

## 🔐 Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based policies** for data access
- **JWT Authentication** via Supabase Auth
- **HTTPS Only** (GitHub Pages + Supabase)
- **Input Validation** client and server-side

## 📈 Compliance Evaluation

The system evaluates compliance using program-specific rules:

```javascript
function evaluateSubmissionAgainstRequirements(submission, program) {
    const gwaPass = submission.gwa <= program.required_gwa;
    const unitsPass = submission.units_enrolled >= program.min_units;
    const failingPass = program.allow_failing_grade || submission.failed_subjects === 0;
    const incompletePass = submission.incomplete_subjects === 0;
    
    return (gwaPass && unitsPass && failingPass && incompletePass) 
        ? 'Compliant' 
        : 'With Deficiency';
}
```

**Note:** Uses Philippine GWA system where 1.00 = highest, 5.00 = failing.

## 🧪 Testing

Run functional tests per `docs/functional-test-results.md`:
- TC-01 to TC-10 (Required)
- TC-11 to TC-20 (Additional validation)

## 📚 Documentation

All lab documentation in `docs/`:
- Use Case Descriptions (4 major + summary)
- Requirements Traceability Matrix
- Functional Test Results Template
- Business Rules (20 rules)
- Functional Requirements (15 FRs)
- Non-Functional Requirements (10 NFRs)

## 🎓 Lab Submission Checklist

Per Section XVIII:
- [ ] GitHub Repository URL
- [ ] Live Deployed System URL (GitHub Pages)
- [ ] Use Case Diagram (from Part I)
- [ ] Final Functional Requirements
- [ ] Database/ERD Screenshot
- [ ] ≥4 Meaningful Git Commits
- [ ] Functional Test Results
- [ ] Requirements-to-Implementation Table
- [ ] 2-4 Screenshots of Core Workflow

## 📝 Git Commit History (Examples)

```bash
git commit -m "Initialize scholarship monitoring system"
git commit -m "Create scholar and scholarship database modules"
git commit -m "Implement grade submission and verification"
git commit -m "Add compliance evaluation dashboard and deployment"
```

## 👨‍🏫 Instructor Demo Scenarios

1. Register new scholar → Assign scholarship program
2. Create semester grade submission → Show "Pending"
3. Verify submission → Show "Verified"
4. Evaluate compliance → Show "Compliant"
5. Modify data (lower GWA) → Re-evaluate → Show "With Deficiency"
6. Search scholar by ID/Name
7. Explain FR → Feature mapping
8. Explain BR → Compliance decision

## 📄 License

Educational use only - Systems Analysis and Design Laboratory Exercise