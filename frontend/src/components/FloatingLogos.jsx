import { useEffect, useRef } from 'react';

const LOGOS = [
  { slug: 'react',      label: 'React',      color: '61DAFB', depth: 0.08, x: 12,  y: 20 },
  { slug: 'nodedotjs',  label: 'Node.js',    color: '5FA04E', depth: 0.05, x: 82,  y: 15 },
  { slug: 'mongodb',    label: 'MongoDB',    color: '47A248', depth: 0.10, x: 72,  y: 70 },
  { slug: 'javascript', label: 'JavaScript', color: 'F7DF1E', depth: 0.06, x: 18,  y: 72 },
  { slug: 'threedotjs', label: 'Three.js',   color: 'ffffff', depth: 0.12, x: 88,  y: 42 },
  { slug: 'python',     label: 'Python',     color: '3776AB', depth: 0.07, x: 7,   y: 50 },
  { slug: 'greensock',  label: 'GSAP',       color: '88CE02', depth: 0.09, x: 55,  y: 82 },
  { slug: 'nextdotjs',  label: 'Next.js',    color: 'ffffff', depth: 0.04, x: 40,  y: 10 },
  { slug: 'git',        label: 'Git',        color: 'F05032', depth: 0.11, x: 65,  y: 25 },
  { slug: 'vite',       label: 'Vite',       color: '646CFF', depth: 0.06, x: 28,  y: 88 },
  { slug: 'typescript', label: 'TypeScript', color: '3178C6', depth: 0.08, x: 92,  y: 78 },
  { slug: 'express',    label: 'Express',    color: 'ffffff', depth: 0.05, x: 48,  y: 55 },
];

export default function FloatingLogos() {
  const containerRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = e => {
      mouse.current.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const items = containerRef.current?.querySelectorAll('.fl-item');

    const tick = () => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.06;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.06;

      items?.forEach(item => {
        const depth = parseFloat(item.dataset.depth);
        const ox = mouse.current.x * depth * 120;
        const oy = mouse.current.y * depth * 80;
        item.style.transform = `translate(${ox}px, ${oy}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {LOGOS.map((logo, i) => (
        <div
          key={logo.slug}
          className="fl-item"
          data-depth={logo.depth}
          style={{
            position: 'absolute',
            left: `${logo.x}%`,
            top:  `${logo.y}%`,
            transition: 'transform 0.1s linear',
            willChange: 'transform',
            animation: `fl-float-${i % 4} ${4 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          <img
            src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
            alt={logo.label}
            style={{
              width: `${22 + (i % 4) * 6}px`,
              height: `${22 + (i % 4) * 6}px`,
              opacity: 0.15 + logo.depth * 0.9,
              display: 'block',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      ))}
    </div>
  );
}
