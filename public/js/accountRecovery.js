function accountMessage(message, success = false) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${success ? 'success' : 'error'}`;
    alert.textContent = message;
    document.getElementById('alert-container').replaceChildren(alert);
}

async function requestAccountEmail(type) {
    const email = document.getElementById('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        accountMessage('Please enter your registered email address above. A phone number cannot receive this email.');
        return;
    }
    const buttons = ['forgotPasswordBtn', 'resendConfirmationBtn'].map(id => document.getElementById(id));
    if (buttons.some(button => button.disabled)) return;
    buttons.forEach(button => { button.disabled = true; });
    let accepted = false;
    try {
        const client = await window.initializeSupabaseClient();
        const redirectTo = window.TUTOR_CONFIG.authRedirectUrl;
        const result = type === 'recovery'
            ? await client.auth.resetPasswordForEmail(email, { redirectTo })
            : await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
        if (result.error) throw result.error;
        accepted = true;
        accountMessage(type === 'recovery'
            ? 'If this email is registered, a password reset email has been sent. Please check your inbox and spam folder.'
            : 'If this account is awaiting confirmation, a confirmation email has been sent. Please check your inbox and spam folder.', true);
    } catch (error) {
        accountMessage(`Unable to send email: ${error.message || 'Please try again later.'}`);
    } finally {
        // Avoid duplicate requests while Supabase's email cooldown is active.
        if (accepted) setTimeout(() => buttons.forEach(button => { button.disabled = false; }), 60000);
        else buttons.forEach(button => { button.disabled = false; });
    }
}

async function saveRecoveredPassword(event) {
    event.preventDefault();
    const button = document.getElementById('resetPasswordBtn');
    if (button.disabled) return;
    const password = document.getElementById('newPassword').value;
    if (password.length < 6) return accountMessage('Use a password with at least 6 characters.');
    if (password !== document.getElementById('confirmNewPassword').value) return accountMessage('Passwords do not match.');
    button.disabled = true;
    try {
        const client = await window.initializeSupabaseClient();
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError || !data?.session) throw new Error('Your reset link has expired. Request a new password reset email.');
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        document.getElementById('resetPasswordForm').reset();
        document.getElementById('resetPasswordForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('accountHelp').classList.remove('hidden');
        const { error: signOutError } = await client.auth.signOut({ scope: 'local' });
        if (!signOutError) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
        }
        accountMessage('Password updated successfully. Sign in with your new password.', true);
    } catch (error) {
        accountMessage(error.message || 'Unable to update your password. Please try again.');
    } finally {
        button.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgotPasswordBtn').addEventListener('click', () => requestAccountEmail('recovery'));
    document.getElementById('resendConfirmationBtn').addEventListener('click', () => requestAccountEmail('signup'));
    document.getElementById('resetPasswordForm').addEventListener('submit', saveRecoveredPassword);
});
