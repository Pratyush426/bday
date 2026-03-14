export interface MotionOptions {
    items: string[];
    type: 'image' | 'text';
    itemWidth?: number;
    itemHeight?: number;
    gap?: number;
    speed?: number;
    fontSize?: string;
    fontWeight?: string;
    textColor?: string;
}

export class HorizontalMotion {
    private container: HTMLElement;
    private options: MotionOptions;
    private domItems: HTMLElement[] = [];
    private scroll = { target: 0, current: 0, last: 0, ease: 0.05 };
    private isDown = false;
    private startX = 0;
    private rafId: number = 0;

    constructor(container: HTMLElement, options: MotionOptions) {
        this.container = container;
        this.options = {
            itemWidth: 250,
            itemHeight: 250,
            gap: 50,
            speed: 1.5,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textColor: '#ffffff',
            ...options
        };
        this.init();
    }

    private init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.cursor = 'grab';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.whiteSpace = 'nowrap';

        // Duplicate for infinite scroll feel
        const count = Math.ceil(this.container.clientWidth / (this.options.itemWidth! + this.options.gap!)) + 2;
        const fullList = [];
        for (let i = 0; i < 3; i++) fullList.push(...this.options.items);
        
        fullList.forEach((content) => {
            const item = document.createElement('div');
            item.className = 'motion-item';
            item.style.position = 'absolute';
            item.style.width = `${this.options.itemWidth}px`;
            item.style.height = `${this.options.itemHeight}px`;
            item.style.top = '50%';
            item.style.left = '0';
            item.style.marginTop = `-${this.options.itemHeight! / 2}px`;
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            
            if (this.options.type === 'image') {
                const img = document.createElement('img');
                img.src = content;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.draggable = false;
                item.appendChild(img);
            } else {
                item.textContent = content;
                item.style.fontSize = this.options.fontSize!;
                item.style.fontWeight = this.options.fontWeight!;
                item.style.color = this.options.textColor!;
                item.style.fontFamily = "'Space Grotesk', sans-serif";
                item.style.textTransform = 'uppercase';
            }
            
            this.container.appendChild(item);
            this.domItems.push(item);
        });

        this.addEvents();
        this.update();
    }

    private addEvents() {
        this.container.addEventListener('mousedown', (e) => this.onDown(e.clientX));
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX));
        window.addEventListener('mouseup', () => this.onUp());
        
        this.container.addEventListener('touchstart', (e) => this.onDown(e.touches[0].clientX), { passive: true });
        this.container.addEventListener('touchmove', (e) => this.onMove(e.touches[0].clientX), { passive: true });
        this.container.addEventListener('touchend', () => this.onUp());
    }

    private onDown(x: number) {
        this.isDown = true;
        this.startX = x;
        this.container.style.cursor = 'grabbing';
    }

    private onMove(x: number) {
        if (!this.isDown) return;
        const delta = (this.startX - x) * 2;
        this.scroll.target += delta;
        this.startX = x;
    }

    private onUp() {
        this.isDown = false;
        this.container.style.cursor = 'grab';
    }

    private update = () => {
        if (!this.isDown) {
            this.scroll.target += this.options.speed!;
        }

        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;

        const effectiveItemWidth = this.options.itemWidth! + this.options.gap!;
        const totalWidth = this.domItems.length * effectiveItemWidth;
        const viewportWidth = this.container.clientWidth;
        
        this.domItems.forEach((item, i) => {
            const basePos = i * effectiveItemWidth;
            let x = (basePos - this.scroll.current) % totalWidth;
            
            if (x < -effectiveItemWidth) x += totalWidth;
            if (x > totalWidth - effectiveItemWidth) x -= totalWidth;

            item.style.transform = `translate3d(${x}px, 0, 0)`;
            
            // Subtle fade at edges
            const normalizedX = (x - viewportWidth / 2) / (viewportWidth / 2);
            item.style.opacity = (1.2 - Math.abs(normalizedX)).toString();
        });

        this.rafId = requestAnimationFrame(this.update);
    }

    public destroy() {
        cancelAnimationFrame(this.rafId);
        this.container.innerHTML = '';
    }
}
