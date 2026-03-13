export interface OrbitImagesOptions {
    images: string[];
    shape?: 'circle' | 'ellipse' | 'square' | 'rectangle' | 'triangle' | 'star' | 'heart' | 'infinity' | 'wave' | 'custom';
    customPath?: string;
    baseWidth?: number;
    radiusX?: number;
    radiusY?: number;
    radius?: number;
    starPoints?: number;
    starInnerRatio?: number;
    rotation?: number;
    duration?: number;
    itemSize?: number;
    direction?: 'normal' | 'reverse';
    fill?: boolean;
    showPath?: boolean;
    pathColor?: string;
    pathWidth?: number;
}

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number) {
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}
// other paths can be added but ellipse is all we need right now

export function createOrbitImages(container: HTMLElement, options: OrbitImagesOptions) {
    const {
        images = [],
        shape = 'ellipse',
        baseWidth = 1400,
        radiusX = 700,
        radiusY = 170,
        radius = 300,
        rotation = -8,
        duration = 40,
        itemSize = 64,
        fill = true,
        showPath = false,
        pathColor = 'rgba(255,255,255,0.1)',
        pathWidth = 2,
    } = options;

    const cx = baseWidth / 2;
    const cy = baseWidth / 2;
    
    let path = generateEllipsePath(cx, cy, radiusX, radiusY);
    if (shape === 'circle') {
        path = generateEllipsePath(cx, cy, radius, radius);
    }

    container.innerHTML = '';
    container.classList.add('orbit-container');
    container.style.width = '100%';
    container.style.aspectRatio = '1 / 1';
    container.setAttribute('aria-hidden', 'true');

    const scalingContainer = document.createElement('div');
    scalingContainer.className = 'orbit-scaling-container orbit-scaling-container--responsive';
    scalingContainer.style.width = `${baseWidth}px`;
    scalingContainer.style.height = `${baseWidth}px`;
    
    // Scale handling
    const updateScale = () => {
        const scale = container.clientWidth / baseWidth;
        scalingContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    new ResizeObserver(updateScale).observe(container);
    updateScale();

    const rotationWrapper = document.createElement('div');
    rotationWrapper.className = 'orbit-rotation-wrapper';
    rotationWrapper.style.transform = `rotate(${rotation}deg)`;

    if (showPath) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${baseWidth} ${baseWidth}`);
        svg.setAttribute('class', 'orbit-path-svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke', pathColor);
        pathEl.setAttribute('stroke-width', (pathWidth).toString()); // not scaled by JS, let SVG scale it
        svg.appendChild(pathEl);
        rotationWrapper.appendChild(svg);
    }

    images.forEach((src, index) => {
        const itemOffset = fill ? (index / images.length) * 100 : 0;
        
        const item = document.createElement('div');
        item.className = 'orbit-item';
        item.style.width = `${itemSize}px`;
        item.style.height = `${itemSize}px`;
        item.style.offsetPath = `path("${path}")`;
        item.style.offsetRotate = '0deg';
        item.style.offsetAnchor = 'center center';
        
        // Set initial offset static position
        item.style.offsetDistance = `${itemOffset}%`;
        
        // Add animation starting from 0 to 100%
        item.style.animation = `orbitAnim ${duration}s linear infinite`;
        // Use a negative delay to stagger them based on offset smoothly
        item.style.animationDelay = `calc(${duration}s * -${itemOffset / 100})`;

        const imgWrapper = document.createElement('div');
        imgWrapper.style.transform = `rotate(${-rotation}deg)`;
        imgWrapper.style.width = '100%';
        imgWrapper.style.height = '100%';

        const img = document.createElement('img');
        img.src = src;
        img.draggable = false;
        img.className = 'orbit-image';
        
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
        rotationWrapper.appendChild(item);
    });

    scalingContainer.appendChild(rotationWrapper);
    container.appendChild(scalingContainer);
}
