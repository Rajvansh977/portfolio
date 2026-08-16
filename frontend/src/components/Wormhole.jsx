import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TOTAL_DURATION = 16.7;   // seconds — full clip length
const HALF           = TOTAL_DURATION / 2; // 8.35s per half

// ── Procedural SFX ────────────────────────────────────────────
function playWormholeSound(reverse = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const dur = HALF;

    const osc1   = ctx.createOscillator(); osc1.type   = 'sawtooth';
    const osc2   = ctx.createOscillator(); osc2.type   = 'sine';
    const rumble = ctx.createOscillator(); rumble.type = 'sine';

    if (reverse) {
      osc1.frequency.setValueAtTime(40, now);   osc1.frequency.exponentialRampToValueAtTime(900,  now + dur);
      osc2.frequency.setValueAtTime(60, now);   osc2.frequency.exponentialRampToValueAtTime(1400, now + dur * 0.9);
      rumble.frequency.setValueAtTime(20, now); rumble.frequency.exponentialRampToValueAtTime(140, now + dur);
    } else {
      osc1.frequency.setValueAtTime(800, now);  osc1.frequency.exponentialRampToValueAtTime(40,  now + dur);
      osc2.frequency.setValueAtTime(1200, now); osc2.frequency.exponentialRampToValueAtTime(60,  now + dur * 0.9);
      rumble.frequency.setValueAtTime(120, now);rumble.frequency.exponentialRampToValueAtTime(20, now + dur);
    }

    const bufSize = ctx.sampleRate * dur;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuf;
    const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.Q.value = 3;
    if (reverse) { bpf.frequency.setValueAtTime(80,  now); bpf.frequency.exponentialRampToValueAtTime(700, now + dur); }
    else          { bpf.frequency.setValueAtTime(600, now); bpf.frequency.exponentialRampToValueAtTime(80,  now + dur); }

    const g1=ctx.createGain(); g1.gain.value=0.3;
    const g2=ctx.createGain(); g2.gain.value=0.2;
    const gN=ctx.createGain(); gN.gain.value=0.35;
    const gR=ctx.createGain(); gR.gain.value=0.45;
    const master=ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.4, now + 0.1);
    master.gain.setValueAtTime(0.4, now + dur * 0.6);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(g1);   g1.connect(master);
    osc2.connect(g2);   g2.connect(master);
    noise.connect(bpf); bpf.connect(gN); gN.connect(master);
    rumble.connect(gR); gR.connect(master);
    master.connect(ctx.destination);

    osc1.start(now);   osc1.stop(now + dur);
    osc2.start(now);   osc2.stop(now + dur);
    noise.start(now);  noise.stop(now + dur);
    rumble.start(now); rumble.stop(now + dur);
    setTimeout(() => ctx.close(), (dur + 0.3) * 1000);
  } catch(e) {}
}

// ── Wormhole Component ────────────────────────────────────────
export default function Wormhole({ color = '#f4d03f', reverse = false, onDone }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    playWormholeSound(reverse);

    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 1);
    renderer.setAnimationLoop(null);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ─────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, 12);

    // ── Lighting ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const pt = new THREE.PointLight(0xffffff, 2, 50);
    pt.position.set(0, 0, 5);
    scene.add(pt);

    // ── Safety timeout ─────────────────────────────────────────
    const safetyTimer = setTimeout(() => {
      cleanup(); onDone();
    }, (HALF + 1) * 1000);

    let mixer = null;
    let animId = null;
    let clock  = new THREE.Clock();

    const cleanup = () => {
      clearTimeout(safetyTimer);
      if (animId) cancelAnimationFrame(animId);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };

    // ── Load GLB ───────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      '/wormhole.glb',
      (gltf) => {
        scene.add(gltf.scene);

        // ── Step 1: compute bounding box at rest pose ─────────
        const box    = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // ── Step 2: translate model so its center is at origin ─
        gltf.scene.position.sub(center);

        // ── Step 3: scale to fill screen ──────────────────────
        const scale = 20 / maxDim;
        gltf.scene.scale.setScalar(scale);

        // ── Step 4: camera always looks at world origin ────────
        camera.position.set(0, 0, 14);
        camera.lookAt(0, 0, 0);
        pt.position.set(0, 0, 14);

        // ── Animation setup ──────────────────────────────────
        mixer = new THREE.AnimationMixer(gltf.scene);

        if (gltf.animations && gltf.animations.length > 0) {
          const clip   = gltf.animations[0]; // "Take 001"
          const action = mixer.clipAction(clip);

          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;

          if (reverse) {
            // Play second half: start from HALF
            action.time      = HALF;
            action.timeScale = 1;
          } else {
            // Play first half: start from 0
            action.time      = 0;
            action.timeScale = 1;
          }

          action.play();

          // Force mixer to evaluate at start frame
          mixer.update(0);
          // Camera always at origin — model was translated there

          const halfDuration = HALF * 1000;

          // After HALF seconds, we're done
          setTimeout(() => {
            cleanup();
            onDone();
          }, halfDuration - 100);
        } else {
          // No animations — just show for 1.5s
          setTimeout(() => { cleanup(); onDone(); }, 1500);
        }

        // ── Render loop ───────────────────────────────────────
        const tick = () => {
          animId = requestAnimationFrame(tick);
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          renderer.render(scene, camera);
        };
        tick();
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err);
        cleanup();
        onDone();
      }
    );

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cleanup();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        background: '#000',
      }}
    />
  );
}
