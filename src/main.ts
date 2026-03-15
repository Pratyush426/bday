import './styles.css';
import './DomeGallery.css';
import confetti from 'canvas-confetti';
import { createOrbitImages } from './OrbitImages';
import { HorizontalMotion } from './HorizontalMotion';
import { initDomeGallery } from './DomeGallery';
import { mountMasonry } from './MasonryMount';

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
    'page-hero': '/audios/khat_ZS2Cw9qh.mp3',
    'page-gifts': '/audios/anarkali-disco-chali-koshalworldcom_t3TgPcS6.mp3',
    'page-dome-gallery': '/audios/sachi-muchi-sultan-128-kbps_dMVOc5Rc.mp3',
    'page-timeline': '/audios/jaise-mera-tu-happy-ending-128-kbps_6thWymG1.mp3',
    'page-video': '',
    'page-games': '/audios/shake-your-bootiya-finding-fanny-128-kbps_p3NeO6Jp.mp3',
    'page-end': '/audios/cyndi-lauper-girls-just-wanna-have-fun-mp3pm_3ncvYdMG.mp3'
};

let currentAudioContext: HTMLAudioElement | null = null;
let gifMotionInstance: HorizontalMotion | null = null;
let textTickerInstance: HorizontalMotion | null = null;
let domeGalleryInstance: any = null;

const GIFT_GIFS = [
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExemwzMGw2cXRvOXBvYnQxMnE1NWNuNXZsYmcxbW1hanVreWI3bjB5aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XN8YOV0H6YfVFFGxth/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDZ4MG4yMHFua3JsbmdsdHc4azQzdGxnaGwxaGs5NW8xMGphc2gyciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wVmt9Gh02y6u0FAd6J/giphy.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDBzZW4zeThubzdiMHRmMmNvN3kyMHlmem1ycTNuamhwd3d1ZHAzeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/knLRouBQlkniWmx0hp/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmI5MDB1N3BidW5ndTh0a2c2a2t6czFxM29yc3FldWJsb3YydzBkeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/66CRyMw8X9bhQFs8Je/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTNxd3V4czE5cHZ6dXBzYnpnZXoyOGhndW42ODRyYXI0dmUzazU3dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aosOPhpJHrJq8/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTB2anA2OWMweG9wMDlmY2oxNGl6cW44MWxjYjJwd3VtMGZkdm1yYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE2VAxuXWeyvJIY/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTVrdTJtOWhqYXRhMDE1OHljcm92eW9sa2trOWRxNGZzc3NjMHEyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Eyepo7itqjQcVc82Nf/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDNzdmc5czliZTZ0ZzhuM2d1YzEybWhocTZlbHNnM2g0ZGk4aTJsYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW50djM4YnNjOHM2NHpkNW12MnozNmxvaHpwdThpY3pvaGloOXFhNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j93ycvEyWlSIIg8AEl/giphy.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3hkbGZ1Z3VqZXlrODA0aHQ0YW4xZGthMXpwMGV4c2E5OWNlNW4xZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nU0EccnuhJa5ofFr6v/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzZ5bGV0dnl4dWxwaGhyZDhmdXZoYTZka2cyazZpb3A4YnV0eG10cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13JipyoTNNvM2c/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OHQxa2k1cGh0NnlncHRlc21mNHdxc3AxcTc4ejl3cmJicmR4OWkxNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ADuNzKRAV5s3Nemh84/giphy.gif"
];

// --- DOM ELEMENTS ---
const muteBtn = document.getElementById('mute-toggle') as HTMLButtonElement | null;
const enterBtn = document.getElementById('enter-btn');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupUnveilOverlay();
    setupNavigation();
    setupAudio();
    setupEasterEggs();
    setupHoverMask();
    setupGiftShop();
    setupRandomRoast();
    setupTimelineObserver();
    setupMinigames();
});

