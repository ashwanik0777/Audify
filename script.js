const currentSong = new Audio();
let play;
let songs = [];

const API_BASE = "http://localhost:4000/api";
const ALBUM_CONFIGS = [
    {
        id: "4aawyAB9vmqN3uQ7FjRGTy",
        market: "ES",
        limit: 10,
        offset: 5
    }
];

const state = {
    playlists: [],
    activePlaylistId: null,
    activeTrackIndex: 0
};

function convertSecondsToTimeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

function setSongInfo(text) {
    document.querySelector(".songinfo").textContent = text;
}

function setSongTime(text) {
    document.querySelector(".songtime").textContent = text;
}

function getActivePlaylist() {
    return state.playlists.find(playlist => playlist.id === state.activePlaylistId) || null;
}

async function fetchAlbumPlaylist(config) {
    const market = config.market || "ES";
    const limit = config.limit ?? 10;
    const offset = config.offset ?? 0;

    const albumResponse = await fetch(`${API_BASE}/albums/${config.id}?market=${market}`);
    if (!albumResponse.ok) {
        throw new Error(`Failed to load album ${config.id}: ${albumResponse.status}`);
    }
    const album = await albumResponse.json();

    const tracksResponse = await fetch(
        `${API_BASE}/albums/${config.id}/tracks?market=${market}&limit=${limit}&offset=${offset}`
    );
    if (!tracksResponse.ok) {
        throw new Error(`Failed to load tracks for ${config.id}: ${tracksResponse.status}`);
    }
    const tracksData = await tracksResponse.json();
    const items = Array.isArray(tracksData.items) ? tracksData.items : [];

    return {
        id: album.id,
        title: album.name,
        description: (album.artists || []).map(artist => artist.name).join(", "),
        cover: album.images && album.images[0] ? album.images[0].url : "/img/playlist.svg",
        embedUrl: `https://open.spotify.com/embed/album/${album.id}`,
        tracks: items.map(track => ({
            title: track.name,
            artist: (track.artists || []).map(artist => artist.name).join(", "),
            audioUrl: track.preview_url || ""
        }))
    };
}

