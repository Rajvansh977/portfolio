import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GraduationCap, School, Monitor, Rocket,
  ShoppingCart, Users, Briefcase, Cloud,
  FileText, BarChart2, MessageSquare, Gamepad2,
  Lightbulb, Settings, RefreshCw, Target,
  Link, GitBranch, Globe, Mail, MapPin,
  Zap, ExternalLink, ArrowRight, Loader2,
  ChevronDown, Layers, Database, Wand2, Wrench, Bot,
  User, Code, BookOpen, Clock, CheckSquare, Infinity,
} from 'lucide-react';
import ContactForm from './components/ContactForm.jsx';
import HeroScene from './components/HeroScene.jsx';
import JourneyOrb from './components/JourneyOrb.jsx';
import SkillsUniverse from './components/SkillsUniverse.jsx';
import './App.css';

// Smooth scroll helper — uses Lenis if available
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
};

const isTouchDevice = () =>
  navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const TargetCursor = ({ targetSelector = '.cursor-target, a, button, .project-card, input, textarea', spinDuration = 2 }) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    document.body.style.cursor = 'none';
    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');
    let activeTarget = null, currentTargetMove = null, currentLeaveHandler = null;
    let isAnimatingToTarget = false, resumeTimeout = null;

    const cleanupTarget = target => {
      if (currentTargetMove) target.removeEventListener('mousemove', currentTargetMove);
      if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
      currentTargetMove = null; currentLeaveHandler = null;
    };

    window.gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const createSpin = () => {
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = window.gsap.timeline({ repeat: -1 }).to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };
    createSpin();

    const moveHandler = e => window.gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power3.out' });
    window.addEventListener('mousemove', moveHandler);

    const mouseDownHandler = () => { window.gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 }); window.gsap.to(cursor, { scale: 0.9, duration: 0.2 }); };
    const mouseUpHandler   = () => { window.gsap.to(dotRef.current, { scale: 1,   duration: 0.3 }); window.gsap.to(cursor, { scale: 1,   duration: 0.2 }); };
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const cornerSize = 16;
    const resetCorners = () => {
      const positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5,  y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5,  y: cornerSize * 0.5  },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5  },
      ];
      Array.from(cornersRef.current).forEach((c, i) =>
        window.gsap.to(c, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power3.out' })
      );
    };

    const enterHandler = e => {
      let cur = e.target;
      while (cur && cur !== document.body) {
        if (cur.matches && cur.matches(targetSelector)) break;
        cur = cur.parentElement;
      }
      const target = (cur && cur !== document.body) ? cur : null;
      if (!target || activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = target;
      spinTl.current?.pause();
      window.gsap.set(cursor, { rotation: 0 });

      const updateCorners = (mx, my) => {
        const rect = target.getBoundingClientRect();
        const cr = cursor.getBoundingClientRect();
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        const offsets = [
          { x: rect.left - cx - 3,                    y: rect.top - cy - 3 },
          { x: rect.right - cx + 3 - cornerSize,      y: rect.top - cy - 3 },
          { x: rect.right - cx + 3 - cornerSize,      y: rect.bottom - cy + 3 - cornerSize },
          { x: rect.left - cx - 3,                    y: rect.bottom - cy + 3 - cornerSize },
        ];
        Array.from(cornersRef.current).forEach((c, i) =>
          window.gsap.to(c, { x: offsets[i].x, y: offsets[i].y, duration: 0.2, ease: 'power2.out' })
        );
      };

      isAnimatingToTarget = true;
      updateCorners();
      setTimeout(() => { isAnimatingToTarget = false; }, 1);

      let throttle = null;
      const targetMove = ev => {
        if (throttle || isAnimatingToTarget) return;
        throttle = requestAnimationFrame(() => { updateCorners(ev.clientX, ev.clientY); throttle = null; });
      };
      const leaveHandler = () => {
        activeTarget = null; isAnimatingToTarget = false;
        resetCorners();
        resumeTimeout = setTimeout(() => {
          if (!activeTarget) createSpin();
          resumeTimeout = null;
        }, 50);
        cleanupTarget(target);
      };
      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;
      target.addEventListener('mousemove', targetMove);
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      document.body.style.cursor = '';
    };
  }, [targetSelector, spinDuration]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

