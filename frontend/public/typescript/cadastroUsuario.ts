import { backendAddress } from './constante';

function getCookie(name: string): string {
	const cookieValue = `; ${document.cookie}`;
	const parts = cookieValue.split(`; ${name}=`);

	if (parts.length === 2) {
		return parts.pop()!.split(';').shift() ?? '';
	}

	return '';
}

export interface UsuarioCadastro {
	username: string;
	firstName?: string;
	lastName?: string;
	gender?: string;
	email: string;
	senha: string;
}

export async function cadastrarUsuario(usuario: UsuarioCadastro): Promise<Response> {
	const csrfToken = getCookie('csrftoken');

	const response = await fetch(`${backendAddress}api/users/`, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify(usuario),
	});

	if (!response.ok) {
		throw new Error(`Falha ao cadastrar usuário: ${response.status}`);
	}

	return response;
}