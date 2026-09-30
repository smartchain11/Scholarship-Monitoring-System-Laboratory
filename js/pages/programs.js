// ============================================
// Scholarship Programs Page
// ============================================
import { supabase } from '../supabase.js';
import { currentProfile } from '../auth.js';
import { isAdmin, showToast } from '../supabase.js';

let programsData = [];

export async function loadProgramsPage() {
    const content = document.getElementById('main-content');
    
    const { data: programs } = await supabase
        .from('scholarship_programs')
        .select('*')
        .order('created_at', { ascending: false });
    
    programsData = programs || [];
    
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Scholarship Programs</h1>
                <p class="text-secondary">Configure scholarship requirements and academic standards</p>
            </div>
            ${isAdmin(currentProfile) ? `
                <button class="btn btn-primary" onclick="openProgramModal()">
                    <span>+</span> Add Program
                </button>
            ` : ''}
        </div>
        
        <div class="card">
            <div class="card-body" style="padding: 0;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Program Name</th>
                                <th>Required GWA</th>
                                <th>Min Units</th>
                                <th>Allow Failing</th>
                                <th>Status</th>
                                <th>Created</th>
                                ${isAdmin(currentProfile) ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${renderProgramsRows(programsData)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderProgramsRows(programs) {
    if (programs.length === 0) {
        return `<tr><td colspan="7" class="empty-state" style="padding: 40px;"><div class="icon">📋</div><h3>No programs yet</h3><p>Create a scholarship program to get started</p></td></tr>`;
    }
    
    return programs.map(p => `
        <tr>
            <td>${p.program_name}</td>
            <td>${p.required_gwa}</td>
            <td>${p.min_units}</td>
            <td><span class="status-badge ${p.allow_failing_grade ? 'compliant' : 'deficiency'}">${p.allow_failing_grade ? 'Yes' : 'No'}</span></td>
            <td><span class="status-badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Active' : 'Inactive'}</span></td>
            <td>${formatDate(p.created_at)}</td>
            ${isAdmin(currentProfile) ? `
                <td>
                    <button class="action-btn edit" onclick="openProgramModal('${p.id}')" title="Edit">✏️</button>
                    <button class="action-btn danger" onclick="deleteProgram('${p.id}')" title="Delete">🗑️</button>
                </td>
            ` : ''}
        </tr>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export async function openProgramModal(programId = null) {
    const modal = document.getElementById('program-modal');
    const title = document.getElementById('program-modal-title');
    const form = document.getElementById('program-form');
    
    form.reset();
    document.getElementById('program-id').value = '';
    
    if (programId) {
        title.textContent = 'Edit Scholarship Program';
        const program = programsData.find(p => p.id === programId);
        if (program) {
            document.getElementById('program-id').value = program.id;
            document.getElementById('program-name').value = program.program_name;
            document.getElementById('program-gwa').value = program.required_gwa;
            document.getElementById('program-units').value = program.min_units;
            document.getElementById('program-allow-failing').checked = program.allow_failing_grade;
            document.getElementById('program-active').checked = program.active;
        }
    } else {
        title.textContent = 'Add Scholarship Program';
        document.getElementById('program-active').checked = true;
    }
    
    modal.classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveProgram();
    };
}

async function saveProgram() {
    const id = document.getElementById('program-id').value;
    const data = {
        program_name: document.getElementById('program-name').value.trim(),
        required_gwa: parseFloat(document.getElementById('program-gwa').value),
        min_units: parseInt(document.getElementById('program-units').value),
        allow_failing_grade: document.getElementById('program-allow-failing').checked,
        active: document.getElementById('program-active').checked
    };
    
    if (!data.program_name) {
        showToast('Program name is required', 'error');
        return;
    }
    if (isNaN(data.required_gwa) || data.required_gwa < 1.00 || data.required_gwa > 5.00) {
        showToast('Required GWA must be between 1.00 and 5.00', 'error');
        return;
    }
    if (isNaN(data.min_units) || data.min_units < 1) {
        showToast('Minimum units must be at least 1', 'error');
        return;
    }
    
    try {
        let error;
        if (id) {
            ({ error } = await supabase.from('scholarship_programs').update(data).eq('id', id));
        } else {
            ({ error } = await supabase.from('scholarship_programs').insert(data));
        }
        
        if (error) {
            if (error.code === '23505') {
                showToast('Program name already exists', 'error');
            } else {
                throw error;
            }
            return;
        }
        
        showToast(id ? 'Program updated successfully' : 'Program created successfully', 'success');
        closeModal('program-modal');
        await loadProgramsPage();
    } catch (err) {
        console.error('Error saving program:', err);
        showToast('Error saving program: ' + err.message, 'error');
    }
}

export async function deleteProgram(programId) {
    // Check if program has scholars
    const { data: scholars } = await supabase.from('scholars').select('id').eq('scholarship_id', programId).limit(1);
    
    if (scholars && scholars.length > 0) {
        showToast('Cannot delete program with assigned scholars', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
        const { error } = await supabase.from('scholarship_programs').delete().eq('id', programId);
        if (error) throw error;
        
        showToast('Program deleted successfully', 'success');
        await loadProgramsPage();
    } catch (err) {
        console.error('Error deleting program:', err);
        showToast('Error deleting program: ' + err.message, 'error');
    }
}