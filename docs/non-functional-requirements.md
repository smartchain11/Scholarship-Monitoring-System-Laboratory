# Non-Functional Requirements

Per Part I, Section E

---

## NFR-01: Security
| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| **Authentication** | Secure user authentication with email/password | Supabase Auth (JWT-based, bcrypt password hashing) |
| **Authorization** | Role-based access control (Admin, Staff, Scholar) | Supabase RLS policies + UI role checks |
| **Data Protection** | HTTPS enforcement in production | GitHub Pages + Supabase (both HTTPS only) |
| **Session Management** | Secure session handling with auto-expiry | Supabase Auth tokens (1hr access, refresh tokens) |
| **Input Validation** | Client and server-side validation | HTML5 validation + Supabase CHECK constraints |
| **SQL Injection** | Parameterized queries only | Supabase client uses parameterized queries |
| **Audit Trail** | Track verification and evaluation actions | `verified_by`, `verified_at`, `evaluated_at` fields |

---

## NFR-02: Privacy
| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| **Data Minimization** | Collect only necessary academic data | Student ID, Name, Program, Grades only |
| **Access Control** | Scholars see only own records | RLS: Scholar role filtered to own scholar_id |
| **Staff Access** | Staff see all scholar data for monitoring | RLS: Staff/Admin bypass scholar filter |
| **No PII Exposure** | No SSN, financial data, or excessive personal info | Only academic identifiers used |
| **FERPA Considerations** | Grade data protected by role | RLS enforces need-to-know access |

---

## NFR-03: Usability
| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| **Responsive Design** | Works on desktop, tablet, mobile | CSS Grid/Flexbox, media queries |
| **Clear Navigation** | Consistent sidebar/menu structure | Fixed sidebar with labeled icons |
| **Feedback** | Toast notifications for actions | Success/error/warning toasts |
| **Validation Messages** | Inline field-level error messages | Browser native + custom validation |
| **Loading States** | Spinner during async operations | Loading component on page transitions |
| **Empty States** | Helpful messages when no data | Icon + description + action button |
| **Keyboard Accessible** | Tab navigation, Enter to submit | Semantic HTML, focus styles |
| **Color Contrast** | WCAG AA compliant colors | Defined color palette with contrast ratios |

---

## NFR-04: Performance
| Aspect | Requirement | Target | Implementation |
|--------|-------------|--------|----------------|
| **Page Load** | Initial load < 3 seconds | < 3s | Minimal JS, CDN for Supabase client |
| **Dashboard Refresh** | Stats load < 1 second | < 1s | Parallel queries, indexed columns |
| **Search/Filter** | Real-time response | < 300ms | Client-side filtering after initial load |
| **Database Queries** | Optimized with indexes | - | Indexes on FKs, status, search fields |
| **Concurrent Users** | Support 50+ simultaneous | 50+ | Supabase auto-scales |

---

## NFR-05: Reliability
| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| **Uptime** | 99.9% availability | Supabase managed PostgreSQL (99.99% SLA) |
| **Backup** | Automated daily backups | Supabase built-in point-in-time recovery |
| **Error Handling** | Graceful degradation, user-friendly messages | Try/catch with toast notifications |
| **Data Consistency** | ACID transactions | PostgreSQL transactions via Supabase |
| **Failover** | Automatic failover | Supabase multi-AZ deployment |

---

## NFR-06: Data Integrity
| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| **Referential Integrity** | Foreign key constraints | DB: FK on scholarship_id, scholar_id, verified_by |
| **Domain Integrity** | Check constraints on all fields | DB: CHECK on GWA range, units ≥0, enum statuses |
| **Uniqueness** | Unique constraints where required | DB: UNIQUE on student_id, scholar+year+semester |
| **Cascading** | Proper cascade/delete rules | DB: CASCADE on scholar→submissions; SET NULL on verifier |
| **Audit Trail** | Immutable verification records | verified_at, evaluated_at immutable after set |
| **Soft Deletes** | Optional: archive instead of delete | Future: deleted_at column |

---

## Additional Non-Functional Requirements

### NFR-07: Maintainability
- **Modular Code**: ES6 modules per feature (auth, pages, supabase)
- **Consistent Patterns**: Same CRUD pattern across modules
- **Documentation**: JSDoc comments on exported functions
- **Configuration**: Environment variables for Supabase credentials

### NFR-08: Scalability
- **Horizontal**: Supabase handles connection pooling
- **Vertical**: Pagination for large datasets (future)
- **Caching**: Browser caches static assets; Supabase edge caching

### NFR-09: Deployability
- **Static Hosting**: GitHub Pages compatible (no server runtime)
- **CI/CD Ready**: GitHub Actions workflow template included
- **Environment Config**: Separate dev/prod Supabase projects

### NFR-10: Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES Modules**: Native ES6 module support required
- **No Polyfills**: Uses modern APIs (fetch, localStorage, etc.)

---

## Verification Methods

| NFR | Verification Method |
|-----|---------------------|
| NFR-01 | Penetration testing, RLS policy review, auth flow testing |
| NFR-02 | Role-based access testing with different user accounts |
| NFR-03 | Usability testing, mobile viewport testing, accessibility audit |
| NFR-04 | Load testing with k6/JMeter, browser dev tools performance tab |
| NFR-05 | Chaos engineering (simulated failures), monitoring alerts |
| NFR-06 | Constraint violation testing, referential integrity tests |

---

## Compliance Matrix

| Requirement | FR Trace | Test Case |
|-------------|----------|-----------|
| NFR-01 Security | FR-14 | TC-18, TC-19 |
| NFR-02 Privacy | FR-14 | TC-19 |
| NFR-03 Usability | FR-15 | TC-08, TC-09 |
| NFR-04 Performance | - | TC-10 |
| NFR-05 Reliability | - | Deployment verification |
| NFR-06 Data Integrity | FR-01 to FR-10 | TC-03, TC-11 to TC-17 |