// --- UNVEIL OVERLAY LOGIC ---
function setupUnveilOverlay() {
    const overlay = document.getElementById('unveil-overlay');
    const unveilBtn = document.getElementById('unveil-btn');

    if (overlay && unveilBtn) {
        unveilBtn.addEventListener('click', () => {
            overlay.classList.add('unveiled');
            playTrackForPage('page-hero');
            
            // Start the hero content fade-away timer only after unveiling
            document.querySelectorAll('.fade-away-wrapper').forEach(el => {
                el.classList.add('start-animation');
            });
            
            // Remove from DOM after animation
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1500);
        });
    }
}

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
    // The "unveil" ribbon handles the first interaction.
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
// --- ASSET PRELOADING ---
const PAGE_ASSETS: Record<string, string[]> = {
    'page-hero': ['/hero-bg.png'],
    'page-gifts': GIFT_GIFS,
    'page-dome-gallery': [], 
    'page-timeline': [
        '/WhatsApp Video 2026-03-14 at 5.50.00 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 11.28.31 AM.mp4',
        '/WhatsApp Video 2026-03-14 at 5.50.00 PM (1).mp4',
        '/WhatsApp Video 2026-03-14 at 5.50.00 PM (2).mp4',
        '/WhatsApp Video 2026-03-15 at 3.27.19 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 3.28.57 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 3.37.35 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 3.38.20 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 3.50.44 PM.mp4',
        '/WhatsApp Video 2026-03-15 at 3.50.44 PM (1).mp4'
    ], 
    'page-video': ['/All we want to say is.mp4'],
    'page-games': [
        "/WhatsApp_Image_2026-03-13_at_1.56.34_PM-removebg-preview.png",
        "/111.jpeg", "/112.jpeg", "/113.jpeg", "/114.jpeg",
        "/WhatsApp Image 2026-03-15 at 3.53.27 PM.jpeg",
        "/WhatsApp Image 2026-03-15 at 4.01.12 PM.jpeg"
    ],
    'page-end': []
};

// Also include dome images
import { DEFAULT_IMAGES } from './DomeGallery';
PAGE_ASSETS['page-dome-gallery'] = DEFAULT_IMAGES.map(img => img.src);

const preloadedPages = new Set<string>();

async function preloadPageAssets(pageId: string) {
    if (preloadedPages.has(pageId)) return Promise.resolve();
    
    let assets = [...(PAGE_ASSETS[pageId] || [])];
    
    // Include audio track in preloading
    const audioTrack = AUDIO_TRACKS[pageId];
    if (audioTrack) {
        assets.push(audioTrack);
    }

    if (assets.length === 0) {
        preloadedPages.add(pageId);
        return Promise.resolve();
    }

    const promises = assets.map(src => {
        return new Promise((resolve) => {
            if (src.endsWith('.mp4') || src.endsWith('.m4v') || src.endsWith('.m4a')) {
                const video = document.createElement('video');
                video.onloadedmetadata = resolve;
                video.onerror = resolve; 
                video.src = src;
            } else if (src.endsWith('.mp3') || src.endsWith('.wav') || src.indexOf('/audios/') !== -1) {
                const audio = new Audio(src);
                audio.oncanplaythrough = () => resolve(true);
                audio.onerror = () => resolve(false);
                audio.load();
            } else {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = src;
            }
        });
    });

    await Promise.all(promises);
    preloadedPages.add(pageId);
    updateButtonStates();
}

function updateButtonStates() {
    document.querySelectorAll('.next-page-btn').forEach(btn => {
        // Skip specialized buttons or ones the user wants to stay active
        if (btn.id === 'dome-gallery-next-btn' || btn.id === 'final-proceed-btn') {
            btn.classList.remove('loading');
            (btn as HTMLButtonElement).disabled = false;
            return;
        }
        
        const dest = btn.getAttribute('data-target');
        if (dest && preloadedPages.has(dest)) {
            btn.classList.remove('loading');
            (btn as HTMLButtonElement).disabled = false;
        } else {
            // Keep or set to loading
            btn.classList.add('loading');
            (btn as HTMLButtonElement).disabled = true;
        }
    });
}

