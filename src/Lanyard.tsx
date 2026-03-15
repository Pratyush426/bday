import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

const cardGLB = '/card.glb';

import './Lanyard.css';

// @ts-ignore
extend({ MeshLineGeometry, MeshLineMaterial });

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const videoFiles = [
  '/WhatsApp Video 2026-03-14 at 5.50.00 PM.mp4',
  '/WhatsApp Video 2026-03-14 at 5.50.00 PM (1).mp4',
  '/WhatsApp Video 2026-03-14 at 5.50.00 PM (2).mp4'
];

export default function Lanyard({ count = 10, position = [0, 0, 38], gravity = [0, -40, 0], fov = 40, transparent = true }: any) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [assetsMissing, setAssetsMissing] = useState(false);

  useEffect(() => {
    const checkAssets = async () => {
        try {
            const resps = await Promise.all([
                fetch(cardGLB),
                ...videoFiles.map(v => fetch(v))
            ]);
            
            const types = await Promise.all(resps.map(r => r.headers.get('content-type')));
            const hasHtml = types.some(t => t?.includes('text/html'));
            const allOk = resps.every(r => r.ok);
            
            if (!allOk || hasHtml) {
                setAssetsMissing(true);
            }
        } catch (e) {
            setAssetsMissing(true);
        }
    };
    checkAssets();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (assetsMissing) {
      return (
          <div className="lanyard-wrapper" style={{ border: '2px dashed #ff4d94', color: '#ff4d94', padding: '20px', textAlign: 'center', height: 'auto', background: 'rgba(255, 77, 148, 0.1)', borderRadius: '12px' }}>
              <h3 style={{ margin: 0 }}>Lanyard Component Ready</h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
                  Please ensure 3D assets and videos are in your <strong>public</strong> folder!
              </p>
          </div>
      );
  }

  // Large spacing for a wide circular loop
  const horizontalSpacing = isMobile ? 6 : 9;
  const totalWidth = count * horizontalSpacing;
  const startX = -totalWidth / 2;

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position as any, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <Physics gravity={gravity as any} timeStep={isMobile ? 1 / 30 : 1 / 60}>
              {Array.from({ length: count }).map((_, i) => (
                <Band 
                  key={i} 
                  xBase={startX + i * horizontalSpacing} 
                  totalWidth={totalWidth}
                  yOffset={i % 2 === 0 ? 0 : -3.5}
                  videoSrc={videoFiles[i % videoFiles.length]}
                  isMobile={isMobile} 
                />
              ))}
            </Physics>
          </Suspense>
        </ErrorBoundary>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ xBase = 0, yOffset = 0, totalWidth = 50, videoSrc = '', maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef<any>(null),
    fixed = useRef<any>(null),
    j1 = useRef<any>(null),
    j2 = useRef<any>(null),
    j3 = useRef<any>(null),
    card = useRef<any>(null);
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps: any = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  
  const gltf: any = useGLTF(cardGLB, true);
  const nodes = gltf?.nodes || {};
  const materials = gltf?.materials || {};
  
  // Video Texture logic
  const [video] = useState(() => {
    const vid = document.createElement('video');
    vid.src = videoSrc;
    vid.crossOrigin = 'Anonymous';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.autoplay = true;
    vid.play().catch(() => {});
    return vid;
  });

  const [videoTexture] = useState(() => {
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false; // Fix inverted video
    return tex;
  });

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<any>(false);
  const [hovered, hover] = useState(false);
  const lastX = useRef(xBase);

  // @ts-ignore
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  // @ts-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  // @ts-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  // @ts-ignore
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speed = 0.5; // Significantly slowed down for better video clarity
    
    // Circular infinite motion calculation
    let targetX = ((xBase + t * speed + totalWidth / 2) % totalWidth) - totalWidth / 2;
    
    // Teleportation handling for seamless wrapping
    if (Math.abs(targetX - lastX.current) > totalWidth / 2) {
        const offset = targetX - lastX.current > 0 ? -totalWidth : totalWidth;
        [fixed, j1, j2, j3, card].forEach(ref => {
            if (ref.current) {
                const currentPos = ref.current.translation();
                ref.current.setTranslation({ x: currentPos.x + offset, y: currentPos.y, z: currentPos.z }, true);
            }
        });
    }
    lastX.current = targetX;

    if (fixed.current) {
        fixed.current.setNextKinematicTranslation({ 
            x: targetX, 
            y: 8 + yOffset, 
            z: 0 
        });
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    } else {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      if (card.current) {
          ang.copy(card.current.angvel());
          rot.copy(card.current.rotation());
          card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }

    if (fixed.current && j3.current && card.current) {
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.lerped || j2.current.translation());
        curve.points[2].copy(j1.current.lerped || j1.current.translation());
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
    }
  });

  return (
    <>
      <group>
        <RigidBody ref={fixed} {...segmentProps} type="kinematicPosition">
            {/* Hook assembly moved to the top anchor */}
            <group scale={3.5} position={[0, -0.5, -0.05]} rotation={[0, 0, 0]}>
                {nodes.clip && (
                  <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                )}
                {nodes.clamp && (
                  <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                )}
            </group>
        </RigidBody>
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.9, 1.8, 0.01]} />
          <group
            scale={[4.2, 5.8, 1]}
            position={[0, -1.8, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e: any) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {nodes.card && (
              <mesh geometry={nodes.card.geometry}>
                <meshPhysicalMaterial
                  map={videoTexture}
                  map-anisotropy={16}
                  clearcoat={isMobile ? 0 : 1}
                  clearcoatRoughness={0.15}
                  roughness={0.9}
                  metalness={0.8}
                />
              </mesh>
            )}
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial
          color="#ffffff"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          lineWidth={0.15}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}
