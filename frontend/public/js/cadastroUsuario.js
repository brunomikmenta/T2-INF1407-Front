const backendAddress = 'http://127.0.0.1:8000/';

function getCookie(name) {
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }

    return '';
}

async function cadastrarUsuario(usuario) {
    const csrfToken = getCookie('csrftoken');

    const response = await fetch(`${backendAddress}api/users/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(usuario),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Falha ao cadastrar usuário: ${response.status}`);
    }

    return response;
}

const form = document.getElementById('cadastro-form');

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não conferem.');
            return;
        }

        try {
            await cadastrarUsuario({
                username,
                email,
                senha,
            });

            alert('Usuário cadastrado com sucesso.');
            window.location.href = './login.html';
        } catch (error) {
            if (error instanceof TypeError) {
                alert('Erro ao cadastrar usuário: não foi possível conectar ao backend (porta 8000).');
                return;
            }

            alert(`Erro ao cadastrar usuário: ${error.message}`);
        }
    });
}