// ============================================
// Authentication Module
// ============================================
import { supabase } from './supabase.js';
import { getCurrentProfile, isStaff, isAdmin, showToast } from './supabase.js';

export let currentUser = null;
export let currentProfile = null;

export async function initAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    
    if (user) {
        currentProfile = await getCurrentProfile();
        await updateUIForAuth();
    } else {
        showLoginPage();
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
            currentProfile = await getCurrentProfile();
            await updateUIForAuth();
        } else {
            currentProfile = null;
            showLoginPage();
        }
    });
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showLoginPage();
}

function showLoginPage() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('app-layout').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('active');
}

async function updateUIForAuth() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('hidden');
    document.getElementById('app-layout').classList.add('active');
    
    if (currentProfile) {
        document.getElementById('user-name').textContent = currentProfile.full_name;
        document.getElementById('user-role').textContent = currentProfile.role;
        document.getElementById('user-role').className = `role-badge ${currentProfile.role}`;
    }
    
    // Hide/show navigation based on role
    updateNavigationVisibility();
    
    // Load default page
    navigateTo('dashboard');
}

function updateNavigationVisibility() {
    const isStaffUser = isStaff(currentProfile);
    const isAdminUser = isAdmin(currentProfile);
    
    const navItems = {
        'scholars': isStaffUser,
        'programs': isAdminUser,
        'submissions': true,
        'compliance': isStaffUser
    };
    
    Object.entries(navItems).forEach(([page, visible]) => {
        const link = document.querySelector(`[data-page="${page}"]`);
        if (link) {
            link.parentElement.style.display = visible ? 'block' : 'none';
        }
    });
    
    // If current page is not visible, redirect to dashboard
    const currentPage = document.querySelector('.nav-link.active')?.dataset.page;
    if (currentPage && !navItems[currentPage]) {
        navigateTo('dashboard');
    }
}

export function navigateTo(page) {
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    
    // Load page content
    loadPage(page);
}

async function loadPage(page) {
    const content = document.getElementById('main-content');
    content.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    
    try {
        switch (page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'scholars':
                await loadScholarsPage();
                break;
            case 'programs':
                await loadProgramsPage();
                break;
            case 'submissions':
                await loadSubmissionsPage();
                break;
            case 'compliance':
                await loadCompliancePage();
                break;
            default:
                await loadDashboard();
        }
    } catch (error) {
        console.error('Error loading page:', error);
        content.innerHTML = `<div class="empty-state"><h3>Error loading page</h3><p>${error.message}</p></div>`;
    }
}

// Page loaders will be imported from separate modules
import { loadDashboard } from './pages/dashboard.js';
import { loadScholarsPage, openScholarModal, deleteScholar } from './pages/scholars.js';
import { loadProgramsPage, openProgramModal, deleteProgram } from './pages/programs.js';
import { loadSubmissionsPage, openSubmissionModal, verifySubmission, returnSubmission, evaluateCompliance, viewSubmissionDetails } from './pages/submissions.js';
import { loadCompliancePage } from './pages/compliance.js';

// Make functions globally available for inline handlers
window.navigateTo = navigateTo;
window.openScholarModal = openScholarModal;
window.deleteScholar = deleteScholar;
window.openProgramModal = openProgramModal;
window.deleteProgram = deleteProgram;
window.openSubmissionModal = openSubmissionModal;
window.verifySubmission = verifySubmission;
window.returnSubmission = returnSubmission;
window.evaluateCompliance = evaluateCompliance;
window.viewSubmissionDetails = viewSubmissionDetails;