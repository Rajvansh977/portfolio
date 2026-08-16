import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ─────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 18);

    // ── Mouse tracking ────────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = e => {
      mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const gold  = new THREE.Color(0xf4d03f);
    const white = new THREE.Color(0xe8f4f8);

    // ── Particle field ────────────────────────────────────────────
    const PARTICLE_COUNT = 2000;
    const positions  = new Float32Array(PARTICLE_COUNT * 3);
    const colors     = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 70;
      positions[i3 + 1] = (Math.random() - 0.5) * 45;
      positions[i3 + 2] = (Math.random() - 0.5) * 30 - 5;
      velocities[i3]     = (Math.random() - 0.5) * 0.006;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.006;
      const c = new THREE.Color().lerpColors(gold, white, Math.random());
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const pMat = new THREE.PointsMaterial({
      size: 0.13, vertexColors: true,
      transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
      sizeAttenuation: true,
    });

    scene.add(new THREE.Points(pGeo, pMat));

    // ── Connecting lines ──────────────────────────────────────────
    const MAX_LINES = 300;
    const linePositions = new Float32Array(MAX_LINES * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: gold, transparent: true, opacity: 0.07,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse lerp
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Camera parallax on mouse
      camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Move particles
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3]     += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        if (pos[i3]     >  35)  pos[i3]     = -35;
        if (pos[i3]     < -35)  pos[i3]     =  35;
        if (pos[i3 + 1] >  22)  pos[i3 + 1] = -22;
        if (pos[i3 + 1] < -22)  pos[i3 + 1] =  22;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Connecting lines between nearby particles
      let lIdx = 0;
      for (let i = 0; i < PARTICLE_COUNT && lIdx < MAX_LINES; i += 10) {
        for (let j = i + 10; j < PARTICLE_COUNT && lIdx < MAX_LINES; j += 10) {
          const i3 = i * 3, j3 = j * 3;
          const dx = pos[i3] - pos[j3];
          const dy = pos[i3+1] - pos[j3+1];
          if (dx*dx + dy*dy < 20) {
            const l = lIdx * 6;
            linePositions[l]   = pos[i3];   linePositions[l+1] = pos[i3+1]; linePositions[l+2] = pos[i3+2];
            linePositions[l+3] = pos[j3];   linePositions[l+4] = pos[j3+1]; linePositions[l+5] = pos[j3+2];
            lIdx++;
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, lIdx * 2);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
    />
  );
}
