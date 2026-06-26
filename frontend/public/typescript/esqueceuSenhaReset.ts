import { backendAddress } from './constante';

addEventListener('load', function() {
    const form = document.getElementById('formResetSenha') as HTMLFormElement;
    const senhaInput = document.getElementById('novaSenha') as HTMLInputElement;
    const senha2Input = document.getElementById('confirmarSenha') as HTMLInputElement;
    const message = document.getElementById('message') as HTMLDivElement;

    if (!form || !senhaInput || !senha2Input || !message) {
        return;
    }

    const token = localStorage.getItem('resetToken');

    if (!token) {
        message.textContent = 'Token de redefinicao nao encontrado. Solicite um novo.';
        message.style.color = 'red';
        setTimeout(() => {
            location.href = '/esqueceuSenha/';
        }, 2000);
        return;
    }

    form.addEventListener('submit', async function(evento) {
        evento.preventDefault();

        const senha = senhaInput.value;
        const senha2 = senha2Input.value;

        if (senha !== senha2) {
            message.textContent = 'As senhas nao coincidem.';
            message.style.color = 'red';
            return;
        }

        try {
            let response = await fetch(`${backendAddress}api/password-reset/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: token,
                    new_password: senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('resetToken');
                message.textContent = 'Senha alterada com sucesso! Faca login novamente';
                message.style.color = 'green';
                setTimeout(() => {
                    location.href = '/login/';
                }, 1700);
            } else {
                message.textContent = data.detail || 'Ocorreu um erro ao alterar a senha.';
                message.style.color = 'red';
            }
        } catch (error) {
            message.textContent = `Erro de rede: ${error}`;
            message.style.color = 'red';
        }
    });
});