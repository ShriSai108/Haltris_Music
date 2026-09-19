import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { SoundToggle } from './SoundToggle';

interface ThreeHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ThreeHero({ eyebrow, title, description }: ThreeHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const webGLSupported = useWebGLSupport();
  const [sceneAvailable, setSceneAvailable] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const useFallback = prefersReducedMotion || !webGLSupported || !sceneAvailable;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sceneRef.current;

    if (!canvas || !container || useFallback) {
      return undefined;
    }

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setSceneAvailable(false);
      return undefined;
    }

    const isCompactScene = window.innerWidth < 768;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0b');

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const ambientLight = new THREE.AmbientLight('#c9a5ff', 1.25);
    const pointLight = new THREE.PointLight('#a855f7', 32, 14, 2);
    pointLight.position.set(2, 2.5, 3);
    const fillLight = new THREE.PointLight('#6d28d9', 14, 10, 2);
    fillLight.position.set(-3, -2, 1);
    scene.add(ambientLight, pointLight, fillLight);

    const knotGeometry = new THREE.TorusKnotGeometry(1.05, 0.28, isCompactScene ? 48 : 112, isCompactScene ? 6 : 12);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: '#5b21b6',
      emissive: '#7e22ce',
      emissiveIntensity: 1.6,
      metalness: 0.6,
      roughness: 0.28,
      flatShading: true,
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    knot.rotation.set(0.7, 0.2, -0.3);
    scene.add(knot);

    const particleCount = isCompactScene ? 48 : 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = (index / particleCount) * Math.PI * 2;
      const radius = 1.65 + (index % 5) * 0.08;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius * 0.55;
      particlePositions[index * 3 + 2] = ((index % 7) - 3) * 0.13;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: '#d8b4fe',
      size: isCompactScene ? 0.025 : 0.035,
      transparent: true,
      opacity: 0.78,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const sceneWidth = Math.max(width, 1);
      const sceneHeight = Math.max(height, 1);
      camera.aspect = sceneWidth / sceneHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(sceneWidth, sceneHeight, false);
    };

    let pointerX = 0;
    let pointerY = 0;
    const updatePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    };

    let animationFrame = 0;
    const animate = (time: number) => {
      if (document.hidden) {
        return;
      }

      knot.rotation.x = 0.7 + time * 0.00012 + pointerY * 0.12;
      knot.rotation.y = 0.2 + time * 0.00018 + pointerX * 0.2;
      particles.rotation.z = time * 0.00008;
      camera.position.x += (pointerX * 0.22 - camera.position.x) * 0.04;
      camera.position.y += (-pointerY * 0.16 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    container.addEventListener('pointermove', updatePointer);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      container.removeEventListener('pointermove', updatePointer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      knotGeometry.dispose();
      knotMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [useFallback]);

  return (
    <section className="three-hero" aria-labelledby="three-hero-title">
      <div className="three-hero__content">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="three-hero-title">{title}</h1>
        <p className="three-hero__description">{description}</p>
        <SoundToggle enabled={soundEnabled} onEnable={() => setSoundEnabled(true)} />
      </div>
      <div
        ref={sceneRef}
        className={useFallback ? 'three-hero__scene three-hero__scene--fallback' : 'three-hero__scene'}
        aria-hidden="true"
      >
        {useFallback ? <div className="three-hero__fallback-core" /> : <canvas ref={canvasRef} />}
      </div>
    </section>
  );
}
