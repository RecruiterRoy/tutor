// Display email-confirmation results inside the existing login alert area.
// Supabase's client handles the session tokens; do not log or store them here.
// Capture callback parameters before Supabase consumes and clears the URL hash.
const loginCallbackHash = new URLSearchParams(window.location.hash.slice(1));
const loginCallbackQuery = new URLSearchParams(window.location.search);
async function showLoginCallbackResult() {
    const hash = loginCallbackHash;
    const query = loginCallbackQuery;
    const callbackError = hash.get('error_description') || query.get('error_description')
        || hash.get('error') || query.get('error');
    const isConfirmation = hash.get('type') === 'signup' || query.get('type') === 'signup';
    if (!callbackError && !isConfirmation) return;

    const container = document.getElementById('alert-container');
    if (!container) return;
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    if (callbackError) {
        alert.textContent = `Email verification could not be completed: ${callbackError}. Please use the latest confirmation email.`;
    } else {
        try {
            const client = await window.initializeSupabaseClient();
            const { data, error } = await client.auth.getSession();
            if (error || !data?.session) throw error || new Error('No verification session was received.');
            alert.className = 'alert alert-success';
            alert.textContent = 'Email verified successfully. You can now sign in.';
        } catch {
            alert.textContent = 'Email verification could not be confirmed. Please try signing in, or use the latest confirmation email.';
        }
    }
    container.replaceChildren(alert);
}

document.addEventListener('DOMContentLoaded', showLoginCallbackResult);
