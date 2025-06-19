console.log("Hello JS!")

let currentSong = new Audio();
let songs;
let currFolder;
let baseUrl = "https://sankalp2909.github.io/Spotify-Clone";

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${currFolder}/songs.json`) //fetches data in form raw html so we don't need to parse it into JS Object as it doesn'r return JSON Object!!
    let songs = await a.json() //.text() reads and stores raw html as text, it is an async func. so we need to write await with it!
    //if you're unsure to use .json() or not, try it!
    return songs
}

function secondsToMinutesSeconds(seconds) { //func. given by ChatGpt!
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


function playMusic(track) {
    
    currentSong.src = `${baseUrl}/${currFolder}/` + track;
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
    currentSong.play();
    play.src = "img/pause.svg"
}


async function main() {
    //getting all songs
    songs = await getSongs("songs/cs") //since we're calling an async func. we need to use await so that the further code runs after the function call ends!
    console.log(songs)



    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0] //using [0] since getElementsByTagName returns us a HTML collection of elements inside .songlist having tag as ul, so to select a particular ul we need to use indexing!
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Sanku Chan</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    currentSong.src = `/${currFolder}/` + songs[0];
    currentSong.addEventListener("loadedmetadata", () => { // I was directly changing HTML of songinfo and time, but still I was getting time as 00:00/00:00 instead of actual time duration, I did ChatGpt and got to know that this was happening because currentSong.duration is NaN (or undefined) right after setting src, therefore browser needs sometime to read audio files and loadedmetadata ensures that the browser has read the audio file and knows things like .duration!
        document.querySelector(".songinfo").innerHTML = decodeURI(currentSong.src.split(`/${currFolder}/`)[1]);//decode URI will decode URL and remove %20 and all, however it wont remove https part so we'll have to remove it using split!
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    });

    //attach an eventListener to each song!
    //Array.from converts the HTML collection into array so that we can use foreach loop on it!
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    //attach an event listener to prev, play and next button!
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
            document.querySelector(".songinfo").innerHTML = decodeURI(currentSong.src.split(`/${currFolder}/`)[1])
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        }

        else {
            currentSong.pause()
            play.src = "img/play.svg" //play.src directly works because in our HTML we've id=play for the playbutton in playbar, however we should still choose it explicitly by using querySelector("#play");
        }
    })

    //listen for time update event!
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an eventListener to seekBar!
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100; //e contains object where mouse was clicked and offset X gives where we've clicked from left edge of the element (seekbar here) , while e.target contains the element on which we clicked, in this case it is seekbar and getBound... func. gives us the total width of seekbar on screen, then by above formuala we can calculate what percent of seekbar was clicked!
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    //add an eventListener for Hamburger!
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    //add an eventListener for Close button!
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%"
    })

    //add an evetListener to prev. and next!
    previous.addEventListener("click", () => {
        console.log("clicked prev")
        let len = songs.length
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if (index == 0) {
            currentSong.src = `${baseUrl}/${currFolder}/` + songs[len - 1]
        }
        else {
            currentSong.src = `${baseUrl}/${currFolder}/` + songs[index - 1]
        }
        currentSong.play()
    })
    next.addEventListener("click", () => {
        console.log("clicked next")
        let len = songs.length
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        currentSong.src = `${baseUrl}/${currFolder}/` + songs[(index + 1) % len]
        currentSong.play()
    })

    //add an event to volume!
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value / 100) //e.target is element on which we're tapping i.e. slider and .value gives value out of 100 w.r.t where we tap on the range slider, therefore we take that value and divide it by 100 since volume can be set from [0,1] for any audio in JS!
        if(e.target.value==0)
        {
            document.querySelector(".volume img").src=document.querySelector(".volume img").src.replace("volume.svg","mute.svg") //Since strings in JavaScript are immutable (cannot be changed directly), the replace() method returns a new string instead of modifying the original. So to actually update the .src, we need to assign the result back to .src.
        }
        else
        {
            document.querySelector(".volume img").src=document.querySelector(".volume img").src.replace("mute.svg","volume.svg")
        }
    })

    //add an event to mute the volume
    document.querySelector(".volume img").addEventListener("click",(e)=>{
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            currentSong.volume=0.1;
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })

    //load the respective playlist when a card is clicked!
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder; //target gives the element which we've clicked but currentTarget will give us the whole card as click event is applied on whole card!
            console.log(folder);

            songs = await getSongs(`songs/${folder}`);
            currFolder = `songs/${folder}`; // update currFolder globally

            let songUL = document.querySelector(".songlist ul");
            songUL.innerHTML = ""; // clear old list

            for (const song of songs) {
                songUL.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Sanku Chan</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div> </li>`;
            }

            // Re-attach click listeners to new <li>s, since old li's are erased and new are inserted in .songlist ul therefore we need to reattach the event listeners to them!
            Array.from(songUL.getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", element => {
                    playMusic(e.querySelector(".info").firstElementChild.innerHTML);
                });
            });

            // Optionally auto-play first song
            playMusic(songs[0]);
        });
    });
    console.log()

}
main();
