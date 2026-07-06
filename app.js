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
// SPLINE SCENE — interactive 3D background in the hero.
// The Spline runtime is an ES module on jsdelivr, so we dynamic-
// import it the first time SplineScene runs. If the import fails
// (offline, CSP block, bad version) we log a warning and leave
// the hero as a flat portrait — no broken state.
const SPLINE_RUNTIME_URL =
    'https://cdn.jsdelivr.net/npm/@splinetool/runtime@1.12.98/build/runtime.js';

class SplineScene {
    constructor() {
        this.container = document.getElementById('heroScene');
        this.canvas = document.getElementById('heroSceneCanvas');
        if (!this.container || !this.canvas) return;
        this.init();
    }

    async init() {
        try {
            const { Application } = await import(SPLINE_RUNTIME_URL);
            this.app = new Application(this.canvas);
            // Expose for debugging in DevTools
            window.__splineApp = this.app;
            await this.app.load('/assets/scenes/scene.splinecode');

            // The exported .splinecode from the user has its camera parked
            // ~1000 units away from the content (camera pos ~(1058, 113, 80),
            // content at ~(1.68, -199, 183)). The scene "loads" but renders
            // as a few pixels. Pull the camera in close enough that the Text
            // mesh + Particles fill the hero.
            this.frameScene();

            this.container.classList.add('is-ready');
            this.handleResize();
            window.addEventListener('resize', () => this.handleResize());
        } catch (err) {
            // Runtime fetch failed, scene file missing, parse error — fall back
            // to the flat hero. Canvas stays in the DOM but at opacity 0.
            console.warn('Spline scene failed to load:', err);
        }
    }

    frameScene() {
        // The Spline runtime doesn't expose THREE on the app/window, so we
        // can't import { Box3, Vector3 }. We work with raw numbers + the
        // Three.js Vector3-like on the camera.
        const camera = this.app._camera;
        const root = this.app._scene;
        if (!camera || !root) return;

        // Content lives around (1.68, -199, 183). Center the camera on it
        // and use the camera's `zoom` property to scale everything up
        // (zoom multiplies the projection matrix, so it's the reliable
        // way to make a small scene appear larger — modifying the scene's
        // scale didn't propagate to descendant world matrices in this
        // runtime version).
        const FOCAL_X = 1.68;
        const FOCAL_Y = -199.27;
        const FOCAL_Z = 183.69;

        camera.position.set(FOCAL_X, FOCAL_Y, FOCAL_Z + 220);
        if (typeof camera.lookAt === 'function') camera.lookAt(FOCAL_X, FOCAL_Y, FOCAL_Z);
        // zoom > 1 magnifies; 5x makes the small scene content fill the
        // page around the portrait. updateProjectionMatrix is required
        // after changing zoom.
        camera.zoom = 5;
        if (camera.updateProjectionMatrix) camera.updateProjectionMatrix();

        console.log(`[Spline] framed at focal (${FOCAL_X},${FOCAL_Y},${FOCAL_Z}), zoom=5`);
    }

    handleResize() {
        // Spline runtime sizes its canvas via the WebGL viewport. We pass
        // the viewport size so the scene fills the full window.
        if (this.app) {
            this.app.setSize(window.innerWidth, window.innerHeight);
        }
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
    new SplineScene();

    // Decode obfuscated contact email (must run before users
    // can click it — placed last so all other inits happen first).
    revealContactEmail();

    console.log('🚀 Creative Portfolio Loaded!');
});
