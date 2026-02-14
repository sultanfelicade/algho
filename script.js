const playBtn = document.getElementById('playBtn');
const audio = document.getElementById('lagu');
const disk = document.getElementById('disk');
const icon = playBtn.querySelector('i');
const btnText = document.querySelector('.btn-text');

const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progressBar = document.getElementById('progress');

const lyricsContainer = document.getElementById('lyricsSync');
const lyricLines = lyricsContainer ? Array.from(lyricsContainer.querySelectorAll('p[data-time]')) : [];

let isPlaying = false;

// --- Play / Pause Logic ---
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

function playSong() {
    isPlaying = true;
    audio.play();
    disk.classList.add('playing'); // Mulai animasi piringan
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    if (btnText) btnText.textContent = 'Bisa di Pause, Bang';
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    disk.classList.remove('playing'); // Stop animasi
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
    if (btnText) btnText.textContent = 'Play ini ya, Sayanggggggg';
}

// Reset state ketika lagu selesai
audio.addEventListener('ended', () => {
    pauseSong();
    audio.currentTime = 0;
});

// --- Format waktu mm:ss ---
function formatTime(time) {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Set durasi ketika metadata siap
audio.addEventListener('loadedmetadata', () => {
    if (durationEl) {
        durationEl.textContent = formatTime(audio.duration);
    }
});

// Update waktu dan progress bar
audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const duration = audio.duration || 0;

    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(current);
    }

    if (progressBar) {
        const percent = duration ? (current / duration) * 100 : 0;
        progressBar.style.width = `${percent}%`;
    }

    syncLyrics(current);
});

// --- Sinkronisasi Lirik Berdasarkan Detik ---
function syncLyrics(currentTime) {
    if (!lyricLines.length) return;

    let activeLine = null;

    for (let i = 0; i < lyricLines.length; i++) {
        const line = lyricLines[i];
        const startTime = parseFloat(line.dataset.time || '0');
        const nextTime = i < lyricLines.length - 1
            ? parseFloat(lyricLines[i + 1].dataset.time || '0')
            : Infinity;

        if (currentTime >= startTime && currentTime < nextTime) {
            activeLine = line;
            break;
        }
    }

    lyricLines.forEach(line => line.classList.remove('active'));

    if (activeLine) {
        activeLine.classList.add('active');

        // Scroll pelan mengikuti lirik aktif
        const containerTop = lyricsContainer.scrollTop;
        const containerHeight = lyricsContainer.clientHeight;
        const lineOffset = activeLine.offsetTop;
        const lineHeight = activeLine.offsetHeight;
        const targetScroll = lineOffset - containerHeight / 2 + lineHeight / 2;

        lyricsContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

// Klik lirik -> loncat ke waktu tersebut
if (lyricLines.length) {
    lyricLines.forEach(line => {
        line.addEventListener('click', () => {
            const time = parseFloat(line.dataset.time || '0');
            audio.currentTime = time;
            if (!isPlaying) {
                playSong();
            }
        });
    });
}

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.22
        }
    );

    revealElements.forEach(el => observer.observe(el));
} else {
    // Fallback sederhana
    revealElements.forEach(el => el.classList.add('active'));
}

// --- Cute Click Hearts ---
function spawnHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'click-heart';
    heart.textContent = '❤';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 1000);
}

document.addEventListener('click', (e) => {
    const target = e.target;

    // Hanya munculkan hati jika klik di area yang "spesial"
    if (
        target.closest('.btn-play') ||
        target.closest('.photo-item') ||
        target.closest('.card')
    ) {
        spawnHeart(e.clientX, e.clientY);
    }
});