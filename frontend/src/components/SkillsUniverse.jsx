import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Wormhole from './Wormhole.jsx';

const SKILL_DATA = [
  {
    label: 'FRONTEND', color: 0x61dafb, emissive: 0x1a6b7a, size: 1.1, orbitR: 6.5, speed: 0.004, angle: 0,
    icon: '⚛', desc: 'Building what users see and interact with. Fast, responsive, beautiful interfaces.',
    skills: [
      { name: 'React', level: 90, logo: 'react',
        desc: 'Component-based UI, hooks, context, React Router.',
        about: 'React is a JavaScript library by Meta for building user interfaces using reusable components.',
        benefits: ['Virtual DOM for fast re-renders', 'Huge ecosystem & community', 'Reusable component architecture', 'Rich hooks API for state/effects'] },
      { name: 'Next.js', level: 85, logo: 'nextdotjs',
        desc: 'SSR, SSG, App Router, API routes.',
        about: 'Next.js is a React framework that adds server-side rendering, static generation, and full-stack capabilities.',
        benefits: ['SEO-friendly server-side rendering', 'File-based routing', 'Built-in API routes', 'Automatic code splitting'] },
      { name: 'HTML / CSS', level: 95, logo: 'html5',
        desc: 'Semantic HTML, Flexbox, Grid, animations.',
        about: 'The foundational languages of the web — HTML structures content and CSS styles and animates it.',
        benefits: ['Universal browser support', 'Flexbox & Grid for layouts', 'CSS animations without JS', 'Accessibility built-in with semantic HTML'] },
      { name: 'JavaScript', level: 88, logo: 'javascript',
        desc: 'ES6+, async/await, DOM manipulation, APIs.',
        about: 'JavaScript is the language of the web — runs in every browser and powers dynamic, interactive experiences.',
        benefits: ['Runs natively in browsers', 'Async programming with promises', 'Full DOM access', 'Works on front and back end'] },
    ],
  },
  {
    label: 'BACKEND', color: 0x68d391, emissive: 0x1a4731, size: 1.0, orbitR: 9.0, speed: 0.003, angle: 1.2,
    icon: '⚙', desc: 'The engine behind the scenes. Servers, APIs, logic, and data flow.',
    skills: [
      { name: 'Node.js', level: 82, logo: 'nodedotjs',
        desc: 'Event-driven runtime for scalable server-side apps.',
        about: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine, enabling server-side JavaScript.',
        benefits: ['Non-blocking I/O for high concurrency', 'Same language front & back', 'Massive npm ecosystem', 'Real-time app support'] },
      { name: 'Express', level: 80, logo: 'express',
        desc: 'REST APIs, middleware, routing.',
        about: 'Express is a minimal and flexible Node.js web framework for building APIs and web apps.',
        benefits: ['Lightweight and unopinionated', 'Middleware pipeline', 'Easy REST API setup', 'Large plugin ecosystem'] },
      { name: 'REST API', level: 85, logo: 'postman',
        desc: 'RESTful design, JSON, authentication flows.',
        about: 'REST is an architectural style for building scalable web services using standard HTTP methods.',
        benefits: ['Stateless and scalable', 'Works with any client', 'Standard HTTP verbs', 'Easy to test and debug'] },
      { name: 'Python', level: 75, logo: 'python',
        desc: 'Scripting, automation, Flask basics.',
        about: 'Python is a versatile high-level language known for readability and wide use in ML, automation, and web.',
        benefits: ['Clean readable syntax', 'Excellent for data/ML', 'Huge standard library', 'Rapid prototyping'] },
    ],
  },
  {
    label: 'DATABASE', color: 0xf6ad55, emissive: 0x7a3f00, size: 0.9, orbitR: 11.5, speed: 0.0025, angle: 2.4,
    icon: '🗄', desc: 'Storing, querying, and managing data efficiently.',
    skills: [
      { name: 'MongoDB', level: 85, logo: 'mongodb',
        desc: 'NoSQL, Mongoose ODM, aggregation pipelines.',
        about: 'MongoDB is a document-oriented NoSQL database that stores data in flexible JSON-like BSON documents.',
        benefits: ['Schema-flexible documents', 'Scales horizontally', 'Rich aggregation pipeline', 'Native JSON storage'] },
      { name: 'MySQL', level: 78, logo: 'mysql',
        desc: 'Relational queries, joins, indexing.',
        about: 'MySQL is the world\'s most popular open-source relational database, using structured tables and SQL.',
        benefits: ['ACID transactions', 'Powerful JOIN queries', 'Battle-tested reliability', 'Wide hosting support'] },
      { name: 'Firebase', level: 80, logo: 'firebase',
        desc: 'Realtime DB, Firestore, Auth.',
        about: 'Firebase is Google\'s BaaS platform providing real-time database, authentication, and cloud functions.',
        benefits: ['Real-time data sync', 'Built-in authentication', 'No backend needed for simple apps', 'Generous free tier'] },
      { name: 'Redis', level: 70, logo: 'redis',
        desc: 'In-memory caching, sessions, pub/sub.',
        about: 'Redis is an in-memory data store used as a cache, message broker, and session manager.',
        benefits: ['Microsecond response times', 'Reduces database load', 'Pub/sub messaging', 'Session management'] },
    ],
  },
  {
    label: 'ANIMATION', color: 0xf4d03f, emissive: 0x6b5a00, size: 1.0, orbitR: 14.0, speed: 0.002, angle: 3.6,
    icon: '✨', desc: 'Making the web feel alive. Motion that guides and delights.',
    skills: [
      { name: 'GSAP', level: 88, logo: 'greensock',
        desc: 'Timeline animations, ScrollTrigger, morphing.',
        about: 'GSAP (GreenSock) is the industry standard JavaScript animation library, used by top studios worldwide.',
        benefits: ['Buttery smooth 60fps', 'ScrollTrigger for scroll animations', 'Morphing & SVG support', 'Works on any element'] },
      { name: 'Framer Motion', level: 82, logo: 'framer',
        desc: 'React animations, gestures, layout transitions.',
        about: 'Framer Motion is a production-ready animation library for React with a declarative API.',
        benefits: ['Declarative animation API', 'Layout animations', 'Gesture recognition', 'AnimatePresence for exit animations'] },
      { name: 'Three.js', level: 75, logo: 'threedotjs',
        desc: '3D scenes, shaders, WebGL rendering.',
        about: 'Three.js is a WebGL library that makes 3D graphics in the browser accessible with JavaScript.',
        benefits: ['Full 3D scenes in browser', 'Custom shaders/GLSL', 'Model loading (GLTF/OBJ)', 'GPU-accelerated rendering'] },
      { name: 'CSS Animation', level: 90, logo: 'css3',
        desc: 'Keyframes, transitions, transform tricks.',
        about: 'CSS animations and transitions allow smooth visual changes using pure CSS — no JavaScript required.',
        benefits: ['Zero JS overhead', 'GPU composited layers', 'Simple hover/focus effects', 'Keyframe timeline control'] },
    ],
  },
  {
    label: 'TOOLS', color: 0xa78bfa, emissive: 0x3b1f7a, size: 0.85, orbitR: 17.0, speed: 0.0018, angle: 4.8,
    icon: '🛠', desc: 'The developer toolkit. Everything needed to build, test, and ship.',
    skills: [
      { name: 'Git', level: 90, logo: 'git',
        desc: 'Version control, branching, pull requests.',
        about: 'Git is a distributed version control system that tracks code changes and enables team collaboration.',
        benefits: ['Full change history', 'Branching & merging', 'Collaboration via PRs', 'Revert any mistake'] },
      { name: 'VS Code', level: 95, logo: 'visualstudiocode',
        desc: 'Primary IDE, extensions, debugging.',
        about: 'VS Code is Microsoft\'s lightweight but powerful editor with a massive extension marketplace.',
        benefits: ['Fastest IDE startup', 'IntelliSense autocomplete', '1000s of extensions', 'Built-in debugger & terminal'] },
      { name: 'Vite', level: 85, logo: 'vite',
        desc: 'Lightning-fast build tool and dev server.',
        about: 'Vite is a next-generation frontend build tool leveraging native ES modules for instant hot reload.',
        benefits: ['Instant dev server start', 'Hot Module Replacement', '10-100x faster than Webpack', 'Built-in TypeScript support'] },
      { name: 'NPM', level: 88, logo: 'npm',
        desc: 'Package management, scripts, dependencies.',
        about: 'NPM is the world\'s largest software registry and the default package manager for Node.js.',
        benefits: ['Access to 2M+ packages', 'Script automation', 'Dependency management', 'Version locking'] },
    ],
  },
  {
    label: 'AI / ML', color: 0xfc8181, emissive: 0x7a1f1f, size: 0.95, orbitR: 20.0, speed: 0.0015, angle: 0.6,
    icon: '🤖', desc: 'Exploring machine intelligence. Teaching machines to learn.',
    skills: [
      { name: 'Python', level: 80, logo: 'python',
        desc: 'Primary ML language, data processing.',
        about: 'Python dominates the AI/ML world with its readable syntax and rich scientific computing ecosystem.',
        benefits: ['NumPy/Pandas for data', 'Jupyter notebooks', 'ML framework support', 'Simple prototyping'] },
      { name: 'TensorFlow', level: 70, logo: 'tensorflow',
        desc: 'Neural networks, model training basics.',
        about: 'TensorFlow is Google\'s open-source ML framework for training and deploying neural network models.',
        benefits: ['Production-grade deployment', 'TensorBoard visualization', 'Keras high-level API', 'Mobile/edge support'] },
      { name: 'PyTorch', level: 68, logo: 'pytorch',
        desc: 'Dynamic computation graphs, research.',
        about: 'PyTorch is Facebook\'s ML framework favored in research for its dynamic computation graph.',
        benefits: ['Pythonic and intuitive', 'Dynamic computation graph', 'Strong research community', 'Easy debugging'] },
      { name: 'ML Basics', level: 75, logo: 'scikitlearn',
        desc: 'Supervised learning, classification, regression.',
        about: 'Scikit-learn provides simple tools for data mining and ML built on NumPy, SciPy, and Matplotlib.',
        benefits: ['Simple consistent API', 'Wide algorithm coverage', 'Great for beginners', 'Fast prototyping'] },
    ],
  },
];

