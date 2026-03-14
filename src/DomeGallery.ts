const DEFAULT_IMAGES = [
  { src: '/1.jpeg', alt: 'Image 1' },
  { src: '/2.jpeg', alt: 'Image 2' },
  { src: '/3.jpeg', alt: 'Image 3' },
  { src: '/4.jpeg', alt: 'Image 4' },
  { src: '/5.jpeg', alt: 'Image 5' },
  { src: '/6.jpeg', alt: 'Image 6' },
  { src: '/7.jpeg', alt: 'Image 7' },
  { src: '/8.jpeg', alt: 'Image 8' },
  { src: '/9.jpeg', alt: 'Image 9' },
  { src: '/10.jpeg', alt: 'Image 10' },
  { src: '/11.jpeg', alt: 'Image 11' },
  { src: '/12.jpeg', alt: 'Image 12' },
  { src: '/13.jpeg', alt: 'Image 13' },
  { src: '/14.jpeg', alt: 'Image 14' },
  { src: '/15.jpeg', alt: 'Image 15' },
  { src: '/16.jpeg', alt: 'Image 16' },
  { src: '/17.jpeg', alt: 'Image 17' },
  { src: '/18.jpeg', alt: 'Image 18' },
  { src: '/19.jpeg', alt: 'Image 19' },
  { src: '/20.jpeg', alt: 'Image 20' },
  { src: '/21.jpeg', alt: 'Image 21' },
  { src: '/22.jpeg', alt: 'Image 22' },
  { src: '/23.jpeg', alt: 'Image 23' },
  { src: '/24.jpeg', alt: 'Image 24' },
  { src: '/25.jpeg', alt: 'Image 25' },
  { src: '/26.jpeg', alt: 'Image 26' },
  { src: '/27.jpeg', alt: 'Image 27' },
  { src: '/28.jpeg', alt: 'Image 28' },
  { src: '/29.jpeg', alt: 'Image 29' },
  { src: '/30.jpeg', alt: 'Image 30' },
  { src: '/31.jpeg', alt: 'Image 31' }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: any[], seg: number) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }

  const normalizedImages = pool.map((image: any) => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export function initDomeGallery(
  containerSelector: string,
  options: any = {}
) {
  const {
    images = DEFAULT_IMAGES,
    fit = 0.5,
    fitBasis = 'auto',
    minRadius = 600,
    maxRadius = Infinity,
    padFactor = 0.25,
    overlayBlurColor = '#060010',
    maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
    dragSensitivity = DEFAULTS.dragSensitivity,
    enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
    segments = DEFAULTS.segments,
    dragDampening = 2,
    openedImageWidth = '250px',
    openedImageHeight = '350px',
    imageBorderRadius = '30px',
    openedImageBorderRadius = '30px',
    grayscale = true
  } = options;

  const rootEl = document.querySelector(containerSelector) as HTMLElement;
  if (!rootEl) {
    console.error(`[DomeGallery] Container not found: ${containerSelector}`);
    return;
  }

  const rootRef = { current: rootEl };
  const mainRef = { current: null as HTMLElement | null };
  const sphereRef = { current: null as HTMLElement | null };
  const frameRef = { current: null as HTMLElement | null };
  const viewerRef = { current: null as HTMLElement | null };
  const scrimRef = { current: null as HTMLElement | null };
  const focusedElRef = { current: null as HTMLElement | null };
  const originalTilePositionRef = { current: null as any };

  const rotationRef = { current: { x: 0, y: 0 } };
  const startRotRef = { current: { x: 0, y: 0 } };
  const startPosRef = { current: null as any };
  const draggingRef = { current: false };
  const movedRef = { current: false };
  const inertiaRAF = { current: null as any };
  const openingRef = { current: false };
  const openStartedAtRef = { current: 0 };
  const lastDragEndAt = { current: 0 };

  const scrollLockedRef = { current: false };
  const lockScroll = () => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  };
  const unlockScroll = () => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  };

  const items = buildItems(images, segments);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = { current: null as number | null };

  // Build HTML structure
  rootEl.innerHTML = `
    <main class="sphere-main">
      <div class="stage">
        <div class="sphere"></div>
      </div>
      <div class="overlay"></div>
      <div class="overlay overlay--blur"></div>
      <div class="edge-fade edge-fade--top"></div>
      <div class="edge-fade edge-fade--bottom"></div>
      <div class="viewer">
        <div class="scrim"></div>
        <div class="frame"></div>
      </div>
    </main>
  `;

  mainRef.current = rootEl.querySelector('.sphere-main') as HTMLElement;
  sphereRef.current = rootEl.querySelector('.sphere') as HTMLElement;
  frameRef.current = rootEl.querySelector('.frame') as HTMLElement;
  viewerRef.current = rootEl.querySelector('.viewer') as HTMLElement;
  scrimRef.current = rootEl.querySelector('.scrim') as HTMLElement;

  // Set CSS variables
  rootEl.style.setProperty('--segments-x', segments.toString());
  rootEl.style.setProperty('--segments-y', segments.toString());

  // Populate sphere with items
  const sphere = sphereRef.current;
  items.forEach((item, i) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.dataset.src = item.src;
    itemDiv.dataset.offsetX = item.x.toString();
    itemDiv.dataset.offsetY = item.y.toString();
    itemDiv.dataset.sizeX = item.sizeX.toString();
    itemDiv.dataset.sizeY = item.sizeY.toString();
    itemDiv.style.setProperty('--offset-x', item.x.toString());
    itemDiv.style.setProperty('--offset-y', item.y.toString());
    itemDiv.style.setProperty('--item-size-x', item.sizeX.toString());
    itemDiv.style.setProperty('--item-size-y', item.sizeY.toString());

    const imgDiv = document.createElement('div');
    imgDiv.className = 'item__image';
    imgDiv.setAttribute('role', 'button');
    imgDiv.setAttribute('tabindex', '0');
    imgDiv.setAttribute('aria-label', item.alt || 'Open image');

    const img = document.createElement('img');
    img.src = item.src;
    img.draggable = false;
    img.alt = item.alt;

    imgDiv.appendChild(img);
    itemDiv.appendChild(imgDiv);
    sphere.appendChild(itemDiv);
  });

  // Handle ResizeObserver
  const ro = new ResizeObserver(() => {
    const cr = rootEl.getBoundingClientRect();
    const w = Math.max(1, cr.width),
      h = Math.max(1, cr.height);
    const minDim = Math.min(w, h),
      maxDim = Math.max(w, h),
      aspect = w / h;
    let basis;
    switch (fitBasis) {
      case 'min':
        basis = minDim;
        break;
      case 'max':
        basis = maxDim;
        break;
      case 'width':
        basis = w;
        break;
      case 'height':
        basis = h;
        break;
      default:
        basis = aspect >= 1.3 ? w : minDim;
    }
    let radius = basis * fit;
    const heightGuard = h * 1.35;
    radius = Math.min(radius, heightGuard);
    radius = clamp(radius, minRadius, maxRadius);
    lockedRadiusRef.current = Math.round(radius);

    const viewerPad = Math.max(8, Math.round(minDim * padFactor));
    rootEl.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
    rootEl.style.setProperty('--viewer-pad', `${viewerPad}px`);
    rootEl.style.setProperty('--overlay-blur-color', overlayBlurColor);
    rootEl.style.setProperty('--tile-radius', imageBorderRadius);
    rootEl.style.setProperty('--enlarge-radius', openedImageBorderRadius);
    rootEl.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  });
  ro.observe(rootEl);

  // Drag handling
  mainRef.current?.addEventListener('pointerdown', (e: PointerEvent) => {
    if (focusedElRef.current) return;
    draggingRef.current = true;
    movedRef.current = false;
    startRotRef.current = { ...rotationRef.current };
    startPosRef.current = { x: e.clientX, y: e.clientY };
  });

  const handlePointerMove = (e: PointerEvent) => {
    if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
    movedRef.current = true;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    const nextX = clamp(
      startRotRef.current.x - dy / dragSensitivity,
      -maxVerticalRotationDeg,
      maxVerticalRotationDeg
    );
    const nextY = wrapAngleSigned(startRotRef.current.y + dx / dragSensitivity);
    rotationRef.current = { x: nextX, y: nextY };
    applyTransform(nextX, nextY);
  };

  document.addEventListener('pointermove', handlePointerMove);

  document.addEventListener('pointerup', () => {
    draggingRef.current = false;
    movedRef.current = false;
  });

  // Close enlarged image
  const closeEnlarge = () => {
    if (performance.now() - openStartedAtRef.current < 250) return;
    const el = focusedElRef.current;
    if (!el) return;
    const parent = el.parentElement as HTMLElement;
    const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
    if (!overlay) return;

    overlay.remove();
    parent.style.setProperty('--rot-y-delta', '0deg');
    parent.style.setProperty('--rot-x-delta', '0deg');
    el.style.visibility = '';
    el.style.zIndex = '0';
    focusedElRef.current = null;
    rootEl?.removeAttribute('data-enlarging');
    openingRef.current = false;
    unlockScroll();
  };

  scrimRef.current?.addEventListener('click', closeEnlarge);
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeEnlarge();
  });

  // Open image handler
  const openItemFromElement = (imgEl: HTMLElement) => {
    if (openingRef.current || movedRef.current || draggingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();

    const parent = imgEl.parentElement as HTMLElement;
    focusedElRef.current = imgEl;

    imgEl.setAttribute('data-focused', 'true');
    imgEl.style.visibility = 'hidden';
    imgEl.style.zIndex = '0';

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.position = 'absolute';
    overlay.style.zIndex = '30';

    const rawSrc = parent.dataset.src || imgEl.querySelector('img')?.src || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    overlay.appendChild(img);
    viewerRef.current?.appendChild(overlay);

    overlay.style.opacity = '0';
    overlay.style.transition = `opacity ${enlargeTransitionMs}ms ease`;

    setTimeout(() => {
      overlay.style.opacity = '1';
      rootEl?.setAttribute('data-enlarging', 'true');
    }, 16);
  };

  // Add click handlers to all tiles
  const tiles = rootEl.querySelectorAll('.item__image');
  tiles.forEach(tile => {
    (tile as HTMLElement).addEventListener('click', () => {
      if (!movedRef.current && !draggingRef.current && !openingRef.current) {
        openItemFromElement(tile as HTMLElement);
      }
    });
  });

  applyTransform(0, 0);

  return {
    destroy: () => {
      ro.disconnect();
      document.removeEventListener('pointermove', handlePointerMove);
      document.body.classList.remove('dg-scroll-lock');
    }
  };
}
