# Requirements Traceability Matrix

Per Part I, Section J and Part II, Section XVII - Requirements-to-Implementation Check

---

## Complete Traceability Table

| Requirement | Actor | Use Case | Business Rule | Implemented Feature | Test Result |
|-------------|-------|----------|---------------|---------------------|-------------|
| FR-01: The system shall allow authorized staff to register scholar records. | Staff/Admin | UC-06: Register Scholar | BR-01 | Scholar Management Module (Create/Read/Update) - `pages/scholars.js` | |
| FR-02: The system shall associate a scholar with a scholarship program. | Staff/Admin | UC-07: Assign Scholarship | BR-01 | Scholar Form - scholarship_id dropdown (required field) | |
| FR-03: The system shall maintain academic requirements for each scholarship program. | Admin | UC-08: Configure Scholarship Requirements | BR-02 | Scholarship Programs Module - required_gwa, min_units, allow_failing_grade | |
| FR-04: The system shall allow semester grade submission. | Scholar/Staff | UC-01: Submit Grades | BR-03 | Grade Submission Form - `pages/submissions.js` | |
| FR-05: The system shall record the academic year and semester of every submission. | Scholar/Staff | UC-01: Submit Grades | BR-03 | Submission Form - academic_year, semester fields | |
| FR-06: The system shall allow authorized staff to verify a grade submission. | Staff/Admin | UC-02: Verify Grade Submission | BR-04, BR-05 | Verification Function - Verify/Return buttons, verified_by, verified_at | |
| FR-07: The system shall evaluate verified academic information against scholarship requirements. | System/Coordinator | UC-03: Evaluate Academic Compliance | BR-02, BR-07 | Compliance Evaluation Logic - `evaluateCompliance()` in `submissions.js` | |
| FR-08: The system shall identify deficiencies. | System | UC-03: Evaluate Academic Compliance | BR-06 | Compliance checks return specific failed requirements | |
| FR-09: The system shall maintain scholar status. | System/Staff | UC-11: Update Scholar Status | BR-07 | Scholar status field updated on compliance evaluation | |
| FR-10: The system shall identify pending grade submissions. | Staff/Admin | UC-15: View Dashboard | - | Dashboard stat card + Submissions filter by status | |
| FR-11: The system shall allow scholarship renewal processing. | Coordinator | UC-04: Process Scholarship Renewal | BR-08 | Renewal workflow (UI placeholder in compliance page) | |
| FR-12: The system shall track compliance history per scholar. | Staff/Coordinator | UC-10: View Deficiency | BR-08 | Grade submissions history with compliance results | |
| FR-13: The system shall generate compliance reports. | Coordinator | UC-14: Generate Compliance Report | - | Dashboard stats + filtered views (export placeholder) | |
| FR-14: The system shall enforce role-based access control. | All | UC-05: Login | BR-10 | Supabase Auth + RLS policies + UI role checks | |
| FR-15: The system shall provide search and filter capabilities. | Staff/Admin | UC-12, UC-13: Search/Filter | - | Search by Student ID/Name, Filter by Program/Status | |

---

## Use Case to Implementation Mapping

| Use Case | Implemented In | Key Functions |
|----------|----------------|---------------|
| UC-01: Submit Grades | `pages/submissions.js` | `openSubmissionModal()`, `saveSubmission()` |
| UC-02: Verify Grade Submission | `pages/submissions.js` | `verifySubmission()`, `performVerification()` |
| UC-03: Evaluate Academic Compliance | `pages/submissions.js`, `pages/compliance.js` | `evaluateCompliance()`, `evaluateSubmissionAgainstRequirements()` |
| UC-04: Process Scholarship Renewal | `pages/compliance.js` | UI placeholder - status update workflow |
| UC-05: Login | `auth.js` | `initAuth()`, `login()` |
| UC-06: Register Scholar | `pages/scholars.js` | `openScholarModal()`, `saveScholar()` |
| UC-07: Assign Scholarship | `pages/scholars.js` | Scholar form scholarship_id field |
| UC-08: Configure Scholarship Requirements | `pages/programs.js` | `openProgramModal()`, `saveProgram()` |
| UC-09: View Requirements | `pages/programs.js` | Programs table display |
| UC-10: View Deficiency | `pages/compliance.js` | Compliance cards show failed checks |
| UC-11: Update Scholar Status | `pages/scholars.js`, `pages/submissions.js` | Status field + auto-update on compliance |
| UC-12: Search Scholar | `pages/scholars.js`, `pages/compliance.js` | `filterScholars()`, `filterCompliance()` |
| UC-13: Filter Scholars | `pages/scholars.js`, `pages/submissions.js`, `pages/compliance.js` | Status/Program filter dropdowns |
| UC-14: Generate Compliance Report | `pages/dashboard.js`, `pages/compliance.js` | Stats cards + filtered data views |
| UC-15: View Dashboard | `pages/dashboard.js` | `loadDashboard()` with live counts |
| UC-16: Logout | `auth.js` | `logout()` |