// ── Particles ──────────────────────────────────────────────────
const Particles = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,208,63,${p.alpha})`;
        ctx.fill();
      });
      // draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(244,208,63,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />;
};

// ── Matrix Background ──────────────────────────────────────────
const MatrixBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()'.split('');
    const fontSize = 20;
    const columns = canvas.width / fontSize;
    const drops = Array.from({ length: columns }, () => 1);
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize, y = drops[i] * fontSize;
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    const interval = setInterval(draw, 35);
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} id="matrix-canvas" />;
};

// ── Typed Roles ────────────────────────────────────────────────
const TypedRoles = () => {
  const roles = ['Web Developer', 'MERN Stack Dev', 'UI/UX Enthusiast', 'AI/ML Explorer', 'Open to Work'];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[idx];
    let timeout;
    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 80);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 45);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % roles.length);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, idx]);

  return (
    <p className="hero-subtitle">
      {text}<span className="typed-cursor">|</span>
    </p>
  );
};

// ── Animated Counter ───────────────────────────────────────────
const Counter = ({ end, label, suffix = '+' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(end / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// ── Profile Card ───────────────────────────────────────────────
const ProfileCard = ({ avatarUrl, name, title, handle, status }) => {
  const wrapRef  = useRef(null);
  const cardRef  = useRef(null);
  const imgRef   = useRef(null);
  const detRef   = useRef(null);
  const infoRef  = useRef(null);
  const glowRef  = useRef(null);
  const shineRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap) return;

    let raf;
    let cur = { rx: 0, ry: 0, px: 50, py: 50 };
    let tgt = { rx: 0, ry: 0, px: 50, py: 50 };

    const setLayers = ({ rx, ry, px, py }) => {
      // Card tilt
      card.style.transform = `rotateX(${ry}deg) rotateY(${rx}deg)`;

      // Image moves opposite direction — deeper in the scene
      if (imgRef.current)
        imgRef.current.style.transform = `translateX(${-rx * 1.8}px) translateY(${ry * 1.8}px) scale(1.08)`;

      // Name/title floats forward
      if (detRef.current)
        detRef.current.style.transform = `translateX(${rx * 2.5}px) translateY(${-ry * 2.5}px) translateZ(30px)`;

      // User info bar floats even more forward
      if (infoRef.current)
        infoRef.current.style.transform = `translateX(${rx * 1.5}px) translateY(${-ry * 1.5}px) translateZ(20px)`;

      // Dynamic glow follows pointer
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(circle at ${px}% ${py}%, rgba(244,208,63,0.18) 0%, transparent 65%)`;
      }

      // Shine overlay
      if (shineRef.current) {
        shineRef.current.style.background =
          `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.08) 0%, transparent 55%)`;
        shineRef.current.style.opacity = '1';
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      cur.rx = lerp(cur.rx, tgt.rx, 0.1);
      cur.ry = lerp(cur.ry, tgt.ry, 0.1);
      cur.px = lerp(cur.px, tgt.px, 0.1);
      cur.py = lerp(cur.py, tgt.py, 0.1);
      setLayers(cur);
      raf = requestAnimationFrame(tick);
    };

    const onMove = e => {
      const r = card.getBoundingClientRect();
      const ox = e.clientX - r.left;
      const oy = e.clientY - r.top;
      const px = (ox / r.width)  * 100;
      const py = (oy / r.height) * 100;
      tgt.rx =  ((ox / r.width)  - 0.5) * 22;
      tgt.ry = -((oy / r.height) - 0.5) * 18;
      tgt.px = px;
      tgt.py = py;
    };

    const onEnter = () => {
      wrap.classList.add('pc-active');
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      wrap.classList.remove('pc-active');
      cancelAnimationFrame(raf);
      tgt = { rx: 0, ry: 0, px: 50, py: 50 };
      // Animate back to flat
      const snapBack = () => {
        cur.rx = lerp(cur.rx, 0, 0.08);
        cur.ry = lerp(cur.ry, 0, 0.08);
        cur.px = lerp(cur.px, 50, 0.08);
        cur.py = lerp(cur.py, 50, 0.08);
        setLayers(cur);
        if (Math.abs(cur.rx) > 0.05 || Math.abs(cur.ry) > 0.05) raf = requestAnimationFrame(snapBack);
        else {
          cur = { rx: 0, ry: 0, px: 50, py: 50 };
          setLayers(cur);
          if (shineRef.current) shineRef.current.style.opacity = '0';
        }
      };
      raf = requestAnimationFrame(snapBack);
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove',  onMove);
    card.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove',  onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pc-card-wrapper">
      <section ref={cardRef} className="pc-card">

        {/* ── Deep background glow ── */}
        <div className="pc-bg-glow" />

        {/* ── Avatar — deepest layer, moves most ── */}
        <div className="pc-avatar-layer">
          <img ref={imgRef} className="pc-avatar" src={avatarUrl} alt={name} />
          {/* Depth fog at bottom */}
          <div className="pc-depth-fog" />
          {/* Scanline overlay for texture */}
          <div className="pc-scanlines" />
        </div>

        {/* ── Dynamic shine ── */}
        <div ref={shineRef} className="pc-shine" />

        {/* ── Glow under pointer ── */}
        <div ref={glowRef} className="pc-glare" />

        {/* ── Name / title — floats forward ── */}
        <div ref={detRef} className="pc-details">
          <h3>{name}</h3>
          <p>{title}</p>
        </div>

        {/* ── User info bar — floats most forward ── */}
        <div ref={infoRef} className="pc-user-info">
          <div className="pc-user-details">
            <div className="pc-mini-avatar">
              <img src={avatarUrl} alt={name} />
            </div>
            <div className="pc-user-text">
              <div className="pc-handle">@{handle}</div>
              <div className="pc-status">{status}</div>
            </div>
          </div>
          <button
            className="pc-contact-btn"
            onClick={() => scrollTo('contact')}
          >
            Contact
          </button>
        </div>

      </section>
    </div>
  );
};

