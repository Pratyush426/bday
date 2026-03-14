export class PyroEffect {
    constructor() {
        this.injectStyles();
    }

    private injectStyles() {
        if (document.getElementById('pyro-styles')) return;
        const style = document.createElement('style');
        style.id = 'pyro-styles';
        style.textContent = `
            .firecracker {
                position: fixed;
                pointer-events: none;
                z-index: 1000;
                font-size: 1.2rem;
                animation: crackerPop ease-out forwards;
            }
            @keyframes crackerPop {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--tx), var(--ty)) scale(0.3);
                }
            }
        `;
        document.head.appendChild(style);
    }

    private createFirecracker(fromX: number, fromY: number) {
        const cracker = document.createElement('div');
        cracker.className = 'firecracker';
        const crackerEmojis = ['💥', '⭐', '✨'];
        cracker.textContent = crackerEmojis[Math.floor(Math.random() * crackerEmojis.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 120;
        
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const duration = 0.6 + Math.random() * 0.4;

        cracker.style.left = `${fromX}px`;
        cracker.style.top = `${fromY}px`;
        cracker.style.setProperty('--tx', `${tx}px`);
        cracker.style.setProperty('--ty', `${ty}px`);
        cracker.style.animationDuration = `${duration}s`;

        document.body.appendChild(cracker);

        setTimeout(() => cracker.remove(), duration * 1000);
    }

    public spawnLeft() {
        // Rapid firecracker bursts on the left
        const burstCount = 8;
        for (let burst = 0; burst < burstCount; burst++) {
            setTimeout(() => {
                const particleCount = 12;
                for (let i = 0; i < particleCount; i++) {
                    setTimeout(() => {
                        this.createFirecracker(30, 50);
                    }, i * 20);
                }
            }, burst * 150);
        }
    }

    public spawnRight() {
        // Rapid firecracker bursts on the right
        const burstCount = 8;
        for (let burst = 0; burst < burstCount; burst++) {
            setTimeout(() => {
                const particleCount = 12;
                for (let i = 0; i < particleCount; i++) {
                    setTimeout(() => {
                        this.createFirecracker(window.innerWidth - 30, 50);
                    }, i * 20);
                }
            }, burst * 150);
        }
    }

    public spawn() {
        this.spawnLeft();
        this.spawnRight();
    }
}
