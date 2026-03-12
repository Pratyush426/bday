import './styles.css';
import confetti from 'canvas-confetti';

// --- STATE ---
interface State {
    audioMuted: boolean;
    currentAvatar: string | null;
    totalGiftCost: number;
    currentPage: string;
}

const STATE: State = {
    audioMuted: false,
    currentAvatar: null,
    totalGiftCost: 0,
    currentPage: 'page-hero'
};

// --- AUDIO MANAGER ---
const AUDIO_TRACKS: Record<string, string> = {
    'page-hero': '/6th Main Road 7.m4a.mp4',
    'page-gifts': '',
    'page-timeline': '',
    'page-video': '',
    'page-games': '',
    'page-end': ''
};

let currentAudioContext: HTMLAudioElement | null = null;

// --- DOM ELEMENTS ---
const muteBtn = document.getElementById('mute-toggle') as HTMLButtonElement | null;
const enterBtn = document.getElementById('enter-btn');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupAudio();
    setupEasterEggs();
    setupHoverMask();
    setupGiftShop();
    setupRandomRoast();
    setupTimelineObserver();
    setupMinigames();
});

// --- AUDIO LOGIC ---
function setupAudio() {
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            STATE.audioMuted = !STATE.audioMuted;
            muteBtn.textContent = STATE.audioMuted ? '🔇' : '🔊';
            if (currentAudioContext) {
                currentAudioContext.muted = STATE.audioMuted;
            }
        });
    }

    // Modern browsers block autoplay without interaction.
    // Start playing the hero track on the first click anywhere.
    document.addEventListener('click', function initAudio() {
        if (STATE.currentPage === 'page-hero' && !currentAudioContext) {
            playTrackForPage('page-hero');
        }
        document.removeEventListener('click', initAudio);
    }, { once: true });
}

function playTrackForPage(pageId: string) {
    if (currentAudioContext) {
        currentAudioContext.pause();
        currentAudioContext.currentTime = 0;
    }
    const track = AUDIO_TRACKS[pageId];
    if (track) {
        currentAudioContext = new Audio(track);
        currentAudioContext.loop = true;
        currentAudioContext.muted = STATE.audioMuted;
        currentAudioContext.play().catch(e => console.log('Audio autoplay blocked', e));
    }
}

// --- NAVIGATION LOGIC ---
function navigateTo(pageId: string) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        STATE.currentPage = pageId;
        playTrackForPage(pageId);
        window.scrollTo(0, 0);
    }
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains('next-page-btn')) {
            const dest = target.getAttribute('data-target');
            if (dest) navigateTo(dest);
        }
    });

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            fireConfetti();
        });
    }
}

// --- CONFETTI ---
function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
            colors: ['#ff6b8b', '#4d96ff', '#f9d56e']
        });
        confetti({
            particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
            colors: ['#ff6b8b', '#4d96ff', '#f9d56e']
        });

        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// --- HERO HOVER MASK REVEAL ---
function setupHoverMask() {
    const container = document.getElementById('hero-hover-mask');
    const revealLayer = document.getElementById('hero-reveal-layer');

    if (!container || !revealLayer) return;

    let maskSize = 350; // Increased diameter for hero

    // Hide initially until mouse moves
    revealLayer.style.webkitMaskSize = `0px 0px`;
    revealLayer.style.maskSize = `0px 0px`;

    document.addEventListener('mousemove', (e) => {
        if (STATE.currentPage !== 'page-hero') return;

        revealLayer.style.webkitMaskSize = `${maskSize}px ${maskSize}px`;
        revealLayer.style.maskSize = `${maskSize}px ${maskSize}px`;

        revealLayer.style.webkitMaskPosition = `${e.clientX - maskSize / 2}px ${e.clientY - maskSize / 2}px`;
        revealLayer.style.maskPosition = `${e.clientX - maskSize / 2}px ${e.clientY - maskSize / 2}px`;
    });
}

// --- GIFT SHOP ---
function setupGiftShop() {
    const items = document.querySelectorAll('.gift-item');
    const submitBtn = document.getElementById('submit-gifts-btn');

    if (!submitBtn) return;

    items.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });
    });

    submitBtn.addEventListener('click', () => {
        const selectedItems = document.querySelectorAll('.gift-item.selected');
        let total = 0;
        selectedItems.forEach(item => {
            total += parseInt(item.getAttribute('data-price') || '0');
        });

        showGiftModal(total);
    });
}

