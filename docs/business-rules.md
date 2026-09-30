# Business Rules

Per Part I, Section F - Define at least 10 rules

---

## Mandatory Business Rules (from requirements)

| ID | Business Rule | Description | Enforcement |
|----|---------------|-------------|-------------|
| BR-01 | Every scholar must be assigned to an active scholarship program. | Scholars cannot exist without a valid scholarship program assignment. The program must be active. | DB: `scholarship_id` FK NOT NULL + `scholarship_programs.active = true`<br>UI: Required dropdown with only active programs |
| BR-02 | Every scholarship program must define its academic requirements. | Programs must have GWA requirement, minimum units, and failing grade policy defined. | DB: `required_gwa`, `min_units`, `allow_failing_grade` NOT NULL<br>UI: Required fields on program form |
| BR-03 | A grade submission must belong to one scholar, academic year, and semester. | Unique constraint prevents duplicate submissions for same scholar/period. | DB: UNIQUE(scholar_id, academic_year, semester) |
| BR-04 | Only authorized personnel may verify submitted grades. | Verification restricted to Staff and Admin roles. | RLS: UPDATE policy requires staff/admin<br>UI: Verify buttons only for authorized roles |
| BR-05 | Only verified submissions may be used for final compliance evaluation. | Compliance evaluation blocked on pending/returned submissions. | Code: `evaluateCompliance()` checks `submission_status = 'Verified'`<br>UI: Evaluate button only for verified |
| BR-06 | A scholar cannot be marked Compliant while mandatory requirements are incomplete. | All four checks must pass: GWA, Units, Failing grades, Incomplete subjects. | Logic: AND of all checks in `evaluateSubmissionAgainstRequirements()` |
| BR-07 | Scholar status must be based on the rules of the assigned scholarship program. | Each program has its own thresholds; evaluation uses program-specific rules. | Logic: Evaluation queries scholar's program for thresholds |
| BR-08 | Changes to verified academic records must be traceable. | Audit trail: who verified, when, who evaluated, when. | DB: `verified_by`, `verified_at`, `evaluated_at` fields<br>RLS: Prevents unauthorized modification |
| BR-09 | A submission cannot be verified twice without an authorized correction process. | Once verified, must be returned for correction before re-verification. | UI: Verify button hidden after verification; Return creates new pending state |
| BR-10 | Sensitive grade information must only be visible to authorized users. | Role-based access: Admin/Staff see all; Scholars see only own. | RLS policies on all tables |

---

## Additional Business Rules (Derived)

| ID | Business Rule | Description | Enforcement |
|----|---------------|-------------|-------------|
| BR-11 | Academic year format must be consistent (e.g., "2024-2025"). | Standardized format for reporting and filtering. | UI: Placeholder example; validation regex (optional) |
| BR-12 | Semester values are limited to: 1st, 2nd, Summer. | Fixed enumeration for consistency. | DB: CHECK constraint; UI: Dropdown |
| BR-13 | GWA must be within institutional range (1.00 - 5.00). | Philippine grading system standard. | DB: CHECK(gwa >= 1.00 AND gwa <= 5.00)<br>UI: min/max on input |
| BR-14 | Units enrolled cannot be negative. | Logical constraint. | DB: CHECK(units_enrolled >= 0)<br>UI: min=0 |
| BR-15 | Failed and incomplete subject counts cannot be negative. | Logical constraint. | DB: CHECK(failed_subjects >= 0), CHECK(incomplete_subjects >= 0)<br>UI: min=0 |
| BR-16 | Scholar status transitions follow defined workflow. | Active → Pending Submission → For Verification → Compliant/With Deficiency → (Probationary/For Renewal/Disqualified) | UI: Status dropdown with all valid states; Auto-transition on events |
| BR-17 | Program required_gwa direction: LOWER is better (1.00 = highest). | Philippine GWA system where 1.0 is best. | Logic: `submission.gwa <= program.required_gwa` |
| BR-18 | Incomplete subjects typically disqualify from compliance. | Incomplete grades indicate unfinished requirements. | Logic: `incomplete_subjects = 0` required for compliance |
| BR-19 | Scholarship program changes affect future evaluations only. | Historical evaluations remain based on program at time of submission. | DB: Submission stores compliance result; program changes don't retroactively alter |
| BR-20 | Staff cannot verify their own submissions (if staff are also scholars). | Separation of duties. | RLS: Could add check `verified_by != scholar_id` (future enhancement) |

---

## Compliance Evaluation Logic Details

The core compliance decision (BR-06, BR-07) uses this algorithm:

```
FUNCTION evaluateCompliance(submission, program):
    gwaPass = submission.gwa <= program.required_gwa
    unitsPass = submission.units_enrolled >= program.min_units
    failingPass = program.allow_failing_grade OR submission.failed_subjects == 0
    incompletePass = submission.incomplete_subjects == 0
    
    IF gwaPass AND unitsPass AND failingPass AND incompletePass:
        RETURN "Compliant"
    ELSE:
        RETURN "With Deficiency"
```

**Note on GWA Direction:** This implementation assumes the Philippine grading system where 1.00 is the highest (best) and 5.00 is failing. The rule `submission.gwa <= program.required_gwa` means a scholar with GWA 1.75 meets a requirement of 1.75 or 2.00.

---

## Rule Traceability to Requirements

| Business Rule | Functional Requirement | Use Case | Test Case |
|---------------|------------------------|----------|-----------|
| BR-01 | FR-01, FR-02 | UC-06, UC-07 | TC-02, TC-03 |
| BR-02 | FR-03 | UC-08 | (Program creation) |
| BR-03 | FR-04, FR-05 | UC-01 | TC-04, TC-16 |
| BR-04 | FR-06 | UC-02 | TC-05, TC-18 |
| BR-05 | FR-06, FR-07 | UC-02, UC-03 | TC-05, TC-06, TC-07 |
| BR-06 | FR-07, FR-08 | UC-03 | TC-06, TC-07 |
| BR-07 | FR-07, FR-09 | UC-03, UC-11 | TC-06, TC-07 |
| BR-08 | FR-11, FR-12 | UC-04 | (Audit trail) |
| BR-09 | FR-06 | UC-02 | TC-17 |
| BR-10 | FR-14 | UC-05, UC-10 | TC-19 |