// ── Journey Section ────────────────────────────────────────────
const Journey = () => {
  const education = [
    {
      year: '2023',
      label: 'Present',
      title: 'B.Sc. Information Technology',
      org: 'Panjab University · Ludhiana',
      desc: 'Web technologies, databases, AI/ML, and software engineering — built alongside real projects.',
      current: true,
    },
    {
      year: '2021',
      label: '2023',
      title: 'Senior Secondary (12th)',
      org: 'HVM Convent Sen. Sec. School · Ludhiana',
      desc: 'Science stream. Where curiosity about programming first sparked.',
      current: false,
    },
    {
      year: '2019',
      label: '2021',
      title: 'Secondary (10th)',
      org: 'HVM Convent Sen. Sec. School · Ludhiana',
      desc: 'Strong foundation in Mathematics and Science.',
      current: false,
    },
  ];

  const experience = [
    {
      year: '2026',
      label: 'Present',
      title: 'Full-Stack Developer Intern',
      org: 'Currently Working',
      desc: 'Shipping production MERN features. Learning what it means to build at scale.',
      current: true,
    },
    {
      year: '2024',
      label: 'Present',
      title: 'Freelance Web Developer',
      org: 'Self-employed',
      desc: 'End-to-end client projects — WordPress, MERN, GSAP animations.',
      current: true,
    },
    {
      year: '2024',
      label: '2025',
      title: 'Open Source Projects',
      org: 'github.com/rajvansh977',
      desc: 'CYBER CORE and Site-de-Cinema — shipped, public, and used.',
      current: false,
    },
  ];

  return (
    <div className="jrn-wrap">
      {/* Education column */}
      <div className="jrn-col">
        <div className="jrn-col-head">
          <GraduationCap size={16} strokeWidth={2} />
          Education
        </div>
        {education.map((item, i) => (
          <div key={i} className={`jrn-card reveal-item ${item.current ? 'jrn-card-current' : ''}`}>
            <div className="jrn-year-block">
              <span className="jrn-year">{item.year}</span>
              <span className="jrn-arrow">→</span>
              <span className="jrn-year-end">{item.label}</span>
            </div>
            <h3 className="jrn-title">{item.title}</h3>
            <div className="jrn-org">{item.org}</div>
            <p className="jrn-desc">{item.desc}</p>
            {item.current && <div className="jrn-dot-active" />}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="jrn-divider">
        <div className="jrn-divider-line" />
        <div className="jrn-divider-icon"><Zap size={16} /></div>
        <div className="jrn-divider-line" />
      </div>

      {/* Experience column */}
      <div className="jrn-col">
        <div className="jrn-col-head">
          <Briefcase size={16} strokeWidth={2} />
          Experience
        </div>
        {experience.map((item, i) => (
          <div key={i} className={`jrn-card reveal-item ${item.current ? 'jrn-card-current' : ''}`}>
            <div className="jrn-year-block">
              <span className="jrn-year">{item.year}</span>
              <span className="jrn-arrow">→</span>
              <span className="jrn-year-end">{item.label}</span>
            </div>
            <h3 className="jrn-title">{item.title}</h3>
            <div className="jrn-org">{item.org}</div>
            <p className="jrn-desc">{item.desc}</p>
            {item.current && <div className="jrn-dot-active" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── AI Tech Stack Widget ───────────────────────────────────────
const AITechStack = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectType, setProjectType] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const projectTypes = [
    { value: 'ecommerce', label: 'E-commerce',  icon: <ShoppingCart size={14}/> },
    { value: 'social',    label: 'Social',       icon: <Users size={14}/> },
    { value: 'portfolio', label: 'Portfolio',    icon: <Briefcase size={14}/> },
    { value: 'saas',      label: 'SaaS',         icon: <Cloud size={14}/> },
    { value: 'blog',      label: 'Blog/CMS',     icon: <FileText size={14}/> },
    { value: 'dashboard', label: 'Dashboard',    icon: <BarChart2 size={14}/> },
    { value: 'chat',      label: 'Chat App',     icon: <MessageSquare size={14}/> },
    { value: 'game',      label: 'Game',         icon: <Gamepad2 size={14}/> },
  ];
  const stacks = {
    ecommerce:  { frontend: 'Next.js + TypeScript', backend: 'Node.js + Express', database: 'MongoDB + Redis', extras: ['Stripe API', 'Tailwind CSS', 'React Query'], reason: 'Fast SSR for SEO, secure payments, and scalable architecture.' },
    social:     { frontend: 'React + Vite', backend: 'Node.js + Socket.io', database: 'PostgreSQL + Redis', extras: ['Firebase Auth', 'Cloudinary', 'Framer Motion'], reason: 'Real-time updates and efficient media handling.' },
    portfolio:  { frontend: 'React + GSAP', backend: 'Node.js + Express', database: 'MongoDB', extras: ['Nodemailer', 'Tailwind CSS', 'GSAP ScrollTrigger'], reason: 'Optimized for visual storytelling and smooth animations.' },
    saas:       { frontend: 'Next.js 14 + TypeScript', backend: 'Node.js + tRPC', database: 'PostgreSQL + Prisma', extras: ['Shadcn UI', 'Stripe', 'Zustand'], reason: 'Type-safe, scalable with subscription management.' },
    blog:       { frontend: 'Next.js + MDX', backend: 'Headless CMS (Sanity)', database: 'CMS Built-in', extras: ['Tailwind Typography', 'RSS Feed', 'Syntax Highlighting'], reason: 'Blazing fast SSG/SSR with excellent SEO.' },
    dashboard:  { frontend: 'React + TypeScript + Recharts', backend: 'Node.js + Express', database: 'PostgreSQL', extras: ['Tanstack Table', 'React Query', 'Zustand'], reason: 'Optimized for data visualization and real-time updates.' },
    chat:       { frontend: 'React + TypeScript', backend: 'Node.js + Socket.io', database: 'MongoDB + Redis', extras: ['WebRTC', 'File Upload (S3)', 'Push Notifications'], reason: 'Real-time messaging with media sharing.' },
    game:       { frontend: 'React + Three.js', backend: 'Node.js + Socket.io', database: 'MongoDB', extras: ['R3F', 'GSAP', 'Howler.js'], reason: 'High-performance 3D rendering and real-time multiplayer.' },
  };
  const handleAnalyze = () => {
    if (!projectType) return;
    setIsAnalyzing(true);
    setTimeout(() => { setRecommendation(stacks[projectType]); setIsAnalyzing(false); }, 1800);
  };

  return (
    <div className="ai-chat-container">
      <button className="ai-chat-button" onClick={() => setIsOpen(!isOpen)} title="AI Tech Stack Recommender">
        <img src="/bot.png" alt="Bot" style={{ width: '40px' }} />
      </button>
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <h4><Bot size={16} style={{marginRight:6, verticalAlign:'middle'}}/>Tech Stack AI</h4>
          <button className="ai-chat-close" onClick={() => setIsOpen(false)}>×</button>
        </div>
        <div className="ai-chat-messages" style={{ padding: '20px' }}>
          {!recommendation ? (
            <>
              <h5 style={{ color: '#f4d03f', fontSize: '1rem', marginBottom: '15px', fontWeight: '700' }}>SELECT PROJECT TYPE</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '20px' }}>
                {projectTypes.map(t => (
                  <button key={t.value} onClick={() => setProjectType(t.value)} style={{ padding: '10px', background: projectType === t.value ? 'linear-gradient(135deg,#f4d03f,#e8f4f8)' : 'rgba(244,208,63,0.1)', border: `2px solid ${projectType === t.value ? '#f4d03f' : 'rgba(244,208,63,0.3)'}`, borderRadius: '8px', color: projectType === t.value ? '#0a1628' : '#e8f4f8', fontFamily: 'Orbitron,monospace', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
              <button onClick={handleAnalyze} disabled={!projectType || isAnalyzing} style={{ width: '100%', padding: '15px', background: isAnalyzing ? 'rgba(244,208,63,0.3)' : 'linear-gradient(135deg,#f4d03f,#e8f4f8)', border: '2px solid #f4d03f', borderRadius: '10px', color: '#0a1628', fontFamily: 'Orbitron,monospace', fontSize: '1rem', fontWeight: '900', cursor: isAnalyzing ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '2px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                {isAnalyzing ? <><Loader2 size={16} className="spin-icon"/>ANALYZING...</> : <><Rocket size={16}/>GET RECOMMENDATION</>}
              </button>
            </>
          ) : (
            <div>
              <h5 style={{ color: '#f4d03f', fontSize: '1.1rem', marginBottom: '15px', fontWeight: '900', textAlign: 'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}><Target size={18}/>RECOMMENDED STACK</h5>
              <div style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.3)', borderRadius: '10px', padding: '15px', marginBottom: '12px' }}>
                {Object.entries(recommendation).filter(([k]) => k !== 'reason' && k !== 'extras').map(([key, val]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <div style={{ color: '#f4d03f', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>{key}</div>
                    <div style={{ color: '#e8f4f8', fontSize: '0.88rem', fontWeight: '600' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(232,244,248,0.08)', border: '1px solid rgba(232,244,248,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ color: '#f4d03f', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display:'flex', alignItems:'center', gap:'5px' }}><Lightbulb size={12}/>WHY THIS STACK?</div>
                <div style={{ color: '#e8f4f8', fontSize: '0.82rem', lineHeight: '1.6' }}>{recommendation.reason}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {recommendation.extras.map((e, i) => <span key={i} style={{ padding: '4px 10px', background: 'rgba(244,208,63,0.15)', border: '1px solid rgba(244,208,63,0.4)', borderRadius: '20px', color: '#f4d03f', fontSize: '0.72rem', fontWeight: '700' }}>{e}</span>)}
              </div>
              <button onClick={() => { setRecommendation(null); setProjectType(''); }} style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid #f4d03f', borderRadius: '8px', color: '#f4d03f', fontFamily: 'Orbitron,monospace', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}><RefreshCw size={14}/>NEW RECOMMENDATION</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Mobile Nav ─────────────────────────────────────────────────
const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '#home', label: 'INIT' }, { href: '#about', label: 'PROFILE' },
    { href: '#experience', label: 'JOURNEY' }, { href: '#projects', label: 'PROJECTS' },
    { href: '#skills', label: 'SKILLS' }, { href: '#contact', label: 'CONNECT' },
  ];

  const handleNav = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const id = href.replace('#', '');
    scrollTo(id);
  };

  return (
    <>
      <nav className="mobile-nav">
        <div className="mobile-nav-logo">RAJVANSH</div>
        <button className={`mobile-hamburger ${open ? 'active' : ''}`} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {links.map(l => <a key={l.href} href={l.href} onClick={e => handleNav(e, l.href)}>{l.label}</a>)}
        <a href="https://www.linkedin.com/in/rajvansh-rana-6b98521b4/" target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', display:'flex', alignItems:'center', gap:'8px' }}><Link size={14}/>LINKEDIN</a>
        <a href="https://github.com/rajvansh977" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'8px' }}><GitBranch size={14}/>GITHUB</a>
      </div>
    </>
  );
};

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  // Active nav highlight on scroll
  useEffect(() => {
    const sections = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.4 });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // GSAP
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.utils.toArray('.section-title').forEach(title => {
        window.gsap.fromTo(title, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: title, start: 'top 85%' } });
      });
    }
  }, []);

  const navLinks = [
    ['#home', 'INIT'], ['#about', 'PROFILE'], ['#experience', 'JOURNEY'],
    ['#projects', 'PROJECTS'], ['#skills', 'SKILLS'], ['#contact', 'CONNECT'],
  ];

  const skills = [
    { title: 'FRONTEND',  icon: <Layers size={18}/>,   items: [['React', 90], ['Next.js', 85], ['HTML/CSS', 95], ['JavaScript', 88]] },
    { title: 'BACKEND',   icon: <Settings size={18}/>,  items: [['Node.js', 82], ['Express', 80], ['REST API', 85], ['Python', 75]] },
    { title: 'DATABASE',  icon: <Database size={18}/>,  items: [['MongoDB', 85], ['MySQL', 78], ['Firebase', 80], ['Redis', 70]] },
    { title: 'ANIMATION', icon: <Wand2 size={18}/>,     items: [['GSAP', 88], ['Framer Motion', 82], ['Three.js', 75], ['CSS Animations', 90]] },
    { title: 'TOOLS',     icon: <Wrench size={18}/>,    items: [['Git', 90], ['VS Code', 95], ['Webpack', 75], ['NPM', 88]] },
    { title: 'AI / ML',   icon: <Bot size={18}/>,       items: [['Python', 80], ['TensorFlow', 70], ['PyTorch', 68], ['ML Basics', 75]] },
  ];

  const touch = isTouchDevice();

  return (
    <div className="scanlines">
      {!touch && <TargetCursor />}
      <MobileNav />
      <MatrixBackground />

      {/* HUD */}
      <div className="hud">
        <div className="hud-corner top-left" /><div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" /><div className="hud-corner bottom-right" />
      </div>

      {/* Desktop nav */}
      <nav className="nav-container">
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} className={`nav-item ${activeSection === href.slice(1) ? 'nav-active' : ''}`}
            onClick={e => { e.preventDefault(); scrollTo(href.slice(1)); }}
          >{label}</a>
        ))}
        <a href="https://www.linkedin.com/in/rajvansh-rana-6b98521b4/" target="_blank" rel="noopener noreferrer" className="nav-item nav-linkedin"><Link size={13}/></a>
        <a href="https://github.com/rajvansh977" target="_blank" rel="noopener noreferrer" className="nav-item nav-github"><GitBranch size={13}/></a>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <HeroScene />
        <div className="hero-content">
          <h1 className="glitch" data-text="RAJVANSH">RAJVANSH</h1>
          <TypedRoles />
          <div className="terminal-lines">
            <div className="terminal-line">&gt; B.Sc. IT Student @ Mumbai University</div>
            <div className="terminal-line">&gt; MERN Stack · GSAP · AI/ML</div>
            <div className="terminal-line">&gt; Building the future, one commit at a time_</div>
          </div>
          <div className="hero-cta-group">
            <button className="cta-button" onClick={() => scrollTo('projects')}>
              VIEW PROJECTS
            </button>
            <a href="#contact" className="cta-button cta-outline" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>HIRE ME</a>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-line" />
          <ChevronDown size={14} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section sp-section">
        <div className="container">

          {/* Header */}
          <div className="sp-header">
            <h2 className="section-title sp-title">System Profile</h2>
            <p className="sp-subtitle">USER ID: <span>RAJVANSH_RANA</span> // STATUS: <span className="sp-active">ACTIVE</span></p>
          </div>

          {/* Main 3-col grid */}
          <div className="sp-grid">

            {/* COL 1 — About Me */}
            <div className="sp-col sp-col-left reveal-item">
              <div className="sp-block-title"><User size={14}/> ABOUT ME</div>
              <div className="sp-about-text">
                <p>I'm a B.Sc. IT student and aspiring developer passionate about building interactive, modern digital experiences that feel alive.</p>
                <p>Specializing in the MERN stack and GSAP animations, with growing skills in AI/ML and game development. I enjoy turning ideas into real, polished products.</p>
                <p>My mission: push the boundaries of what the web can feel like — one commit at a time.</p>
              </div>
            </div>

            {/* COL 2 — What Drives Me */}
            <div className="sp-col sp-col-mid reveal-item">
              <div className="sp-block-title"><Zap size={14}/> WHAT DRIVES ME</div>
              <div className="sp-drives">
                {[
                  { icon: <Code size={18}/>,        title: 'BUILD',                   desc: 'I love turning ideas into functional, beautiful and high performance web apps.' },
                  { icon: <Lightbulb size={18}/>,   title: 'CREATIVE PROBLEM SOLVER', desc: 'I enjoy solving real-world problems with clean code and creative thinking.' },
                  { icon: <BookOpen size={18}/>,    title: 'CONTINUOUS LEARNER',      desc: 'Always exploring new technologies and leveling up every day.' },
                  { icon: <Rocket size={18}/>,      title: 'IMPACT',                  desc: 'I want to build products that make a difference and create value.' },
                ].map((d, i) => (
                  <div key={i} className="sp-drive-item">
                    <div className="sp-drive-icon">{d.icon}</div>
                    <div>
                      <div className="sp-drive-title">{d.title}</div>
                      <div className="sp-drive-desc">{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COL 3 — Profile Card */}
            <div className="sp-col sp-col-right reveal-item">
              <ProfileCard avatarUrl="/profile.jpg" name="Rajvansh Rana" title="Web Developer" handle="rajvansh911" status="Available for Work" />
            </div>

          </div>

          {/* Bottom info bar */}
          <div className="sp-info-bar reveal-item">
            {[
              { icon: <GraduationCap size={22}/>, label: 'EDUCATION',    value: 'B.Sc. IT (In Progress)\nLudhiana, India' },
              { icon: <MapPin size={22}/>,        label: 'LOCATION',     value: 'Ludhiana, India' },
              { icon: <Briefcase size={22}/>,     label: 'EXPERIENCE',   value: 'Full-Stack Developer\nIntern · Currently Working' },
              { icon: <Clock size={22}/>,         label: 'AVAILABILITY', value: 'Open to\nOpportunities' },
              { icon: <Globe size={22}/>,         label: 'LANGUAGES',    value: 'English, Hindi,\nPunjabi' },
            ].map((item, i) => (
              <div key={i} className="sp-info-item">
                <div className="sp-info-icon">{item.icon}</div>
                <div className="sp-info-label">{item.label}</div>
                <div className="sp-info-value">{item.value.split('\n').map((line, j) => <span key={j}>{line}</span>)}</div>
              </div>
            ))}
          </div>

          {/* Bottom quote + stats bar */}
          <div className="sp-bottom-bar reveal-item">
            <div className="sp-quote">
              <span className="sp-quote-mark">"</span>
              <p>Code is not just what I write,<br/>it's how I bring ideas to life.</p>
            </div>
            <div className="sp-stats">
              {[
                { icon: <CheckSquare size={20}/>, num: '05+', label: 'PROJECTS BUILT' },
                { icon: <Layers size={20}/>,      num: '10+', label: 'TECHNOLOGIES EXPLORED' },
                { icon: <Infinity size={20}/>,    num: '100%',label: 'PASSION AND DEDICATION' },
              ].map((s, i) => (
                <div key={i} className="sp-stat">
                  <div className="sp-stat-icon">{s.icon}</div>
                  <div className="sp-stat-num">{s.num}</div>
                  <div className="sp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── EXPERIENCE / EDUCATION ── */}
      <section id="experience" className="section">
        <div className="container">
          <h2 className="section-title">My Journey</h2>
          <Journey />
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="section">
        <div className="container">
          <h2 className="section-title">Digital Creations</h2>

          <div className="bento-grid">

            {/* Card 1 — CYBER CORE — large */}
            <div className="bento-card bento-large reveal-item">
              <div className="bento-img-wrap">
                <iframe src="https://rajvansh977.github.io/CYBER_CORE/" title="Cyber Core" className="project-iframe" />
                <div className="bento-img-overlay" />
              </div>
              <div className="bento-content">
                <div className="bento-top">
                  <span className="bento-cat">Frontend</span>
                  <span className="bento-year">2024</span>
                </div>
                <h3 className="bento-title">CYBER CORE</h3>
                <p className="bento-desc">A rotating 3D image slider with cinematic design aesthetics. Pure HTML, CSS and JavaScript.</p>
                <div className="bento-tags">
                  <span className="tech-tag">JavaScript</span>
                  <span className="tech-tag">HTML</span>
                  <span className="tech-tag">CSS</span>
                </div>
                <div className="bento-links">
                  <a href="https://rajvansh977.github.io/CYBER_CORE/" target="_blank" rel="noopener noreferrer" className="bento-btn bento-btn-primary"><ExternalLink size={13}/>Live Demo</a>
                  <a href="https://github.com/rajvansh977/CYBER_CORE" target="_blank" rel="noopener noreferrer" className="bento-btn bento-btn-ghost"><GitBranch size={13}/>GitHub</a>
                </div>
              </div>
            </div>

            {/* Card 2 — SITE-DE-CINEMA — medium */}
            <div className="bento-card bento-medium reveal-item">
              <div className="bento-img-wrap">
                <img src="/Site.png" alt="site-de-cinema" className="bento-img" />
                <div className="bento-img-overlay" />
              </div>
              <div className="bento-content">
                <div className="bento-top">
                  <span className="bento-cat">Full Stack</span>
                  <span className="bento-year">2024</span>
                </div>
                <h3 className="bento-title">SITE-DE-CINEMA</h3>
                <p className="bento-desc">Movie discovery platform with auth, reviews, and a full REST API.</p>
                <div className="bento-tags">
                  <span className="tech-tag">MongoDB</span>
                  <span className="tech-tag">Node.js</span>
                  <span className="tech-tag">Express</span>
                  <span className="tech-tag">GSAP</span>
                </div>
                <div className="bento-links">
                  <a href="https://github.com/rajvansh977/site-de-cinema" target="_blank" rel="noopener noreferrer" className="bento-btn bento-btn-ghost"><GitBranch size={13}/>GitHub</a>
                </div>
              </div>
            </div>

            {/* Card 3 — This Portfolio */}
            <div className="bento-card bento-small bento-highlight reveal-item">
              <div className="bento-content bento-content-full">
                <div className="bento-glow-orb" />
                <div className="bento-top">
                  <span className="bento-cat">Portfolio</span>
                  <span className="bento-year">2026</span>
                </div>
                <h3 className="bento-title">THIS PORTFOLIO</h3>
                <p className="bento-desc">Built with React, Vite, Three.js, GSAP, Node.js + MongoDB backend with Nodemailer.</p>
                <div className="bento-tags">
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">Three.js</span>
                  <span className="tech-tag">GSAP</span>
                  <span className="tech-tag">Node.js</span>
                </div>
              </div>
            </div>

            {/* Card 4 — Coming Soon */}
            <div className="bento-card bento-small bento-soon reveal-item">
              <div className="bento-content bento-content-full">
                <Rocket size={32} strokeWidth={1.5} style={{ color: 'rgba(244,208,63,0.3)', marginBottom: '12px' }} />
                <h3 className="bento-title" style={{ fontSize: '0.9rem' }}>MORE COMING SOON</h3>
                <p className="bento-desc" style={{ fontSize: '0.8rem' }}>New projects in progress. Follow on GitHub.</p>
                <a href="https://github.com/rajvansh977" target="_blank" rel="noopener noreferrer" className="bento-btn bento-btn-ghost" style={{ marginTop: '16px', display: 'inline-flex' }}>
                  <GitBranch size={13}/>View GitHub
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" className="section">
        <div className="container">
          <h2 className="section-title">Core Systems</h2>
          <SkillsUniverse />
        </div>
      </section>

      <AITechStack />

      {/* ── CONTACT ── */}
      <section id="contact" className="section">
        <div className="container">
          <h2 className="section-title">Establish Connection</h2>
          <div className="contact-container">
            <div className="contact-info">
              <p className="contact-tagline reveal-item">Have a project in mind or just want to say hi? My inbox is always open.</p>
              <a href="mailto:rajvanshr95@gmail.com" className="contact-item reveal-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="contact-icon"><Mail size={20}/></div><div>rajvanshr95@gmail.com</div>
              </a>
              <a href="https://www.linkedin.com/in/rajvansh-rana-6b98521b4/" target="_blank" rel="noopener noreferrer" className="contact-item reveal-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="contact-icon"><Link size={20}/></div><div>linkedin.com/in/rajvansh-rana</div>
              </a>
              <a href="https://github.com/rajvansh977" target="_blank" rel="noopener noreferrer" className="contact-item reveal-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="contact-icon"><GitBranch size={20}/></div><div>github.com/rajvansh977</div>
              </a>
              <div className="contact-item reveal-item"><div className="contact-icon"><MapPin size={20}/></div><div>India</div></div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">RAJVANSH<span>.</span></div>
          <p className="footer-copy">© 2026 Rajvansh Rana. Built with React + Vite + Node.js</p>
          <div className="footer-links">
            <a href="https://github.com/rajvansh977" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/rajvansh-rana-6b98521b4/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:rajvanshr95@gmail.com">Email</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
