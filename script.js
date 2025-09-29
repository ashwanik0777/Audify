let currentSong = new Audio();
let songs;
let currFolder;
let play;

function convertSecondsToTimeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let response = await fetch(`http://localhost:5500/${folder}/`);
    
    if (!response.ok) {
        console.error("Error fetching the folder content.");
        return;
    }

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");

    songs = [];

    for (let i = 0; i < links.length; i++) {
        let link = links[i];

        if (link.href.endsWith(".mp3")) {
            let song = link.href.split(`/${folder}/`)[1];
            songs.push(song);
        }
    }

    let songListUl = document.querySelector(".songList ul");
    let lastFolder = folder.split("/").slice(-1)[0].replaceAll("%20", " ");
    songListUl.innerHTML = '';
    songs.forEach(song => {
        songListUl.innerHTML += `
            <li class="flex gap-2 w-auto md:w-80 -ml-3 cursor-pointer items-center p-2.5 justify-between border-[1px] border-white rounded-md my-3">
                <img class="h-6" src="/img/music.svg" alt="music">
                <div class="info w-52 md:w-40">
                    <div class="">${decodeURIComponent(song.replaceAll("%20", " "))}</div>
                    <div>${lastFolder}</div>
                </div>
                <div class="playnow flex items-center gap-2">
                    <span class="text-xs">Play Now</span>
                    <img class="h-6" src="/img/play.svg" alt="play">
                </div>
            </li>`;
    })

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}



async function displayAlbums() {
    console.log("Starting displayAlbums function...");
    try {
        let a = await fetch(`http://localhost:5500/songs/`)
        if (!a.ok) {
            throw new Error(`Failed to fetch songs directory: ${a.status}`);
        }
        let response = await a.text();
        console.log("Songs directory response received");
        
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".card-container")
        console.log("Card container found:", cardContainer);
        
        let array = Array.from(anchors)
        console.log("Found anchors:", array.length);
        
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            console.log("Processing anchor:", e.href);
            
            if(e.href.includes("/songs/") && !e.href.includes(".htaccess") && !e.href.endsWith("/songs")){
                let folder = e.href.split("/").slice(-1)[0]
                console.log("Processing folder:", folder);
                
                try {
                    let infoResponse = await fetch(`http://localhost:5500/songs/${folder}/info.json`)
                    if (!infoResponse.ok) {
                        console.warn(`Failed to fetch info.json for ${folder}: ${infoResponse.status}`);
                        continue;
                    }
                    let info = await infoResponse.json();
                    console.log("Info loaded for", folder, ":", info);
                    
                    cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card md:w-52 p-3 rounded-md bg-neutral-800 *:pt-1 relative hover:bg-slate-600 transition-all duration-700 group">
            <img class="w-fit h-48 rounded-lg" src="/songs/${folder}/cover.jpeg" alt="img">
            <div
              class="play flex absolute ml-[15.5rem] -mt-14 md:ml-[9.3rem] md:-mt-11 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <button class="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="md:h-4 h-6 w-6 md:w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.25 5.25l13.5 7.5-13.5 7.5V5.25z" />
                </svg>
              </button>
            </div>
            <h1 class="font-light text-lg">${info.title}</h1>
            <p class="font-light text-sm text-zinc-400">${info.description}</p>
          </div>`
                } catch (error) {
                    console.error(`Error processing folder ${folder}:`, error);
                }
            }
        }
        console.log("Finished processing all folders");
    } catch (error) {
        console.error("Error in displayAlbums:", error);
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

async function main() {
    console.log("Main function started");
    
    // Initialize play button
    play = document.querySelector("#play");
    
    await getSongs("songs/KK");
    playMusic(songs[0], true)
    console.log("About to call displayAlbums");
    await displayAlbums();
    console.log("displayAlbums completed");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToTimeFormat(currentSong.currentTime)} / ${convertSecondsToTimeFormat(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(currentSong.currentTime === currentSong.duration){
            playMusic(songs[index+1])
        }
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    document.querySelector("#previous").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        } else {
            playMusic(songs[songs.length - 1])
        }

    })
    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > 0) {
            playMusic(songs[index + 1])
        } else {
            playMusic(songs[0])
        }
        
    })
    
   


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        let valueIcon = currentSong.volume = parseInt(e.target.value) / 100


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
    })
      
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
    
}

console.log("Script loaded, calling main...");
main().then(() => {
    console.log("Main function completed successfully");
}).catch(error => {
    console.error("Main function failed:", error);
});
