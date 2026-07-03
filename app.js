/* ========================================
   ROHITH PORTFOLIO - ADVANCED APP.JS
   Creative Effects • Particles • Animations
======================================== */

// ============================================
// DEVICE + VIEWPORT HELPERS (responsive-safe)
// ============================================
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Touch detection — only true for actual touch-first devices (no fine pointer).
// Checking maxTouchPoints alone is unreliable (touch-screen laptops report it too).
const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
                      && window.matchMedia('(pointer: coarse)').matches;
// isMobile as a getter — stays accurate across resize / device-rotate.
const isMobile = () => window.innerWidth < 768;
// visualViewport avoids iOS Safari's classic 100vh bug (address-bar collapse).
const viewportH = () => (window.visualViewport && window.visualViewport.height)
    ? window.visualViewport.height : window.innerHeight;
const viewportW = () => window.innerWidth;
// rAF throttle — at most one execution per frame, no matter how many events fire.
const rafThrottle = (fn) => {
    let queued = false;
    return function(...args) {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fn.apply(this, args);
        });
    };
};

// ============================================
// TEXT → LETTER SPANS
// Walks every text node inside `el`, wraps each non-whitespace
// character in a <span class="title-letter">, and returns them.
// Preserves existing HTML structure (so <span class="accent">
// stays intact and inherits its background-clip color).
// ============================================
function splitTitleToLetters(el) {
    const letters = [];
    // Collect all text nodes (skip elements like <br>).
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            // Keep spaces, newlines, and tabs as plain text — they
            // handle word wrapping naturally. Only letters/digits get wrapped.
            if (ch === ' ' || ch === '\n' || ch === '\t') {
                frag.appendChild(document.createTextNode(ch));
            } else {
                const span = document.createElement('span');
                span.className = 'title-letter';
                span.textContent = ch;
                frag.appendChild(span);
                letters.push(span);
            }
        }
        textNode.parentNode.replaceChild(frag, textNode);
    });

    return letters;
}

// Global state
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

// ============================================
// CURSOR
// ============================================

class Cursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.follower = document.getElementById('cursorFollower');
        this.pos = { x: 0, y: 0 };
        this.targetPos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        if (!this.cursor || !this.follower) return;

        document.addEventListener('mousemove', (e) => {
            this.targetPos.x = e.clientX;
            this.targetPos.y = e.clientY;
        });

        // Add cursor:active on interactive elements
        document.querySelectorAll('a, button, .work-card, .skill-item').forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('active'));
        });

        this.animate();
    }

    animate() {
        this.pos.x += (this.targetPos.x - this.pos.x) * 0.2;
        this.pos.y += (this.targetPos.y - this.pos.y) * 0.2;

        this.cursor.style.left = this.pos.x - 10 + 'px';
        this.cursor.style.top = this.pos.y - 10 + 'px';

        followerX += (this.pos.x - followerX) * 0.1;
        followerY += (this.pos.y - followerY) * 0.1;

        this.follower.style.left = followerX - 18 + 'px';
        this.follower.style.top = followerY - 18 + 'px';

        requestAnimationFrame(() => this.animate());
    }
}


// ============================================
// CURSOR TRAIL
// Spawns a small colored dot at the cursor on every
// mousemove. Dots fade + shrink over ~550ms creating
// a comet-like trail that matches the page palette.
//
// Skipped on touch devices and when reduced-motion
// is preferred (it's a decorative effect, not content).
// ============================================

class CursorTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 35;       // hard cap to keep DOM small
        this.spawnInterval = 25;      // ms between spawns (≈40 dots/sec)
        this.lastSpawn = 0;
        // Same palette the ParticleSystem uses — keeps the visual language unified.
        this.palette = ['#7C3AED', '#06B6D4', '#D4FF3A', '#A78BFA', '#67E8F9'];

        // Skip on touch devices and reduced-motion users.
        if (isTouchDevice || reducedMotion) return;

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            const now = performance.now();
            // Throttle spawn rate so rapid mouse moves don't flood the DOM.
            if (now - this.lastSpawn < this.spawnInterval) return;
            this.lastSpawn = now;
            this.spawn(e.clientX, e.clientY);
        });

        // Periodic cleanup of expired particles (avoids setTimeout-per-particle).
        setInterval(() => this.cleanup(), 1000);
    }

    spawn(x, y) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail-dot';
        // Random size 2–5px — variety keeps the trail organic.
        const size = 2 + Math.random() * 3;
        const color = this.palette[Math.floor(Math.random() * this.palette.length)];

        // Inline styles for size/position/color — keeps the class itself reusable.
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.background = color;
        // Soft glow halo — uses the dot's own color.
        dot.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        document.body.appendChild(dot);
        this.particles.push({ el: dot, born: performance.now() });

        // Kick the fade on the next frame so the initial state
        // (opacity 0.85, scale 1) paints before the transition starts.
        requestAnimationFrame(() => {
            dot.style.opacity = '0';
            dot.style.transform = 'translate(-50%, -50%) scale(0.15)';
        });

        // Enforce max-particles cap by removing the oldest.
        while (this.particles.length > this.maxParticles) {
            const old = this.particles.shift();
            old.el.remove();
        }
    }

    cleanup() {
        const now = performance.now();
        const ttl = 650;       // matches the CSS transition duration
        this.particles = this.particles.filter(p => {
            if (now - p.born > ttl) {
                p.el.remove();
                return false;
            }
            return true;
        });
    }
}


// ============================================
// PARTICLE SYSTEM
// ============================================

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        // Particle count scales down for phones: connections-per-frame
        // is O(n²) and tanks battery + janks scroll on low-end devices.
        this.particleCount = isMobile() ? 24 : 80;
        this.mouse = { x: 0, y: 0, radius: 150 };

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.width = viewportW();
        this.height = viewportH();
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createParticles() {
        // Page-matching palette: violet, cyan, lime, plus 2 soft variants
        // for visual variety. Picks one per particle randomly.
        const palette = [
            '#7C3AED',  // violet   — primary accent
            '#06B6D4',  // cyan     — secondary accent
            '#D4FF3A',  // lime     — highlight accent
            '#A78BFA',  // violet-light — softer
            '#67E8F9',  // cyan-light  — softer
        ];

        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                // Middle-ground size — between original 1–3px and previous 2–5px.
                // Now 1.5–4px, each particle picks a random size in this range.
                size: Math.random() * 2.5 + 1.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: palette[Math.floor(Math.random() * palette.length)],
                opacity: Math.random() * 0.5 + 0.3   // slightly more opaque so colors show
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', rafThrottle(() => {
            this.resize();
            this.createParticles();
        }), { passive: true });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.particles.forEach((p, i) => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Mouse interaction
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.mouse.radius) {
                const force = (this.mouse.radius - dist) / this.mouse.radius;
                p.x -= dx * force * 0.02;
                p.y -= dy * force * 0.02;
            }

            // Boundary check
            if (p.x < 0 || p.x > this.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.height) p.speedY *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);

                if (d < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = p.color;
                    this.ctx.globalAlpha = (1 - d / 150) * 0.5;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}


// ============================================
// MAGNETIC FIELD LINES
// ============================================

