const backendAddress = '/home';

window.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');

    if (!authBtn) {
        return;
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authBtn.textContent = 'Logout';
        authBtn.setAttribute('href', '/');
        authBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await logout();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = '/';
        });
        return;
    }

    authBtn.textContent = 'Login';
    authBtn.setAttribute('href', '/login/');
});

async function logout() {
    try {
        await fetch(`${backendAddress}api/logout/`, {
            method: 'POST',
        });
    } catch (error) {
        // Ignore network errors and clear local state anyway.
    }
}