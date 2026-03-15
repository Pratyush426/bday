import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Masonry from './Masonry';

let masonryRoot: Root | null = null;

export function mountMasonry(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (masonryRoot) return;

  // Use placeholder images for now as requested
  const PICSUM_POOL = [
      {
        id: "msg",
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Happy Birthday Ridhi ❤️</h2>
              <p style={{ fontSize: '1.4rem' }}>This website took unnecessary effort but maximum love. Hope you have the best birthday ever!</p>
          </div>
        ),
        height: 800,
      },
      { id: "p1", img: "https://picsum.photos/id/1015/600/900?grayscale", height: 700 },
      { id: "p2", img: "https://picsum.photos/id/1011/600/750?grayscale", height: 500 },
      { id: "p3", img: "https://picsum.photos/id/1020/600/800?grayscale", height: 800 },
      { id: "p4", img: "https://picsum.photos/id/1025/600/600?grayscale", height: 600 },
      { id: "p5", img: "https://picsum.photos/id/1035/600/900?grayscale", height: 900 },
      { id: "p6", img: "https://picsum.photos/id/1040/600/500?grayscale", height: 500 },
      { id: "p7", img: "https://picsum.photos/id/1043/600/800?grayscale", height: 800 },
      { id: "p8", img: "https://picsum.photos/id/1050/600/600?grayscale", height: 600 },
      { id: "p9", img: "https://picsum.photos/id/1055/600/700?grayscale", height: 700 },
      { id: "p10", img: "https://picsum.photos/id/1060/600/500?grayscale", height: 500 },
      { id: "p11", img: "https://picsum.photos/id/1065/600/800?grayscale", height: 800 },
      { id: "p12", img: "https://picsum.photos/id/1070/600/600?grayscale", height: 600 },
      { id: "p13", img: "https://picsum.photos/id/1075/600/700?grayscale", height: 700 },
      { id: "p14", img: "https://picsum.photos/id/1080/600/500?grayscale", height: 500 },
      { id: "p15", img: "https://picsum.photos/id/1084/600/800?grayscale", height: 800 },
      { id: "p16", img: "https://picsum.photos/id/1018/600/600?grayscale", height: 600 },
      { id: "p17", img: "https://picsum.photos/id/1022/600/900?grayscale", height: 900 },
      { id: "p18", img: "https://picsum.photos/id/1031/600/500?grayscale", height: 500 },
  ];

  masonryRoot = createRoot(container);
  masonryRoot.render(
    <React.StrictMode>
      <div style={{ width: '100%', height: '100vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        <Masonry
            items={PICSUM_POOL}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={1.0}
            blurToFocus
            colorShiftOnHover={false}
        />
      </div>
    </React.StrictMode>
  );
}
