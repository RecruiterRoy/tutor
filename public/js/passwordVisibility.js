document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="password"]').forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        input.style.paddingRight = '4.5rem';
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Show';
        button.setAttribute('aria-label', 'Show password');
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-controls', input.id);
        button.style.cssText = 'position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);background:transparent;border:0;color:#4f46e5;cursor:pointer;padding:0.3rem;font:inherit;font-size:0.875rem';
        button.addEventListener('click', () => {
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            button.textContent = show ? 'Hide' : 'Show';
            button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
            button.setAttribute('aria-pressed', String(show));
        });
        wrapper.appendChild(button);
    });
});
