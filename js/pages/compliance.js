// ============================================
// Compliance Page
// ============================================
import { supabase } from '../supabase.js';
import { currentProfile } from '../auth.js';
import { isStaff, isAdmin, formatDate, showToast } from '../supabase.js';

export async function loadCompliancePage() {
    const content = document.getElementById('main-content');
    
    // Fetch all scholars with their latest submissions
    const { data: scholars } = await supabase
        .from('scholars')
        .select(`
            *,
            scholarship_programs (program_name, required_gwa, min_units, allow_failing_grade),
            grade_submissions (
                id, academic_year, semester, gwa, units_enrolled, 
                failed_subjects, incomplete_subjects, submission_status,
                compliance_result, evaluated_at
            )
        `)
        .order('full_name');
    
    // Process compliance for each scholar
    const complianceData = (scholars || []).map(scholar => {
        const program = scholar.scholarship_programs;
        const submissions = scholar.grade_submissions || [];
        
        // Get latest submission per academic year/semester
        const latestByTerm = {};
        submissions.forEach(s => {
            const key = `${s.academic_year}-${s.semester}`;
            if (!latestByTerm[key] || new Date(s.submitted_at) > new Date(latestByTerm[key].submitted_at)) {
                latestByTerm[key] = s;
            }
        });
        
        const latestSubmission = Object.values(latestByTerm).sort((a, b) => 
            new Date(b.submitted_at) - new Date(a.submitted_at)
        )[0];
        
        let complianceStatus = scholar.status;
        let complianceDetails = null;
        
        if (latestSubmission && program) {
            complianceDetails = evaluateCompliance(latestSubmission, program);
            if (latestSubmission.submission_status === 'Verified') {
                complianceStatus = complianceDetails.result;
            }
        }
        
        return {
            scholar,
            program,
            latestSubmission,
            complianceStatus,
            complianceDetails
        };
    });
    
    // Summary counts
    const compliant = complianceData.filter(d => d.complianceStatus === 'Compliant').length;
    const withDeficiency = complianceData.filter(d => d.complianceStatus === 'With Deficiency').length;
    const pending = complianceData.filter(d => d.complianceStatus === 'Pending Submission' || d.complianceStatus === 'For Verification').length;
    const active = complianceData.filter(d => d.complianceStatus === 'Active').length;
    
    content.innerHTML = `
        <div class="page-header">
            <h1>Compliance Monitoring</h1>
            <p class="text-secondary">Academic compliance evaluation against scholarship requirements</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card success">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                    <h3>${compliant}</h3>
                    <p>Compliant</p>
                </div>
            </div>
            <div class="stat-card danger">
                <div class="stat-icon">⚠️</div>
                <div class="stat-info">
                    <h3>${withDeficiency}</h3>
                    <p>With Deficiency</p>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">⏳</div>
                <div class="stat-info">
                    <h3>${pending}</h3>
                    <p>Pending Verification</p>
                </div>
            </div>
            <div class="stat-card primary">
                <div class="stat-icon">👨‍🎓</div>
                <div class="stat-info">
                    <h3>${active}</h3>
                    <p>Active (No Submission)</p>
                </div>
            </div>
        </div>
        
        <div class="search-filter-bar">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="compliance-search" placeholder="Search by Student ID or Name..." onkeyup="filterCompliance()">
            </div>
            <div class="filter-group">
                <select id="compliance-status-filter" onchange="filterCompliance()">
                    <option value="">All Statuses</option>
                    <option value="Compliant">Compliant</option>
                    <option value="With Deficiency">With Deficiency</option>
                    <option value="Pending Submission">Pending Submission</option>
                    <option value="For Verification">For Verification</option>
                    <option value="Active">Active</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Disqualified">Disqualified</option>
                </select>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body" style="padding: 0;">
                <div id="compliance-list">
                    ${renderComplianceList(complianceData)}
                </div>
            </div>
        </div>
    `;
    
    window.complianceData = complianceData;
}

function evaluateCompliance(submission, program) {
    const gwaPass = submission.gwa <= program.required_gwa;
    const unitsPass = submission.units_enrolled >= program.min_units;
    const failingPass = program.allow_failing_grade || submission.failed_subjects === 0;
    const incompletePass = submission.incomplete_subjects === 0;
    
    const checks = [
        { name: 'GWA Requirement', passed: gwaPass, detail: `GWA ${submission.gwa} ≤ ${program.required_gwa}` },
        { name: 'Minimum Units', passed: unitsPass, detail: `${submission.units_enrolled} ≥ ${program.min_units} units` },
        { name: 'Failing Grades', passed: failingPass, detail: program.allow_failing_grade ? 'Allowed' : `${submission.failed_subjects} failed subjects` },
        { name: 'Incomplete Subjects', passed: incompletePass, detail: `${submission.incomplete_subjects} incomplete` }
    ];
    
    const allPassed = checks.every(c => c.passed);
    
    return {
        result: allPassed ? 'Compliant' : 'With Deficiency',
        checks
    };
}

