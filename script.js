console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Play selected music
function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Load songs from folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        let res = await fetch(`${folder}/songs.json`);
        if (!res.ok) throw new Error("songs.json not found");
        songs = await res.json();
    } catch (err) {
        console.error("Error loading songs:", err);
        alert("Songs not found for this album.");
        return [];
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert-only" src="music-note-01-stroke-rounded.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Songs for you</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert-only" src="play-stroke-rounded.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}

// Show album cards
async function displayAlbums() {
    try {
        let res = await fetch("songs/info.json");
        if (!res.ok) throw new Error("info.json not found");
        let albums = await res.json();

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let album of albums) {
            let folder = album.folder;

            // 🔥 Fetch title/desc from each album's info.json
            let infoRes = await fetch(`songs/${folder}/info.json`);
            let info = await infoRes.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play1">
                        <svg width="50" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="28" fill="#1DB954" stroke="#1DB954" stroke-width="2" />
                            <polygon points="24,20 24,40 40,30" fill="black" />
                        </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="">
                    <h2 class="word1">${info.title}</h2>
                    <p class="word2">${info.description}</p>
                </div>`;
        }

        // Album click event
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                let folder = card.dataset.folder;
                songs = await getSongs(`songs/${folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0], true);
                }
            });
        });

    } catch (err) {
        console.error("Error loading albums:", err);
        alert("Failed to load albums");
    }
}

// Main function
async function main() {
    await displayAlbums();

    const firstCard = document.querySelector(".card");
    if (firstCard) {
        firstCard.click(); // auto-click first album
    }

    // Play / Pause
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent / 100);
    });

    // Previous / Next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume
    let previousVolume = 50;

    document.querySelector(".volume input").addEventListener("change", (e) => {
        const vol = parseInt(e.target.value);
        currentSong.volume = vol / 100;
        if (vol > 0) {
            document.querySelector(".volume>img").src = "volume.svg";
            previousVolume = vol;
        }
    });

    // Mute/Unmute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        const volumeSlider = document.querySelector(".volume input");
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            previousVolume = volumeSlider.value;
            currentSong.volume = 0;
            volumeSlider.value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            volumeSlider.value = previousVolume || 10;
            currentSong.volume = volumeSlider.value / 100;
        }
    });
}

main();
