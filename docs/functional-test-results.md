# Functional Test Results

Per Part II, Section XVI - Required Functional Tests

---

## Test Execution Record

**Test Date:** ___________  
**Tested By:** ___________  
**Environment:** ___________ (GitHub Pages URL)  
**Browser:** ___________

---

## Test Cases

### TC-01: Login with Valid Authorized Account
| Field | Value |
|-------|-------|
| **Test ID** | TC-01 |
| **Related FR** | FR-14 |
| **Preconditions** | User accounts exist in Supabase Auth |
| **Test Steps** | 1. Navigate to deployed URL<br>2. Enter valid admin credentials<br>3. Click Sign In |
| **Expected Result** | Dashboard opens, user name and role displayed |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-02: Create Scholar with Complete Data
| Field | Value |
|-------|-------|
| **Test ID** | TC-02 |
| **Related FR** | FR-01, FR-02 |
| **Preconditions** | Logged in as Staff/Admin; Scholarship programs exist |
| **Test Steps** | 1. Navigate to Scholars page<br>2. Click "Add Scholar"<br>3. Fill all required fields<br>4. Select scholarship program<br>5. Click Save |
| **Expected Result** | Scholar saved, appears in list with correct status |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-03: Create Scholar without Student ID
| Field | Value |
|-------|-------|
| **Test ID** | TC-03 |
| **Related FR** | FR-01, BR-01 |
| **Preconditions** | Logged in as Staff/Admin |
| **Test Steps** | 1. Navigate to Scholars page<br>2. Click "Add Scholar"<br>3. Leave Student ID blank<br>4. Fill other fields<br>5. Click Save |
| **Expected Result** | Submission rejected, validation error shown |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-04: Submit Semester Grades
| Field | Value |
|-------|-------|
| **Test ID** | TC-04 |
| **Related FR** | FR-04, FR-05, BR-03 |
| **Preconditions** | Scholar exists with assigned program |
| **Test Steps** | 1. Navigate to Grade Submissions<br>2. Click "New Submission"<br>3. Select scholar<br>4. Enter: Academic Year, Semester, GWA, Units, Failed, Incomplete<br>5. Click Save |
| **Expected Result** | Record saved with status "Pending/For Verification" |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-05: Verify Pending Grade Submission
| Field | Value |
|-------|-------|
| **Test ID** | TC-05 |
| **Related FR** | FR-06, BR-04, BR-05 |
| **Preconditions** | Pending submission exists; logged in as Staff |
| **Test Steps** | 1. Navigate to Grade Submissions<br>2. Filter by "Pending"<br>3. Click "Verify" on a submission<br>4. Review details in modal<br>5. Click "Mark as Verified" |
| **Expected Result** | Status becomes "Verified", verified_by and verified_at populated |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-06: Evaluate Scholar Meeting Requirements
| Field | Value |
|-------|-------|
| **Test ID** | TC-06 |
| **Related FR** | FR-07, FR-08, BR-07 |
| **Preconditions** | Verified submission exists; scholar meets all program requirements |
| **Test Steps** | 1. Navigate to Grade Submissions or Compliance<br>2. Find verified submission without compliance result<br>3. Click "Evaluate" |
| **Expected Result** | Result is "Compliant", scholar status updated |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-07: Evaluate Scholar Failing a Requirement
| Field | Value |
|-------|-------|
| **Test ID** | TC-07 |
| **Related FR** | FR-07, FR-08, BR-06 |
| **Preconditions** | Verified submission exists; scholar fails at least one requirement |
| **Test Steps** | 1. Create submission with GWA > required_gwa OR units < min_units OR failed > 0 (if not allowed)<br>2. Verify submission<br>3. Click "Evaluate" |
| **Expected Result** | Result is "With Deficiency", scholar status updated |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-08: Search Scholar by Student ID/Name
| Field | Value |
|-------|-------|
| **Test ID** | TC-08 |
| **Related FR** | FR-15 |
| **Preconditions** | Multiple scholars exist |
| **Test Steps** | 1. Navigate to Scholars or Compliance page<br>2. Enter partial Student ID or Name in search box |
| **Expected Result** | Matching scholars displayed in real-time |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-09: Filter by Scholarship/Status
| Field | Value |
|-------|-------|
| **Test ID** | TC-09 |
| **Related FR** | FR-15 |
| **Preconditions** | Scholars with different programs/statuses exist |
| **Test Steps** | 1. Navigate to Scholars page<br>2. Select a scholarship program from filter<br>3. Select a status from filter<br>4. Combine both filters |
| **Expected Result** | Correct subset displayed for each filter combination |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

### TC-10: Open Deployed URL
| Field | Value |
|-------|-------|
| **Test ID** | TC-10 |
| **Related FR** | NFR-01, NFR-04 |
| **Preconditions** | System deployed to GitHub Pages |
| **Test Steps** | 1. Open GitHub Pages URL in browser<br>2. Verify login page loads<br>3. Test on mobile viewport |
| **Expected Result** | System accessible online, responsive layout |
| **Actual Result** | |
| **Status** | ☐ PASS ☐ FAIL |
| **Notes** | |

---

## Additional Validation Tests

| Test ID | Scenario | Expected | Status |
|---------|----------|----------|--------|
| TC-11 | GWA validation (below 1.00) | Rejected | ☐ PASS ☐ FAIL |
| TC-12 | GWA validation (above 5.00) | Rejected | ☐ PASS ☐ FAIL |
| TC-13 | Negative units enrolled | Rejected | ☐ PASS ☐ FAIL |
| TC-14 | Negative failed subjects | Rejected | ☐ PASS ☐ FAIL |
| TC-15 | Negative incomplete subjects | Rejected | ☐ PASS ☐ FAIL |
| TC-16 | Duplicate submission (same scholar/year/semester) | Rejected | ☐ PASS ☐ FAIL |
| TC-17 | Verify already verified submission | Blocked | ☐ PASS ☐ FAIL |
| TC-18 | Non-staff accessing verification | Denied | ☐ PASS ☐ FAIL |
| TC-19 | Scholar seeing only own submissions | Enforced | ☐ PASS ☐ FAIL |
| TC-20 | Dashboard counts update in real-time | Updated | ☐ PASS ☐ FAIL |

---

## Defect Log

| Defect ID | Test Case | Description | Severity | Status |
|-----------|-----------|-------------|----------|--------|
| DEF-001 | | | | |
| DEF-002 | | | | |
| DEF-003 | | | | |

---

## Summary

| Metric | Count |
|--------|-------|
| Total Test Cases | 10 (required) + 10 (additional) |
| Passed | |
| Failed | |
| Pass Rate | |

**Overall Assessment:** ☐ READY FOR SUBMISSION ☐ NEEDS FIXES

**Signed:** ___________ **Date:** ___________