---

## Business Rule Implementation

| Business Rule | Implementation |
|---------------|----------------|
| BR-01: Every scholar must be assigned to an active scholarship program. | Schema: `scholars.scholarship_id` NOT NULL FK to `scholarship_programs`; UI: required dropdown |
| BR-02: Every scholarship program must define its academic requirements. | Schema: `required_gwa`, `min_units`, `allow_failing_grade` NOT NULL; UI: required fields |
| BR-03: A grade submission must belong to one scholar, academic year, and semester. | Schema: UNIQUE constraint on (scholar_id, academic_year, semester) |
| BR-04: Only authorized personnel may verify submitted grades. | RLS: `grade_submissions` UPDATE policy requires staff/admin role; UI: verify buttons only for staff |
| BR-05: Only verified submissions may be used for final compliance evaluation. | Code: `evaluateCompliance()` only callable on verified submissions; UI: evaluate button only for verified |
| BR-06: A scholar cannot be marked Compliant while mandatory requirements are incomplete. | Logic: All 4 checks must pass (GWA, Units, Failing, Incomplete) |
| BR-07: Scholar status must be based on the rules of the assigned scholarship program. | Logic: `evaluateSubmissionAgainstRequirements()` uses program-specific thresholds |
| BR-08: Changes to verified academic records must be traceable. | Schema: `verified_by`, `verified_at`, `evaluated_at`; RLS prevents unauthorized changes |
| BR-09: A submission cannot be verified twice without an authorized correction process. | UI: Verify button hidden after verification; Return creates new pending state |
| BR-10: Sensitive grade information must only be visible to authorized users. | RLS policies on all tables; Scholar role only sees own records |

---

## Non-Functional Requirements Traceability

| NFR | Category | Implementation |
|-----|----------|----------------|
| NFR-01 | Security | Supabase Auth (JWT), RLS policies, HTTPS via GitHub Pages |
| NFR-02 | Privacy | Role-based data access, scholars only see own data |
| NFR-03 | Usability | Clean UI, validation messages, responsive design |
| NFR-04 | Performance | Indexed columns, pagination (future), Supabase edge network |
| NFR-05 | Reliability | Supabase managed PostgreSQL, automated backups |
| NFR-06 | Data Integrity | Foreign keys, check constraints, unique constraints, transactions |

---

## Test Case Traceability

| Test ID | Scenario | Related FR | Expected Result |
|---------|----------|------------|-----------------|
| TC-01 | Login with valid authorized account | FR-14 | Dashboard opens |
| TC-02 | Create scholar with complete data | FR-01, FR-02 | Scholar saved |
| TC-03 | Create scholar without Student ID | FR-01, BR-01 | Submission rejected |
| TC-04 | Submit semester grades | FR-04, FR-05, BR-03 | Record saved as Pending |
| TC-05 | Verify pending grade submission | FR-06, BR-04, BR-05 | Status becomes Verified |
| TC-06 | Evaluate scholar meeting requirements | FR-07, FR-08, BR-07 | Result is Compliant |
| TC-07 | Evaluate scholar failing a requirement | FR-07, FR-08, BR-06 | Result is With Deficiency |
| TC-08 | Search scholar by Student ID/name | FR-15 | Matching scholar displayed |
| TC-09 | Filter by scholarship/status | FR-15 | Correct subset displayed |
| TC-10 | Open deployed URL | NFR-01, NFR-04 | System is accessible online |

---

## Instructions for Completion

After development, fill in the **Test Result** column with:
- **PASS** - Test executed successfully
- **FAIL** - Test failed (document why)
- **N/A** - Not implemented in this iteration

For each feature, note the exact file/function that implements it for the instructor demo.