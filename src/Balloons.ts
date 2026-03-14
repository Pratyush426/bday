export class BalloonEffect {
    private colors = ['#ff6b8b', '#4d96ff', '#f9d56e', '#ff9ff3', '#54a0ff'];

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
                bottom: -100px;
                width: 50px;
                height: 70px;
                border-radius: 50%;
                z-index: 1000;
                pointer-events: none;
                animation: floatUp 10s linear forwards, sway 3s ease-in-out infinite alternate;
            }
            .balloon::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 2px;
                height: 30px;
                background: rgba(255, 255, 255, 0.3);
            }
            @keyframes floatUp {
                to { transform: translateY(-120vh); }
            }
            @keyframes sway {
                from { margin-left: -20px; }
                to { margin-left: 20px; }
            }
        `;
        document.head.appendChild(style);
    }

    public spawn(count: number = 1) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.createBalloon(), i * 300);
        }
    }

    private createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = 30 + Math.random() * 40;
        const left = Math.random() * 100;
        const duration = 6 + Math.random() * 8;
        const delay = Math.random() * 2;

        balloon.style.backgroundColor = color;
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.3}px`;
        balloon.style.left = `${left}%`;
        balloon.style.animationDuration = `${duration}s, 3s`;
        balloon.style.animationDelay = `${delay}s`;
        balloon.style.opacity = (0.7 + Math.random() * 0.3).toString();

        document.body.appendChild(balloon);

        balloon.addEventListener('animationend', () => {
            balloon.remove();
        });
    }
}