// --- NAVIGATION LOGIC ---
function navigateTo(pageId: string) {
    if (!preloadedPages.has(pageId)) {
        console.warn(`Attempted to navigate to ${pageId} but it's not ready.`);
        // Note: we've disabled the buttons, so this shouldn't normally happen.
        // But for completeness, we could wait here if needed.
    }

    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
    });

    // Destroy gallery & ticker when leaving gifts page
    if (STATE.currentPage === 'page-gifts' && pageId !== 'page-gifts') {
        if (gifMotionInstance) {
            gifMotionInstance.destroy();
            gifMotionInstance = null;
        }
        if (textTickerInstance) {
            textTickerInstance.destroy();
            textTickerInstance = null;
        }
    }

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        STATE.currentPage = pageId;
        playTrackForPage(pageId);
        window.scrollTo(0, 0);

        // Proactively preload the next page after a small delay
        const nextBtn = target.querySelector('.next-page-btn');
        if (nextBtn) {
            const nextDest = nextBtn.getAttribute('data-target');
            if (nextDest) {
                setTimeout(() => preloadPageAssets(nextDest), 500);
            }
        }
    }

    // Init gallery & ticker when entering gifts page
    if (pageId === 'page-gifts') {
        // Proactively preload the dome gallery since it's the next step
        preloadPageAssets('page-dome-gallery');
        
        if (!gifMotionInstance) {
            const galleryContainer = document.getElementById('circular-gallery-container');
            const tickerContainer = document.getElementById('text-ticker-container');
            
            if (galleryContainer) {
                requestAnimationFrame(() => {
                    gifMotionInstance = new HorizontalMotion(galleryContainer, {
                        items: GIFT_GIFS,
                        type: 'image',
                        itemWidth: 250,
                        itemHeight: 250,
                        gap: 50,
                        speed: 2.0
                    });
                });
            }
            
            if (tickerContainer) {
                requestAnimationFrame(() => {
                    textTickerInstance = new HorizontalMotion(tickerContainer, {
                        items: [
                            "behen ka bday 🎂", 
                            "chudail 👻", 
                            "haathi 🐘", 
                            "chal nikal 🚀"
                        ],
                        type: 'text',
                        itemWidth: 280,
                        itemHeight: 40,
                        gap: 80,
                        speed: -1.2, 
                        fontSize: '1.2rem',
                        textColor: 'var(--accent-pink)'
                    });
                });
            }
        }
    }

    // Init DomeGallery when entering the dome gallery page
    if (pageId === 'page-dome-gallery') {
        const welcomeOverlay = document.getElementById('dome-welcome-overlay');
        const lessGoBtn = document.getElementById('dome-less-go-btn') as HTMLButtonElement | null;
        
        if (welcomeOverlay && lessGoBtn) {
            welcomeOverlay.classList.remove('hidden');
            welcomeOverlay.classList.remove('vanish');
            
            // Note: Dome preloading is now handled by the global system
            // But we keep the specialized button logic for the "spin" behavior

            lessGoBtn.onclick = () => {
                welcomeOverlay.classList.add('vanish');
                setTimeout(() => {
                    welcomeOverlay.classList.add('hidden');
                    if (domeGalleryInstance) {
                        domeGalleryInstance.spin(2500, 3); // 2.5s for 3 rapid revolutions
                    }
                }, 800); // Wait for vanish animation
            };
        }

        if (!domeGalleryInstance) {
            const domeContainer = document.getElementById('dome-gallery-root');
            if (domeContainer) {
                requestAnimationFrame(async () => {
                    domeGalleryInstance = await initDomeGallery('#dome-gallery-root', {
                        fit: 0.8,
                        minRadius: 600,
                        maxVerticalRotationDeg: 0,
                        segments: 34,
                        dragDampening: 2,
                        grayscale: false
                    });

                    // Global system already preloaded these, but we ensure consistency
                    if (domeGalleryInstance && domeGalleryInstance.ready) {
                        await domeGalleryInstance.ready;
                        if (lessGoBtn) {
                            lessGoBtn.classList.remove('loading');
                            lessGoBtn.disabled = false;
                            lessGoBtn.innerHTML = 'Lesss go 💖';
                        }
                    }
                });
            }
        }
    }

    // Stagger circuit items in when entering the timeline page
    if (pageId === 'page-timeline') {
        const items = Array.from(document.querySelectorAll('.circuit-item'));
        // Reset first
        items.forEach(item => item.classList.remove('visible'));
        // Stagger in
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), 300 + index * 600);
        });

        // Add reveal logic for Pratyush button
        const revealBtn = document.getElementById('reveal-pratyush-btn');
        const revealedName = document.getElementById('revealed-pratyush');
        if (revealBtn && revealedName) {
            revealBtn.onclick = (e) => {
                e.stopPropagation();
                revealBtn.classList.add('hidden');
                revealedName.classList.remove('hidden');
            };
        }
    }

    // Init OrbitImages when entering the games page
    if (pageId === 'page-games') {
        const shockOverlay = document.getElementById('games-shock-overlay');
        if (shockOverlay) {
            shockOverlay.classList.remove('hidden');
            shockOverlay.classList.add('active');
            fireConfetti(); // Trigger confetti burst
            setTimeout(() => {
                shockOverlay.classList.add('hidden');
                shockOverlay.classList.remove('active');
            }, 3000);
        }

        const orbitContainer = document.getElementById('orbit-container-games');
        if (orbitContainer && !orbitContainer.hasChildNodes()) {
            createOrbitImages(orbitContainer, {
                images: [
                    "/111.jpeg",
                    "/112.jpeg",
                    "/113.jpeg",
                    "/114.jpeg",
                    "/WhatsApp Image 2026-03-15 at 3.53.27 PM.jpeg",
                    "/WhatsApp Image 2026-03-15 at 4.01.12 PM.jpeg"
                ],
                shape: "ellipse",
                radiusX: 340,
                radiusY: 80,
                rotation: -8,
                duration: 30,
                itemSize: 80,
                fill: true,
                showPath: true
            });
        }
        
        // Ensure the end page is ready
        preloadPageAssets('page-end');

        // Explicit handler for the final button to ensure 100% reliability
        const finalBtn = document.getElementById('final-proceed-btn');
        if (finalBtn) {
            finalBtn.onclick = (e) => {
                e.stopPropagation();
                fireConfetti();
                setTimeout(() => navigateTo('page-end'), 300);
            };
        }
    }

    if (pageId === 'page-end') {
        mountMasonry('page-end-masonry-container');
    }
}

