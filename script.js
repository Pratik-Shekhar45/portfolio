// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. THREE.JS 3D BACKGROUND SCENE
// ==========================================

const initThreeScene = () => {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x16181e, 0.015);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5, 25);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xffb320, 2, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00d2ff, 1.5, 50);
  pointLight2.position.set(-10, -5, 10);
  scene.add(pointLight2);

  // 3D Particles Terrain / Wave
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Generate grid values for wave
  const gridSize = 45;
  const spacing = 1.0;
  let idx = 0;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (idx >= particleCount) break;

      // X position (centered)
      const x = (i - gridSize / 2) * spacing;
      // Z position (centered)
      const z = (j - gridSize / 2) * spacing;
      // Y position (initially zero, animated in loop)
      const y = 0;

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      // Colors - gradient blend between amber and blue/purple
      const ratio = i / gridSize;
      colors[idx * 3] = 1.0 - ratio * 0.4;     // R
      colors[idx * 3 + 1] = 0.7 + ratio * 0.1; // G
      colors[idx * 3 + 2] = 0.1 + ratio * 0.8; // B

      idx++;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Circular texture creation for particles
  const createParticleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  };

  // Material
  const material = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    map: createParticleTexture(),
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  // Points Mesh
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Mouse Tracking for Parallax
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Clock
  const clock = new THREE.Clock();

  // Scroll Trigger Sync: rotate particle mesh on scroll
  gsap.to(points.rotation, {
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    },
    y: Math.PI * 1.2,
    x: Math.PI * 0.2
  });

  // Move camera on scroll
  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2
    },
    z: 18,
    y: 8
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime() * 0.4;
    const positionsAttr = points.geometry.attributes.position;
    const array = positionsAttr.array;

    // Mutate Y coordinates to form animated wave terrain
    for (let i = 0; i < particleCount; i++) {
      const x = array[i * 3];
      const z = array[i * 3 + 2];
      
      // Dynamic sine-wave calculations
      array[i * 3 + 1] = Math.sin(x * 0.18 + time) * Math.cos(z * 0.18 + time) * 2.2
                       + Math.sin(x * 0.4 + time * 1.5) * 0.4;
    }

    positionsAttr.needsUpdate = true;

    // Smooth mouse lerp
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    // Apply mouse parallax to scene
    points.rotation.y = currentMouseX * 0.35 + (points.rotation.y % (Math.PI * 2));
    points.rotation.x = currentMouseY * 0.2;

    renderer.render(scene, camera);
  };

  animate();
};

// ==========================================
// 2. 3D CARD TILT INTERACTION
// ==========================================

const initCardTilts = () => {
  const cards = document.querySelectorAll('[data-tilt]');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      // Calculate normal coordinates (-0.5 to 0.5)
      const relativeX = (x / rect.width) - 0.5;
      const relativeY = (y / rect.height) - 0.5;
      
      // Max tilt angle in degrees
      const maxTilt = 12;
      const tiltX = -relativeY * maxTilt;
      const tiltY = relativeX * maxTilt;
      
      // Set CSS custom variables for glow radial coordinates
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      
      // Apply 3D rotation transform
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      // Smoothly return card to flat state
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
};

// ==========================================
// 3. GSAP SCROLL-TRIGGER ANIMATIONS
// ==========================================

const initScrollAnimations = () => {
  // Fade in nav links
  gsap.from('.navbar', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  // Fade in Hero items
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl.from('.intro-tag', { opacity: 0, x: -30, duration: 0.8, delay: 0.3 })
        .from('.hero-title', { opacity: 0, y: 50, duration: 1 }, '-=0.6')
        .from('.hero-subtitle', { opacity: 0, x: -20, duration: 0.8 }, '-=0.7')
        .from('.hero-description', { opacity: 0, y: 30, duration: 0.8 }, '-=0.7')
        .from('.hero-socials a', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.6')
        .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
        .from('.image-wrapper', { opacity: 0, scale: 0.9, duration: 1.2 }, '-=1');

  // Reveal stats section
  gsap.from('.stats-container > div', {
    scrollTrigger: {
      trigger: '.stats-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    stagger: 0.25,
    duration: 1,
    ease: 'power3.out'
  });

  // Reveal services cards
  gsap.from('.service-card', {
    scrollTrigger: {
      trigger: '.services-section',
      start: 'top 75%'
    },
    opacity: 0,
    y: 60,
    stagger: 0.15,
    duration: 1,
    ease: 'power4.out'
  });

  // Reveal portfolio items
  gsap.from('.portfolio-header', {
    scrollTrigger: {
      trigger: '.portfolio-section',
      start: 'top 80%'
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.portfolio-item-card', {
    scrollTrigger: {
      trigger: '.portfolio-grid',
      start: 'top 75%'
    },
    opacity: 0,
    y: 60,
    stagger: 0.2,
    duration: 1.2,
    ease: 'power3.out'
  });

  // Reveal skills
  gsap.from('.skills-category-block', {
    scrollTrigger: {
      trigger: '.skills-section',
      start: 'top 80%'
    },
    opacity: 0,
    y: 40,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out'
  });

  // Reveal timeline items
  gsap.from('.experience-info-side', {
    scrollTrigger: {
      trigger: '.experience-section',
      start: 'top 80%'
    },
    opacity: 0,
    x: -30,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.timeline-item', {
    scrollTrigger: {
      trigger: '.timeline-side',
      start: 'top 80%'
    },
    opacity: 0,
    x: 50,
    duration: 1,
    ease: 'power3.out'
  });

  // Reveal testimonial quote
  gsap.from('.quote-container', {
    scrollTrigger: {
      trigger: '.quote-section',
      start: 'top 80%'
    },
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: 'power3.out'
  });

  // Reveal contact details and form
  gsap.from('.contact-details-panel', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 80%'
    },
    opacity: 0,
    x: -40,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.contact-form-panel', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 75%'
    },
    opacity: 0,
    x: 40,
    duration: 1,
    ease: 'power3.out'
  });
};

// ==========================================
// INITIALIZE PAGE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initThreeScene();
  initCardTilts();
  initScrollAnimations();
});
