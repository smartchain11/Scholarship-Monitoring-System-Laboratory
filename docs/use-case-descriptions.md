# Detailed Use Case Descriptions

Per Part I, Section I - Prepare detailed descriptions for at least four major use cases:
1. Submit Grades
2. Verify Grade Submission
3. Evaluate Academic Compliance
4. Process Scholarship Renewal

---

## UC-01: Submit Grades

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC-01 |
| **Use Case Name** | Submit Grades |
| **Primary Actor** | Scholar / Scholarship Staff |
| **Goal** | Submit semester grades for compliance evaluation |
| **Preconditions** | • Scholar is registered in the system<br>• Scholar is assigned to an active scholarship program<br>• Current academic year/semester is open for submission<br>• User is authenticated |
| **Trigger** | Scholar or staff initiates grade submission for a specific semester |
| **Main Flow** | 1. Actor navigates to Grade Submissions page<br>2. Actor clicks "New Submission"<br>3. System displays submission form with scholar dropdown<br>4. Actor selects scholar (auto-filters by active scholars)<br>5. Actor enters: Academic Year, Semester, GWA, Units Enrolled, Failed Subjects, Incomplete Subjects<br>6. System validates all required fields and business rules<br>7. Actor clicks "Save Submission"<br>8. System saves record with status = "Pending"<br>9. System displays confirmation<br>10. Dashboard updates pending count |
| **Alternative Flow** | **A1: Duplicate Submission**<br>1. At step 5, scholar/academic year/semester combination already exists<br>2. System rejects with error "Submission already exists for this period"<br>3. Actor can edit existing submission instead<br><br>**A2: Scholar Not Assigned to Program**<br>1. At step 4, selected scholar has no scholarship program<br>2. System shows warning and prevents submission<br>3. Actor must assign program first via Scholar Management |
| **Exception Flow** | **E1: Validation Failure**<br>1. GWA outside valid range (1.00-5.00)<br>2. Units enrolled negative<br>3. Failed/Incomplete subjects negative<br>4. System displays specific field errors<br>5. Actor corrects and resubmits<br><br>**E2: Database Error**<br>1. Network failure or constraint violation<br>2. System logs error and shows user-friendly message<br>3. Actor retries |
| **Postconditions** | • Grade submission record created with status "Pending"<br>• Submission timestamp recorded<br>• Scholar status updated to "Pending Submission" (if was "Active")<br>• Audit trail entry created |
| **Related Requirements** | FR-04, FR-05, FR-10, BR-03, BR-06 |
| **Business Rules** | BR-03: A grade submission must belong to one scholar, academic year, and semester |

---

## UC-02: Verify Grade Submission

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC-02 |
| **Use Case Name** | Verify Grade Submission |
| **Primary Actor** | Scholarship Staff |
| **Goal** | Verify the accuracy and authenticity of submitted grades |
| **Preconditions** | • Grade submission exists with status "Pending"<br>• Actor has Staff or Admin role<br>• Actor can view submission details |
| **Trigger** | Staff selects a pending submission and clicks "Verify" |
| **Main Flow** | 1. Staff navigates to Grade Submissions or Compliance page<br>2. Staff filters to show "Pending" submissions<br>3. Staff clicks "Verify" on a submission<br>4. System displays verification modal with submission details<br>5. Staff reviews: Scholar info, GWA, Units, Failed/Incomplete subjects<br>6. Staff clicks "Mark as Verified"<br>7. System updates: submission_status = "Verified", verified_by = current user, verified_at = now<br>8. System triggers compliance evaluation (UC-03)<br>9. Dashboard updates: pending count decreases, verified count increases |
| **Alternative Flow** | **A1: Return for Correction**<br>1. At step 5, staff finds errors in submission<br>2. Staff clicks "Return for Correction"<br>3. System updates status to "Returned"<br>4. Scholar/staff notified to resubmit |
| **Exception Flow** | **E1: Already Verified**<br>1. Submission status is already "Verified"<br>2. System prevents double verification per BR-09<br>3. Staff must use correction process if changes needed<br><br>**E2: Unauthorized Access**<br>1. Non-staff user attempts verification<br>2. System denies access per BR-04<br>3. Audit log records attempt |
| **Postconditions** | • Submission status changed to "Verified"<br>• Verifier identity and timestamp recorded<br>• Compliance evaluation automatically triggered<br>• Scholar status updated to "For Verification" |
| **Related Requirements** | FR-06, FR-07, BR-04, BR-05, BR-09 |
| **Business Rules** | BR-04: Only authorized personnel may verify submitted grades<br>BR-05: Only verified submissions may be used for final compliance evaluation<br>BR-09: A submission cannot be verified twice without an authorized correction process |

---

