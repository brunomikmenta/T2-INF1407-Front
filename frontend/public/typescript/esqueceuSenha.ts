import { backendAddress } from './constante';

addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('formulario') as HTMLFormElement;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const messageDiv = document.getElementById('message') as HTMLDivElement;
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        
        try {
                const response = await fetch(`${backendAddress}api/password-reset/`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

            const data = await response.json();
            

            if (response.ok) {
                const resetCode = data.reset_code as string | null;
                messageDiv.style.color = 'green';

                if (resetCode) {
                    localStorage.setItem('resetToken', resetCode);
                    messageDiv.textContent = `Foi solicitado a recuperação de senha para sua conta`;
                    setTimeout(() => {
                        location.href = `/esqueceuSenha/reset/`;
                    }, 1700);
                } else {
                    messageDiv.textContent = 'Se o e-mail existir, a recuperacao foi iniciada.';
                }
                
            } else {
                messageDiv.textContent = `Erro: ${data.detail || 'Falha na solicitacao.'}`;
            }
        
        } catch (error) {
            messageDiv.textContent = `Erro de rede: ${error}`;
        }
    });
});