function setupNavigation() {
    // Preload hero page assets immediately (it's already visible but good practice)
    preloadPageAssets('page-hero');
    // Also preload the first navigation target (gifts page)
    preloadPageAssets('page-gifts');

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const navBtn = target.closest('.next-page-btn, .back-btn') as HTMLElement;
        
        if (navBtn) {
            const dest = navBtn.getAttribute('data-target');
            if (dest) {
                // If it's a next button and not ready, don't navigate
                // EXCEPT for the dome gallery next button and the final button
                const bypassReadyCheck = navBtn.id === 'dome-gallery-next-btn' || navBtn.id === 'final-proceed-btn';
                
                if (navBtn.classList.contains('next-page-btn') && 
                    !bypassReadyCheck && 
                    !preloadedPages.has(dest)) {
                    console.log(`Page ${dest} is NOT ready yet.`);
                    return;
                }
                navigateTo(dest);
            }
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

    let maskSize = 350;

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
    const items = document.querySelectorAll('.gift-card');
    const submitBtn = document.getElementById('submit-gifts-btn');

    if (!submitBtn) return;

    items.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });
    });

    submitBtn.addEventListener('click', () => {
        const selectedItems = document.querySelectorAll('.gift-card.selected');
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
            <button class="glass-btn primary mt-4 next-page-btn" id="accept-debt-btn" data-target="page-dome-gallery">I Accept My Debt ➡️</button>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof fireConfetti === 'function') fireConfetti();

    // Trigger update for newly added modal button
    updateButtonStates();

    const acceptBtn = document.getElementById('accept-debt-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            if (!preloadedPages.has('page-dome-gallery')) return;
            overlay.remove();
            navigateTo('page-dome-gallery');
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

// --- CIRCUIT TIMELINE OBSERVER ---
function setupTimelineObserver() {
    const items = Array.from(document.querySelectorAll('.circuit-item'));
    if (!items.length) return;

    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 600);
                });
            }
        });
    }, { threshold: 0.05 });

    // Observe the container so it fires when any part of the list is in view
    const container = document.getElementById('circuit-container');
    if (container) observer.observe(container);
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
