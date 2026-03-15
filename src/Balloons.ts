export class BalloonEffect {
    private colors = ['#ff6b8b', '#4d96ff', '#f9d56e', '#ff9ff3', '#54a0ff'];
    private active = false;
    private spawnInterval: number | null = null;

    constructor() {
        this.injectStyles();
    }

    private injectStyles() {
        if (document.getElementById('balloon-styles')) return;
        const style = document.createElement('style');
        style.id = 'balloon-styles';
        style.textContent = `
            .balloon {
                position: fixed;
                bottom: -150px;
                width: 50px;
                height: 70px;
                border-radius: 50%;
                z-index: 1000;
                pointer-events: none;
                animation: floatUp 15s linear forwards, sway 4s ease-in-out infinite alternate;
                box-shadow: inset -10px -10px 20px rgba(0,0,0,0.2);
            }
            /* The knot at the bottom */
            .balloon::before {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 7px solid currentColor;
                filter: brightness(0.8);
            }
            /* The string */
            .balloon::after {
                content: '';
                position: absolute;
                bottom: -40px;
                left: 50%;
                transform: translateX(-50%);
                width: 1px;
                height: 40px;
                background: rgba(255, 255, 255, 0.4);
            }
            /* The specular highlight (shine) */
            .balloon-shine {
                position: absolute;
                top: 15%;
                left: 15%;
                width: 25%;
                height: 20%;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                filter: blur(2px);
                transform: rotate(-30deg);
            }
            @keyframes floatUp {
                to { transform: translateY(-130vh); }
            }
            @keyframes sway {
                from { margin-left: -30px; }
                to { margin-left: 30px; }
            }
        `;
        document.head.appendChild(style);
    }

    public startLoop() {
        if (this.active) return;
        this.active = true;
        this.spawnContinuous();
    }

    private spawnContinuous() {
        if (!this.active) return;
        this.createBalloon();
        const nextDelay = 800 + Math.random() * 1200;
        this.spawnInterval = setTimeout(() => this.spawnContinuous(), nextDelay) as any;
    }

    public stopLoop() {
        this.active = false;
        if (this.spawnInterval) {
            clearTimeout(this.spawnInterval);
            this.spawnInterval = null;
        }
    }

    private createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const shine = document.createElement('div');
        shine.className = 'balloon-shine';
        balloon.appendChild(shine);
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = 40 + Math.random() * 50;
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;

        balloon.style.backgroundColor = color;
        // Also set currentColor for the knot
        balloon.style.color = color;
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.3}px`;
        balloon.style.left = `${left}%`;
        balloon.style.animationDuration = `${duration}s, 4s`;
        balloon.style.animationDelay = `${delay}s, 0s`;
        
        // Use a radial gradient for a more spherical look
        balloon.style.backgroundImage = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 60%)`;

        document.body.appendChild(balloon);

        balloon.addEventListener('animationend', (e) => {
            if (e.animationName === 'floatUp') {
                balloon.remove();
            }
        });
    }
}
