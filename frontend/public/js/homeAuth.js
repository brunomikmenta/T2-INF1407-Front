const backendCandidates = ['http://localhost:8000/', 'http://127.0.0.1:8000/'];

function getOrderedBackends() {
    const saved = localStorage.getItem('activeBackendAddress');

    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }

    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}

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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
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
        const accessToken = localStorage.getItem('accessToken');
        const headers = {};

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        for (const backendAddress of getOrderedBackends()) {
            try {
                const response = await fetch(`${backendAddress}api/logout/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers,
                });

                if (response.ok) {
                    localStorage.setItem('activeBackendAddress', backendAddress);
                    break;
                }
            } catch (error) {
                // Try next host.
            }
        }
    } catch (error) {
        // Ignore network errors and clear local state anyway.
    }
}