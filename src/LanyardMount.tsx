import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Lanyard from './Lanyard';

let lanyardRoot: Root | null = null;

export function mountLanyard(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Prevent multiple mounts
  if (lanyardRoot) {
      return; 
  }

  lanyardRoot = createRoot(container);
  lanyardRoot.render(
    <React.StrictMode>
      <Lanyard position={[0, 0, 25]} gravity={[0, -40, 0]} />
    </React.StrictMode>
  );
}