class FieldLines {
    constructor() {
        this.canvas = document.getElementById('fieldLines');
        if (!this.canvas) return;

        // Field lines are a heavy O(n²)-per-frame canvas effect.
        // On phones they're a battery killer and visually noisy —
        // the static hero particles are enough on small viewports.
        if (isMobile()) {
            this.canvas.style.display = 'none';
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.nodes = [];

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();

        // Fewer nodes on narrow viewports (smoothly scales 3→6 as window widens).
        const nodeCount = Math.max(2, Math.min(6, Math.floor(viewportW() / 320)));
        this.nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: (viewportW() / (nodeCount + 1)) * (i + 1),
                y: viewportH() / 2 + (Math.random() - 0.5) * 200,
                radius: 50 + Math.random() * 50,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    resize() {
        this.width = viewportW();
        this.height = viewportH();
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setupEventListeners() {
        window.addEventListener('resize', rafThrottle(() => this.init()), { passive: true });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.01;

        this.nodes.forEach((node, i) => {
            // Animate node position
            node.y += Math.sin(this.time + node.phase) * 0.3;

            // Draw field lines
            this.ctx.strokeStyle = '#6366f1';
            this.ctx.lineWidth = 0.5;
            this.ctx.globalAlpha = 0.1;

            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                this.ctx.beginPath();

                let x = node.x;
                let y = node.y;

                for (let step = 0; step < 50; step++) {
                    const nextAngle = angle + Math.sin(this.time + step * 0.1) * 0.3;
                    x += Math.cos(nextAngle) * 15;
                    y += Math.sin(nextAngle) * 15;

                    this.ctx.lineTo(x, y);

                    if (x < 0 || x > this.width || y < 0 || y > this.height) break;
                }

                this.ctx.stroke();
            }
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}


// ============================================
// GSAP ANIMATIONS
// ============================================

class Animations {
    constructor() {
        if (typeof gsap === 'undefined') return;

        // Respect users who have set "Reduce Motion" in their OS — skip all
        // scroll-triggered motion. The static layout is still perfectly readable.
        if (reducedMotion) {
            gsap.config({ nullTargetWarn: false });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        this.init();
    }

    init() {
        this.setupLoader();
        this.setupLetterReveal();    // split section titles BEFORE other scroll animations
        this.setupScrollAnimations();
        this.setupSkillBars();
        this.setupStatCounters();
        this.setupNavToggle();
    }

    // ============================================
    // LETTER-BY-LETTER REVEAL ON SCROLL
    // Splits each .section-title into per-character spans,
    // then animates them in with a violet → cyan → lime color cascade.
    // ============================================
    setupLetterReveal() {
        if (typeof gsap === 'undefined' || reducedMotion) return;

        const titles = document.querySelectorAll('.section-title');
        if (!titles.length) return;

        titles.forEach(title => {
            const letters = splitTitleToLetters(title);
            if (!letters.length) return;

            // Cache each letter's computed color BEFORE the animation runs,
            // so the cascade can flash a tint and then settle back to
            // its real color (white for normal, lime/violet for .accent).
            letters.forEach(letter => {
                letter.dataset.naturalColor = window.getComputedStyle(letter).color;
            });

            // Page-matching palette: violet → cyan → lime, repeating.
            // This is the "color cascade" — each letter briefly takes the
            // next palette color as it reveals, then settles back.
            const palette = ['#7C3AED', '#06B6D4', '#D4FF3A'];

            // Hidden + offset down — the start state of the reveal.
            gsap.set(letters, { opacity: 0, y: 30 });

            ScrollTrigger.create({
                trigger: title,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    letters.forEach((letter, i) => {
                        const tint = palette[i % palette.length];
                        const natural = letter.dataset.naturalColor;

                        // Position + opacity reveal — staggered cascade.
                        gsap.to(letter, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            delay: i * 0.022,
                            ease: 'power3.out'
                        });

                        // Color flash: current color → tint → natural color.
                        // Built as a tiny timeline so the tint peaks when
                        // the letter finishes its rise, then fades back.
                        gsap.timeline({ delay: i * 0.022 })
                            .fromTo(letter,
                                { color: natural },
                                { color: tint, duration: 0.25, ease: 'power2.out' }
                            )
                            .to(letter, {
                                color: natural,
                                duration: 0.9,
                                ease: 'power2.out'
                            });
                    });
                }
            });
        });
    }

    setupLoader() {
        const loader = document.getElementById('pageLoader');
        const progress = document.getElementById('loaderProgress');
        if (!loader) return;

        // Simulate loading — paced so users can appreciate the cinematic reveal.
        // Total: ~2.6s fill + 700ms hold = ~3.3s before the dramatic exit.
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10;       // slower fill rate
            if (width >= 100) {
                width = 100;
                clearInterval(interval);

                setTimeout(() => {
                    // Add .leaving so the CSS .page-loader.leaving .loader-content
                    // animation (scale 1 → 2.5, blur 0 → 14px) actually fires —
                    // this is the "Netflix zoom-out" burst.
                    loader.classList.add('leaving');

                    // After the CSS exit animation completes, hide fully + reveal hero.
                    setTimeout(() => {
                        loader.classList.add('hidden');
                        this.triggerHeroAnimations();
                    }, 1000);                  // matches loaderExit duration
                }, 700);                       // hold the filled loader longer
            }
            if (progress) progress.style.width = width + '%';
        }, 180);                               // slower tick rate
    }

    triggerHeroAnimations() {
        // The hero now only contains the .hero-image — animate that as the reveal.
        // All other targets (.hero-badge, .title-line, .hero-desc, .hero-cta,
        // .scroll-indicator) were removed when the hero content was stripped.
        gsap.from('.hero-image', {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out'
        });
    }

    setupScrollAnimations() {
        // Section labels
        gsap.utils.toArray('.section-label').forEach(label => {
            gsap.from(label, {
                scrollTrigger: {
                    trigger: label,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Section titles
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // About image
        gsap.from('.about-visual', {
            scrollTrigger: {
                trigger: '.about-visual',
                start: 'top 80%',
            },
            opacity: 0,
            x: -100,
            duration: 1,
            ease: 'power3.out'
        });

        // About stats
        gsap.from('.stat-item', {
            scrollTrigger: {
                trigger: '.about-stats',
                start: 'top 80%',
            },
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Work cards
        gsap.utils.toArray('.work-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 80,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });

        // Skills categories
        gsap.utils.toArray('.skill-category').forEach((cat, i) => {
            gsap.from(cat, {
                scrollTrigger: {
                    trigger: cat,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power3.out'
            });
        });

        // Contact cards
        gsap.utils.toArray('.contact-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                },
                opacity: 0,
                x: 50,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power3.out'
            });
        });

        // Nav scroll effect
        ScrollTrigger.create({
            start: 'top -80',
            end: 99999,
            onUpdate: (self) => {
                const nav = document.getElementById('nav');
                if (self.direction === 1 && self.progress > 0) {
                    nav.classList.add('scrolled');
                } else if (self.progress === 0) {
                    nav.classList.remove('scrolled');
                }
            }
        });
    }

    setupSkillBars() {
        ScrollTrigger.create({
            trigger: '.skills-grid',
            start: 'top 70%',
            onEnter: () => {
                document.querySelectorAll('.skill-progress').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    gsap.to(bar, {
                        width: width + '%',
                        duration: 1.2,
                        ease: 'power3.out'
                    });
                });
            },
            once: true
        });
    }

    setupStatCounters() {
        const counters = document.querySelectorAll('.stat-value[data-count]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));

            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 1.5,
                        ease: 'power2.out',
                        snap: { innerHTML: 1 },
                        onUpdate: function() {
                            counter.innerHTML = Math.ceil(this.targets()[0].innerHTML) + '+';
                        }
                    });
                },
                once: true
            });
        });
    }

