// ============================================
// Grade Submissions Page
// ============================================
import { supabase } from '../supabase.js';
import { currentProfile, isStaff, isAdmin, formatDate, formatDateTime, showToast } from '../supabase.js';

let submissionsData = [];
let scholarsData = [];

export async function loadSubmissionsPage() {
    const content = document.getElementById('main-content');
    
    // Fetch data
    const [{ data: submissions }, { data: scholars }] = await Promise.all([
        supabase.from('grade_submissions').select(`
            *,
            scholars (id, student_id, full_name, scholarship_id, scholarship_programs (program_name, required_gwa, min_units, allow_failing_grade)),
            profiles!grade_submissions_verified_by_fkey (full_name)
        `).order('created_at', { ascending: false }),
        supabase.from('scholars').select('id, student_id, full_name, scholarship_id').eq('status', 'Active').order('full_name')
    ]);
    
    submissionsData = submissions || [];
    scholarsData = scholars || [];
    
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Grade Submissions</h1>
                <p class="text-secondary">Manage semester grade submissions and verification</p>
            </div>
            ${isStaff(currentProfile) ? `
                <button class="btn btn-primary" onclick="openSubmissionModal()">
                    <span>+</span> New Submission
                </button>
            ` : ''}
        </div>
        
        <div class="search-filter-bar">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="submission-search" placeholder="Search by Student ID or Name..." onkeyup="filterSubmissions()">
            </div>
            <div class="filter-group">
                <select id="submission-status-filter" onchange="filterSubmissions()">
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Returned">Returned</option>
                </select>
                <select id="submission-compliance-filter" onchange="filterSubmissions()">
                    <option value="">All Compliance</option>
                    <option value="Compliant">Compliant</option>
                    <option value="With Deficiency">With Deficiency</option>
                </select>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body" style="padding: 0;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Scholar</th>
                                <th>Student ID</th>
                                <th>Program</th>
                                <th>Acad. Year</th>
                                <th>Semester</th>
                                <th>GWA</th>
                                <th>Units</th>
                                <th>Failed</th>
                                <th>Inc.</th>
                                <th>Status</th>
                                <th>Compliance</th>
                                <th>Submitted</th>
                                <th>Verified By</th>
                                ${isStaff(currentProfile) ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="submissions-table-body">
                            ${renderSubmissionsRows(submissionsData)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderSubmissionsRows(submissions) {
    if (submissions.length === 0) {
        return `<tr><td colspan="14" class="empty-state" style="padding: 40px;"><div class="icon">📝</div><h3>No submissions found</h3><p>Create a grade submission to get started</p></td></tr>`;
    }
    
    return submissions.map(s => {
        const scholar = s.scholars;
        const program = scholar?.scholarship_programs;
        const verifiedBy = s.profiles?.full_name;
        
        return `
            <tr>
                <td>${scholar?.full_name || 'N/A'}</td>
                <td>${scholar?.student_id || 'N/A'}</td>
                <td>${program?.program_name || 'N/A'}</td>
                <td>${s.academic_year}</td>
                <td>${s.semester}</td>
                <td>${s.gwa}</td>
                <td>${s.units_enrolled}</td>
                <td>${s.failed_subjects}</td>
                <td>${s.incomplete_subjects}</td>
                <td><span class="status-badge ${s.submission_status.toLowerCase()}">${s.submission_status}</span></td>
                <td>${s.compliance_result ? `<span class="status-badge ${s.compliance_result.toLowerCase().replace(' ', '-')}">${s.compliance_result}</span>` : '-'}</td>
                <td>${formatDate(s.submitted_at)}</td>
                <td>${verifiedBy || '-'}</td>
                ${isStaff(currentProfile) ? `
                    <td>
                        ${s.submission_status === 'Pending' ? `
                            <button class="action-btn verify" onclick="verifySubmission('${s.id}')" title="Verify">✅ Verify</button>
                            <button class="action-btn warning" onclick="returnSubmission('${s.id}')" title="Return">↩️ Return</button>
                        ` : s.submission_status === 'Verified' && !s.compliance_result ? `
                            <button class="action-btn success" onclick="evaluateCompliance('${s.id}')" title="Evaluate Compliance">🎯 Evaluate</button>
                        ` : ''}
                        <button class="action-btn view" onclick="viewSubmissionDetails('${s.id}')" title="View Details">👁️</button>
                    </td>
                ` : ''}
            </tr>
        `;
    }).join('');
}

window.filterSubmissions = function() {
    const search = document.getElementById('submission-search').value.toLowerCase();
    const statusFilter = document.getElementById('submission-status-filter').value;
    const complianceFilter = document.getElementById('submission-compliance-filter').value;
    
    const filtered = submissionsData.filter(s => {
        const scholar = s.scholars;
        const matchesSearch = scholar?.student_id.toLowerCase().includes(search) || 
                             scholar?.full_name.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || s.submission_status === statusFilter;
        const matchesCompliance = !complianceFilter || s.compliance_result === complianceFilter;
        return matchesSearch && matchesStatus && matchesCompliance;
    });
    
    document.getElementById('submissions-table-body').innerHTML = renderSubmissionsRows(filtered);
};

export async function openSubmissionModal(submissionId = null) {
    // Populate scholar dropdown
    const select = document.getElementById('submission-scholar');
    select.innerHTML = '<option value="">Select Scholar</option>' +
        scholarsData.map(s => `<option value="${s.id}">${s.full_name} (${s.student_id})</option>`).join('');
    
    const modal = document.getElementById('submission-modal');
    const title = document.getElementById('submission-modal-title');
    const form = document.getElementById('submission-form');
    
    form.reset();
    document.getElementById('submission-id').value = '';
    document.getElementById('submission-academic-year').value = getCurrentAcademicYear();
    
    if (submissionId) {
        title.textContent = 'Edit Grade Submission';
        const submission = submissionsData.find(s => s.id === submissionId);
        if (submission) {
            document.getElementById('submission-id').value = submission.id;
            document.getElementById('submission-scholar').value = submission.scholar_id;
            document.getElementById('submission-academic-year').value = submission.academic_year;
            document.getElementById('submission-semester').value = submission.semester;
            document.getElementById('submission-gwa').value = submission.gwa;
            document.getElementById('submission-units').value = submission.units_enrolled;
            document.getElementById('submission-failed').value = submission.failed_subjects;
            document.getElementById('submission-incomplete').value = submission.incomplete_subjects;
        }
    } else {
        title.textContent = 'Submit Grades';
    }
    
    modal.classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveSubmission();
    };
}

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // Academic year typically starts in August (month 8)
    if (month >= 8) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

async function saveSubmission() {
    const id = document.getElementById('submission-id').value;
    const scholarId = document.getElementById('submission-scholar').value;
    
    // Get scholar info for validation
    const scholar = scholarsData.find(s => s.id === scholarId);
    if (!scholar) {
        showToast('Please select a valid scholar', 'error');
        return;
    }
    
    const data = {
        scholar_id: scholarId,
        academic_year: document.getElementById('submission-academic-year').value.trim(),
        semester: document.getElementById('submission-semester').value,
        gwa: parseFloat(document.getElementById('submission-gwa').value),
        units_enrolled: parseInt(document.getElementById('submission-units').value),
        failed_subjects: parseInt(document.getElementById('submission-failed').value) || 0,
        incomplete_subjects: parseInt(document.getElementById('submission-incomplete').value) || 0,
        submission_status: 'Pending'
    };
    
    // Validation
    if (!data.academic_year) {
        showToast('Academic year is required', 'error');
        return;
    }
    if (isNaN(data.gwa) || data.gwa < 1.00 || data.gwa > 5.00) {
        showToast('GWA must be between 1.00 and 5.00', 'error');
        return;
    }
    if (isNaN(data.units_enrolled) || data.units_enrolled < 0) {
        showToast('Units enrolled cannot be negative', 'error');
        return;
    }
    if (data.failed_subjects < 0 || data.incomplete_subjects < 0) {
        showToast('Failed and incomplete subjects cannot be negative', 'error');
        return;
    }
    
    try {
        let error;
        if (id) {
            ({ error } = await supabase.from('grade_submissions').update(data).eq('id', id));
        } else {
            ({ error } = await supabase.from('grade_submissions').insert(data));
        }
        
        if (error) {
            if (error.code === '23505') {
                showToast('A submission for this scholar, academic year, and semester already exists', 'error');
            } else {
                throw error;
            }
            return;
        }
        
        showToast(id ? 'Submission updated successfully' : 'Grade submission created successfully', 'success');
        closeModal('submission-modal');
        await loadSubmissionsPage();
    } catch (err) {
        console.error('Error saving submission:', err);
        showToast('Error saving submission: ' + err.message, 'error');
    }
}

export async function verifySubmission(submissionId) {
    const submission = submissionsData.find(s => s.id === submissionId);
    if (!submission) return;
    
    // Show verification modal with details
    const modal = document.getElementById('verify-modal');
    const details = document.getElementById('verify-details');
    
    details.innerHTML = `
        <div class="compliance-card">
            <div class="compliance-header">
                <span class="compliance-title">Verification Details</span>
            </div>
            <div class="compliance-details">
                <div class="compliance-item">
                    <label>Scholar</label>
                    <span>${submission.scholars?.full_name}</span>
                </div>
                <div class="compliance-item">
                    <label>Student ID</label>
                    <span>${submission.scholars?.student_id}</span>
                </div>
                <div class="compliance-item">
                    <label>Program</label>
                    <span>${submission.scholars?.scholarship_programs?.program_name}</span>
                </div>
                <div class="compliance-item">
                    <label>Academic Year</label>
                    <span>${submission.academic_year}</span>
                </div>
                <div class="compliance-item">
                    <label>Semester</label>
                    <span>${submission.semester}</span>
                </div>
                <div class="compliance-item">
                    <label>GWA</label>
                    <span>${submission.gwa}</span>
                </div>
                <div class="compliance-item">
                    <label>Units Enrolled</label>
                    <span>${submission.units_enrolled}</span>
                </div>
                <div class="compliance-item">
                    <label>Failed Subjects</label>
                    <span>${submission.failed_subjects}</span>
                </div>
                <div class="compliance-item">
                    <label>Incomplete Subjects</label>
                    <span>${submission.incomplete_subjects}</span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    // Handle verify button
    document.getElementById('verify-btn').onclick = async () => {
        await performVerification(submissionId, 'Verified');
    };
    
    document.getElementById('return-btn').onclick = async () => {
        await performVerification(submissionId, 'Returned');
    };
}

async function performVerification(submissionId, status) {
    const { error } = await supabase
        .from('grade_submissions')
        .update({
            submission_status: status,
            verified_by: currentProfile?.id,
            verified_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    
    if (error) {
        showToast('Error: ' + error.message, 'error');
        return;
    }
    
    showToast(`Submission marked as ${status}`, 'success');
    closeModal('verify-modal');
    await loadSubmissionsPage();
}

export async function returnSubmission(submissionId) {
    await performVerification(submissionId, 'Returned');
}

export async function evaluateCompliance(submissionId) {
    const submission = submissionsData.find(s => s.id === submissionId);
    if (!submission || !submission.scholars?.scholarship_programs) {
        showToast('Cannot evaluate: missing program requirements', 'error');
        return;
    }
    
    const program = submission.scholars.scholarship_programs;
    const result = evaluateSubmissionAgainstRequirements(submission, program);
    
    const { error } = await supabase
        .from('grade_submissions')
        .update({
            compliance_result: result,
            evaluated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    
    if (error) {
        showToast('Error: ' + error.message, 'error');
        return;
    }
    
    // Also update scholar status
    const scholarStatus = result === 'Compliant' ? 'Compliant' : 'With Deficiency';
    await supabase.from('scholars').update({ status: scholarStatus }).eq('id', submission.scholar_id);
    
    showToast(`Compliance evaluation: ${result}`, result === 'Compliant' ? 'success' : 'warning');
    await loadSubmissionsPage();
}

function evaluateSubmissionAgainstRequirements(submission, program) {
    // BR-07: Scholar status must be based on the rules of the assigned scholarship program
    // Check GWA (lower is better in Philippine system)
    const gwaPass = submission.gwa <= program.required_gwa;
    
    // Check minimum units
    const unitsPass = submission.units_enrolled >= program.min_units;
    
    // Check failing grades policy
    const failingPass = program.allow_failing_grade || submission.failed_subjects === 0;
    
    // Check incomplete subjects (typically not allowed for compliance)
    const incompletePass = submission.incomplete_subjects === 0;
    
    const compliant = gwaPass && unitsPass && failingPass && incompletePass;
    
    return compliant ? 'Compliant' : 'With Deficiency';
}

function viewSubmissionDetails(submissionId) {
    const submission = submissionsData.find(s => s.id === submissionId);
    if (!submission) return;
    
    const program = submission.scholars?.scholarship_programs;
    const result = program ? evaluateSubmissionAgainstRequirements(submission, program) : 'N/A';
    
    alert(`Submission Details:
Scholar: ${submission.scholars?.full_name}
Student ID: ${submission.scholars?.student_id}
Program: ${program?.program_name}
Academic Year: ${submission.academic_year}
Semester: ${submission.semester}
GWA: ${submission.gwa} (Required: ≤${program?.required_gwa || 'N/A'})
Units: ${submission.units_enrolled} (Min: ${program?.min_units || 'N/A'})
Failed: ${submission.failed_subjects}
Incomplete: ${submission.incomplete_subjects}
Status: ${submission.submission_status}
Compliance: ${submission.compliance_result || result}
Submitted: ${formatDateTime(submission.submitted_at)}
Verified By: ${submission.profiles?.full_name || 'N/A'}
Verified At: ${formatDateTime(submission.verified_at)}
`);
}