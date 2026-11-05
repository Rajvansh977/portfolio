import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TOTAL_DURATION = 16.7;   // seconds — full clip length
const HALF           = TOTAL_DURATION / 2; // 8.35s per half

// ── Procedural SFX ────────────────────────────────────────────
// Returns a stop() function to kill audio immediately
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

    // Return stop function — ramps volume to 0 in 80ms then closes context
    return () => {
      try {
        const stopNow = ctx.currentTime;
        master.gain.cancelScheduledValues(stopNow);
        master.gain.setValueAtTime(master.gain.value, stopNow);
        master.gain.linearRampToValueAtTime(0, stopNow + 0.08);
        setTimeout(() => { try { ctx.close(); } catch(_) {} }, 150);
      } catch(_) {}
    };
  } catch(e) {
    return () => {}; // no-op if audio failed
  }
}

// ── Wormhole Component ────────────────────────────────────────
export default function Wormhole({ color = '#f4d03f', reverse = false, onDone }) {
  const mountRef  = useRef(null);
  const exitRef   = useRef(null); // call to skip immediately
  const stopSfxRef = useRef(null); // call to stop SFX immediately

  const handleSkip = () => {
    if (stopSfxRef.current) stopSfxRef.current();
    if (exitRef.current) exitRef.current();
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    stopSfxRef.current = playWormholeSound(reverse);

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 1);
    renderer.setAnimationLoop(null);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, 12);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const pt = new THREE.PointLight(0xffffff, 2, 50);
    pt.position.set(0, 0, 5);
    scene.add(pt);

    let doneOnce = false;
    const safetyTimer = setTimeout(() => { cleanup(); finish(); }, (HALF + 1) * 1000);
    let halfTimer = null;

    let mixer = null;
    let animId = null;
    let clock  = new THREE.Clock();

    const cleanup = () => {
      clearTimeout(safetyTimer);
      if (halfTimer) clearTimeout(halfTimer);
      if (animId) cancelAnimationFrame(animId);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };

    const finish = () => {
      if (doneOnce) return;
      doneOnce = true;
      if (stopSfxRef.current) { stopSfxRef.current(); stopSfxRef.current = null; }
      cleanup();
      onDone();
    };

    // Expose skip
    exitRef.current = finish;

    const loader = new GLTFLoader();
    loader.load(
      '/wormhole.glb',
      (gltf) => {
        scene.add(gltf.scene);

        const box    = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        gltf.scene.position.sub(center);
        gltf.scene.scale.setScalar(20 / maxDim);

        camera.position.set(0, 0, 14);
        camera.lookAt(0, 0, 0);
        pt.position.set(0, 0, 14);

        mixer = new THREE.AnimationMixer(gltf.scene);

        if (gltf.animations && gltf.animations.length > 0) {
          const clip   = gltf.animations[0];
          const action = mixer.clipAction(clip);

          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;

          if (reverse) {
            action.time = HALF; action.timeScale = 1;
          } else {
            action.time = 0; action.timeScale = 1;
          }

          action.play();
          mixer.update(0);

          halfTimer = setTimeout(finish, (HALF - 0.1) * 1000);
        } else {
          halfTimer = setTimeout(finish, 1500);
        }

        const tick = () => {
          animId = requestAnimationFrame(tick);
          if (mixer) mixer.update(clock.getDelta());
          renderer.render(scene, camera);
        };
        tick();
      },
      undefined,
      (err) => { console.error('GLB load error:', err); finish(); }
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute', top: '28px', right: '36px', zIndex: 1,
          background: 'rgba(0,0,0,0.6)',
          border: `1px solid ${color}55`,
          color: `${color}aa`,
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.65rem', fontWeight: '700',
          letterSpacing: '3px', textTransform: 'uppercase',
          padding: '8px 18px', borderRadius: '20px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          pointerEvents: 'all',
        }}
        onMouseEnter={e => { e.target.style.color = color; e.target.style.borderColor = color; }}
        onMouseLeave={e => { e.target.style.color = `${color}aa`; e.target.style.borderColor = `${color}55`; }}
      >
        SKIP ›
      </button>
    </div>
  );
}
