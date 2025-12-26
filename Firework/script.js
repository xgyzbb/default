const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const musicBtn = document.getElementById('musicToggle');

let width, height;
const particles = [];
let autoFireInterval;

// --- Audio System (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let nextNoteTime = 0;
let noteIndex = 0;
let audioTimerID = null;

// "Happy Birthday" melody (Note, Duration in beats)
// BPM = 100, 1 beat = 0.6s
const tempo = 120;
const secondsPerBeat = 60.0 / tempo;

// Frequencies for C Major
const notes = {
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25,
    'F5': 698.46, 'G5': 783.99, 'C6': 1046.50
};

// Melody: [Note, NoteLength (1=quarter, 0.5=eighth)]
const melody = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2], // Standard ending
    ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
];

function playNote(freq, time, duration) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine'; // Soft tone
    osc.frequency.value = freq;

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(time);

    // Envelope for "music box" feel
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // Decay

    osc.stop(time + duration);
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
        const note = melody[noteIndex];
        if (note) {
            playNote(notes[note[0]], nextNoteTime, note[1] * secondsPerBeat);
            nextNoteTime += note[1] * secondsPerBeat;

            noteIndex++;
            if (noteIndex >= melody.length) {
                noteIndex = 0; // Loop
                nextNoteTime += 1.0; // Pause between loops
            }
        }
    }
    audioTimerID = requestAnimationFrame(scheduler);
}

function toggleMusic() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlaying) {
        cancelAnimationFrame(audioTimerID);
        isPlaying = false;
        musicBtn.innerHTML = '<span class="icon">🔇</span> Play Music';
    } else {
        nextNoteTime = audioCtx.currentTime + 0.1;
        scheduler();
        isPlaying = true;
        musicBtn.innerHTML = '<span class="icon">🔊</span> Pause Music';
    }
}

musicBtn.addEventListener('click', toggleMusic);

// Try to auto-start music on load
// Note: Most browsers block audio until user interaction.
// We attempt it, and add a fallback to "unmute" on the first user interaction.
function tryAutoPlay() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("AudioContext resumed successfully");
        }).catch(e => {
            console.log("Autoplay blocked, waiting for interaction");
        });
    }

    if (!isPlaying) {
        toggleMusic();
    }
}

// Interaction fallback: Resume audio context on first user action (click, move, touch)
function unlockAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    // Remove listeners once unlocked
    ['click', 'touchstart', 'mousemove', 'keydown'].forEach(event => {
        document.body.removeEventListener(event, unlockAudio);
    });
}

// Add listeners for the fallback
['click', 'touchstart', 'mousemove', 'keydown'].forEach(event => {
    document.body.addEventListener(event, unlockAudio, { once: true });
});

// Attempt immediate play
tryAutoPlay();


// --- Fireworks System ---

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// Realistic Firework Palette (Based on chemical elements)
const FIREWORK_COLORS = [
    '#FF0000', // Red (Strontium)
    '#FF4500', // Orange (Calcium)
    '#FFD700', // Gold/Yellow (Sodium)
    '#32CD32', // Green (Barium)
    '#00BFFF', // Blue (Copper)
    '#9400D3', // Purple (Strontium + Copper)
    '#FFFFFF'  // White/Silver (Magnesium/Aluminum)
];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2.5 + 1;

        // Use provided color or pick a random realistic one
        if (color) {
            this.color = color;
        } else {
            this.color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 3;
        const spread = Math.random();

        this.vx = Math.cos(angle) * speed * spread;
        this.vy = Math.sin(angle) * speed * spread;

        this.gravity = 0.12;
        this.friction = 0.96;
        this.opacity = 1;
        this.life = Math.random() * 0.01 + 0.005;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= this.life;
    }
}

function createFirework(x, y) {
    const particleCount = 300;
    // 70% chance of a single-color burst (more realistic), 30% multicolor
    const isSingleColor = Math.random() < 0.7;
    const baseColor = isSingleColor ? FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)] : null;

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, baseColor));
    }
}

function animate() {
    // Slower trail fade for more "full" screen look
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.opacity <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Click interaction
window.addEventListener('mousedown', (e) => {
    // Prevent clicking the button from triggering a firework under it (simple check)
    if (e.target.tagName !== 'BUTTON') {
        createFirework(e.clientX, e.clientY);
    }
});

// Auto fireworks - RAPID FIRE to fill screen
setInterval(() => {
    // Launch 2-3 fireworks at once
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * (height * 0.8); // Use more vertical space
        createFirework(x, y);
    }
}, 800); // Faster frequency

// Initial burst
setTimeout(() => {
    createFirework(width / 2, height / 2);
}, 500);

animate();
