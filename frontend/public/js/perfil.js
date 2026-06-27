const backendAddress = 'http://127.0.0.1:8000/';

window.addEventListener('DOMContentLoaded', () => {
    const profileTitle = document.getElementById('profile-name-title');
    const songListEmpty = document.getElementById('song-list-empty');
    const songListLoading = document.getElementById('song-list-loading');
    const songListTable = document.getElementById('song-list-table');
    const songListBody = document.getElementById('song-list-body');
    const songListMessage = document.getElementById('song-list-message');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        window.location.href = '/login/';
        return;
    }

    const setMessage = (element, text, color = 'white') => {
        if (!element) return;
        element.textContent = text;
        element.style.color = color;
    };

    const renderSongList = (songs) => {
        if (!songListBody) return;
        songListBody.innerHTML = '';

        if (!songs || songs.length === 0) {
            songListTable?.classList.add('d-none');
            songListEmpty?.classList.remove('is-hidden');
            return;
        }

        songListTable?.classList.remove('d-none');
        songListEmpty?.classList.add('is-hidden');

        songs.forEach((song, index) => {
            const tr = document.createElement('tr');
            const id = song.id || '';
            const title = song.name || song.title || 'Sem título';
            const artist = song.artist || 'Desconhecido';
            const genre = song.gender || song.genre || '-';

            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td><strong>${title}</strong></td>
                <td>${artist}</td>
                <td>${genre}</td>
                <td>
                    <a href="/editsong/${id}/">Editar</a> |
                    <a href="/deletesong/${id}/">Deletar</a>
                </td>
            `;

            songListBody.appendChild(tr);
        });
    };

    const loadProfile = async () => {
        try {
            const response = await fetch(`${backendAddress}api/profile/`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                window.location.href = '/login/';
                return;
            }

            const data = await response.json();
            const username = data.username || data.user?.username || localStorage.getItem('username') || 'Usuário';

            if (profileTitle) {
                profileTitle.textContent = username;
            }

            localStorage.setItem('username', username);
        } catch (error) {
            setMessage(songListMessage, 'Não foi possível carregar seu perfil.', 'red');
        }
    };

    const loadSongs = async () => {
        songListLoading?.classList.remove('is-hidden');
        setMessage(songListMessage, '');

        try {
            const response = await fetch(`${backendAddress}api/profile/songs/`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            songListLoading?.classList.add('is-hidden');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setMessage(songListMessage, errorData.detail || 'Erro ao carregar a lista de músicas.', 'red');
                return;
            }

            const data = await response.json();
            const songs = data.songs || data.get_songs || data || [];
            renderSongList(Array.isArray(songs) ? songs : []);
        } catch (error) {
            songListLoading?.classList.add('is-hidden');
            setMessage(songListMessage, 'Erro de rede ao carregar a lista de músicas.', 'red');
        }
    };

    loadProfile();
    loadSongs();
});
