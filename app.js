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

// Global state
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

// ============================================
// PAGE-WIDE 3D BACKGROUND
// Custom Three.js particle field pinned to the viewport. Sits behind
// every section (z-index 0). Built in-house rather than loading a
// .splinecode file because the exported Spline scene's text mesh
// was rendering as raw geometry strokes (its Urbanist font wasn't
// loading through the runtime) and its particles were too dim to
// register — the result looked like static, not design. This is the
// same idea — ambient 3D depth behind the content — done with full
// control over geometry, color, and performance.
//
// Three.js is loaded once at startup as an ES module from jsdelivr.
// If the import fails (offline, CSP, version drift) the page falls
// back to the flat dark background silently.
const THREE_MODULE_URL =
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Site accent colors, sampled from styles.css CSS variables. The
// field is mostly bone-white so it doesn't fight the content, with
// occasional lime + cyan particles for visual life.
const PARTICLE_COLORS = {
    bone:  [0.96, 0.96, 0.93],
    lime:  [0.83, 1.00, 0.23],   // --lime #D4FF3A
    cyan:  [0.02, 0.71, 0.83],   // --cyan #06B6D4
};

class Background3D {
    constructor() {
        this.container = document.getElementById('heroScene');
        this.canvas = document.getElementById('heroSceneCanvas');
        if (!this.container || !this.canvas) return;

        // Smoothed mouse position (normalized -1..+1). Drives the
        // camera offset for the parallax effect.
        this.target = { x: 0, y: 0 };
        this.current = { x: 0, y: 0 };
        // Pause the rAF loop when the tab is hidden — there's no point
        // burning GPU cycles for a background the user can't see.
        this.paused = document.hidden;
        document.addEventListener('visibilitychange', () => {
            this.paused = document.hidden;
        });

        this.init();
    }

    async init() {
        try {
            const THREE = await import(THREE_MODULE_URL);
            this.THREE = THREE;
            this.setup();
            // Expose for DevTools poking
            window.__bg3d = this;
            this.container.classList.add('is-ready');
            window.addEventListener('resize', () => this.handleResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.animate();
        } catch (err) {
            // Network failure, CSP, version gone — page is fine, the
            // background is just empty. The canvas stays in the DOM
            // at opacity 0.
            console.warn('Background3D failed to load:', err);
        }
    }

    onMouseMove(e) {
        this.target.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.target.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }

    setup() {
        const THREE = this.THREE;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w < 768;
        // DPR clamp: full pixel ratio on retina is 2-3x the fragment work
        // for almost no visible benefit on a soft particle field. Cap at
        // 1.5 on desktop, 1 on mobile.
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

        // Renderer — transparent so the body background shows through.
        // antialias: false because the particles are circular gradients
        // (no edges to alias) and AA costs frame time.
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(dpr);
        // Third arg false = don't touch the canvas's CSS size. The
        // stylesheet already sets it to 100vw/100vh.
        this.renderer.setSize(w, h, false);
        this.renderer.setClearColor(0x000000, 0);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 3000);
        this.camera.position.z = 500;

        this.buildParticles(isMobile);
        this.buildAccentOrbs(isMobile);

        this.clock = new THREE.Clock();
    }

