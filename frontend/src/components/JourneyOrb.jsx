import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function JourneyOrb() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 6);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = e => {
      const rect = mount.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const gold = new THREE.Color(0xf4d03f);

    // ── Core orb ──────────────────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(0.9, 64, 64);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      emissive: new THREE.Color(0xf4d03f),
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    // ── Wireframe shell ───────────────────────────────────────────
    const wireGeo = new THREE.IcosahedronGeometry(1.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf4d03f, wireframe: true,
      transparent: true, opacity: 0.15,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // ── Outer glow ring ───────────────────────────────────────────
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xf4d03f, transparent: true, opacity: 0.4 })
    );
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.006, 6, 100),
      new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.15 })
    );
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 5;
    scene.add(ring2);

    // ── Orbiting dots ─────────────────────────────────────────────
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    const ORBIT_COUNT = 8;
    const orbitDots = [];
    for (let i = 0; i < ORBIT_COUNT; i++) {
      const angle  = (i / ORBIT_COUNT) * Math.PI * 2;
      const radius = 1.5 + (i % 3) * 0.3;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xf4d03f : 0xe8f4f8,
          transparent: true, opacity: 0.9,
        })
      );
      dot.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.6, Math.sin(angle) * radius);
      dot.userData = { angle, radius, speed: 0.004 + Math.random() * 0.006, yOffset: dot.position.y };
      orbitGroup.add(dot);
      orbitDots.push(dot);
    }

    // ── Particle cloud ────────────────────────────────────────────
    const PCOUNT = 600;
    const pPos = new Float32Array(PCOUNT * 3);
    const pCol = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.2 + Math.random() * 1.8;
      pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i*3+2] = r * Math.cos(phi);
      const c = new THREE.Color().lerpColors(gold, new THREE.Color(0xe8f4f8), Math.random());
      pCol[i*3] = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const pCloud = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.04, vertexColors: true,
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(pCloud);

    // ── Lights ────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pointLight = new THREE.PointLight(0xf4d03f, 2, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animate ───────────────────────────────────────────────────
    let frame = 0, animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame += 0.008;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Orb slow spin + mouse tilt
      orb.rotation.y  = frame * 0.4;
      orb.rotation.x  = mouse.y * 0.3;
      wire.rotation.y = -frame * 0.25;
      wire.rotation.x =  frame * 0.15;

      // Rings
      ring1.rotation.z = frame * 0.5;
      ring2.rotation.y = frame * 0.3;

      // Orbit group follows mouse
      orbitGroup.rotation.y  = frame * 0.6 + mouse.x * 0.5;
      orbitGroup.rotation.x  = mouse.y * 0.3;

      // Orbiting dots float
      orbitDots.forEach(dot => {
        dot.userData.angle += dot.userData.speed;
        dot.position.x = Math.cos(dot.userData.angle) * dot.userData.radius;
        dot.position.z = Math.sin(dot.userData.angle) * dot.userData.radius;
        dot.position.y = dot.userData.yOffset + Math.sin(frame * 2 + dot.userData.angle) * 0.1;
      });

      // Particle cloud slow rotation
      pCloud.rotation.y = frame * 0.05;
      pCloud.rotation.x = frame * 0.03;

      // Pulse emissive
      orbMat.emissiveIntensity = 0.12 + Math.sin(frame * 2) * 0.06;
      pointLight.intensity = 1.8 + Math.sin(frame * 3) * 0.4;

      // Camera subtle movement
      camera.position.x = mouse.x * 0.4;
      camera.position.y = -mouse.y * 0.3;
      camera.lookAt(0, 0, 0);

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
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
  );
}
