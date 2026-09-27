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
    const isRecovery = hash.get('type') === 'recovery' || query.get('type') === 'recovery';
    if (!callbackError && !isConfirmation && !isRecovery) return;

    const container = document.getElementById('alert-container');
    if (!container) return;
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    if (callbackError) {
        alert.textContent = `This email link could not be used: ${callbackError}. Please request a new email using the options below.`;
    } else {
        try {
            const client = await window.initializeSupabaseClient();
            const { data, error } = await client.auth.getSession();
            if (error || !data?.session) throw error || new Error('No verification session was received.');
            alert.className = 'alert alert-success';
            if (isRecovery) {
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('accountHelp').classList.add('hidden');
                document.getElementById('resetPasswordForm').classList.remove('hidden');
                alert.textContent = 'Reset link verified. Choose your new password below.';
            } else {
                alert.textContent = 'Email verified successfully. You can now sign in.';
            }
        } catch {
            alert.textContent = 'This email link could not be verified or has expired. Please request a new email using the options below.';
        }
    }
    container.replaceChildren(alert);
}

document.addEventListener('DOMContentLoaded', showLoginCallbackResult);
