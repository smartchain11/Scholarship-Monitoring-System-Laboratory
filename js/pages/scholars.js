// ============================================
// Scholars Page
// ============================================
import { supabase } from '../supabase.js';
import { currentProfile, isStaff, isAdmin, formatDate, showToast } from '../supabase.js';

let scholarsData = [];
let scholarshipPrograms = [];

export async function loadScholarsPage() {
    const content = document.getElementById('main-content');
    
    // Fetch data
    const [{ data: scholars }, { data: programs }] = await Promise.all([
        supabase.from('scholars').select(`
            *,
            scholarship_programs (program_name, required_gwa)
        `).order('created_at', { ascending: false }),
        supabase.from('scholarship_programs').select('*').eq('active', true).order('program_name')
    ]);
    
    scholarsData = scholars || [];
    scholarshipPrograms = programs || [];
    
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Scholars</h1>
                <p class="text-secondary">Manage scholar records</p>
            </div>
            ${isStaff(currentProfile) ? `
                <button class="btn btn-primary" onclick="openScholarModal()">
                    <span>+</span> Add Scholar
                </button>
            ` : ''}
        </div>
        
        <div class="search-filter-bar">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="scholar-search" placeholder="Search by Student ID or Name..." onkeyup="filterScholars()">
            </div>
            <div class="filter-group">
                <select id="scholar-program-filter" onchange="filterScholars()">
                    <option value="">All Programs</option>
                    ${scholarshipPrograms.map(p => `<option value="${p.id}">${p.program_name}</option>`).join('')}
                </select>
                <select id="scholar-status-filter" onchange="filterScholars()">
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Submission">Pending Submission</option>
                    <option value="For Verification">For Verification</option>
                    <option value="Compliant">Compliant</option>
                    <option value="With Deficiency">With Deficiency</option>
                    <option value="Probationary">Probationary</option>
                    <option value="For Renewal">For Renewal</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Disqualified">Disqualified</option>
                </select>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body" style="padding: 0;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Full Name</th>
                                <th>Degree Program</th>
                                <th>Year</th>
                                <th>Scholarship</th>
                                <th>Status</th>
                                <th>Created</th>
                                ${isStaff(currentProfile) ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="scholars-table-body">
                            ${renderScholarsRows(scholarsData)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderScholarsRows(scholars) {
    if (scholars.length === 0) {
        return `<tr><td colspan="8" class="empty-state" style="padding: 40px;"><div class="icon">👨‍🎓</div><h3>No scholars found</h3><p>Add a scholar to get started</p></td></tr>`;
    }
    
    return scholars.map(s => `
        <tr>
            <td>${s.student_id}</td>
            <td>${s.full_name}</td>
            <td>${s.degree_program}</td>
            <td>${s.year_level}</td>
            <td>${s.scholarship_programs?.program_name || 'N/A'}</td>
            <td><span class="status-badge ${s.status.toLowerCase().replace(' ', '-')}">${s.status}</span></td>
            <td>${formatDate(s.created_at)}</td>
            ${isStaff(currentProfile) ? `
                <td>
                    <button class="action-btn edit" onclick="openScholarModal('${s.id}')" title="Edit">✏️</button>
                    <button class="action-btn danger" onclick="deleteScholar('${s.id}')" title="Delete">🗑️</button>
                </td>
            ` : ''}
        </tr>
    `).join('');
}

window.filterScholars = function() {
    const search = document.getElementById('scholar-search').value.toLowerCase();
    const programFilter = document.getElementById('scholar-program-filter').value;
    const statusFilter = document.getElementById('scholar-status-filter').value;
    
    const filtered = scholarsData.filter(s => {
        const matchesSearch = s.student_id.toLowerCase().includes(search) || 
                             s.full_name.toLowerCase().includes(search);
        const matchesProgram = !programFilter || s.scholarship_id === programFilter;
        const matchesStatus = !statusFilter || s.status === statusFilter;
        return matchesSearch && matchesProgram && matchesStatus;
    });
    
    document.getElementById('scholars-table-body').innerHTML = renderScholarsRows(filtered);
};

export async function openScholarModal(scholarId = null) {
    // Populate scholarship dropdown
    const select = document.getElementById('scholar-scholarship');
    select.innerHTML = '<option value="">Select Scholarship Program</option>' +
        scholarshipPrograms.map(p => `<option value="${p.id}">${p.program_name} (GWA: ${p.required_gwa}, Units: ${p.min_units})</option>`).join('');
    
    const modal = document.getElementById('scholar-modal');
    const title = document.getElementById('scholar-modal-title');
    const form = document.getElementById('scholar-form');
    
    // Reset form
    form.reset();
    document.getElementById('scholar-id').value = '';
    
    if (scholarId) {
        title.textContent = 'Edit Scholar';
        const scholar = scholarsData.find(s => s.id === scholarId);
        if (scholar) {
            document.getElementById('scholar-id').value = scholar.id;
            document.getElementById('scholar-student-id').value = scholar.student_id;
            document.getElementById('scholar-full-name').value = scholar.full_name;
            document.getElementById('scholar-degree-program').value = scholar.degree_program;
            document.getElementById('scholar-year-level').value = scholar.year_level;
            document.getElementById('scholar-scholarship').value = scholar.scholarship_id;
            document.getElementById('scholar-status').value = scholar.status;
        }
    } else {
        title.textContent = 'Add Scholar';
        document.getElementById('scholar-status').value = 'Active';
    }
    
    modal.classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    // Handle form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveScholar();
    };
}

async function saveScholar() {
    const id = document.getElementById('scholar-id').value;
    const data = {
        student_id: document.getElementById('scholar-student-id').value.trim(),
        full_name: document.getElementById('scholar-full-name').value.trim(),
        degree_program: document.getElementById('scholar-degree-program').value.trim(),
        year_level: parseInt(document.getElementById('scholar-year-level').value),
        scholarship_id: document.getElementById('scholar-scholarship').value,
        status: document.getElementById('scholar-status').value
    };
    
    // Validation
    if (!data.student_id) {
        showToast('Student ID is required', 'error');
        return;
    }
    if (!data.scholarship_id) {
        showToast('Scholarship program is required', 'error');
        return;
    }
    
    try {
        let error;
        if (id) {
            ({ error } = await supabase.from('scholars').update(data).eq('id', id));
        } else {
            ({ error } = await supabase.from('scholars').insert(data));
        }
        
        if (error) {
            if (error.code === '23505') {
                showToast('Student ID already exists', 'error');
            } else {
                throw error;
            }
            return;
        }
        
        showToast(id ? 'Scholar updated successfully' : 'Scholar created successfully', 'success');
        closeModal('scholar-modal');
        await loadScholarsPage();
    } catch (err) {
        console.error('Error saving scholar:', err);
        showToast('Error saving scholar: ' + err.message, 'error');
    }
}

export async function deleteScholar(scholarId) {
    if (!confirm('Are you sure you want to delete this scholar? This will also delete all their grade submissions.')) {
        return;
    }
    
    try {
        const { error } = await supabase.from('scholars').delete().eq('id', scholarId);
        if (error) throw error;
        
        showToast('Scholar deleted successfully', 'success');
        await loadScholarsPage();
    } catch (err) {
        console.error('Error deleting scholar:', err);
        showToast('Error deleting scholar: ' + err.message, 'error');
    }
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
};

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    document.getElementById('modal-overlay').classList.add('hidden');
});

// Close modal on close button click
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        closeModal(modalId);
    });
});