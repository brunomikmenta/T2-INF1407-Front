const backendAddress = '/';

window.onload = () => {
    const form = document.getElementById('loginForm');
    const msg = document.getElementById('msg');

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        try {
            const loginResult = await login(username, password);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', loginResult.username);
            window.location.href = '/';
        } catch (error) {
            if (msg) {
                msg.textContent = error.message || 'Usuário ou senha inválidos';
            }
        }
    });
};

async function login(username, password) {
    const response = await fetch(`${backendAddress}api/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Login inválido');
    }

    return data;
}