// ============================================
// Supabase Configuration
// ============================================
// Replace with your Supabase project URL and anon key
export const SUPABASE_URL = 'https://cpafexwayfoogfqkamen.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_2ro4kPfeV37l0HQE-Tlcvw_2K_eQDFn';

// Create Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Helper Functions
// ============================================
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            // Profile missing, auto-create it using metadata from registration
            const role = user.user_metadata?.role || 'scholar';
            const fullName = user.user_metadata?.full_name || user.email;
            
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    full_name: fullName,
                    role: role
                })
                .select()
                .single();
                
            if (!insertError) {
                return newProfile;
            }
            console.error('Error auto-creating profile:', insertError);
        } else {
            console.error('Error fetching profile:', error);
        }
        return null;
    }
    return data;
}

export function isAdmin(profile) {
    return profile?.role === 'admin';
}

export function isStaff(profile) {
    return profile?.role === 'staff' || profile?.role === 'admin';
}

export function isScholar(profile) {
    return profile?.role === 'scholar';
}

export function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 12px 24px;
        border-radius: var(--radius);
        color: white;
        font-weight: 500;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100px); } }
`;
document.head.appendChild(style);