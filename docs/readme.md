# Scholarship Monitoring System - Documentation

This folder contains all documentation templates required for the lab submission.

## Contents

1. **use-case-descriptions.md** - Detailed use case descriptions for 4 major use cases
2. **requirements-traceability.md** - Requirements-to-Implementation traceability table
3. **functional-test-results.md** - Functional test results template (TC-01 to TC-10)
4. **business-rules.md** - Complete list of 10 business rules
5. **functional-requirements.md** - Complete list of 15 functional requirements
6. **non-functional-requirements.md** - Non-functional requirements
7. **readme.md** - This file

---

## Submission Checklist

Per the lab requirements (Section XVIII), you must submit:

- [ ] GitHub repository URL
- [ ] Live deployed system URL (GitHub Pages)
- [ ] Use Case Diagram from Part I
- [ ] Final Functional Requirements used for development
- [ ] Database/ERD screenshot or diagram
- [ ] At least four meaningful Git commits
- [ ] Functional test results
- [ ] Requirements-to-Implementation table
- [ ] Two to four screenshots showing the core workflow

---

## Git Commit Examples (Section XIX)

```
1. Initialize scholarship monitoring system
2. Create scholar and scholarship database modules
3. Implement grade submission and verification
4. Add compliance evaluation dashboard and deployment
```

---

## Development Schedule (Section XV)

| Time | Task | Expected Output |
|------|------|-----------------|
| 0:00-0:15 | Review analysis outputs and create repository/project structure | Requirements selected for implementation |
| 0:15-0:35 | Configure Supabase tables, authentication, and sample scholarship rules | Working backend |
| 0:35-1:00 | Develop scholar management | Scholar Create/Read/Update |
| 1:00-1:25 | Develop grade submission | Semester submission saved as Pending |
| 1:25-1:45 | Implement verification and compliance logic | Verified submission evaluated |
| 1:45-2:05 | Build dashboard, search, and filter | Live monitoring view |
| 2:05-2:20 | Functional testing and debugging | Core workflow passes |
| 2:20-2:30 | GitHub commit, deploy, and submit | Online working prototype |

---

## Grading Rubric (Section XX)

| Criterion | Points |
|-----------|--------|
| Requirements and Use Case Alignment | 10 |
| Database Design and Relationships | 10 |
| Authentication and Access Control | 10 |
| Scholar Management | 10 |
| Scholarship Requirement Configuration | 10 |
| Grade Submission and Verification | 15 |
| Compliance Evaluation Logic | 15 |
| Dashboard, Search, and Filter | 5 |
| Validation and Functional Testing | 10 |
| GitHub and Online Deployment | 5 |
| **TOTAL** | **100** |

---

## Instructor Demo Challenges (Section XXI)

Be prepared to demonstrate:

1. Register a new scholar
2. Assign a scholarship program
3. Create a semester grade submission
4. Demonstrate a Pending submission
5. Verify the submission
6. Show a scholar who becomes Compliant
7. Modify data so the scholar becomes With Deficiency
8. Search for a scholar
9. Explain which functional requirement produced a selected feature
10. Explain which business rule controls the compliance decision