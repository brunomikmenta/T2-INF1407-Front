import { backendAddress } from './constante';

interface LoginResposta {
    success: boolean;
    username: string;
}

window.onload = () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    const msg = document.getElementById('msg') as HTMLDivElement | null;

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement).value.trim();
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const loginResult = await login(username, password);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', loginResult.username);
            window.location.href = '/';
        } catch (error) {
            if (msg) {
                msg.textContent = 'Usuário ou senha inválidos';
            }
        }
    });
};

async function login(username: string, password: string): Promise<LoginResposta> {
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

    return data as LoginResposta;
}