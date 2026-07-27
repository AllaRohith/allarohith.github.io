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
        document.querySelectorAll('a, button, .work-card, .skill-item, .hero-image').forEach(el => {
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
        // The remaining setup runs once the loader's done — see setupLoader().
        // It registers everything except the hero reveal, which only fires
        // after the loader fades (10s + 700ms exit).
        this.setupScrollAnimations();
        this.setupSkillBars();
        this.setupStatCounters();
        this.setupNavToggle();
    }

    // ============================================
    // PAGE LOADER — multilingual "Hello" rotator.
    // Cycles 20 greetings × 500ms each = 10s, then
    // fades the loader out and reveals the hero.
    // Colors are picked to harmonize with the cream
    // paper backdrop (no saturated neons).
    // ============================================
    setupLoader() {
        const loader = document.getElementById('pageLoader');
        const wordWrap = document.querySelector('.loader-word-wrap');
        const wordEl   = document.getElementById('loaderWord');
        const langEl   = document.getElementById('loaderLang');
        const countEl  = document.getElementById('loaderCount');
        const totalEl  = document.getElementById('loaderTotal');

        if (!loader || !wordEl || !langEl || !countEl || !totalEl) {
            // Bail out gracefully if the markup isn't there — just reveal.
            this.triggerHeroAnimations();
            return;
        }

        // Each entry: { text, lang, langCode, font, color, dir }.
        // font uses Google Fonts family names (loaded by the
        // <link> in <head>). dir is "rtl" for Arabic/Hebrew.
        const GREETINGS = [
            { text: 'Hello',      lang: 'English',         langCode: 'en', font: "'Syne', sans-serif",                         color: 'var(--coral)' },
            { text: 'Hola',       lang: 'Spanish',         langCode: 'es', font: "'Syne', sans-serif",                         color: 'var(--coral-dark)' },
            { text: 'Bonjour',    lang: 'French',          langCode: 'fr', font: "'Cormorant Garamond', serif",                color: 'var(--lavender-dark)' },
            { text: 'Hallo',      lang: 'German',          langCode: 'de', font: "'Syne', sans-serif",                         color: 'var(--blue-dark)' },
            { text: 'Ciao',       lang: 'Italian',         langCode: 'it', font: "'Italianno', cursive",                        color: 'var(--coral-dark)' },
            { text: 'こんにちは',  lang: 'Japanese',        langCode: 'ja', font: "'Noto Sans JP', sans-serif",                  color: 'var(--coral)' },
            { text: '你好',        lang: 'Chinese (Simp.)', langCode: 'zh', font: "'Noto Sans SC', sans-serif",                  color: 'var(--green-dark)' },
            { text: '안녕하세요',   lang: 'Korean',          langCode: 'ko', font: "'Noto Sans KR', sans-serif",                  color: 'var(--blue-dark)' },
            { text: 'مرحبا',       lang: 'Arabic',          langCode: 'ar', font: "'Noto Sans Arabic', sans-serif",             color: 'var(--green-dark)', dir: 'rtl' },
            { text: 'שלום',        lang: 'Hebrew',          langCode: 'he', font: "'Noto Sans Hebrew', sans-serif",             color: 'var(--rose-dark)',   dir: 'rtl' },
            { text: 'Привет',     lang: 'Russian',         langCode: 'ru', font: "'Syne', sans-serif",                         color: 'var(--mint-dark)' },
            { text: 'Γειά σου',  lang: 'Greek',           langCode: 'el', font: "'Syne', sans-serif",                         color: 'var(--blue-dark)' },
            { text: 'नमस्ते',      lang: 'Hindi',           langCode: 'hi', font: "'Noto Sans Devanagari', sans-serif",         color: 'var(--coral-dark)' },
            { text: 'নমস্কার',     lang: 'Bengali',         langCode: 'bn', font: "'Noto Sans Bengali', sans-serif",            color: 'var(--green-dark)' },
            { text: 'வணக்கம்',    lang: 'Tamil',           langCode: 'ta', font: "'Noto Sans Tamil', sans-serif",              color: 'var(--lavender-dark)' },
            { text: 'ನಮಸ್ಕಾರ',    lang: 'Kannada',         langCode: 'kn', font: "'Noto Sans Kannada', sans-serif",            color: 'var(--coral)' },
            { text: 'നമസ്കാരം',  lang: 'Malayalam',       langCode: 'ml', font: "'Noto Sans Malayalam', sans-serif",          color: 'var(--mint-dark)' },
            { text: 'สวัสดี',     lang: 'Thai',            langCode: 'th', font: "'Noto Sans Thai', sans-serif",               color: 'var(--yellow-dark)' },
            { text: 'Xin chào',  lang: 'Vietnamese',      langCode: 'vi', font: "'Be Vietnam Pro', sans-serif",               color: 'var(--rose-dark)' },
            { text: 'Merhaba',    lang: 'Turkish',         langCode: 'tr', font: "'Syne', sans-serif",                         color: 'var(--coral-dark)' },
        ];

        const total = GREETINGS.length;
        // Whiplash cycle: 75ms visible + 30ms fade = ~105ms/word.
        // 20 × 105 ≈ 2.1s of greetings, plus ~0.4s flourish + exit ≈ 2.5s total.
        const PER_WORD_MS = 75;
        const FADE_MS = 30;
        const FINAL_HOLD_MS = 120;

        totalEl.textContent = String(total).padStart(2, '0');

        // Four flying-in directions that cycle through the 20 words.
        // Each word enters from one side and exits the opposite side,
        // so the rapid sequence reads as a kinetic sweep through the
        // viewport instead of a static fade.
        const DIRECTIONS = [
            { enterX: -90, enterY: 0,   enterRot: -4, exitX: 90,  exitY: 0,   exitRot: 4  }, // left  → right
            { enterX:  90, enterY: 0,   enterRot:  4, exitX: -90, exitY: 0,   exitRot: -4 }, // right → left
            { enterX:  0,  enterY: -60, enterRot:  3, exitX: 0,   exitY: 60,  exitRot: -3 }, // top   → bottom
            { enterX:  0,  enterY:  60, enterRot: -3, exitX: 0,   exitY: -60, exitRot: 3  }, // bot   → top
        ];

        // Show one greeting — set text, font, color, dir, language label,
        // counter, AND the per-word entry/exit direction.
        let index = 0;
        const show = (g, i) => {
            wordEl.textContent = g.text;
            wordEl.style.fontFamily = g.font;
            wordEl.style.color = g.color;
            wordEl.setAttribute('lang', g.langCode);
            wordEl.setAttribute('dir', g.dir || 'ltr');
            langEl.textContent = g.lang;
            countEl.textContent = String(i + 1).padStart(2, '0');

            // Pick a direction. RTL scripts (Arabic, Hebrew) always
            // enter from the right — reads as more "natural" for
            // right-to-left text. Otherwise cycle through the 4
            // directions so consecutive words come from different
            // sides (avoids monotonous left-right-left-right).
            let dirIdx;
            if (g.dir === 'rtl') {
                dirIdx = 1; // right
            } else {
                dirIdx = i % 4;
            }
            const d = DIRECTIONS[dirIdx];
            wordWrap.style.setProperty('--enter-x',     d.enterX + 'px');
            wordWrap.style.setProperty('--enter-y',     d.enterY + 'px');
            wordWrap.style.setProperty('--enter-rot',   d.enterRot + 'deg');
            wordWrap.style.setProperty('--exit-x',      d.exitX + 'px');
            wordWrap.style.setProperty('--exit-y',      d.exitY + 'px');
            wordWrap.style.setProperty('--exit-rot',    d.exitRot + 'deg');

            // Force a reflow so re-adding the same .in class
            // re-triggers the transition (browsers coalesce
            // identical class sequences).
            wordWrap.classList.remove('in', 'out', 'final');
            // eslint-disable-next-line no-unused-expressions
            wordWrap.offsetWidth;
            wordWrap.classList.add('in');
        };

        // After PER_WORD_MS, fade out and queue the next greeting.
        const advance = () => {
            wordWrap.classList.remove('in');
            wordWrap.classList.add('out');
            index += 1;
            if (index >= total) {
                // Show a final flourish in English — gives the
                // loader a satisfying punctuation mark.
                setTimeout(() => {
                    wordEl.textContent = 'Hello';
                    wordEl.style.fontFamily = "'Syne', sans-serif";
                    wordEl.style.color = 'var(--coral)';
                    wordEl.setAttribute('lang', 'en');
                    wordEl.setAttribute('dir', 'ltr');
                    langEl.textContent = 'Welcome';
                    countEl.textContent = '00';
                    wordWrap.classList.remove('out', 'final');
                    // eslint-disable-next-line no-unused-expressions
                    wordWrap.offsetWidth;
                    wordWrap.classList.add('in', 'final');

                    setTimeout(() => this.exitLoader(), FINAL_HOLD_MS);
                }, FADE_MS);
                return;
            }
            setTimeout(() => {
                show(GREETINGS[index], index);
                setTimeout(advance, PER_WORD_MS);
            }, FADE_MS);
        };

        // Kickoff — show greeting 0, then schedule advance after PER_WORD_MS.
        show(GREETINGS[0], 0);
        setTimeout(advance, PER_WORD_MS);

        // Reduced motion: skip the whole cycle. Show the final
        // word for a beat, then exit.
        if (reducedMotion) {
            // Skip ahead to the final flourish immediately.
            for (let i = 0; i < total; i++) advance();
            return;
        }
    }

    exitLoader() {
        const loader = document.getElementById('pageLoader');
        if (!loader) {
            this.triggerHeroAnimations();
            return;
        }

        // Kick off the loader exit. CSS handles the per-child unravel
        // (paper-bg, word, eyebrow, meta, progress, confetti — all on
        // their own timelines, see styles.css).
        loader.classList.add('exiting');

        // 120ms into the loader exit, add .hero-ready so the hero
        // cascade (eyebrow → portrait → name → content → confetti)
        // BEGINS while the loader is still unraveling. The hero
        // eyebrow slides DOWN at the same time the loader eyebrow
        // slides UP — they share the same vertical position so it
        // reads as a seamless handoff rather than two separate scenes.
        setTimeout(() => this.triggerHeroAnimations(), 120);

        // After the 700ms exit completes, take the loader out of the
        // DOM. Hero reveal continues independently for another ~900ms.
        setTimeout(() => {
            loader.style.display = 'none';
        }, 740);
    }

    // ============================================
    // HERO REVEAL — flips body.hero-ready, which triggers a
    // CSS-only staggered cascade. The previous GSAP version was
    // replaced so the handoff timing matches the loader exit
    // exactly (see styles.css .hero-ready rules).
    // ============================================
    triggerHeroAnimations() {
        document.body.classList.add('hero-ready');
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
// HERO PORTRAIT — cursor-driven 3D tilt
// Subtle, rAF-throttled (one transform per frame
// regardless of mousemove rate). Mouse position is
// normalized to [-0.5, 0.5] so the tilt range is
// stable regardless of image size.
// ============================================

const heroPortrait = document.querySelector('.hero-image');
if (heroPortrait) {
    let heroRaf = 0;
    heroPortrait.addEventListener('mousemove', (e) => {
        if (heroRaf) return;
        heroRaf = requestAnimationFrame(() => {
            heroRaf = 0;
            const rect = heroPortrait.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            // Cap tilt at ±8° so it stays subtle on huge portraits.
            gsap.to(heroPortrait, {
                rotateY: x * 8,
                rotateX: -y * 8,
                transformPerspective: 1200,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });

    heroPortrait.addEventListener('mouseleave', () => {
        gsap.to(heroPortrait, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
        });
    });
}


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
// LOCAL CLOCK
// Writes the current IST time into the status bar's
// #localTime element every minute. The element was
// previously hard-coded to "--:--:--" — louder than
// any visual effect on a portfolio whose entire pitch
// is craft.
// ============================================
function tickLocalClock() {
    const el = document.getElementById('localTime');
    if (!el) return;
    const fmt = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
    });
    const update = () => { el.textContent = fmt.format(new Date()); };
    update();
    // Align the first tick to the next minute boundary, then tick
    // every 60s. Cheaper than polling every second and keeps the
    // displayed value stable between updates.
    const ms = (60 - new Date().getSeconds()) * 1000;
    setTimeout(() => { update(); setInterval(update, 60_000); }, ms);
}

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

    // Decode obfuscated contact email (must run before users
    // can click it — placed last so all other inits happen first).
    revealContactEmail();

    // Tick the local clock on the status bar.
    tickLocalClock();

    console.log('🚀 Creative Portfolio Loaded!');
});
