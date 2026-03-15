import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Masonry from './Masonry';

let masonryRoot: Root | null = null;

const MASONRY_ITEMS = [
    {
      id: "msg",
      content: (
        <>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Happy Birthday Ridhi ❤️</h2>
            <p>This website took unnecessary effort but maximum love. Hope you have the best birthday ever!</p>
        </>
      ),
      height: 600,
    },
    { id: "1", img: "/1.jpeg", height: 700 },
    { id: "2", img: "/2.jpeg", height: 500 },
    { id: "3", img: "/3.jpeg", height: 800 },
    { id: "4", img: "/4.jpeg", height: 600 },
    { id: "5", img: "/5.jpeg", height: 900 },
    { id: "6", img: "/6.jpeg", height: 500 },
    { id: "7", img: "/7.jpeg", height: 800 },
    { id: "8", img: "/8.jpeg", height: 600 },
    { id: "9", img: "/9.jpeg", height: 700 },
    { id: "10", img: "/10.jpeg", height: 500 },
    { id: "11", img: "/11.jpeg", height: 800 },
    { id: "12", img: "/12.jpeg", height: 600 }
];

export function mountMasonry(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (masonryRoot) return;

  masonryRoot = createRoot(container);
  masonryRoot.render(
    <React.StrictMode>
      <div style={{ width: '100%', height: '80vh', marginTop: '20px' }}>
        <Masonry
            items={MASONRY_ITEMS}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={0.95}
            blurToFocus
            colorShiftOnHover={false}
        />
      </div>
    </React.StrictMode>
  );
}
