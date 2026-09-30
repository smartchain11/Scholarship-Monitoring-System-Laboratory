// ============================================
// Main Application Entry Point
// ============================================
import { initAuth, logout, navigateTo } from './auth.js';
import { supabase, showToast } from './supabase.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Set up navigation
    setupNavigation();
    
    // Set up login form
    setupLoginForm();
    
    // Set up register form
    setupRegisterForm();
    
    // Set up auth tabs
    setupAuthTabs();
    
    // Set up logout
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('modal-overlay').classList.add('hidden');
        }
    });

    // Initialize authentication last so UI is ready
    try {
        await initAuth();
    } catch (err) {
        console.error("Auth init error:", err);
    }
});

function setupAuthTabs() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            // Toggle active tab
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle forms
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            if (target === 'login') {
                document.getElementById('login-form').classList.add('active');
            } else {
                document.getElementById('register-form').classList.add('active');
            }
            
            // Clear messages
            document.getElementById('login-error').classList.add('hidden');
            document.getElementById('register-success').classList.add('hidden');
        });
    });
}

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
        document.getElementById('register-success').classList.add('hidden');
        
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
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

function setupRegisterForm() {
    const form = document.getElementById('register-form');
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('register-success');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('reg-full-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const role = document.getElementById('reg-role').value;
        
        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');
        
        // Validation
        if (!fullName) {
            errorEl.textContent = 'Full name is required';
            errorEl.classList.remove('hidden');
            return;
        }
        
        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.remove('hidden');
            return;
        }
        
        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.classList.remove('hidden');
            return;
        }
        
        try {
            // Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });
            
            if (error) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
                return;
            }
            
            // Insert profile record
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        full_name: fullName,
                        role: role
                    });
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }
            
            // Show success message
            successEl.textContent = 'Account created successfully! You can now sign in.';
            successEl.classList.remove('hidden');
            form.reset();
            
            // Switch to login tab after a brief delay
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 2000);
            
        } catch (err) {
            errorEl.textContent = 'Registration failed: ' + err.message;
            errorEl.classList.remove('hidden');
        }
    });
}

// Export for global access
window.navigateTo = navigateTo;