const backendAddress = 'http://127.0.0.1:8000/';

window.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('formulario');
	const messageDiv = document.getElementById('message');

	if (!form || !messageDiv) {
		return;
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const emailInput = document.getElementById('email');
		const email = emailInput ? emailInput.value.trim() : '';

		if (!email) {
			messageDiv.textContent = 'Informe um e-mail valido.';
			messageDiv.style.color = 'red';
			return;
		}

		try {
			const response = await fetch(`${backendAddress}api/password-reset/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				messageDiv.textContent = data.detail || 'Erro ao solicitar redefinicao de senha.';
				messageDiv.style.color = 'red';
				return;
			}

			const resetCode = data.reset_code;
			messageDiv.style.color = 'green';

			if (resetCode) {
				localStorage.setItem('resetToken', resetCode);
				messageDiv.textContent = `Foi solicitado a recuperação de senha para sua conta.`;
				setTimeout(() => {
					window.location.href = './esqueceuSenhaReset.html';
				}, 1700);
			} else {
				messageDiv.textContent = 'Se o e-mail existir, a recuperacao foi iniciada.';
			}
		} catch (error) {
			messageDiv.textContent = `Erro de rede: ${error.message || error}`;
			messageDiv.style.color = 'red';
		}
	});
});