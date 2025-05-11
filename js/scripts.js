const videos = [
    'assets/videos/VFX Edit Ball Kick.mp4',
    'assets/videos/VFX Edit Chatham Door.mp4',
    'assets/videos/VFX Edit Grosvenor East.mp4',
    'assets/videos/VFX Edit SODA Stairwell.mp4'
];

const overlayMessages = [
    {
        time: 8,
        message: "DID YOU SEE THAT",
        sound: 'assets/audio/Glitch Sound Effect.mp3',
        extra: []
    },
    {
        time: 11,
        message: "DID YOU SEE IT",
        sound: 'assets/audio/Pibby glitch sound effect (free to use).mp3',
        extra: [
            { time: 18, message: "STILL THERE", sound: 'assets/audio/Glitch Sound Effect - Free.mp3' }
        ]
    },
    {
        time: 3,
        message: "WHAT ARE THEY",
        sound: 'assets/audio/Pibby glitch sound effect (free to use).mp3',
        extra: [
            { time: 4, message: "YOU SEE IT TOO", sound: 'assets/audio/Glitch Sound Effect.mp3' },
            { time: 7, message: "DON'T YOU", sound: 'assets/audio/Glitch Sound Effect - Free.mp3' }
        ]
    },
    {
        time: 18,
        message: "WHY IS THIS HAPPENING",
        sound: 'assets/audio/Long Screen Glitch - Sound Effect for editing.mp3',
        extra: [
            { time: 12, message: "IT WON'T STOP", sound: 'assets/audio/Pibby glitch sound effect (free to use).mp3' },
            { time: 24, message: "TELL ME YOU SEE IT", sound: 'assets/audio/Long Screen Glitch - Sound Effect for editing.mp3' }
        ]
    }
];

// DOM Elements
const screen = document.getElementById('screen');
const playButton = document.getElementById('play');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const glitchSound = document.getElementById('glitch-sound');
const humSound = document.getElementById('hum-sound');

let currentVideoIndex = 0;
let videoElement = null;
let typingInterval = null;

// Persistent glitch overlay setup
const persistentGlitch = document.createElement('div');
persistentGlitch.classList.add('persistent-glitch-overlay');
persistentGlitch.style.position = 'absolute';
persistentGlitch.style.top = '0';
persistentGlitch.style.left = '0';
persistentGlitch.style.width = '100%';
persistentGlitch.style.height = '100%';
persistentGlitch.style.pointerEvents = 'none';
persistentGlitch.style.backgroundImage = 'url("assets/img/glitchh.gif")';
persistentGlitch.style.backgroundSize = 'cover';
persistentGlitch.style.opacity = '0';
persistentGlitch.style.mixBlendMode = 'screen';
persistentGlitch.style.zIndex = '9999';  // <- make sure overlay is always on top
screen.appendChild(persistentGlitch);

function createVideoElement(src, options = {}) {
    const video = document.createElement('video');
    video.src = src;
    video.autoplay = true;
    video.muted = options.muted ?? true;
    video.controls = false;
    video.classList.add('tv-video');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.position = 'absolute'; // ensure same stacking context
    video.style.top = '0';
    video.style.left = '0';
    return video;
}

function showOverlayMessage(message, soundSrc) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-message');
    overlay.textContent = message;
    screen.appendChild(overlay);

    const glitchOverlay = document.createElement('div');
    glitchOverlay.classList.add('glitch-overlay');
    glitchOverlay.style.position = 'absolute';
    glitchOverlay.style.top = '0';
    glitchOverlay.style.left = '0';
    glitchOverlay.style.width = '100%';
    glitchOverlay.style.height = '100%';
    glitchOverlay.style.pointerEvents = 'none';
    glitchOverlay.style.backgroundImage = 'url("assets/img/glitchh.gif")';
    glitchOverlay.style.backgroundSize = 'cover';
    glitchOverlay.style.opacity = '0.1';
    glitchOverlay.style.mixBlendMode = 'screen';
    glitchOverlay.style.zIndex = '9998';  // just under persistentGlitch
    screen.appendChild(glitchOverlay);

    if (soundSrc) {
        const audio = new Audio(soundSrc);
        audio.play();
    } else if (glitchSound) {
        glitchSound.currentTime = 0;
        glitchSound.play();
    }

    setTimeout(() => {
        if (screen.contains(overlay)) screen.removeChild(overlay);
        if (screen.contains(glitchOverlay)) screen.removeChild(glitchOverlay);
    }, 3000);
}