function renderComplianceList(data) {
    if (data.length === 0) {
        return `<div class="empty-state" style="padding: 40px;"><div class="icon">✅</div><h3>No scholars found</h3><p>Add scholars to monitor compliance</p></div>`;
    }
    
    return data.map(d => {
        const scholar = d.scholar;
        const program = d.program;
        const submission = d.latestSubmission;
        const details = d.complianceDetails;
        
        const statusClass = d.complianceStatus.toLowerCase().replace(' ', '-');
        
        if (!submission) {
            return `
                <div class="compliance-card ${d.complianceStatus === 'Compliant' ? 'compliant' : ''}">
                    <div class="compliance-header">
                        <div>
                            <div class="compliance-title">${scholar.full_name}</div>
                            <div class="text-secondary" style="font-size: 13px;">${scholar.student_id} • ${program?.program_name || 'No Program'}</div>
                        </div>
                        <span class="status-badge ${statusClass}">${d.complianceStatus}</span>
                    </div>
                    <div class="compliance-details">
                        <div class="compliance-item">
                            <label>No Grade Submission</label>
                            <span>No semester grades submitted yet</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="compliance-card ${details?.result === 'Compliant' ? 'compliant' : 'deficiency'}">
                <div class="compliance-header">
                    <div>
                        <div class="compliance-title">${scholar.full_name}</div>
                        <div class="text-secondary" style="font-size: 13px;">${scholar.student_id} • ${program.program_name} • ${submission.academic_year} ${submission.semester}</div>
                    </div>
                    <span class="status-badge ${details?.result === 'Compliant' ? 'compliant' : 'deficiency'}">${details?.result || d.complianceStatus}</span>
                </div>
                <div class="compliance-details">
                    <div class="compliance-item">
                        <label>GWA</label>
                        <span class="${details?.checks[0].passed ? 'pass' : 'fail'}">${submission.gwa} (Req: ≤${program.required_gwa})</span>
                    </div>
                    <div class="compliance-item">
                        <label>Units Enrolled</label>
                        <span class="${details?.checks[1].passed ? 'pass' : 'fail'}">${submission.units_enrolled} (Min: ${program.min_units})</span>
                    </div>
                    <div class="compliance-item">
                        <label>Failed Subjects</label>
                        <span class="${details?.checks[2].passed ? 'pass' : 'fail'}">${submission.failed_subjects} ${program.allow_failing_grade ? '(Allowed)' : '(Not Allowed)'}</span>
                    </div>
                    <div class="compliance-item">
                        <label>Incomplete Subjects</label>
                        <span class="${details?.checks[3].passed ? 'pass' : 'fail'}">${submission.incomplete_subjects}</span>
                    </div>
                    <div class="compliance-item">
                        <label>Submission Status</label>
                        <span><span class="status-badge ${submission.submission_status.toLowerCase()}">${submission.submission_status}</span></span>
                    </div>
                    <div class="compliance-item">
                        <label>Verified</label>
                        <span>${submission.verified_at ? formatDate(submission.verified_at) : 'Not verified'}</span>
                    </div>
                </div>
                ${isStaff(currentProfile) && submission.submission_status === 'Pending' ? `
                    <div style="margin-top: 16px; display: flex; gap: 8px;">
                        <button class="btn btn-primary btn-sm" onclick="verifySubmission('${submission.id}')">Verify Submission</button>
                        <button class="btn btn-warning btn-sm" onclick="returnSubmission('${submission.id}')">Return</button>
                    </div>
                ` : ''}
                ${isStaff(currentProfile) && submission.submission_status === 'Verified' && !submission.compliance_result ? `
                    <div style="margin-top: 16px;">
                        <button class="btn btn-success btn-sm" onclick="evaluateCompliance('${submission.id}')">Evaluate Compliance</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

window.filterCompliance = function() {
    const search = document.getElementById('compliance-search').value.toLowerCase();
    const statusFilter = document.getElementById('compliance-status-filter').value;
    
    const filtered = window.complianceData.filter(d => {
        const scholar = d.scholar;
        const matchesSearch = scholar.student_id.toLowerCase().includes(search) || 
                             scholar.full_name.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || d.complianceStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    document.getElementById('compliance-list').innerHTML = renderComplianceList(filtered);
};