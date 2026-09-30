# Functional Requirements

Per Part I, Section D - At least 15 functional requirements

---

## Required Starting Points (FR-01 to FR-10)

| ID | Requirement | Status | Implemented In |
|----|-------------|--------|----------------|
| FR-01 | The system shall allow authorized staff to register scholar records. | ✅ | `pages/scholars.js` - Scholar Management Module |
| FR-02 | The system shall associate a scholar with a scholarship program. | ✅ | `pages/scholars.js` - scholarship_id required field |
| FR-03 | The system shall maintain academic requirements for each scholarship program. | ✅ | `pages/programs.js` - Scholarship Programs Module |
| FR-04 | The system shall allow semester grade submission. | ✅ | `pages/submissions.js` - Grade Submission Form |
| FR-05 | The system shall record the academic year and semester of every submission. | ✅ | `pages/submissions.js` - academic_year, semester fields |
| FR-06 | The system shall allow authorized staff to verify a grade submission. | ✅ | `pages/submissions.js` - Verification Function |
| FR-07 | The system shall evaluate verified academic information against scholarship requirements. | ✅ | `pages/submissions.js` - Compliance Evaluation Logic |
| FR-08 | The system shall identify deficiencies. | ✅ | `pages/compliance.js` - Compliance Details showing failed checks |
| FR-09 | The system shall maintain scholar status. | ✅ | `pages/scholars.js` + auto-update on compliance |
| FR-10 | The system shall identify pending grade submissions. | ✅ | `pages/dashboard.js` - Dashboard stats + filter |

---

## Additional Requirements (FR-11 to FR-15)

| ID | Requirement | Status | Implemented In |
|----|-------------|--------|----------------|
| FR-11 | The system shall allow scholarship renewal processing for eligible scholars. | 🟡 Partial | `pages/compliance.js` - Status update workflow |
| FR-12 | The system shall track compliance history per scholar across semesters. | ✅ | `pages/compliance.js` - All submissions with results |
| FR-13 | The system shall generate compliance summary reports. | 🟡 Partial | `pages/dashboard.js` - Stats cards + filtered views |
| FR-14 | The system shall enforce role-based access control (Admin, Staff, Scholar). | ✅ | `auth.js` + Supabase RLS + UI role checks |
| FR-15 | The system shall provide search and filter capabilities for scholars and submissions. | ✅ | All pages - Search by ID/Name, Filter by Program/Status |

---

## Detailed Requirement Specifications

### FR-01: Register Scholar Records
- **Actors:** Staff, Admin
- **Inputs:** Student ID, Full Name, Degree Program, Year Level, Scholarship Program, Status
- **Validations:** Student ID unique, not blank; Scholarship required; Year 1-10
- **Outputs:** Scholar record created, audit timestamp
- **Business Rules:** BR-01

### FR-02: Associate Scholar with Scholarship Program
- **Actors:** Staff, Admin
- **Mechanism:** Dropdown selection of active programs during scholar create/edit
- **Validations:** Program must be active
- **Business Rules:** BR-01

### FR-03: Maintain Scholarship Program Requirements
- **Actors:** Admin
- **Attributes:** Program Name, Required GWA (1.00-5.00), Min Units (>0), Allow Failing (Y/N), Active Status
- **Validations:** Name unique; GWA in range; Units positive
- **Business Rules:** BR-02

### FR-04: Semester Grade Submission
- **Actors:** Scholar, Staff
- **Inputs:** Scholar, Academic Year, Semester, GWA, Units Enrolled, Failed Subjects, Incomplete Subjects
- **Validations:** All required; GWA 1.00-5.00; Units ≥0; Failed/Incomplete ≥0; Unique per scholar/year/semester
- **Outputs:** Submission record with status "Pending"
- **Business Rules:** BR-03, BR-11, BR-12, BR-13, BR-14, BR-15

### FR-05: Record Academic Year and Semester
- **Mechanism:** Required fields on submission form
- **Values:** Academic Year (free text, e.g., "2024-2025"), Semester (1st, 2nd, Summer)
- **Business Rules:** BR-03, BR-11, BR-12