async function loadLocalPlaylists() {
    try {
        const response = await fetch(`${API_BASE}/local/playlists`);
        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.items) && data.items.length > 0) {
                return data.items;
            }
        }
    } catch (error) {
        console.warn("Could not load local playlists from server API, using standalone client fallback:", error.message);
    }

    return [
        {
            id: "local-ARJIT-SINGH",
            title: "Arjit Singh PlayList",
            description: "This the beautiful beats",
            cover: "/songs/ARJIT%20SINGH/cover.jpeg",
            embedUrl: null,
            tracks: [
                { title: "Tainu Khabar Nahi", artist: "Arjit Singh PlayList", audioUrl: "/songs/ARJIT%20SINGH/Tainu%20Khabar%20Nahi.mp3" }
            ]
        },
        {
            id: "local-GLORY",
            title: "Glory Playlist",
            description: "This is by Honey Singh",
            cover: "/songs/GLORY/cover.jpeg",
            embedUrl: null,
            tracks: [
                { title: "Chhori", artist: "Glory Playlist", audioUrl: "/songs/GLORY/Chhori.mp3" },
                { title: "HIGH ON ME", artist: "Glory Playlist", audioUrl: "/songs/GLORY/HIGH%20ON%20ME.mp3" },
                { title: "Jatt Mehkma", artist: "Glory Playlist", audioUrl: "/songs/GLORY/Jatt%20Mehkma.mp3" },
                { title: "Millionaire", artist: "Glory Playlist", audioUrl: "/songs/GLORY/Millionaire.mp3" }
            ]
        },
        {
            id: "local-KK",
            title: "KK Songs",
            description: "KK Songs by KK",
            cover: "/songs/KK/cover.jpeg",
            embedUrl: null,
            tracks: [
                { title: "Aankhon Mein Teri Ajab Si", artist: "KK Songs", audioUrl: "/songs/KK/Aankhon%20Mein%20Teri%20Ajab%20Si.mp3" },
                { title: "Beete Lamhe", artist: "KK Songs", audioUrl: "/songs/KK/Beete%20Lamhe.mp3" },
                { title: "Dil Ibaadat Kar Raha Hai", artist: "KK Songs", audioUrl: "/songs/KK/Dil%20Ibaadat%20Kar%20Raha%20Hai.mp3" },
                { title: "Dilnashin Dilnashin", artist: "KK Songs", audioUrl: "/songs/KK/Dilnashin%20Dilnashin.mp3" },
                { title: "HAAN TU HAIN", artist: "KK Songs", audioUrl: "/songs/KK/HAAN%20TU%20HAIN.mp3" },
                { title: "KHUDA JAANE", artist: "KK Songs", audioUrl: "/songs/KK/KHUDA%20JAANE.mp3" },
                { title: "Labon Ko Bhool Bhulaiyaa", artist: "KK Songs", audioUrl: "/songs/KK/Labon%20Ko%20Bhool%20Bhulaiyaa.mp3" },
                { title: "Tu Hi Haqeeqat", artist: "KK Songs", audioUrl: "/songs/KK/Tu%20Hi%20Haqeeqat.mp3" },
                { title: "Tu Hi Meri Shab Hai", artist: "KK Songs", audioUrl: "/songs/KK/Tu%20Hi%20Meri%20Shab%20Hai.mp3" },
                { title: "Tujhe Sochta Hoon", artist: "KK Songs", audioUrl: "/songs/KK/Tujhe%20Sochta%20Hoon.mp3" },
                { title: "Tum Mile Audio", artist: "KK Songs", audioUrl: "/songs/KK/Tum%20Mile%20Audio.mp3" },
                { title: "Zara Sa", artist: "KK Songs", audioUrl: "/songs/KK/Zara%20Sa.mp3" },
                { title: "Zindagi Do Pal Ki", artist: "KK Songs", audioUrl: "/songs/KK/Zindagi%20Do%20Pal%20Ki.mp3" }
            ]
        },
        {
            id: "local-RADHA-KRISHANA",
            title: "Radha Krishna Songs",
            description: "This is Bhakti Songs",
            cover: "/songs/RADHA%20KRISHANA/cover.jpeg",
            embedUrl: null,
            tracks: [
                { title: "Choti Si Kishori", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Choti%20Si%20Kishori.mp3" },
                { title: "Kishori Kuch Aisa Intezaam Ho Jaaye 2.0 ", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Kishori%20Kuch%20Aisa%20Intezaam%20Ho%20Jaaye%202.0%20.mp3" },
                { title: "Main Radha Vallabh Ki ", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Main%20Radha%20Vallabh%20Ki%20.mp3" },
                { title: "RADHA RANI LAGE", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/RADHA%20RANI%20LAGE.mp3" },
                { title: "Radha Krishna Song", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Radha%20Krishna%20Song.mp3" },
                { title: "Radhe Braj Jan Man Sukhkari", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Radhe%20Braj%20Jan%20Man%20Sukhkari.mp3" },
                { title: "Shyama Aan Baso", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Shyama%20Aan%20Baso.mp3" },
                { title: "Suno Krishna Pyaare  by- Swati Mishra", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Suno%20Krishna%20Pyaare%20%20by-%20Swati%20Mishra.mp3" },
                { title: "Tum Prem Ho", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Tum%20Prem%20Ho.mp3" },
                { title: "Vrindavan Jaungi", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Vrindavan%20Jaungi.mp3" },
                { title: "Vrindavan Mein Hukum Chale Barsane Wali Ka", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/Vrindavan%20Mein%20Hukum%20Chale%20Barsane%20Wali%20Ka.mp3" },
                { title: "kishori kuch aisa intjam ho jaye", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/kishori%20kuch%20aisa%20intjam%20ho%20jaye.mp3" },
                { title: "meri vinti yahi hai radha rani", artist: "Radha Krishna Songs", audioUrl: "/songs/RADHA%20KRISHANA/meri%20vinti%20yahi%20hai%20radha%20rani.mp3" }
            ]
        }
    ];
}

async function loadPlaylists() {
    try {
        const results = await Promise.allSettled(
            ALBUM_CONFIGS.map(config => fetchAlbumPlaylist(config))
        );

        state.playlists = results
            .filter(result => result.status === "fulfilled")
            .map(result => result.value);
    } catch (error) {
        console.error("Playlist load failed:", error);
        state.playlists = [];
    }

    if (!state.playlists || state.playlists.length === 0) {
        console.log("API playlists unavailable or empty. Loading fallback local songs...");
        state.playlists = await loadLocalPlaylists();
    }
}

function renderPlaylists() {
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    if (!state.playlists.length) {
        cardContainer.innerHTML = "<div class=\"text-sm text-zinc-400\">No playlists found.</div>";
        return;
    }

    state.playlists.forEach(playlist => {
        const cover = playlist.cover || "/img/playlist.svg";
        cardContainer.insertAdjacentHTML(
            "beforeend",
            `<div data-id="${playlist.id}" class="card md:w-52 p-3 rounded-md bg-neutral-800 *:pt-1 relative hover:bg-slate-600 transition-all duration-700 group">
                <img class="w-fit h-48 rounded-lg" src="${cover}" alt="cover">
                <div class="play flex absolute ml-[15.5rem] -mt-14 md:ml-[9.3rem] md:-mt-11 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <button data-action="open-embed" class="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full" aria-label="Open embed">
                        <svg xmlns="http://www.w3.org/2000/svg" class="md:h-4 h-6 w-6 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.25 5.25l13.5 7.5-13.5 7.5V5.25z" />
                        </svg>
                    </button>
                </div>
                <h1 class="font-light text-lg">${playlist.title}</h1>
                <p class="font-light text-sm text-zinc-400">${playlist.description || ""}</p>
            </div>`
        );
    });
}

function renderTracks(playlist) {
    const songListUl = document.querySelector(".songList ul");
    songListUl.innerHTML = "";

    if (!playlist || !Array.isArray(playlist.tracks) || playlist.tracks.length === 0) {
        songListUl.innerHTML = "<li class=\"text-sm text-zinc-400\">No tracks in this playlist.</li>";
        return;
    }

    playlist.tracks.forEach((track, index) => {
        const title = track.title || "Untitled";
        const artist = track.artist || "Unknown";
        songListUl.insertAdjacentHTML(
            "beforeend",
            `<li data-index="${index}" class="flex gap-2 w-auto md:w-80 -ml-3 cursor-pointer items-center p-2.5 justify-between border-[1px] border-white rounded-md my-3">
                <img class="h-6" src="/img/music.svg" alt="music">
                <div class="info w-52 md:w-40">
                    <div>${title}</div>
                    <div>${artist}</div>
                </div>
                <div class="playnow flex items-center gap-2">
                    <span class="text-xs">Play Now</span>
                    <img class="h-6" src="/img/play.svg" alt="play">
                </div>
            </li>`
        );
    });
}

function playTrack(index, pause = false) {
    const playlist = getActivePlaylist();
    if (!playlist || !Array.isArray(playlist.tracks)) {
        return;
    }

    songs = playlist.tracks;
    const track = songs[index];
    if (!track) {
        return;
    }

    state.activeTrackIndex = index;
    const title = track.title || "Untitled";
    const artist = track.artist || "Unknown";
    const displayTitle = `${title} - ${artist}`;

    if (!track.audioUrl) {
        currentSong.pause();
        currentSong.src = "";
        play.src = "/img/play.svg";
        setSongInfo(`${displayTitle} (no preview)`);
        setSongTime("00:00 / 00:00");
        return;
    }

    currentSong.src = track.audioUrl;
    if (!pause) {
        currentSong.play().catch(() => undefined);
        play.src = "/img/pause.svg";
    } else {
        play.src = "/img/play.svg";
    }
    setSongInfo(displayTitle);
    setSongTime("00:00 / 00:00");
}

function openEmbed(playlist) {
    const modal = document.querySelector("#embed-modal");
    const frame = document.querySelector("#embed-frame");
    const empty = document.querySelector("#embed-empty");

    modal.style.display = "flex";

    if (playlist && playlist.embedUrl) {
        frame.src = playlist.embedUrl;
        frame.style.display = "block";
        empty.style.display = "none";
    } else {
        frame.src = "";
        frame.style.display = "none";
        empty.style.display = "block";
    }
}

function closeEmbed() {
    const modal = document.querySelector("#embed-modal");
    const frame = document.querySelector("#embed-frame");
    modal.style.display = "none";
    frame.src = "";
}

function loadPlaylist(playlistId) {
    state.activePlaylistId = playlistId;
    const playlist = getActivePlaylist();
    renderTracks(playlist);
    if (playlist && playlist.tracks && playlist.tracks.length) {
        playTrack(0, true);
    }
}

async function main() {
    play = document.querySelector("#play");
    setSongInfo("Select a playlist to start.");
    setSongTime("00:00 / 00:00");

    await loadPlaylists();
    renderPlaylists();

    if (state.playlists && state.playlists.length > 0) {
        loadPlaylist(state.playlists[0].id);
    }

    const cardContainer = document.querySelector(".card-container");
    cardContainer.addEventListener("click", event => {
        const card = event.target.closest(".card");
        if (!card) {
            return;
        }

        const playlistId = card.dataset.id;
        const playlist = state.playlists.find(item => item.id === playlistId);

        if (event.target.closest("[data-action='open-embed']")) {
            openEmbed(playlist);
            return;
        }

        loadPlaylist(playlistId);
    });

    document.querySelector(".songList ul").addEventListener("click", event => {
        const item = event.target.closest("li[data-index]");
        if (!item) {
            return;
        }
        const index = Number(item.dataset.index);
        playTrack(index);
    });

    play.addEventListener("click", () => {
        if (!songs.length) {
            return;
        }

        if (!currentSong.src) {
            playTrack(state.activeTrackIndex || 0);
            return;
        }

        if (currentSong.paused) {
            currentSong.play().catch(() => undefined);
            play.src = "/img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isFinite(currentSong.duration) || currentSong.duration <= 0) {
            setSongTime("00:00 / 00:00");
            return;
        }

        setSongTime(`${convertSecondsToTimeFormat(currentSong.currentTime)} / ${convertSecondsToTimeFormat(currentSong.duration)}`);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("ended", () => {
        if (!songs.length) {
            return;
        }
        const nextIndex = (state.activeTrackIndex + 1) % songs.length;
        playTrack(nextIndex);
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        if (!isFinite(currentSong.duration) || currentSong.duration <= 0) {
            return;
        }
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        if (!songs.length) {
            return;
        }
        const prevIndex = (state.activeTrackIndex - 1 + songs.length) % songs.length;
        playTrack(prevIndex);
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (!songs.length) {
            return;
        }
        const nextIndex = (state.activeTrackIndex + 1) % songs.length;
        playTrack(nextIndex);
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        const valueIcon = currentSong.volume = parseInt(e.target.value, 10) / 100;

        if (valueIcon > 0.4) {
            document.querySelector(".maxval").style.display = "block";
            document.querySelector(".midval").style.display = "none";
            document.querySelector(".offval").style.display = "none";
        } else if (valueIcon > 0) {
            document.querySelector(".maxval").style.display = "none";
            document.querySelector(".midval").style.display = "block";
            document.querySelector(".offval").style.display = "none";
        } else {
            document.querySelector(".maxval").style.display = "none";
            document.querySelector(".midval").style.display = "none";
            document.querySelector(".offval").style.display = "block";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("/img/volume-max.svg")) {
            e.target.src = e.target.src.replace("/img/volume-max.svg", "/img/volume-xmark.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else if (e.target.src.includes("/img/volume-min.svg")) {
            e.target.src = e.target.src.replace("/img/volume-min.svg", "/img/volume-xmark.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("/img/volume-xmark.svg", "/img/volume-max.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    });

    const modal = document.querySelector("#embed-modal");
    document.querySelector("#embed-close").addEventListener("click", closeEmbed);
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeEmbed();
        }
    });
}

main().catch(error => {
    console.error("Main function failed:", error);
});
