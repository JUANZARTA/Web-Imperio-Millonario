/* ================================================================
   PARTICLES
================================================================ */
(function () {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  const GOLD   = '#C9A142';
  const BLUE   = '#4DAAFF';
  const COUNT  = 100;
  let W, H, pts = [];
  let mx = null, my = null;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function Pt() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .26;
    this.vy = (Math.random() - .5) * .26;
    this.r  = Math.random() * 1.5 + .4;
    this.a  = Math.random() * .4 + .1;
    this.c  = Math.random() > .7 ? BLUE : GOLD;
  }
  for (let i = 0; i < COUNT; i++) pts.push(new Pt());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 110) * .1;
          ctx.strokeStyle = GOLD;
          ctx.lineWidth   = .6;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // dots
    pts.forEach(p => {
      if (mx !== null) {
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { p.x += dx / d * .55; p.y += dy / d * .55; }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle   = p.c;
      ctx.shadowColor = p.c;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ================================================================
   NAVBAR — scroll state
================================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  document.getElementById('topBtn').classList.toggle('show', y > 500);
}

/* hero bg removed — no parallax needed */

/* ================================================================
   INTERSECTION OBSERVER — scroll reveal
================================================================ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in, .reveal, .fade-left, .fade-right, .fade-scale').forEach(el => io.observe(el));

/* stats removed — no counters needed */

/* ================================================================
   3D TILT on cards
================================================================ */
document.querySelectorAll('.mentor-card, .pain-card, .benefit-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ================================================================
   MAGNETIC BUTTONS
================================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width  / 2;
    const y = e.clientY - r.top  - r.height / 2;
    btn.style.transform = `translateY(-3px) translate(${x * .1}px, ${y * .1}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ================================================================
   MOBILE MENU
================================================================ */
function toggleMobile() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileNav');
  ham.classList.toggle('open');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
function closeMobile() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileNav').classList.remove('open');
  document.body.style.overflow = '';
}

/* ================================================================
   LUCIDE ICONS
================================================================ */
if (typeof lucide !== 'undefined') lucide.createIcons();