### FR-06: Verify Grade Submission
- **Actors:** Staff, Admin
- **Precondition:** Submission status = "Pending"
- **Actions:** Review details → Mark Verified OR Return for Correction
- **Outputs:** Status updated, verified_by, verified_at populated
- **Business Rules:** BR-04, BR-05, BR-09

### FR-07: Evaluate Academic Compliance
- **Actors:** System (auto), Coordinator (manual trigger)
- **Precondition:** Submission status = "Verified"
- **Logic:** Compare submission against scholar's program requirements
- **Checks:** GWA ≤ Required, Units ≥ Min, Failing per policy, Incomplete = 0
- **Outputs:** Compliance Result (Compliant/With Deficiency), evaluated_at
- **Business Rules:** BR-02, BR-05, BR-06, BR-07

### FR-08: Identify Deficiencies
- **Mechanism:** Per-check evaluation results displayed
- **Output:** Which specific requirements failed (GWA, Units, Failing, Incomplete)
- **Business Rules:** BR-06

### FR-09: Maintain Scholar Status
- **States:** Active, Pending Submission, For Verification, Compliant, With Deficiency, Probationary, For Renewal, Renewed, Disqualified
- **Transitions:** Auto on submission/verification/evaluation; Manual override by staff
- **Business Rules:** BR-07, BR-16

### FR-10: Identify Pending Submissions
- **Mechanism:** Dashboard stat card + Submissions filter
- **Real-time:** Counts update on page load
- **Business Rules:** -

### FR-11: Scholarship Renewal Processing
- **Actors:** Coordinator, Committee
- **Scope:** Scholars nearing end of scholarship period
- **Actions:** Review history → Renew / Probationary / Disqualify
- **Status Updates:** Renewed, Probationary, Disqualified
- **Business Rules:** BR-08

### FR-12: Track Compliance History
- **Mechanism:** All submissions retained with compliance results
- **View:** Compliance page shows all terms with results
- **Business Rules:** BR-08

### FR-13: Generate Compliance Reports
- **Current:** Dashboard summary stats, filtered lists
- **Future:** Export to PDF/CSV, scheduled reports
- **Business Rules:** -

### FR-14: Role-Based Access Control
- **Roles:** Admin (full access), Staff (scholars, submissions, compliance), Scholar (own records only)
- **Enforcement:** Supabase Auth + RLS policies + UI conditional rendering
- **Business Rules:** BR-10

### FR-15: Search and Filter
- **Search:** Student ID, Full Name (partial match, case-insensitive)
- **Filters:** Scholarship Program, Scholar Status, Submission Status, Compliance Result
- **Combination:** Search + filters work together
- **Business Rules:** -

---

## Requirement Priorities for 2.5-Hour Lab

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| **Must Have** | FR-01 to FR-10 | Core workflow: Register → Submit → Verify → Evaluate → Monitor |
| **Should Have** | FR-14, FR-15 | Security and usability |
| **Nice to Have** | FR-11, FR-12, FR-13 | Advanced features for future iterations |

---

## Acceptance Criteria Summary

| FR | Acceptance Criteria |
|----|---------------------|
| FR-01 | Staff can create scholar with all required fields; validation prevents duplicates |
| FR-02 | Scholar form requires active scholarship program selection |
| FR-03 | Admin can CRUD programs with GWA, units, failing policy |
| FR-04 | Grade submission form saves as Pending with all fields |
| FR-05 | Academic year and semester recorded on every submission |
| FR-06 | Staff can verify pending submissions; verifier and timestamp recorded |
| FR-07 | Verified submissions evaluated against program rules automatically |
| FR-08 | Failed requirements shown individually (GWA, Units, Failing, Incomplete) |
| FR-09 | Scholar status updates automatically: Active→Pending→Verified→Compliant/Deficiency |
| FR-10 | Dashboard shows live count of pending submissions |
| FR-14 | Scholar login only sees own data; Staff sees all; Admin manages programs |
| FR-15 | Search and filter work on Scholars, Submissions, Compliance pages |