// ============================================
// Dashboard Page
// ============================================
import { supabase } from '../supabase.js';
import { currentProfile, isStaff, isAdmin, formatDate, showToast } from '../supabase.js';

export async function loadDashboard() {
    const content = document.getElementById('main-content');
    
    // Fetch stats
    const [
        { count: totalScholars },
        { count: pendingSubmissions },
        { count: verifiedSubmissions },
        { count: compliantScholars },
        { count: deficiencyScholars }
    ] = await Promise.all([
        supabase.from('scholars').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('grade_submissions').select('*', { count: 'exact', head: true }).eq('submission_status', 'Pending'),
        supabase.from('grade_submissions').select('*', { count: 'exact', head: true }).eq('submission_status', 'Verified'),
        supabase.from('grade_submissions').select('*', { count: 'exact', head: true }).eq('compliance_result', 'Compliant'),
        supabase.from('grade_submissions').select('*', { count: 'exact', head: true }).eq('compliance_result', 'With Deficiency')
    ]);
    
    // Fetch recent submissions
    const { data: recentSubmissions } = await supabase
        .from('grade_submissions')
        .select(`
            *,
            scholars (student_id, full_name),
            profiles!grade_submissions_verified_by_fkey (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
    
    content.innerHTML = `
        <div class="page-header">
            <h1>Dashboard</h1>
            <p class="text-secondary">Overview of scholarship monitoring system</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="stat-icon">👨‍🎓</div>
                <div class="stat-info">
                    <h3>${totalScholars || 0}</h3>
                    <p>Total Active Scholars</p>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">⏳</div>
                <div class="stat-info">
                    <h3>${pendingSubmissions || 0}</h3>
                    <p>Pending Submissions</p>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                    <h3>${verifiedSubmissions || 0}</h3>
                    <p>Verified Submissions</p>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                    <h3>${compliantScholars || 0}</h3>
                    <p>Compliant Scholars</p>
                </div>
            </div>
            <div class="stat-card danger">
                <div class="stat-icon">⚠️</div>
                <div class="stat-info">
                    <h3>${deficiencyScholars || 0}</h3>
                    <p>With Deficiency</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2>Recent Grade Submissions</h2>
                ${isStaff(currentProfile) ? '<a href="#" class="btn btn-primary btn-sm" onclick="navigateTo(\'submissions\')">View All</a>' : ''}
            </div>
            <div class="card-body">
                ${renderSubmissionsTable(recentSubmissions || [])}
            </div>
        </div>
    `;
}

function renderSubmissionsTable(submissions) {
    if (submissions.length === 0) {
        return `<div class="empty-state"><div class="icon">📝</div><h3>No submissions yet</h3><p>Grade submissions will appear here</p></div>`;
    }
    
    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Scholar</th>
                        <th>Student ID</th>
                        <th>Academic Year</th>
                        <th>Semester</th>
                        <th>GWA</th>
                        <th>Status</th>
                        <th>Compliance</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    ${submissions.map(s => `
                        <tr>
                            <td>${s.scholars?.full_name || 'N/A'}</td>
                            <td>${s.scholars?.student_id || 'N/A'}</td>
                            <td>${s.academic_year}</td>
                            <td>${s.semester}</td>
                            <td>${s.gwa}</td>
                            <td><span class="status-badge ${s.submission_status.toLowerCase()}">${s.submission_status}</span></td>
                            <td>${s.compliance_result ? `<span class="status-badge ${s.compliance_result.toLowerCase().replace(' ', '-')}">${s.compliance_result}</span>` : '-'}</td>
                            <td>${formatDate(s.submitted_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}