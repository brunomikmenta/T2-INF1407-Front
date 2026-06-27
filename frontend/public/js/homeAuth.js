const backendAddress = 'http://127.0.0.1:8000/';

window.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const profileBtn = document.getElementById('perfil-btn');

    if (!authBtn) {
        return;
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authBtn.textContent = 'Logout';
        authBtn.setAttribute('href', './index.html');
        if (profileBtn) {
            profileBtn.setAttribute('href', './perfil.html');
        }
        authBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await logout();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = './index.html';
        });
        return;
    }

    authBtn.textContent = 'Login';
    authBtn.setAttribute('href', './login.html');
    if (profileBtn) {
        profileBtn.setAttribute('href', './login.html');
    }
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