    buildParticles(isMobile) {
        const THREE = this.THREE;
        // 800 on phones, 1800 on desktop. The whole field is one Points
        // object = one draw call, so the GPU cost is mostly fragment
        // shader work, which is cheap for a disc.
        const count = isMobile ? 800 : 1800;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute in a box that covers the viewport at the
            // camera's z=500. Width/height match the visible area with
            // margin; depth is varied for parallax.
            positions[i * 3 + 0] = (Math.random() - 0.5) * 1400;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 900;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 900;

            // Color mix: 78% bone (background filler), 11% lime, 11% cyan
            // (accent sparks). Brightness randomized so particles don't
            // all look identical.
            const r = Math.random();
            const palette = r < 0.78 ? PARTICLE_COLORS.bone
                         : r < 0.895 ? PARTICLE_COLORS.lime
                         : PARTICLE_COLORS.cyan;
            const brightness = 0.4 + Math.random() * 0.6;
            colors[i * 3 + 0] = palette[0] * brightness;
            colors[i * 3 + 1] = palette[1] * brightness;
            colors[i * 3 + 2] = palette[2] * brightness;

            // Size distribution: 70% "small" background dots (1.0-2.2),
            // 30% larger foreground dots (2.5-4.5). The mix gives
            // depth — most particles read as fine grain, a few pop.
            sizes[i] = Math.random() < 0.7
                ? 1.0 + Math.random() * 1.2
                : 2.5 + Math.random() * 2.0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader: each particle is a soft circular gradient that
        // fades by distance from the camera. The vertex shader handles
        // per-particle drift, the fragment shader handles the disc shape.
        const vertexShader = /* glsl */ `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            void main() {
                vec3 pos = position;
                // Slow vertical drift, phase-offset by x so the field
                // doesn't move as one block.
                pos.y += sin(uTime * 0.4 + position.x * 0.01) * 8.0;
                pos.x += cos(uTime * 0.3 + position.y * 0.008) * 6.0;

                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                // Perspective scaling: closer = larger. Constant tuned so
                // a size=1 particle near the focal plane reads ~2-3px on
                // screen. The previous 220 was way too small — the field
                // looked like dust.
                gl_PointSize = size * (1200.0 / -mv.z);
                gl_Position = projectionMatrix * mv;

                // Fade with distance so far particles don't crowd the
                // view, and very near particles don't become huge blobs.
                vAlpha = clamp(1.0 - (-mv.z - 150.0) / 1200.0, 0.0, 1.0);
                vColor = color;
            }
        `;
        const fragmentShader = /* glsl */ `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                // Circular point sprite: distance from center, smooth
                // falloff to zero at the disc edge.
                vec2 c = gl_PointCoord - vec2(0.5);
                float d = length(c);
                if (d > 0.5) discard;
                // Brighter core, soft edge falloff. Max alpha 0.95 so
                // the brightest particles are nearly opaque — the
                // field reads as solid specks, not ghosts.
                float a = pow(smoothstep(0.5, 0.0, d), 1.5) * 0.95 * vAlpha;
                gl_FragColor = vec4(vColor, a);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            // NormalBlending (not Additive) so overlapping particles don't
            // blow out to white. Additive would look "energy field"-y but
            // competes with the page text.
            blending: THREE.NormalBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    buildAccentOrbs(isMobile) {
        const THREE = this.THREE;
        // A handful of larger glowing dots that drift slowly. These give
        // the eye anchor points in the field so the page doesn't look
        // like static. Each orb is a small sphere + a soft sprite for
        // a glow halo, both controlled together.
        const orbCount = isMobile ? 3 : 6;
        const orbs = [];
        for (let i = 0; i < orbCount; i++) {
            const isLime = i % 2 === 0;
            const color = isLime ? 0xD4FF3A : 0x06B6D4;
            // Core sphere — small, bright
            const coreGeo = new THREE.SphereGeometry(2.5, 16, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.85,
            });
            const core = new THREE.Mesh(coreGeo, coreMat);

            // Halo — a larger transparent sphere around the core that
            // reads as a soft glow. Cheap because it's just one extra
            // sphere with low opacity.
            const haloGeo = new THREE.SphereGeometry(7, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.18,
                depthWrite: false,
            });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.add(core);

            halo.position.set(
                (Math.random() - 0.5) * 1100,
                (Math.random() - 0.5) * 500,
                (Math.random() - 0.5) * 500,
            );
            halo.userData.driftX = (Math.random() - 0.5) * 0.4;
            halo.userData.driftY = (Math.random() - 0.5) * 0.3;
            halo.userData.phase = Math.random() * Math.PI * 2;
            halo.userData.baseY = halo.position.y;
            this.scene.add(halo);
            orbs.push(halo);
        }
        this.orbs = orbs;
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
    }

    animate() {
        // rAF runs every frame regardless of pause, so the resume is
        // instant when the tab becomes visible again. The actual work
        // is gated on `this.paused`.
        requestAnimationFrame(() => this.animate());
        if (this.paused) return;
        if (!this.renderer) return;

        const t = this.clock.getElapsedTime();

        // Critically-damped mouse follow. 0.05 is the lerp factor — lower
        // = snappier, higher = more sluggish. 0.05 reads as "responsive
        // but smooth."
        this.current.x += (this.target.x - this.current.x) * 0.05;
        this.current.y += (this.target.y - this.current.y) * 0.05;

        // Camera offset. Range: ±40 horizontal, ±25 vertical. Big enough
        // to feel, small enough to never make the field look unmoored.
        this.camera.position.x = this.current.x * 40;
        this.camera.position.y = this.current.y * 25;
        this.camera.lookAt(0, 0, 0);

        // Whole-field rotation: glacial, so it never looks like a
        // screensaver.
        this.particles.rotation.y += 0.00012;
        this.particles.rotation.x += 0.00004;

        // Drift the orbs vertically with a slow sine wave. Each orb's
        // phase is different so they don't all bob in lockstep.
        for (const orb of this.orbs) {
            orb.position.y = orb.userData.baseY
                + Math.sin(t * 0.25 + orb.userData.phase) * 30;
            orb.position.x += orb.userData.driftX;
            orb.position.y += orb.userData.driftY;
            // Wrap horizontally so the orbs never drift off forever.
            if (orb.position.x > 800) orb.position.x = -800;
            if (orb.position.x < -800) orb.position.x = 800;
        }

        this.particles.material.uniforms.uTime.value = t;
        this.renderer.render(this.scene, this.camera);
    }
}

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
        this.setupScrollAnimations();
        this.setupSkillBars();
        this.setupStatCounters();
        this.setupNavToggle();
    }

    // ============================================
    // LOADER + REST BELOW
    // ============================================
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
    new Animations();
    new Background3D();

    // Decode obfuscated contact email (must run before users
    // can click it — placed last so all other inits happen first).
    revealContactEmail();

    console.log('🚀 Creative Portfolio Loaded!');
});