function showGiftModal(total: number) {
    const overlay = document.createElement('div');
    overlay.className = 'gift-modal-overlay';

    const formattedTotal = total >= 9999999 ? "Literally Unaffordable" : "₹" + total.toLocaleString('en-IN');

    overlay.innerHTML = `
        <div class="gift-modal">
            <h2 class="glitch-text" data-text="WARNING">WARNING</h2>
            <div class="dramatic-text mt-3">
                Congratulations!<br>
                Your selected gifts cost:<br>
                <div class="total-cost mt-2 mb-2">${formattedTotal}</div>
                Therefore, you now owe your brother this amount.<br>
                Please pay immediately or cancel your request.
            </div>
            <button class="glass-btn primary mt-4" id="accept-debt-btn">I Accept My Debt ➡️</button>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof fireConfetti === 'function') fireConfetti();

    const acceptBtn = document.getElementById('accept-debt-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            overlay.remove();
            navigateTo('page-timeline');
        });
    }
}

// --- RANDOM ROAST ---
function setupRandomRoast() {
    const roasts = [
        "Ridhi has a 73% probability of stealing fries from your plate.",
        "Scientifically proven: Ridhi laughs at her own jokes.",
        "Legend says Ridhi's screen time is higher than NASA's computational power.",
        "If overthinking was an Olympic sport, Ridhi would have a gold medal.",
        "Ridhi's favorite hobby: Claiming she's 'on the way' while still wearing pajamas."
    ];

    const roastBtn = document.getElementById('roast-btn');
    const display = document.getElementById('roast-display');

    if (!roastBtn || !display) return;

    roastBtn.addEventListener('click', () => {
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        display.textContent = randomRoast;
        display.setAttribute('data-text', randomRoast);
        display.classList.remove('hidden');

        display.style.animation = 'none';
        setTimeout(() => display.style.animation = 'shake 0.3s ease', 10);
    });
}

// --- TIMELINE OBSERVER ---
function setupTimelineObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

// --- EASTER EGGS ---
function setupEasterEggs() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPosition = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiPosition]) {
            konamiPosition++;
            if (konamiPosition === konamiCode.length) {
                activateUltimateMode();
                konamiPosition = 0;
            }
        } else {
            konamiPosition = 0;
        }
    });

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains('clickable-emoji')) {
            target.style.transform = `scale(1.5) rotate(${Math.random() * 30 - 15}deg)`;
            setTimeout(() => target.style.transform = '', 200);
        }
    });
}

function activateUltimateMode() {
    const overlay = document.getElementById('konami-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
    overlay.style.color = 'white';
    overlay.style.fontSize = '3rem';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.animation = 'shake 0.1s infinite';
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';

    setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.style.filter = 'none';
        overlay.style.animation = 'none';
    }, 4000);
}

// --- MINIGAMES LOGIC ---
function setupMinigames() {
    // 1. Catch the Cake (Escaping Button)
    const runawayBtn = document.getElementById('runaway-btn') as HTMLButtonElement | null;
    const gameArea = document.getElementById('catch-cake-area');

    if (runawayBtn && gameArea) {
        runawayBtn.addEventListener('mouseover', () => {
            const areaRect = gameArea.getBoundingClientRect();
            const btnRect = runawayBtn.getBoundingClientRect();

            // Calculate random positions within the game area bounds
            const maxX = areaRect.width - btnRect.width;
            const maxY = areaRect.height - btnRect.height;

            const newX = Math.floor(Math.random() * maxX);
            const newY = Math.floor(Math.random() * maxY);

            runawayBtn.style.left = `${newX}px`;
            runawayBtn.style.top = `${newY}px`;
        });

        runawayBtn.addEventListener('click', () => {
            alert("HOW DID YOU CATCH IT?! You win a free piece of virtual cake. 🍰");
        });
    }

    // 2. Rage Clicker
    const rageBtn = document.getElementById('rage-click-btn');
    const rageScoreDisplay = document.getElementById('rage-score');
    let rageScore = 0;

    if (rageBtn && rageScoreDisplay) {
        rageBtn.addEventListener('click', () => {
            rageScore++;
            rageScoreDisplay.textContent = `Score: ${rageScore}`;

            // Make button jitter slightly on click for chaotic effect
            rageBtn.style.transform = `scale(0.95) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            setTimeout(() => {
                rageBtn.style.transform = 'scale(1) translate(0px, 0px)';
            }, 50);
        });
    }
}
