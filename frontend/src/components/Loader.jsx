import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MAX_DURATION = 60000;

// ── Narration script ───────────────────────────────────────────
const SCRIPT = [
  { voice: 1, text: 'SOMEWHERE IN THE UNIVERSE...' },
  { voice: 2, text: 'A DEVELOPER DECIDED TO BUILD SOMETHING DIFFERENT.' },
  { voice: 3, text: 'NOT JUST CODE.' },
  { voice: 4, text: 'NOT JUST ANOTHER WEBSITE.' },
  { voice: 5, text: 'AN EXPERIENCE.' },
  { voice: 6, text: 'IDEAS BECAME INTERFACES.' },
  { voice: 7, text: 'LOGIC BECAME INTERACTION.' },
  { voice: 8, text: 'AND CREATIVITY BECAME REALITY.' },
  {
    voice: 9,
    text: 'SYSTEMS LOADING...',
    sub: ['SYSTEMS LOADING...', 'REALITY COMPILING...', 'NEW POSSIBILITIES INITIALIZING...'],
  },
  {
    voice: 10,
    text: 'WELCOME TO THE WORLD.',
    sub: ['WELCOME TO THE WORLD.', 'WHERE CODE MEETS CREATIVITY,', 'AND EVERY PROJECT IS BUILT TO BE EXPERIENCED.'],
  },
];

// ── Audio pool ─────────────────────────────────────────────────
const pool = {};
function preload() {
  for (let i = 1; i <= 10; i++) {
    const a = new Audio(`/voices/${i}.mp3`);
    a.preload = 'auto';
    pool[i] = a;
  }
}
function stopAll() {
  Object.values(pool).forEach(a => {
    try { a.pause(); a.currentTime = 0; } catch (_) {}
  });
}

// ── Audio-driven script runner ─────────────────────────────────
function runScript(onLine, onDone) {
  let cancelled = false;
  let subTimers = [];
  const clearSubs = () => { subTimers.forEach(clearTimeout); subTimers = []; };

  const playEntry = (index) => {
    if (cancelled) return;
    if (index >= SCRIPT.length) { onDone(); return; }

    const entry = SCRIPT[index];
    const audio = pool[entry.voice];
    if (!audio) { playEntry(index + 1); return; }

    audio.pause();
    audio.currentTime = 0;
    clearSubs();

    const onPlaying = () => {
      if (cancelled) return;
      onLine(entry.text);
      if (entry.sub && entry.sub.length > 1) {
        const waitForDuration = () => {
          const dur = audio.duration;
          if (!isFinite(dur) || dur <= 0) { requestAnimationFrame(waitForDuration); return; }
          const slice = (dur / entry.sub.length) * 1000;
          entry.sub.forEach((subText, i) => {
            if (i === 0) return;
            const t = setTimeout(() => { if (!cancelled) onLine(subText); }, slice * i);
            subTimers.push(t);
          });
        };
        waitForDuration();
      }
    };

    const onEnded = () => {
      if (cancelled) return;
      clearSubs();
      setTimeout(() => playEntry(index + 1), 600);
    };

    const onError = () => {
      if (cancelled) return;
      clearSubs();
      setTimeout(() => playEntry(index + 1), 500);
    };

    audio.addEventListener('playing', onPlaying, { once: true });
    audio.addEventListener('ended',   onEnded,   { once: true });
    audio.addEventListener('error',   onError,   { once: true });

    audio.play().catch(() => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended',   onEnded);
      audio.removeEventListener('error',   onError);
      clearSubs();
      onLine(entry.text);
      setTimeout(() => playEntry(index + 1), 2500);
    });
  };

  playEntry(0);
  return () => { cancelled = true; clearSubs(); stopAll(); };
}

// ── Easing helpers ─────────────────────────────────────────────
const easeInQuart = t => t * t * t * t;
const lerp = (a, b, t) => a + (b - a) * t;

