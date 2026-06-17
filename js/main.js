/* ================================================================
   js/main.js — Imperio Millonario
   Responsabilidades:
     1. Sistema de partículas animadas en el canvas de fondo
     2. Estado del navbar al hacer scroll
     3. Animaciones de entrada con IntersectionObserver
     4. Efecto 3D tilt en tarjetas
     5. Efecto magnético en botones
     6. Menú móvil (hamburger)
     7. Inicialización de Lucide Icons
================================================================ */


/* ================================================================
   1. PARTÍCULAS
   IIFE aislado para no contaminar el scope global.
   Dibuja puntos dorados/azules que flotan, se conectan con líneas
   cuando están a menos de 110px, y se repelen del cursor del mouse.
================================================================ */
(function () {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');

  /* Colores del logo de la marca */
  const GOLD   = '#C9A142';
  const BLUE   = '#4DAAFF';

  /* Total de partículas en pantalla. Más = más denso pero más pesado. */
  const COUNT  = 100;

  let W, H, pts = [];
  let mx = null, my = null; /* posición actual del mouse; null = fuera de pantalla */

  /* Sincroniza el canvas con el tamaño real de la ventana */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  /* Constructor de partícula con valores aleatorios */
  function Pt() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .26;  /* velocidad horizontal */
    this.vy = (Math.random() - .5) * .26;  /* velocidad vertical */
    this.r  = Math.random() * 1.5 + .4;    /* radio del punto (0.4–1.9px) */
    this.a  = Math.random() * .4 + .1;     /* opacidad (0.1–0.5) */
    this.c  = Math.random() > .7 ? BLUE : GOLD; /* 30% azul, 70% dorado */
  }
  for (let i = 0; i < COUNT; i++) pts.push(new Pt());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* --- Líneas de conexión entre partículas cercanas ---
       Solo se dibuja si la distancia entre dos puntos es < 110px.
       La opacidad de la línea se atenúa a medida que los puntos se alejan. */
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

    /* --- Movimiento y dibujo de cada punto ---
       Si el mouse está dentro de 120px, el punto se aleja de él (repulsión). */
    pts.forEach(p => {
      if (mx !== null) {
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { p.x += dx / d * .55; p.y += dy / d * .55; }
      }

      /* Avance por velocidad y rebote en los bordes del canvas */
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* Dibuja el punto con glow usando shadowBlur */
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
   2. NAVBAR — estado al hacer scroll
   Agrega .scrolled al navbar cuando el usuario baja más de 60px
   (activa el fondo oscuro con blur en CSS).
   Muestra/oculta el botón "Volver arriba" después de 500px.
================================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  document.getElementById('topBtn').classList.toggle('show', y > 500);
}


/* ================================================================
   3. INTERSECTION OBSERVER — animaciones de entrada al hacer scroll
   Observa todos los elementos con clases de animación.
   Cuando un elemento entra al viewport (12% visible), agrega .visible
   que activa la transición CSS. Se deja de observar tras la primera vez.

   Clases animadas:
     .fade-in    → sube desde abajo (translateY)
     .reveal     → igual que fade-in pero más lenta (.8s)
     .fade-left  → entra desde la izquierda (translateX -)
     .fade-right → entra desde la derecha (translateX +)
     .fade-scale → escala desde 92% hasta 100%
================================================================ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target); /* se dispara una sola vez */
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in, .reveal, .fade-left, .fade-right, .fade-scale').forEach(el => io.observe(el));


/* ================================================================
   4. EFECTO 3D TILT en tarjetas
   Al mover el mouse sobre una tarjeta, se calcula la posición relativa
   del cursor dentro del elemento (normalizada entre -0.5 y 0.5) y se
   aplica una rotación 3D de hasta ±7 grados en X e Y.
   Al salir, el transform se limpia para volver al estado original.
================================================================ */
document.querySelectorAll('.mentor-card, .pain-card, .benefit-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5; /* -0.5 (izq) a 0.5 (der) */
    const y = (e.clientY - r.top)  / r.height - .5; /* -0.5 (arr) a 0.5 (aba) */
    card.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ================================================================
   5. EFECTO MAGNÉTICO en botones
   El botón se desplaza levemente hacia el cursor (10% del offset).
   Crea la ilusión de que el botón "atrae" al mouse.
   El desplazamiento es pequeño (factor 0.1) para que sea sutil.
================================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width  / 2; /* offset desde el centro */
    const y = e.clientY - r.top  - r.height / 2;
    btn.style.transform = `translateY(-3px) translate(${x * .1}px, ${y * .1}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});


/* ================================================================
   6. MENÚ MÓVIL
   toggleMobile: abre/cierra el overlay y anima el hamburger a X.
                 Bloquea el scroll del body mientras el menú está abierto.
   closeMobile:  cierra desde los links internos (onclick en el HTML).
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
   7. LUCIDE ICONS
   Debe ejecutarse AL FINAL, después de que el DOM esté completo,
   para que encuentre todos los <i data-lucide="nombre"> y los
   reemplace con el SVG correspondiente.
   El guard evita errores si el CDN falla en cargar.
================================================================ */
if (typeof lucide !== 'undefined') lucide.createIcons();