## UC-03: Evaluate Academic Compliance

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC-03 |
| **Use Case Name** | Evaluate Academic Compliance |
| **Primary Actor** | System (automatic) / Scholarship Coordinator |
| **Goal** | Determine if scholar meets scholarship academic requirements |
| **Preconditions** | • Grade submission exists with status "Verified"<br>• Scholar is assigned to a scholarship program<br>• Scholarship program has defined requirements (GWA, units, failing policy) |
| **Trigger** | Automatic after verification, or manual "Evaluate" button click |
| **Main Flow** | 1. System retrieves verified submission and scholarship program requirements<br>2. System evaluates each requirement:<br>   a. GWA Check: submission.gwa ≤ program.required_gwa<br>   b. Units Check: submission.units_enrolled ≥ program.min_units<br>   c. Failing Grades Check: program.allow_failing_grade OR submission.failed_subjects = 0<br>   d. Incomplete Subjects Check: submission.incomplete_subjects = 0<br>3. If ALL checks pass → Result = "Compliant"<br>4. If ANY check fails → Result = "With Deficiency"<br>5. System updates submission: compliance_result, evaluated_at<br>6. System updates scholar status based on result<br>7. Dashboard updates compliant/deficiency counts |
| **Alternative Flow** | **A1: Manual Override**<br>1. Coordinator reviews automatic evaluation<br>2. Coordinator can trigger re-evaluation after data correction<br>3. System re-runs evaluation with updated data |
| **Exception Flow** | **E1: Missing Program Requirements**<br>1. Scholarship program missing required_gwa or min_units<br>2. System cannot evaluate, flags as error<br>3. Admin must configure program requirements first<br><br>**E2: Unverified Submission**<br>1. Attempt to evaluate non-verified submission<br>2. System blocks per BR-05<br>3. Staff must verify first |
| **Postconditions** | • Compliance result recorded ("Compliant" or "With Deficiency")<br>• Evaluation timestamp recorded<br>• Scholar status updated accordingly<br>• Deficiency records created for failed checks (if applicable) |
| **Related Requirements** | FR-07, FR-08, FR-09, BR-02, BR-06, BR-07 |
| **Business Rules** | BR-02: Every scholarship program must define its academic requirements<br>BR-06: A scholar cannot be marked Compliant while mandatory requirements are incomplete<br>BR-07: Scholar status must be based on the rules of the assigned scholarship program |

---

## UC-04: Process Scholarship Renewal

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC-04 |
| **Use Case Name** | Process Scholarship Renewal |
| **Primary Actor** | Scholarship Coordinator / Committee |
| **Goal** | Process scholarship renewal for eligible scholars |
| **Preconditions** | • Scholar has completed at least one academic year<br>• Scholar has compliance history (Compliant/With Deficiency)<br>• Current scholarship period is ending<br>• Actor has Coordinator or Admin role |
| **Trigger** | Coordinator initiates renewal process for eligible scholars |
| **Main Flow** | 1. Coordinator navigates to Compliance/Renewal page<br>2. System shows scholars with status "For Renewal" or "Compliant" near end of term<br>3. Coordinator reviews scholar's compliance history<br>4. Coordinator selects scholars for renewal<br>5. For each scholar, Coordinator chooses: Renew / Probationary / Disqualify<br>6. System updates scholar status accordingly<br>7. System records renewal decision with timestamp and actor<br>8. Notifications sent to scholars (if implemented)<br>9. Renewal report generated |
| **Alternative Flow** | **A1: Conditional Renewal (Probationary)**<br>1. Scholar has minor deficiencies but shows improvement<br>2. Coordinator selects "Probationary"<br>3. System sets status to "Probationary" with review date<br>4. Additional monitoring enabled |
| **Exception Flow** | **E1: Incomplete Compliance History**<br>1. Scholar missing grade submissions for recent semesters<br>2. System flags incomplete records<br>3. Coordinator cannot process until submissions complete<br><br>**E2: Disqualification**<br>1. Scholar has repeated deficiencies<br>2. Coordinator selects "Disqualified"<br>3. System sets status and records reason<br>4. Scholar loses scholarship benefits |
| **Postconditions** | • Scholar status updated to "Renewed", "Probationary", or "Disqualified"<br>• Renewal decision recorded with actor and timestamp<br>• Audit trail maintained per BR-08 |
| **Related Requirements** | FR-11, FR-12, FR-13, FR-14, FR-15, BR-08 |
| **Business Rules** | BR-08: Changes to verified academic records must be traceable |

---

## Additional Use Cases (Summary)

| UC ID | Name | Primary Actor | Related FR |
|-------|------|---------------|------------|
| UC-05 | Login | All | FR-01 |
| UC-06 | Register Scholar | Staff/Admin | FR-01 |
| UC-07 | Assign Scholarship | Staff/Admin | FR-02 |
| UC-08 | Configure Scholarship Requirements | Admin | FR-03 |
| UC-09 | View Requirements | All | FR-03 |
| UC-10 | View Deficiency | Scholar/Staff | FR-08 |
| UC-11 | Update Scholar Status | Staff/Admin | FR-09 |
| UC-12 | Search Scholar | Staff/Admin | FR-10 |
| UC-13 | Filter Scholars | Staff/Admin | FR-10 |
| UC-14 | Generate Compliance Report | Coordinator | FR-11 |
| UC-15 | View Dashboard | All | FR-10 |
| UC-16 | Logout | All | - |