// ── Component ──────────────────────────────────────────────────
export default function Loader({ onDone, bgAudioRef }) {
  const mountRef      = useRef(null);
  const rendererRef   = useRef(null);
  const animIdRef     = useRef(null);
  const mixerRef      = useRef(null);
  const lastTimeRef   = useRef(null);
  const cameraRef     = useRef(null);
  const sceneRef      = useRef(null);
  const divingRef     = useRef(false);
  const wormholeTargetZ = useRef(-5); // dive destination, set after GLB loads

  const [flashOpacity, setFlashOpacity] = useState(0); // white flash 0→1
  const [hudVisible,   setHudVisible]   = useState(true);
  const [progress,     setProgress]     = useState(0);
  const [caption,      setCaption]      = useState('');
  const [captionVis,   setCaptionVis]   = useState(false);
  const [started,      setStarted]      = useState(false);

  const finishRef       = useRef(null);
  const doneRef         = useRef(false);
  const progressRef     = useRef(0);
  const progressTimer   = useRef(null);
  const cancelScriptRef = useRef(null);
  const hardTimerRef    = useRef(null);

  const tickToward = (target) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      progressRef.current += 0.4;
      const val = Math.min(Math.round(progressRef.current), target);
      setProgress(val);
      if (val >= target) clearInterval(progressTimer.current);
    }, 16);
  };

  const showLine = (text) => {
    setCaptionVis(false);
    setTimeout(() => { setCaption(text); setCaptionVis(true); }, 280);
  };

  // ── Wormhole dive then reveal site ────────────────────────────
  const doFinish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(progressTimer.current);
    if (hardTimerRef.current) clearTimeout(hardTimerRef.current);
    if (cancelScriptRef.current) cancelScriptRef.current();
    setProgress(100);
    setCaptionVis(false);
    setHudVisible(false);

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer || divingRef.current) {
      // No camera yet — just flash and exit
      setFlashOpacity(1);
      setTimeout(() => {
        stopAll();
        document.body.style.cursor = '';
        onDone();
      }, 800);
      return;
    }

    divingRef.current = true;

    // Record starting camera state
    const startPos   = camera.position.clone();
    const startFov   = camera.fov;
    const targetFov  = 130;
    const DIVE_MS    = 2200;
    let   diveStart  = null;

    cancelAnimationFrame(animIdRef.current);

    const diveLoop = (ts) => {
      if (!diveStart) diveStart = ts;
      const elapsed = ts - diveStart;
      const t = Math.min(elapsed / DIVE_MS, 1);
      const e = easeInQuart(t);

      // Fly straight down the tunnel axis (X/Y locked, Z rushes forward)
      camera.position.set(
        lerp(startPos.x, 0.02, e * 0.3),   // gently center on axis
        lerp(startPos.y, 0.05, e * 0.3),
        lerp(startPos.z, wormholeTargetZ.current, e),  // blast through
      );
      camera.lookAt(0.02, 0.05, -999);     // always down the tunnel

      // FOV widens — warp speed distortion
      camera.fov = lerp(startFov, targetFov, e);
      camera.updateProjectionMatrix();

      // Scene background brightens from black → white (tunnel light)
      const bright = e * e; // quadratic — slow glow then explosion
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(bright, bright, bright);
      }

      // Update mixer
      const now   = performance.now();
      const delta = lastTimeRef.current === null ? 0 : (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (mixerRef.current) mixerRef.current.update(delta);
      renderer.render(sceneRef.current, camera);

      if (t < 1) {
        animIdRef.current = requestAnimationFrame(diveLoop);
      } else {
        // Full white — hold one frame then hand off
        setFlashOpacity(1);
        setTimeout(() => {
          // Cleanup Three.js
          cancelAnimationFrame(animIdRef.current);
          const mount = mountRef.current;
          if (mount && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
          renderer.dispose();
          stopAll();
          document.body.style.cursor = '';
          // Flash fades out as site reveals (controlled by App's own fade-in)
          onDone();
        }, 120);
      }
    };

    requestAnimationFrame(diveLoop);
  };

  finishRef.current = doFinish;

  // ── Three.js setup — runs on mount ────────────────────────────
  useEffect(() => {
    document.body.style.cursor = 'none';
    preload();

    const mount = mountRef.current;
    if (!mount) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.01, 10000);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x8888ff, 2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Normal render loop
    const tick = () => {
      animIdRef.current = requestAnimationFrame(tick);
      const now = performance.now();
      const delta = lastTimeRef.current === null ? 0 : (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (mixerRef.current) mixerRef.current.update(delta);
      renderer.render(scene, camera);
    };
    tick();

    tickToward(25);
    const loader = new GLTFLoader();
    loader.load(
      '/24_dizzying_space_travel_-_inktober2019.glb',
      (gltf) => {
        tickToward(75);
        scene.add(gltf.scene);

        const box    = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        gltf.scene.position.sub(center);
        const scale = 10 / maxDim;
        gltf.scene.scale.setScalar(scale);

        // Scene layout after scaling (scale = 10/2744 ≈ 0.00365):
        // Object_5 (tunnel): centered at (0,0,0), fills entire view
        // Object_7 (jet):    at ~(0, 0.013, 3.09) — flying toward negative Z
        // Tunnel mouth at negative Z, exit at ~ -4.7
        //
        // Camera sits just behind the jet, looking down the tunnel throat
        camera.position.set(0.02, 0.05, 3.8);
        camera.lookAt(0.02, 0.05, -10);

        // Dive will push camera from Z=3.8 → Z=-6 (through the tunnel)
        wormholeTargetZ.current = -6;

        if (gltf.animations?.length) {
          mixerRef.current = new THREE.AnimationMixer(gltf.scene);
          const action = mixerRef.current.clipAction(gltf.animations[0]);
          action.loop = THREE.LoopRepeat;
          action.play();
        }
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const pct = 25 + Math.round((xhr.loaded / xhr.total) * 40);
          if (pct > progressRef.current) { progressRef.current = pct; setProgress(pct); }
        }
      },
      (err) => console.error('GLB error:', err)
    );

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      clearInterval(progressTimer.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      window.removeEventListener('resize', onResize);
      document.body.style.cursor = '';
    };
  }, []);

  // ── Click to begin ────────────────────────────────────────────
  const handleBegin = () => {
    if (bgAudioRef?.current) {
      bgAudioRef.current.volume = 0;
      bgAudioRef.current.play().then(() => {
        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.005, 0.25);
          if (bgAudioRef.current) bgAudioRef.current.volume = vol;
          if (vol >= 0.25) clearInterval(fade);
        }, 100);
      }).catch(() => {});
    }

    setStarted(true);
    hardTimerRef.current = setTimeout(() => finishRef.current(), MAX_DURATION);

    cancelScriptRef.current = runScript(
      (text) => showLine(text),
      () => {
        clearTimeout(hardTimerRef.current);
        tickToward(100);
        // Trigger wormhole dive immediately — no delay
        finishRef.current();
      }
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: '#000',
      cursor: 'none',
    }}>

      {/* 3D canvas */}
      <div ref={mountRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0,
      }} />

      {/* White flash overlay — fills screen during wormhole exit */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        background: '#fff',
        opacity: flashOpacity,
        transition: flashOpacity === 1 ? 'none' : 'opacity 0.1s ease',
        pointerEvents: 'none',
      }} />

      {/* Click-to-begin overlay */}
      {!started && (
        <div
          onClick={handleBegin}
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: '28px',
            userSelect: 'none',
            background: 'rgba(0,0,0,0.65)',
          }}
        >
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            border: '1px solid rgba(244,208,63,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'loaderPulse 2.2s ease-in-out infinite',
          }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              border: '2px solid rgba(244,208,63,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(244,208,63,0.05)',
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: '13px solid transparent',
                borderBottom: '13px solid transparent',
                borderLeft: '22px solid #f4d03f',
                marginLeft: '5px',
                filter: 'drop-shadow(0 0 8px rgba(244,208,63,0.7))',
              }} />
            </div>
          </div>

          <div style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)',
            letterSpacing: '8px',
            color: 'rgba(244,208,63,0.65)',
            textTransform: 'uppercase',
            animation: 'loaderPulse 2.2s ease-in-out infinite',
          }}>
            CLICK TO BEGIN
          </div>

          <style>{`
            @keyframes loaderPulse {
              0%, 100% { opacity: 0.45; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* Caption */}
      <div style={{
        position: 'absolute', zIndex: 3,
        bottom: '90px', left: '40px', right: '40px',
        pointerEvents: 'none',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        opacity: captionVis ? 1 : 0,
        transform: captionVis ? 'translateY(0)' : 'translateY(10px)',
      }}>
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
          letterSpacing: '4px',
          color: '#f4d03f',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(244,208,63,0.6)',
          lineHeight: 1.5,
        }}>
          {caption}
        </div>
      </div>

      {/* Skip button — only visible after narration starts */}
      {started && hudVisible && (
        <button
          onClick={() => finishRef.current()}
          style={{
            position: 'absolute', zIndex: 5,
            top: '28px', right: '36px',
            background: 'rgba(10,22,40,0.7)',
            border: '1px solid rgba(244,208,63,0.35)',
            color: 'rgba(244,208,63,0.7)',
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.65rem', fontWeight: '700',
            letterSpacing: '3px', textTransform: 'uppercase',
            padding: '8px 18px', borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.target.style.color = '#f4d03f'; e.target.style.borderColor = 'rgba(244,208,63,0.7)'; e.target.style.background = 'rgba(10,22,40,0.9)'; }}
          onMouseLeave={e => { e.target.style.color = 'rgba(244,208,63,0.7)'; e.target.style.borderColor = 'rgba(244,208,63,0.35)'; e.target.style.background = 'rgba(10,22,40,0.7)'; }}
        >
          SKIP ›
        </button>
      )}

      {/* Bottom HUD */}
      {started && hudVisible && (
        <div style={{
          position: 'absolute', zIndex: 3,
          bottom: 0, left: 0, right: 0,
          padding: '0 40px 36px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          transition: 'opacity 0.4s ease',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.7rem', letterSpacing: '3px',
            color: 'rgba(244,208,63,0.55)', textTransform: 'uppercase',
          }}>
            <span>INITIALIZING SYSTEM</span>
            <span style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#f4d03f', fontWeight: '700' }}>
              {progress}<span style={{ fontSize: '0.7rem', opacity: 0.6 }}>%</span>
            </span>
          </div>

          <div style={{
            width: '100%', height: '2px',
            background: 'rgba(244,208,63,0.12)',
            borderRadius: '2px', position: 'relative',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(244,208,63,0.35), #f4d03f)',
              borderRadius: '2px', transition: 'width 0.15s linear',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', right: 0, top: '-2px',
                width: '4px', height: '6px',
                background: '#fff', borderRadius: '2px',
                boxShadow: '0 0 8px 2px #f4d03f',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