    setupNavToggle() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');

        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu on link click
        menu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }
}


// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Native smooth scroll — no GSAP ScrollToPlugin dependency required.
            // CSS html { scroll-behavior: smooth } handles the easing.
            // offsetY 80 accounts for the fixed nav/status bar at top.
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});


// ============================================
// PARALLAX HOVER ON WORK CARDS
// ============================================

document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    });
});


// ============================================
// MAGNETIC BUTTONS
// ============================================

document.querySelectorAll('.btn, .social-link, .contact-link').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
    });
});


// ============================================
// TILT ON ABOUT IMAGE
// ============================================

const aboutImage = document.querySelector('.image-frame');
if (aboutImage) {
    aboutImage.addEventListener('mousemove', (e) => {
        const rect = aboutImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        gsap.to(aboutImage, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    aboutImage.addEventListener('mouseleave', () => {
        gsap.to(aboutImage, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        });
    });
}


// ============================================
// INIT
// ============================================

// ============================================
// EMAIL OBFUSCATION DECODER
// Decodes the char-code-encoded contact email
// stored in data-uc / data-dc attributes and
// sets both the visible text and the mailto: href.
// Defeats scrapers that look for "user@domain"
// patterns in raw HTML.
// ============================================
function revealContactEmail() {
    const decode = (encoded) => encoded
        .split(',')
        .map(n => String.fromCharCode(parseInt(n, 10)))
        .join('');

    document.querySelectorAll('.contact-email[data-uc]').forEach(link => {
        try {
            const user = decode(link.dataset.uc);
            const domain = decode(link.dataset.dc);
            const email = `${user}@${domain}`;
            link.href = `mailto:${email}`;
            const textEl = link.querySelector('.email-text');
            if (textEl) textEl.textContent = email;
        } catch (e) {
            // Fallback: leave the link inert if decoding fails.
            link.removeAttribute('href');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new Cursor();
    new CursorTrail();
    new ParticleSystem();
    new FieldLines();
    new Animations();

    // Decode obfuscated contact email (must run before users
    // can click it — placed last so all other inits happen first).
    revealContactEmail();

    console.log('🚀 Creative Portfolio Loaded!');
});
