console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show songs in updated HTML structure
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li> <img class="invert-only" src="music-note-01-stroke-rounded.svg" alt="">
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

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);
        });
    });
    return songs;
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
              <div class="play1">
                <svg width="50" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" fill="#1DB954" stroke="#1DB954" stroke-width="2" />
                  <polygon points="24,20 24,40 40,30" fill="black" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h2 class="word1">${response.title}</h2>
              <p class="word2">${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0], true)
        })
    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        document.getElementById("play").src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {
    await getSongs("songs/karan")
    playMusic(songs[0], true)

    await displayAlbums();

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            document.getElementById("play").src = "pause.svg"
        } else {
            currentSong.pause()
            document.getElementById("play").src = "play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent / 100)
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

let previousVolume = 50; // default volume

document.querySelector(".volume input").addEventListener("change", (e) => {
  const vol = parseInt(e.target.value);
  console.log("setting volume to", vol, "/100");
  currentSong.volume = vol / 100;

  if (vol > 0) {
    document.querySelector(".volume>img").src = "volume.svg";
    previousVolume = vol; // save volume for unmute
  }
});

// Add event listener to mute/unmute
document.querySelector(".volume>img").addEventListener("click", (e) => {
  const volumeSlider = document.querySelector(".volume input");

  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
    previousVolume = volumeSlider.value; // save before muting
    currentSong.volume = 0;
    volumeSlider.value = 0;
  } else {
    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
    volumeSlider.value = previousVolume || 10;
    currentSong.volume = volumeSlider.value / 100;
  }
});





}

main()
