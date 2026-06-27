const backendCandidates = ['http://localhost:8000/', 'http://127.0.0.1:8000/'];

function getOrderedBackends() {
    const saved = localStorage.getItem('activeBackendAddress');

    if (!saved || !backendCandidates.includes(saved)) {
        return backendCandidates;
    }

    return [saved, ...backendCandidates.filter((host) => host !== saved)];
}

async function apiFetch(path, options = {}) {
    const hosts = getOrderedBackends();
    let lastResponse = null;

    for (const backendAddress of hosts) {
        try {
            const response = await fetch(`${backendAddress}${path}`, {
                credentials: 'include',
                ...options,
            });

            lastResponse = response;

            if (response.ok) {
                localStorage.setItem('activeBackendAddress', backendAddress);
                return response;
            }

            if (response.status !== 401) {
                localStorage.setItem('activeBackendAddress', backendAddress);
                return response;
            }
        } catch (error) {
            // Try next host.
        }
    }

    if (lastResponse) {
        return lastResponse;
    }

    throw new Error('Falha de rede ao conectar no backend.');
}

function buildAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
}

function showFeedback(message, type = 'error') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }

    alert(message);
}

function toggleElement(element, shouldShow) {
    if (!element) {
        return;
    }

    if (shouldShow) {
        element.classList.remove('is-hidden');
    } else {
        element.classList.add('is-hidden');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const playlistView = document.getElementById('profile-playlist-view');
    const editView = document.getElementById('profile-edit-view');
    const btnShowPlaylist = document.getElementById('btn-show-playlist');
    const btnShowEdit = document.getElementById('btn-show-edit');

    const emptyState = document.getElementById('playlist-empty-state');
    const playlistFormWrapper = document.getElementById('playlist-form-wrapper');
    const playlistTableWrapper = document.getElementById('playlist-table-wrapper');
    const openPlaylistFormBtn = document.getElementById('btn-open-playlist-form');
    const cancelPlaylistBtn = document.getElementById('btn-cancel-playlist');
    const playlistForm = document.getElementById('playlist-form');
    const playlistTableBody = document.getElementById('playlist-tbody');

    const profileForm = document.getElementById('profile-form');
    const profileMessage = document.getElementById('profile-message');
    const sidebarUsername = document.getElementById('profile-username');

    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profileFirstNameInput = document.getElementById('profile-first-name');
    const profileLastNameInput = document.getElementById('profile-last-name');
    const profileGenderInput = document.getElementById('profile-gender');

    const setProfileMessage = (text, color = 'white') => {
        if (!profileMessage) {
            return;
        }

        profileMessage.textContent = text;
        profileMessage.style.color = color;
    };

    const setPanel = (panel) => {
        const isPlaylist = panel === 'playlist';

        toggleElement(playlistView, isPlaylist);
        toggleElement(editView, !isPlaylist);

        btnShowPlaylist?.classList.toggle('is-active', isPlaylist);
        btnShowEdit?.classList.toggle('is-active', !isPlaylist);
    };

    const renderPlaylistTable = (songs) => {
        if (!playlistTableBody) {
            return;
        }

        playlistTableBody.innerHTML = '';

        if (!Array.isArray(songs) || songs.length === 0) {
            toggleElement(emptyState, true);
            toggleElement(playlistTableWrapper, false);
            toggleElement(playlistFormWrapper, false);
            return;
        }

        songs.forEach((song, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${song.slot || index + 1}</td>
                <td>${song.name || '-'}</td>
                <td>${song.artist || '-'}</td>
                <td>${song.gender || '-'}</td>
                <td>
                    <button type="button" class="playlist-action-btn" data-action="edit" data-song-id="${song.id || ''}" data-song-name="${song.name || ''}" data-song-artist="${song.artist || ''}" data-song-gender="${song.gender || ''}">Editar</button>
                    <button type="button" class="playlist-action-btn danger" data-action="delete" data-song-id="${song.id || ''}">Deletar</button>
                </td>
            `;
            playlistTableBody.appendChild(row);
        });

        toggleElement(emptyState, false);
        toggleElement(playlistTableWrapper, true);
    };

    const setProfileFields = (data) => {
        const username = data.username || '';
        const email = data.email || '';
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const gender = data.gender || '';

        if (profileNameInput) profileNameInput.value = username;
        if (profileEmailInput) profileEmailInput.value = email;
        if (profileFirstNameInput) profileFirstNameInput.value = firstName;
        if (profileLastNameInput) profileLastNameInput.value = lastName;
        if (profileGenderInput) profileGenderInput.value = gender;
        if (sidebarUsername) sidebarUsername.textContent = username || 'Usuário';

        if (username) {
            localStorage.setItem('username', username);
        }
    };

    const loadProfile = async () => {
        try {
            const profileResponse = await apiFetch('api/profile/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });

            if (!profileResponse.ok) {
                localStorage.removeItem('isLoggedIn');
                setProfileMessage('Sessao expirada. Faca login novamente.', 'red');
                showFeedback('Sessao expirada. Faca login novamente.', 'error');
                return;
            }

            const data = await profileResponse.json();
            setProfileFields(data);
        } catch (error) {
            setProfileMessage('Nao foi possivel carregar seu perfil.', 'red');
        }
    };

    const loadPlaylist = async () => {
        try {
            const response = await apiFetch('api/playlist/', {
                method: 'GET',
                headers: buildAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                showFeedback(errorData.detail || 'Nao foi possivel carregar a playlist.', 'error');
                return;
            }

            const data = await response.json();
            renderPlaylistTable(data.songs || []);
        } catch (error) {
            showFeedback('Erro de rede ao carregar playlist.', 'error');
        }
    };

    const handleEditSong = async (button) => {
        const songId = button?.dataset?.songId;

        if (!songId) {
            showFeedback('Musica invalida para edicao.', 'error');
            return;
        }

        const currentName = button.dataset.songName || '';
        const currentArtist = button.dataset.songArtist || '';
        const currentGender = button.dataset.songGender || '';

        const name = window.prompt('Nome da musica:', currentName);
        if (name === null) return;

        const artist = window.prompt('Artista:', currentArtist);
        if (artist === null) return;

        const gender = window.prompt('Genero:', currentGender);
        if (gender === null) return;

        if (!name.trim() || !artist.trim() || !gender.trim()) {
            showFeedback('Nome, artista e genero sao obrigatorios.', 'error');
            return;
        }

        try {
            const response = await apiFetch(`api/playlist/${songId}/`, {
                method: 'PUT',
                headers: buildAuthHeaders(),
                body: JSON.stringify({
                    name: name.trim(),
                    artist: artist.trim(),
                    gender: gender.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao editar musica.', 'error');
                return;
            }

            showFeedback(data.detail || 'Musica atualizada com sucesso.', 'success');
            await loadPlaylist();
        } catch (error) {
            showFeedback('Erro de rede ao editar musica.', 'error');
        }
    };

    const handleDeleteSong = async (button) => {
        const songId = button?.dataset?.songId;

        if (!songId) {
            showFeedback('Musica invalida para exclusao.', 'error');
            return;
        }

        const confirmed = window.confirm('Deseja realmente remover esta musica da playlist?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiFetch(`api/playlist/${songId}/`, {
                method: 'DELETE',
                headers: buildAuthHeaders(),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao remover musica.', 'error');
                return;
            }

            showFeedback(data.detail || 'Musica removida com sucesso.', 'success');
            await loadPlaylist();
        } catch (error) {
            showFeedback('Erro de rede ao remover musica.', 'error');
        }
    };

    const getSongsFromForm = () => {
        const songs = [];

        for (let i = 1; i <= 5; i += 1) {
            const nameInput = document.querySelector(`[data-song-field="name"][data-song-index="${i}"]`);
            const artistInput = document.querySelector(`[data-song-field="artist"][data-song-index="${i}"]`);
            const genderInput = document.querySelector(`[data-song-field="gender"][data-song-index="${i}"]`);

            songs.push({
                name: (nameInput?.value || '').trim(),
                artist: (artistInput?.value || '').trim(),
                gender: (genderInput?.value || '').trim(),
            });
        }

        return songs;
    };

    btnShowPlaylist?.addEventListener('click', () => setPanel('playlist'));
    btnShowEdit?.addEventListener('click', () => setPanel('edit'));

    openPlaylistFormBtn?.addEventListener('click', () => {
        toggleElement(playlistFormWrapper, true);
        toggleElement(emptyState, false);
    });

    cancelPlaylistBtn?.addEventListener('click', () => {
        toggleElement(playlistFormWrapper, false);
    });

    profileForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            username: profileNameInput?.value?.trim() || '',
            email: profileEmailInput?.value?.trim() || '',
            firstName: profileFirstNameInput?.value?.trim() || '',
            lastName: profileLastNameInput?.value?.trim() || '',
            gender: profileGenderInput?.value || '',
        };

        try {
            const response = await apiFetch('api/profile/', {
                method: 'PUT',
                headers: buildAuthHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setProfileMessage(data.detail || 'Erro ao salvar perfil.', 'red');
                return;
            }

            setProfileFields(data);
            setProfileMessage('Perfil atualizado com sucesso.', '#4ade80');
            showFeedback('Perfil atualizado com sucesso.', 'success');
        } catch (error) {
            setProfileMessage('Erro de rede ao salvar perfil.', 'red');
        }
    });

    playlistForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const songs = getSongsFromForm();
        const hasEmpty = songs.some((song) => !song.name || !song.artist || !song.gender);

        if (hasEmpty) {
            showFeedback('Preencha os 3 campos de cada uma das 5 musicas.', 'error');
            return;
        }

        try {
            const response = await apiFetch('api/playlist/', {
                method: 'POST',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ songs }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showFeedback(data.detail || 'Erro ao salvar playlist.', 'error');
                return;
            }

            renderPlaylistTable(data.songs || []);
            toggleElement(playlistFormWrapper, false);
            playlistForm.reset();
            showFeedback('Playlist salva com sucesso.', 'success');
        } catch (error) {
            showFeedback('Erro de rede ao salvar playlist.', 'error');
        }
    });

    playlistTableBody?.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');

        if (!button) {
            return;
        }

        const action = button.dataset.action;

        if (action === 'edit') {
            await handleEditSong(button);
            return;
        }

        if (action === 'delete') {
            await handleDeleteSong(button);
        }
    });

    setPanel('playlist');
    loadProfile();
    loadPlaylist();
});