function playVideo(index) {
    if (videoElement) {
        videoElement.pause();
        screen.removeChild(videoElement);
    }
    clearInterval(typingInterval);
    screen.textContent = '';
    screen.appendChild(persistentGlitch);

    videoElement = createVideoElement(videos[index]);
    screen.appendChild(videoElement);
    screen.appendChild(persistentGlitch);  // keep overlay on top

    let glitchIntensity = 0.01 + (index * 0.02);
    if (glitchIntensity > 0.07) glitchIntensity = 0.07;
    persistentGlitch.style.opacity = glitchIntensity.toString();

    const overlay = overlayMessages[index];
    const shownTimes = new Set();
    const allTriggers = [{ time: overlay.time, message: overlay.message, sound: overlay.sound }, ...(overlay.extra || [])];

    videoElement.addEventListener('timeupdate', () => {
        const currentTime = Math.floor(videoElement.currentTime);
        allTriggers.forEach(trigger => {
            if (currentTime === trigger.time && !shownTimes.has(trigger.time)) {
                showOverlayMessage(trigger.message, trigger.sound);
                shownTimes.add(trigger.time);
            }
        });
    });

    videoElement.onended = () => {
        showOverlayMessage("LOADING...");
        setTimeout(() => {
            playButton.textContent = 'Play';
            if (index < videos.length - 1) {
                currentVideoIndex++;
                playVideo(currentVideoIndex);
            } else {
                typeEndMessage();
            }
        }, 3000);
    };

    playButton.textContent = 'Pause';
    videoElement.play();
}

function typeEndMessage() {
    let message = "Believe what you see.";
    let i = 0;
    screen.textContent = '';
    screen.appendChild(persistentGlitch);
    persistentGlitch.style.opacity = '0.5';

    typingInterval = setInterval(() => {
        screen.textContent += message.charAt(i);
        i++;
        if (i >= message.length) {
            clearInterval(typingInterval);
            setTimeout(playLostSignalVideos, 1500);
        }
    }, 100);
}

function playLostSignalVideos() {
    const overlays = screen.querySelectorAll('.overlay-message, .glitch-overlay');
    overlays.forEach(overlay => overlay.remove());

    if (videoElement) {
        videoElement.pause();
        videoElement.remove();
    }

    screen.textContent = '';
    screen.style.backgroundColor = 'black';

    const lostSignalVideo1 = createVideoElement('assets/videos/TVglitchylostsignal.mp4', { muted: false });
    lostSignalVideo1.style.zIndex = '1000';
    screen.appendChild(lostSignalVideo1);
    screen.appendChild(persistentGlitch);  // <- overlay always stays on top

    lostSignalVideo1.play();

    lostSignalVideo1.onended = () => {
        screen.removeChild(lostSignalVideo1);

        const lostSignalVideo2 = createVideoElement('assets/videos/Lostsignal.mp4', { muted: false });
        lostSignalVideo2.loop = true;
        lostSignalVideo2.style.zIndex = '1000';
        screen.appendChild(lostSignalVideo2);
        screen.appendChild(persistentGlitch);  // <- again, overlay on top

        lostSignalVideo2.play();
    };
}

// Button listeners
playButton.addEventListener('click', () => {
    if (humSound && humSound.paused) {
        humSound.volume = 0.2;
        humSound.loop = true;
        humSound.play().catch(e => console.log("Audio autoplay blocked until interaction"));
    }

    if (!videoElement) {
        playVideo(currentVideoIndex);
    } else if (videoElement.paused) {
        videoElement.play();
        playButton.textContent = 'Pause';
    } else {
        videoElement.pause();
        playButton.textContent = 'Play';
    }
});

nextButton.addEventListener('click', () => {
    if (currentVideoIndex < videos.length - 1) {
        currentVideoIndex++;
        playVideo(currentVideoIndex);
    }
});

prevButton.addEventListener('click', () => {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        playVideo(currentVideoIndex);
    }
});

















  
  



