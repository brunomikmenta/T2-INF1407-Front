const backendAddress = '/';

window.addEventListener('DOMContentLoaded', () => {
    const songView = document.getElementById('profile-songs-view');
    const editView = document.getElementById('profile-edit-view');
    const btnSongs = document.getElementById('btn-show-songs');
    const btnEdit = document.getElementById('btn-show-edit');
    const profileForm = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');
    const usernameBadge = document.getElementById('profile-username');
    const nameField = document.getElementById('profile-name');
    const emailField = document.getElementById('profile-email');
    const firstNameField = document.getElementById('profile-first-name');
    const lastNameField = document.getElementById('profile-last-name');
    const genderField = document.getElementById('profile-gender');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        window.location.href = '/login/';
        return;
    }

    const showSongs = () => {
        songView?.classList.remove('is-hidden');
        editView?.classList.add('is-hidden');
        btnSongs?.classList.add('is-active');
        btnEdit?.classList.remove('is-active');
    };

    const showEdit = () => {
        songView?.classList.add('is-hidden');
        editView?.classList.remove('is-hidden');
        btnSongs?.classList.remove('is-active');
        btnEdit?.classList.add('is-active');
    };

    btnSongs?.addEventListener('click', showSongs);
    btnEdit?.addEventListener('click', showEdit);

    showSongs();

    const username = localStorage.getItem('username') || 'Usuário';
    if (usernameBadge) {
        usernameBadge.textContent = username;
    }

    const loadProfile = async () => {
        try {
            const response = await fetch(`${backendAddress}api/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                window.location.href = '/login/';
                return;
            }

            const data = await response.json();

            if (nameField) nameField.value = data.username || '';
            if (emailField) emailField.value = data.email || '';
            if (firstNameField) firstNameField.value = data.firstName || '';
            if (lastNameField) lastNameField.value = data.lastName || '';
            if (genderField) genderField.value = data.gender || '';
        } catch (error) {
            if (message) {
                message.textContent = 'Nao foi possivel carregar seu perfil.';
                message.style.color = 'red';
            }
        }
    };

    loadProfile();

    profileForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            username: nameField?.value.trim() || '',
            email: emailField?.value.trim() || '',
            firstName: firstNameField?.value.trim() || '',
            lastName: lastNameField?.value.trim() || '',
            gender: genderField?.value || '',
        };

        try {
            const response = await fetch(`${backendAddress}api/profile/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (message) {
                    message.textContent = data.detail || 'Nao foi possivel atualizar o perfil.';
                    message.style.color = 'red';
                }
                return;
            }

            localStorage.setItem('username', data.username || payload.username);
            if (usernameBadge) {
                usernameBadge.textContent = data.username || payload.username;
            }

            if (message) {
                message.textContent = 'Perfil atualizado com sucesso.';
                message.style.color = 'green';
            }
        } catch (error) {
            if (message) {
                message.textContent = 'Erro de rede ao atualizar o perfil.';
                message.style.color = 'red';
            }
        }
    });
});