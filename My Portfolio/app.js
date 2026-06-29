/* ========================================
   ROHITH PORTFOLIO - APP.JS
   Three.js 3D Background + GSAP Animations
======================================== */

// ============================================
// THREE.JS - 3D BACKGROUND
// ============================================

class Background3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0f0f0f, 5, 20);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 8;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('webgl'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0f0f0f, 1);

        // Create objects
        this.createParticles();
        this.createFloatingShapes();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 1500;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color1 = new THREE.Color(0x6366f1); // Primary
        const color2 = new THREE.Color(0x0ea5e9); // Secondary

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Position
            positions[i3] = (Math.random() - 0.5) * 25;
            positions[i3 + 1] = (Math.random() - 0.5) * 25;
            positions[i3 + 2] = (Math.random() - 0.5) * 15;

            // Color gradient
            const mixedColor = color1.clone().lerp(color2, Math.random() * 0.5);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            // Size
            sizes[i] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Material
        const material = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFloatingShapes() {
        const shapes = [];

        // Torus
        const torusGeometry = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(-4, 2, -3);
        this.scene.add(torus);
        shapes.push({ mesh: torus, rotationSpeed: { x: 0.001, y: 0.002, z: 0 } });

        // Icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(1, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const ico = new THREE.Mesh(icoGeometry, icoMaterial);
        ico.position.set(5, -2, -4);
        this.scene.add(ico);
        shapes.push({ mesh: ico, rotationSpeed: { x: 0.002, y: 0.001, z: 0.001 } });

        // Octahedron
        const octGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const octMaterial = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const oct = new THREE.Mesh(octGeometry, octMaterial);
        oct.position.set(-3, -3, -2);
        this.scene.add(oct);
        shapes.push({ mesh: oct, rotationSpeed: { x: 0.0015, y: 0.001, z: 0.002 } });

        // More shapes for depth
        const ringGeometry = new THREE.TorusGeometry(2, 0.01, 8, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(3, 3, -5);
        this.scene.add(ring);
        shapes.push({ mesh: ring, rotationSpeed: { x: 0, y: 0.003, z: 0.001 } });

        this.shapes = shapes;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.02;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.02;

        // Rotate particles based on mouse
        if (this.particles) {
            this.particles.rotation.x += 0.0003;
            this.particles.rotation.y += 0.0005;

            // Mouse parallax on particles
            this.particles.rotation.x += this.mouse.y * 0.0005;
            this.particles.rotation.y += this.mouse.x * 0.0005;
        }

        // Rotate floating shapes
        if (this.shapes) {
            this.shapes.forEach(({ mesh, rotationSpeed }) => {
                mesh.rotation.x += rotationSpeed.x;
                mesh.rotation.y += rotationSpeed.y;
                mesh.rotation.z += rotationSpeed.z;
            });
        }

        // Camera subtle movement
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}


// ============================================
// GSAP - SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
    constructor() {
        gsap.registerPlugin(ScrollTrigger);
        this.init();
    }

    init() {
        this.setupRevealAnimations();
        this.setupParallax();
        this.setupNavScroll();
        this.setupLoader();
    }

    setupLoader() {
        const loader = document.getElementById('loader');

        // Hide loader after page load
        window.addEventListener('load', () => {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.6,
                delay: 0.5,
                onComplete: () => {
                    loader.classList.add('hidden');
                    // Trigger initial animations
                    this.triggerInitialAnimations();
                }
            });
        });
    }

    triggerInitialAnimations() {
        gsap.to('.hero-tag', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.to('.hero-title .title-line:nth-child(1)', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.2,
            ease: 'power3.out'
        });

        gsap.to('.hero-title .title-line:nth-child(2)', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.4,
            ease: 'power3.out'
        });

        gsap.to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.6,
            ease: 'power3.out'
        });

        gsap.to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.8,
            ease: 'power3.out'
        });
    }

    setupRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');

        reveals.forEach((el, i) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: (i % 3) * 0.1,
                ease: 'power3.out'
            });
        });

        // Hero elements initial state
        gsap.set('.hero-tag', { opacity: 0, y: 30 });
        gsap.set('.hero-title .title-line', { opacity: 0, y: 50 });
        gsap.set('.hero-subtitle', { opacity: 0, y: 30 });
        gsap.set('.hero-cta', { opacity: 0, y: 30 });
    }

    setupParallax() {
        // Hero parallax
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 150,
            opacity: 0.5
        });

        // Hero scroll indicator fade
        gsap.to('.hero-scroll', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '20% top',
                scrub: 1
            },
            opacity: 0
        });

        // Section headers parallax
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.to(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                },
                y: -50,
                opacity: 0.2
            });
        });
    }

    setupNavScroll() {
        const nav = document.getElementById('nav');

        ScrollTrigger.create({
            start: 'top -80',
            end: 99999,
            toggleClass: {
                className: 'scrolled',
                targets: nav
            }
        });

        // Smooth scroll for nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: target,
                        ease: 'power3.inOut'
                    });
                }
            });
        });

        // Hero CTA buttons smooth scroll
        document.querySelectorAll('.hero-cta a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: target,
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }
}


// ============================================
// MOUSE FOLLOWER (Optional Effect)
// ============================================

class MouseFollower {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.pos = { x: 0, y: 0 };
        this.targetPos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid #6366f1;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease-out, opacity 0.15s ease;
            mix-blend-mode: difference;
        `;
        document.body.appendChild(this.cursor);

        document.addEventListener('mousemove', (e) => {
            this.targetPos.x = e.clientX;
            this.targetPos.y = e.clientY;
        });

        this.animate();
    }

    animate() {
        this.pos.x += (this.targetPos.x - this.pos.x) * 0.15;
        this.pos.y += (this.targetPos.y - this.pos.y) * 0.15;

        this.cursor.style.left = this.pos.x - 10 + 'px';
        this.cursor.style.top = this.pos.y - 10 + 'px';

        requestAnimationFrame(() => this.animate());
    }
}


// ============================================
// SMOOTH SCROLL TO (Polyfill for GSAP)
// ============================================

if (!gsap.plugins.scrollTo) {
    gsap.scrollTo = function(target, vars) {
        if (typeof target === 'number') {
            window.scrollTo(0, target);
        } else {
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
}


// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js Background
    new Background3D();

    // Initialize Scroll Animations
    new ScrollAnimations();

    // Initialize Mouse Follower (subtle effect)
    // new MouseFollower(); // Uncomment for custom cursor

    console.log('🚀 Portfolio loaded successfully!');
});
