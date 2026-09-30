// ============================================
// Main Application Entry Point
// ============================================
import { initAuth, logout, navigateTo } from './auth.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize authentication
    await initAuth();
    
    // Set up navigation
    setupNavigation();
    
    // Set up login form
    setupLoginForm();
    
    // Set up logout
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('modal-overlay').classList.add('hidden');
        }
    });
});

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        errorEl.classList.add('hidden');
        
        try {
            const { error } = await import('./supabase.js').then(m => m.supabase.auth.signInWithPassword({
                email,
                password
            }));
            
            if (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        } catch (err) {
            errorEl.textContent = 'Login failed: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    });
}

// Export for global access
window.navigateTo = navigateTo;