// ── Lab Room Overlay ──────────────────────────────────────────────
function LabRoom({ data, onClose }) {
  const hex   = '#' + data.color.toString(16).padStart(6, '0');
  const hex20 = hex + '20';
  const hex40 = hex + '40';
  const hex80 = hex + '80';
  const [visible,    setVisible]    = useState(false);
  const [booted,     setBooted]     = useState(false);
  const [bootText,   setBootText]   = useState('');
  const [expandedSkill, setExpandedSkill] = useState(null); // { skill, closing }

  const openSkill = (skill) => setExpandedSkill({ skill, closing: false });
  const closeSkill = () => {
    setExpandedSkill(s => s ? { ...s, closing: true } : null);
    setTimeout(() => setExpandedSkill(null), 380);
  };

  // Inject cursor color CSS variable into :root for this overlay
  useEffect(() => {
    document.documentElement.style.setProperty('--cursor-color', hex);
    return () => document.documentElement.style.removeProperty('--cursor-color');
  }, [hex]);

  const bootLines = [
    `> CONNECTING TO MODULE: ${data.label}...`,
    `> LOADING SKILL PACKAGES [${data.skills.length}]...`,
    `> SYSTEM READY.`,
  ];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    // Boot sequence typing effect
    let lineIdx = 0, charIdx = 0, current = '';
    const interval = setInterval(() => {
      if (lineIdx >= bootLines.length) {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 300);
        return;
      }
      current += bootLines[lineIdx][charIdx];
      charIdx++;
      if (charIdx >= bootLines[lineIdx].length) {
        current += '\n'; lineIdx++; charIdx = 0;
      }
      setBootText(current);
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div className={`lab-overlay ${visible ? 'lab-visible' : ''}`}
      style={{ '--hex': hex, '--hex20': hex20, '--hex40': hex40, '--hex80': hex80 }}>

      {/* CRT scanlines */}
      <div className="lab-scanlines" />

      {/* HUD corner brackets */}
      {['lab-tl','lab-tr','lab-bl','lab-br'].map(c => (
        <div key={c} className={`lab-corner ${c}`} style={{ borderColor: hex40 }} />
      ))}

      {/* Top bar */}
      <div className="lab-topbar" style={{ borderBottomColor: hex20 }}>
        <div className="lab-topbar-left">
          <div className="lab-topbar-icon" style={{ background: hex20, borderColor: hex40, color: hex }}>
            {data.icon}
          </div>
          <div>
            <div className="lab-topbar-eyebrow">SYSTEM MODULE — ACTIVE</div>
            <div className="lab-topbar-title" style={{ color: hex }}>{data.label}</div>
          </div>
        </div>
        <div className="lab-topbar-right">
          <div className="lab-status-pill">
            <span className="lab-status-dot" />
            <span>ONLINE</span>
          </div>
          <button className="lab-close" onClick={handleClose} style={{ borderColor: hex40, color: hex }}>
            ← BACK TO ORBIT
          </button>
        </div>
      </div>

      {/* Boot sequence */}
      {!booted && (
        <div className="lab-boot">
          <pre className="lab-boot-text" style={{ color: hex }}>
            {bootText}<span className="lab-cursor">█</span>
          </pre>
        </div>
      )}

      {/* Main content — shown after boot */}
      {booted && (
        <div className="lab-body">

          {/* Left panel — description + stats */}
          <div className="lab-panel lab-panel-left" style={{ borderColor: hex20 }}>
            <div className="lab-panel-header" style={{ borderBottomColor: hex20, color: hex }}>
              <span className="lab-panel-dot" style={{ background: hex }} />
              MODULE OVERVIEW
            </div>
            <p className="lab-desc">{data.desc}</p>

            {/* Mini stats */}
            <div className="lab-mini-stats">
              <div className="lab-mini-stat" style={{ borderColor: hex20 }}>
                <div className="lab-mini-stat-val" style={{ color: hex }}>{data.skills.length}</div>
                <div className="lab-mini-stat-label">PACKAGES</div>
              </div>
              <div className="lab-mini-stat" style={{ borderColor: hex20 }}>
                <div className="lab-mini-stat-val" style={{ color: hex }}>
                  {Math.round(data.skills.reduce((a,s) => a + s.level, 0) / data.skills.length)}%
                </div>
                <div className="lab-mini-stat-label">AVG LEVEL</div>
              </div>
              <div className="lab-mini-stat" style={{ borderColor: hex20 }}>
                <div className="lab-mini-stat-val" style={{ color: '#4ade80' }}>ALL</div>
                <div className="lab-mini-stat-label">STATUS</div>
              </div>
            </div>

            {/* Vertical skill level bars */}
            <div className="lab-panel-header" style={{ borderBottomColor: hex20, color: hex, marginTop: '24px' }}>
              <span className="lab-panel-dot" style={{ background: hex }} />
              PROFICIENCY OVERVIEW
            </div>
            <div className="lab-vert-bars">
              {data.skills.map(s => (
                <div key={s.name} className="lab-vert-bar-item">
                  <div className="lab-vert-bar-track">
                    <div className="lab-vert-bar-fill"
                      style={{ height: s.level + '%', background: `linear-gradient(to top, ${hex}, ${hex}55)`, boxShadow: `0 0 8px ${hex}66` }} />
                  </div>
                  <img
                    src={`https://cdn.simpleicons.org/${s.logo}/ffffff`}
                    alt={s.name}
                    style={{ width:'14px', height:'14px', opacity:0.6, marginTop:'4px' }}
                    onError={e => { e.target.style.display='none'; }}
                  />
                  <div className="lab-vert-bar-pct" style={{ color: hex }}>{s.level}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — skill cards */}
          <div className="lab-panel lab-panel-right" style={{ borderColor: hex20 }}>
            <div className="lab-panel-header" style={{ borderBottomColor: hex20, color: hex }}>
              <span className="lab-panel-dot" style={{ background: hex }} />
              INSTALLED PACKAGES — {data.skills.length} FOUND
            </div>
            <div className="lab-skills-grid">
              {data.skills.map((skill, i) => (
                <div key={skill.name}
                  className="lab-skill-card"
                  style={{ borderColor: hex20, animationDelay: `${i * 0.1}s` }}
                  onClick={() => openSkill(skill)}
                >
                  <div className="lab-skill-card-top" style={{ borderBottomColor: hex20 }}>
                    <div className="lab-skill-dots">
                      <span style={{ background: '#ff5f57' }} />
                      <span style={{ background: '#febc2e' }} />
                      <span style={{ background: '#28c840' }} />
                    </div>
                    <span className="lab-skill-card-id" style={{ color: hex }}>PKG_{String(i+1).padStart(2,'0')}</span>
                    <span className="lab-expand-hint" style={{ color: hex }}>CLICK ↗</span>
                  </div>
                  <div className="lab-skill-card-body">
                    <div className="lab-skill-header">
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <img src={`https://cdn.simpleicons.org/${skill.logo}/ffffff`} alt={skill.name}
                          className="lab-skill-logo" onError={e => { e.target.style.display='none'; }} />
                        <div className="lab-skill-name" style={{ color: hex }}>{skill.name}</div>
                      </div>
                      <div className="lab-skill-pct" style={{ color: hex }}>{skill.level}%</div>
                    </div>
                    <div className="lab-skill-bar-track">
                      <div className="lab-skill-bar-fill"
                        style={{ width: skill.level+'%', background:`linear-gradient(90deg,${hex},${hex}66)`, boxShadow:`0 0 8px ${hex}55` }} />
                    </div>
                    <p className="lab-skill-desc">{skill.desc}</p>
                    <div className="lab-skill-status">
                      <span className="lab-skill-dot" style={{ background:'#4ade80', boxShadow:'0 0 6px #4ade80' }} />
                      <span className="lab-skill-status-text">ACTIVE · LOADED</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Full-screen skill detail modal ── */}
            {expandedSkill && (
              <div
                className={`skill-modal ${expandedSkill.closing ? 'skill-modal-closing' : 'skill-modal-open'}`}
                style={{ '--hex': hex, '--hex20': hex20, '--hex40': hex40 }}
              >
                {/* Scanlines */}
                <div className="lab-scanlines" />

                {/* Close button */}
                <button className="skill-modal-close" style={{ borderColor: hex40, color: hex }} onClick={closeSkill}>
                  ✕ CLOSE
                </button>

                <div className="skill-modal-inner">
                  {/* Header */}
                  <div className="skill-modal-header">
                    <img src={`https://cdn.simpleicons.org/${expandedSkill.skill.logo}/${hex.replace('#','')}`}
                      alt={expandedSkill.skill.name}
                      className="skill-modal-logo"
                      onError={e => { e.target.style.display='none'; }} />
                    <div>
                      <div className="skill-modal-eyebrow" style={{ color: hex }}>PACKAGE DETAILS</div>
                      <h2 className="skill-modal-title" style={{ color: hex }}>{expandedSkill.skill.name}</h2>
                    </div>
                  </div>

                  {/* Big proficiency display */}
                  <div className="skill-modal-level-wrap">
                    <div className="skill-modal-level-num" style={{ color: hex }}>{expandedSkill.skill.level}</div>
                    <div className="skill-modal-level-label">% PROFICIENCY</div>
                    {/* Full-width bar */}
                    <div className="skill-modal-bar-track">
                      <div className="skill-modal-bar-fill"
                        style={{ width: expandedSkill.skill.level+'%', background:`linear-gradient(90deg,${hex},${hex}88)`, boxShadow:`0 0 20px ${hex}66` }} />
                    </div>
                    {/* Segment display */}
                    <div className="skill-modal-segs">
                      {Array.from({length:20}).map((_,j) => (
                        <div key={j} className="skill-modal-seg"
                          style={{ background: j < Math.round(expandedSkill.skill.level/5) ? hex : 'rgba(255,255,255,0.07)', boxShadow: j < Math.round(expandedSkill.skill.level/5) ? `0 0 6px ${hex}` : 'none' }} />
                      ))}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="skill-modal-details">
                    <div className="skill-modal-detail-card" style={{ borderColor: hex20 }}>
                      <div className="skill-modal-detail-label" style={{ color: hex }}>DESCRIPTION</div>
                      <p className="skill-modal-detail-val">{expandedSkill.skill.desc}</p>
                    </div>
                    <div className="skill-modal-detail-card" style={{ borderColor: hex20 }}>
                      <div className="skill-modal-detail-label" style={{ color: hex }}>PACKAGE ID</div>
                      <p className="skill-modal-detail-val" style={{ fontFamily:'Courier New,monospace' }}>{expandedSkill.skill.logo}@latest</p>
                    </div>
                    <div className="skill-modal-detail-card" style={{ borderColor: hex20 }}>
                      <div className="skill-modal-detail-label" style={{ color: hex }}>STATUS</div>
                      <p className="skill-modal-detail-val" style={{ color:'#4ade80' }}>● ACTIVE · PRODUCTION READY</p>
                    </div>
                    <div className="skill-modal-detail-card" style={{ borderColor: hex20 }}>
                      <div className="skill-modal-detail-label" style={{ color: hex }}>CATEGORY</div>
                      <p className="skill-modal-detail-val" style={{ color: hex }}>{data.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Bottom status bar */}
      <div className="lab-statusbar" style={{ borderTopColor: hex20 }}>
        <span style={{ color: hex }}>◉ {data.label}</span>
        <span>PACKAGES: {data.skills.length}</span>
        <span>STATUS: <span style={{ color:'#4ade80' }}>ONLINE</span></span>
        <span>RAJVANSH_OS <span style={{ color: hex }}>v2026</span></span>
        <span>SYS_MEM: 98.2% FREE</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function SkillsUniverse() {
  const mountRef      = useRef(null);
  const onDoneRef     = useRef(null);
  const [active,    setActive]   = useState(null);
  const [wormhole,  setWormhole] = useState(null); // { color, reverse }

  const handlePlanetClick = (idx) => {
    const hex = '#' + SKILL_DATA[idx].color.toString(16).padStart(6, '0');
    onDoneRef.current = () => {
      setWormhole(null);
      setActive(idx);
    };
    setWormhole({ color: hex, reverse: false });
  };

  const handleClose = () => {
    onDoneRef.current = () => {
      setWormhole(null);
      setActive(null);
    };
    setWormhole({ color: '#f4d03f', reverse: true });
  };

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
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
    camera.position.set(0, 12, 42);
    camera.lookAt(0, 0, 0);

    const ndc       = new THREE.Vector2(-9999, -9999);
    const raycaster = new THREE.Raycaster();
    const camTarget = { x: 0, y: 0, cx: 0, cy: 0 };

    const onMouseMove = e => {
      const rect = mount.getBoundingClientRect();
      ndc.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height)  * 2 - 1);
      camTarget.cx = (e.clientX - rect.left) / rect.width  - 0.5;
      camTarget.cy = (e.clientY - rect.top)  / rect.height - 0.5;
    };
    mount.addEventListener('mousemove', onMouseMove);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sunLight = new THREE.PointLight(0xf4d03f, 5, 60);
    scene.add(sunLight);

    // Central star
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfff0b3, emissive: new THREE.Color(0xf4d03f),
      emissiveIntensity: 1.5, roughness: 0.1, metalness: 0.2,
    });
    const star = new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), starMat);
    scene.add(star);
    [2.6, 3.4, 4.4].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.025, 8, 100),
        new THREE.MeshBasicMaterial({ color: 0xf4d03f, transparent: true, opacity: 0.18 - i * 0.05 })
      );
      ring.rotation.x = Math.PI / 2 + i * 0.4;
      scene.add(ring);
    });

    // Orbit paths
    SKILL_DATA.forEach(cat => {
      const pts = Array.from({ length: 129 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * cat.orbitR, 0, Math.sin(a) * cat.orbitR);
      });
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.3 })
      ));
    });

    // Planets
    const planets = SKILL_DATA.map((cat, idx) => {
      const planetMat = new THREE.MeshStandardMaterial({
        color: cat.color, emissive: new THREE.Color(cat.emissive),
        emissiveIntensity: 0.7, roughness: 0.35, metalness: 0.55,
      });
      const planet = new THREE.Mesh(new THREE.SphereGeometry(cat.size, 40, 40), planetMat);
      planet.userData.idx = idx;

      // Hitbox
      planet.add(new THREE.Mesh(
        new THREE.SphereGeometry(cat.size * 2.5, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      ));

      // Atmosphere
      const atmMat = new THREE.MeshBasicMaterial({
        color: cat.color, transparent: true, opacity: 0.08, side: THREE.BackSide,
      });
      planet.add(new THREE.Mesh(new THREE.SphereGeometry(cat.size * 1.5, 16, 16), atmMat));
      planet.userData.atmMat = atmMat;
      planet.userData.planetMat = planetMat;

      if (idx % 2 === 0) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(cat.size * 2.0, 0.035, 4, 60),
          new THREE.MeshBasicMaterial({ color: cat.color, transparent: true, opacity: 0.3 })
        );
        ring.rotation.x = Math.PI / 2.8;
        planet.add(ring);
      }

      // Label
      const cv = document.createElement('canvas');
      cv.width = 320; cv.height = 80;
      const cx2 = cv.getContext('2d');
      cx2.font = 'bold 22px monospace';
      cx2.fillStyle = '#' + cat.color.toString(16).padStart(6, '0');
      cx2.textAlign = 'center';
      cx2.shadowColor = cx2.fillStyle;
      cx2.shadowBlur = 10;
      cx2.fillText(cat.label, 160, 50);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
      sp.scale.set(2.8, 0.7, 1);
      sp.position.y = cat.size + 0.9;
      planet.add(sp);

      scene.add(planet);
      return planet;
    });

    // Click handler
    const onClick = e => {
      const rect = mount.getBoundingClientRect();
      const clickNDC = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      );
      raycaster.setFromCamera(clickNDC, camera);
      const hits = raycaster.intersectObjects(planets, true);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.idx ?? hits[0].object.parent?.userData.idx;
        if (idx !== undefined) handlePlanetClick(idx);
      }
    };
    mount.addEventListener('click', onClick);

    // Background stars
    const STARS = 1200;
    const sPts = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      sPts[i*3]   = (Math.random() - 0.5) * 80;
      sPts[i*3+1] = (Math.random() - 0.5) * 50;
      sPts[i*3+2] = (Math.random() - 0.5) * 80;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPts, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      size: 0.07, color: 0xffffff, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    // Hover cursor
    let hoveredIdx = -1;
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let frame = 0, animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame += 0.008;

      camTarget.x += (camTarget.cx * 8 - camTarget.x) * 0.04;
      camTarget.y += (camTarget.cy * 5 - camTarget.y) * 0.04;
      camera.position.x = camTarget.x;
      camera.position.y = 12 - camTarget.y;
      camera.lookAt(0, 0, 0);

      star.rotation.y += 0.003;
      starMat.emissiveIntensity = 1.3 + Math.sin(frame * 2) * 0.3;
      sunLight.intensity = 3.5 + Math.sin(frame * 3) * 0.6;

      // Hover detect for cursor change
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(planets, true);
      const newHov = hits.length > 0
        ? (hits[0].object.userData.idx ?? hits[0].object.parent?.userData.idx ?? -1)
        : -1;
      if (newHov !== hoveredIdx) {
        hoveredIdx = newHov;
        renderer.domElement.style.cursor = newHov >= 0 ? 'pointer' : 'default';
      }

      planets.forEach((planet, idx) => {
        const cat = SKILL_DATA[idx];
        const isHov = idx === hoveredIdx;
        cat.angle += cat.speed;
        const tx = Math.cos(cat.angle) * cat.orbitR;
        const tz = Math.sin(cat.angle) * cat.orbitR;
        planet.position.x += (tx - planet.position.x) * 0.05;
        planet.position.y += (0  - planet.position.y) * 0.05;
        planet.position.z += (tz - planet.position.z) * 0.05;
        planet.userData.planetMat.emissiveIntensity = isHov
          ? 1.4 + Math.sin(frame * 5) * 0.2
          : 0.6 + Math.sin(frame * 2 + idx) * 0.1;
        planet.userData.atmMat.opacity = isHov ? 0.22 : 0.08;
        planet.scale.setScalar(isHov ? 1.2 + Math.sin(frame * 4) * 0.03 : 1);
        planet.rotation.y += 0.008;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* Wormhole transition */}
      {wormhole && (
        <Wormhole
          color={wormhole.color}
          reverse={wormhole.reverse}
          onDone={() => onDoneRef.current && onDoneRef.current()}
        />
      )}

      {/* Lab room overlay — only after wormhole finishes */}
      {active !== null && wormhole === null && (
        <LabRoom data={SKILL_DATA[active]} onClose={handleClose} />
      )}

      <div style={{ position: 'relative', width: '100%', height: '800px' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <div className="skills-hint">CLICK A PLANET TO ENTER ITS LAB</div>
        <div className="skills-legend">
          {SKILL_DATA.map((cat, i) => (
            <div key={i} className="skills-legend-item">
              <span className="skills-legend-dot"
                style={{ background: `#${cat.color.toString(16).padStart(6, '0')}` }} />
              <span className="skills-legend-label">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
