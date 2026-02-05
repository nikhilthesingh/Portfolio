/* ========================================
   NIKHIL KUMAR PORTFOLIO - Main JavaScript
   GSAP Animations & Interactivity
   ======================================== */

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll
let lenis;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function rafThrottle(callback) {
    let rafId = null;
    let lastValue;

    return (value) => {
        lastValue = value;
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
            rafId = null;
            callback(lastValue);
        });
    };
}

function registerScrollHandler(handler) {
    if (window.lenis) {
        window.lenis.on('scroll', ({ scroll }) => handler(scroll));
    } else {
        window.addEventListener('scroll', () => handler(window.scrollY), { passive: true });
    }
}

function initLenis() {
    lenis = new Lenis({
        duration: window.innerWidth < 768 ? 0.8 : 1.4, // Faster scroll on mobile
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.8, // More responsive touch
        infinite: false
    });

    // Connect Lenis to GSAP
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Stop scroll during preloader
    lenis.stop();
    window.lenis = lenis;
}

/* ========================================
   Custom Cursor
   ======================================== */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    // Disable on touch devices or small screens
    if (!cursor || window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 1024) return;

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorGlow = document.querySelector('.cursor-glow');
    const cursorLabel = document.querySelector('.cursor-label');

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let glowX = 0, glowY = 0;
    let lastMouseX = 0, lastMouseY = 0;
    let hoverScale = 1;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // Smooth cursor animation
    function animateCursor() {
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const speed = Math.min(Math.hypot(dx, dy), 60);
        const angle = Math.atan2(dy, dx) || 0;
        const stretch = speed / 60;
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // Dot follows quickly
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';

        // Ring follows with delay
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        const scaleX = (1 + stretch * 0.35) * hoverScale;
        const scaleY = (1 - stretch * 0.15) * hoverScale;
        cursorRing.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(${scaleX}, ${scaleY})`;

        // Glow follows softly
        if (cursorGlow) {
            glowX += (mouseX - glowX) * 0.06;
            glowY += (mouseY - glowY) * 0.06;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }

        if (cursorLabel) {
            cursorLabel.style.left = ringX + 'px';
            cursorLabel.style.top = ringY + 'px';
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .about-card, .about-fact, .achievement-card, .award-card, .cert-card, .achievement-metric, .metric-card, .pillar-card, .play-item, .case-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            hoverScale = 1.35;
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            hoverScale = 1;
        });
    });

    document.addEventListener('mousedown', () => cursor.classList.add('cursor-press'));
    document.addEventListener('mouseup', () => cursor.classList.remove('cursor-press'));

    const labelTargets = document.querySelectorAll('[data-cursor]');
    labelTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!cursorLabel) return;
            cursorLabel.textContent = el.getAttribute('data-cursor') || '';
            cursor.classList.add('cursor-label-active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-label-active');
        });
    });

    const textTargets = document.querySelectorAll('input, textarea');
    textTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-text'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-text'));
    });

    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (event) => {
            const rect = el.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            el.style.setProperty('--magnetic-x', `${x * 0.2}px`);
            el.style.setProperty('--magnetic-y', `${y * 0.2}px`);
        });

        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--magnetic-x', '0px');
            el.style.setProperty('--magnetic-y', '0px');
        });
    });
}

/* ========================================
   Audio Reactive Hero
   ======================================== */
function initAudioReactiveHero() {
    const toggle = document.getElementById('audio-toggle');
    const canvas = document.getElementById('hero-audio');
    const hero = document.querySelector('.hero');
    if (!toggle || !canvas || !hero) return;

    const toggleText = toggle.querySelector('.audio-text');

    const ctx = canvas.getContext('2d');
    let audioCtx;
    let analyser;
    let dataArray;
    let source;
    let stream;
    let running = false;

    const resize = () => {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
    };

    const draw = () => {
        if (!running || !analyser) return;
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);

        const barCount = 60;
        const step = Math.floor(dataArray.length / barCount);
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step] / 255;
            const barHeight = value * height * 0.4;
            const x = i * barWidth;
            const y = height - barHeight - 40;

            ctx.fillStyle = `rgba(255, 77, 0, ${0.15 + value * 0.6})`;
            ctx.fillRect(x, y, barWidth * 0.6, barHeight);
        }
    };

    const stopAudio = () => {
        running = false;
        toggle.classList.remove('active');
        toggle.setAttribute('aria-pressed', 'false');
        if (toggleText) toggleText.textContent = 'Visualizer Off';
        hero.classList.remove('audio-on');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    };

    toggle.addEventListener('click', async () => {
        if (running) {
            stopAudio();
            return;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            resize();
            running = true;
            toggle.classList.add('active');
            toggle.setAttribute('aria-pressed', 'true');
            if (toggleText) toggleText.textContent = 'Visualizer On';
            hero.classList.add('audio-on');
            draw();
        } catch (error) {
            if (toggleText) toggleText.textContent = 'Visualizer Blocked';
            toggle.classList.remove('active');
            toggle.setAttribute('aria-pressed', 'false');
        }
    });

    window.addEventListener('resize', resize);
    resize();
}

/* ========================================
   Hero Playground Interaction
   ======================================== */
function initHeroPlayground() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    const playground = document.querySelector('.hero-playground');
    if (!playground) return;

    const orb = playground.querySelector('.playground-orb');
    const items = playground.querySelectorAll('.play-item');

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const updateTarget = (event) => {
        const rect = playground.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        targetX = x * 30;
        targetY = y * 30;
    };

    playground.addEventListener('mousemove', updateTarget, { passive: true });
    playground.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    const animate = () => {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        if (orb) {
            orb.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }

        items.forEach((item) => {
            const depth = parseFloat(item.dataset.depth || '1');
            item.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
        });

        requestAnimationFrame(animate);
    };

    animate();
}

/* ========================================
   Preloader Animation
   ======================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('counter');
    const titles = document.querySelectorAll('.preloader-title');
    const line = document.querySelector('.preloader-line');
    const corners = document.querySelectorAll('.corner-info, .corner-counter');
    const bgTop = document.querySelector('.preloader-bg-top');
    const bgBottom = document.querySelector('.preloader-bg-bottom');
    const main = document.getElementById('main');

    const tl = gsap.timeline({
        defaults: { ease: 'power4.out' }
    });

    // Counter animation
    let count = { value: 0 };
    gsap.to(count, {
        value: 100,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: () => {
            counter.textContent = String(Math.floor(count.value)).padStart(3, '0');
        }
    });

    // Main preloader animation
    tl
        // Show corners
        .to(corners, {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1
        })
        // Animate titles in
        .to(titles, {
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out'
        }, 0.3)
        // Animate line
        .to(line, {
            scaleX: 1,
            duration: 0.8,
            ease: 'power2.inOut'
        }, 0.6)
        // Hold for a moment
        .to({}, { duration: 0.8 })
        // Hide titles
        .to(titles, {
            y: -100,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1
        })
        // Hide line
        .to(line, {
            scaleX: 0,
            duration: 0.4
        }, '-=0.4')
        // Hide corners
        .to(corners, {
            opacity: 0,
            duration: 0.3
        }, '-=0.3')
        // Split panels
        .to(bgTop, {
            y: '-100%',
            duration: 1,
            ease: 'power4.inOut'
        }, '-=0.2')
        .to(bgBottom, {
            y: '100%',
            duration: 1,
            ease: 'power4.inOut'
        }, '<')
        // Show main content
        .add(() => {
            main.classList.add('visible');
            preloader.classList.add('hidden');
            if (window.lenis) lenis.start();
            initHeroAnimation();
        }, '-=0.5');
}

/* ========================================
   Hero Section Animation
   ======================================== */
function initHeroAnimation() {
    const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: 'power4.out' }
    });

    tl
        // Kicker
        .to('.hero-kicker', {
            opacity: 1,
            y: 0,
            duration: 1
        })
        // Title words
        .to('.title-word', {
            y: 0,
            duration: 1.2,
            stagger: 0.1
        }, '-=0.6')
        // Description
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.8')
        // CTA buttons
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.6')
        // Playground
        .fromTo('.hero-playground',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '-=0.6'
        )
        .fromTo('.play-item',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
            '-=0.4'
        )
        // Audio pill
        .to('.audio-pill', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        // Scroll indicator
        .to('.hero-scroll', {
            opacity: 1,
            duration: 1
        }, '-=0.4')
        // Decorations
        .to('.decoration-circle', {
            opacity: 0.3,
            scale: 1,
            duration: 1.5,
            ease: 'power2.out'
        }, '-=1')
        .to('.decoration-dots', {
            opacity: 0.5,
            duration: 1
        }, '-=1');

    // Failsafe: ensure hero title is visible
    setTimeout(ensureHeroTitleVisible, 1600);
}

function ensureHeroTitleVisible() {
    const words = document.querySelectorAll('.hero-title .title-word');
    if (!words.length) return;

    const anyVisible = Array.from(words).some((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.opacity !== '0' && style.visibility !== 'hidden';
    });

    if (!anyVisible) {
        document.body.classList.add('hero-title-force');
        words.forEach((el) => {
            el.style.transform = 'translateY(0)';
            el.style.opacity = '1';
        });
    }
}

/* ========================================
   Navigation
   ======================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Navbar scroll effect
    const updateNavbar = rafThrottle((scrollY) => {
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    registerScrollHandler(updateNavbar);

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        if (mobileMenu.classList.contains('active')) {
            gsap.fromTo('.mobile-link',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power4.out' }
            );
            if (lenis) lenis.stop();
        } else {
            if (lenis) lenis.start();
        }
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            if (lenis) lenis.start();
        });
    });
}

/* ========================================
   About Section - Text Reveal
   ======================================== */
function initAboutSection() {
    const aboutText = document.getElementById('about-text');
    if (!aboutText) return;

    // Split text into words
    const text = aboutText.textContent;
    const words = text.split(' ');
    aboutText.innerHTML = words.map(word =>
        `<span class="word">${word}</span>`
    ).join(' ');

    const wordElements = aboutText.querySelectorAll('.word');

    // Scroll-triggered word reveal
    gsap.to(wordElements, {
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
            trigger: '.about',
            start: 'top 60%',
            end: 'center center',
            scrub: 1
        }
    });

    // About facts animation
    gsap.to('.about-fact', {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.about-facts',
            start: 'top 80%'
        }
    });

    // Portrait parallax
    const layers = document.querySelectorAll('.portrait-layer');
    if (layers.length) {
        layers.forEach((layer, index) => {
            gsap.to(layer, {
                y: -20 - index * 10,
                scrollTrigger: {
                    trigger: '.about-portrait',
                    start: 'top 80%',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }
}

/* ========================================
   Experience Section
   ======================================== */
function initExperienceSection() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach((item, index) => {
        gsap.fromTo(item,
            { x: -50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%'
                }
            }
        );
    });
}

/* ========================================
   Skills Section
   ======================================== */
function initSkillsSection() {
    const constellation = document.querySelector('.skills-constellation');
    if (!constellation) return;

    gsap.fromTo('.constellation-core',
        { scale: 0.9, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.skills-constellation',
                start: 'top 75%'
            }
        }
    );

    gsap.fromTo('.orbit',
        { scale: 0.95, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.skills-constellation',
                start: 'top 70%'
            }
        }
    );

    initSkillConstellation();
}

/* ========================================
   Skills Constellation Placement
   ======================================== */
function initSkillConstellation() {
    const orbits = document.querySelectorAll('.orbit');
    if (!orbits.length) return;

    if (window.innerWidth < 768) {
        orbits.forEach(orbit => {
            orbit.style.removeProperty('width');
            orbit.style.removeProperty('height');
            orbit.style.removeProperty('left');
            orbit.style.removeProperty('top');
            orbit.style.removeProperty('transform');
            orbit.querySelectorAll('.orbit-tag').forEach(tag => {
                tag.style.removeProperty('left');
                tag.style.removeProperty('top');
            });
        });
        return;
    }

    orbits.forEach(orbit => {
        const radius = parseInt(orbit.dataset.radius || '180', 10);
        const tags = Array.from(orbit.querySelectorAll('.orbit-tag'));
        const count = tags.length;
        if (!count) return;

        const angleStep = 360 / count;
        tags.forEach((tag, index) => {
            const angle = angleStep * index;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + (Math.cos(rad) * radius) / 4;
            const y = 50 + (Math.sin(rad) * radius) / 4;
            tag.style.left = `${x}%`;
            tag.style.top = `${y}%`;
        });

        orbit.style.width = `${radius * 2}px`;
        orbit.style.height = `${radius * 2}px`;
        orbit.style.left = '50%';
        orbit.style.top = '50%';
        orbit.style.transform = 'translate(-50%, -50%)';
    });
}

/* ========================================
   Projects Section
   ======================================== */
function initProjectsSection() {
    const projectCards = document.querySelectorAll('.project-card');

    gsap.fromTo(projectCards,
        { y: 100, opacity: 0, scale: 0.95 },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.2,
            duration: 1,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 75%'
            }
        }
    );

}

/* ========================================
   Tri Matic Section
   ======================================== */
function initTrimaticSection() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.trimatic',
            start: 'top 70%',
            once: true,
            toggleActions: 'play none none none'
        }
    });

    tl
        .fromTo('.trimatic-header',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
        )
        .fromTo('.trimatic-intro',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
            '-=0.5'
        )
        .fromTo('.service-card',
            { y: 60, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 0.8, ease: 'power4.out' },
            '-=0.4'
        )
        .fromTo('.trimatic-cta',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
            '-=0.3'
        );
}

/* ========================================
   Achievements Section
   ======================================== */
function initAchievementsSection() {
    const awards = document.querySelectorAll('.award-item');
    const certCards = document.querySelectorAll('.cert-card');
    if (!awards.length && !certCards.length) return;

    if (awards.length) {
        gsap.to(awards, {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.award-timeline',
                start: 'top 75%'
            }
        });
    }

    if (certCards.length) {
        gsap.fromTo(certCards,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 0.9,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '.cert-column',
                    start: 'top 75%'
                }
            }
        );
    }
}

/* ========================================
   Contact Section
   ======================================== */
function initContactSection() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%'
        }
    });

    tl
        .fromTo('.contact-header',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
        )
        .fromTo('.contact-info',
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
            '-=0.5'
        )
        .fromTo('.contact-form',
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
            '-=0.6'
        );

    // Form submit handling with Web3Forms
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('submit-btn');
            const originalText = btn.querySelector('.btn-text').textContent;

            // Button animation
            btn.querySelector('.btn-text').textContent = 'Sending...';
            btn.disabled = true;

            // Get form data
            const formData = new FormData(form);

            try {
                // Send to Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    btn.querySelector('.btn-text').textContent = 'Message Sent!';
                    gsap.to(btn, {
                        scale: 1.05,
                        duration: 0.3,
                        yoyo: true,
                        repeat: 1
                    });

                    // Reset form
                    setTimeout(() => {
                        form.reset();
                        btn.querySelector('.btn-text').textContent = originalText;
                        btn.disabled = false;
                    }, 2000);
                } else {
                    btn.querySelector('.btn-text').textContent = 'Failed. Try again';
                    btn.disabled = false;
                    setTimeout(() => {
                        btn.querySelector('.btn-text').textContent = originalText;
                    }, 2000);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                btn.querySelector('.btn-text').textContent = 'Error. Try email';
                btn.disabled = false;
                setTimeout(() => {
                    btn.querySelector('.btn-text').textContent = originalText;
                }, 2000);
            }
        });
    }
}

/* ========================================
   Hero Particles
   ======================================== */
function createHeroParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255, 77, 0, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            pointer-events: none;
        `;
        container.appendChild(particle);

        // Animate particle
        gsap.to(particle, {
            y: -100 - Math.random() * 100,
            x: (Math.random() - 0.5) * 100,
            opacity: 0,
            duration: 3 + Math.random() * 3,
            repeat: -1,
            delay: Math.random() * 3,
            ease: 'none'
        });
    }
}

/* ========================================
   Beyond Particles
   ======================================== */
function createBeyondParticles() {
    const container = document.getElementById('beyond-particles');
    if (!container) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle orange';
        const size = Math.random() * 6 + 3;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.2};
        `;
        container.appendChild(particle);

        gsap.to(particle, {
            y: -120 - Math.random() * 150,
            x: (Math.random() - 0.5) * 120,
            duration: 6 + Math.random() * 4,
            repeat: -1,
            delay: Math.random() * 4,
            ease: 'none'
        });
    }
}

/* ========================================
   Magnetic Buttons
   ======================================== */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.cta-button, .trimatic-btn, .submit-btn, .project-link.primary, .back-to-top');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3,
                ease: 'power2.out'
            });
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

/* ========================================
   Case Study Modal
   ======================================== */
function initCaseStudyModal() {
    const modal = document.getElementById('case-modal');
    if (!modal) return;

    const titleEl = document.getElementById('case-title');
    const subtitleEl = document.getElementById('case-subtitle');
    const highlightsEl = document.getElementById('case-highlights');
    const metaEl = document.getElementById('case-meta');
    const actionsEl = document.getElementById('case-actions');

    const caseData = {
        clearcheck: {
            title: 'ClearCheck — Advanced Proctoring System',
            subtitle: 'AI-powered online proctoring with device and multi-face detection',
            highlights: [
                'Led a 4-member team to build real-time proctoring workflows.',
                'Implemented face spoofing prevention and device detection.',
                'Selected for SOA PROXIMA 2025 and Top 10 at HackNation.'
            ],
            meta: ['Python', 'OpenCV', 'ML', 'Computer Vision', 'Team Lead'],
            actions: [
                { label: 'Learn More', url: 'https://abinya.vercel.app/project.html?id=16', primary: true }
            ]
        },
        dejaview: {
            title: 'DejaView — Photo Location Visualizer',
            subtitle: 'GPS extraction, maps, and 360° Street View experiences',
            videoId: 'uh3oMO7EiPg',
            highlights: [
                'Built a privacy-first Java backend with in-memory processing.',
                'Integrated Google Maps + OpenStreetMap for intelligent 3D view.',
                'Deployed live demo for instant user experience.'
            ],
            meta: ['Java', 'Servlets', 'JSP', 'Maps API', 'Full Stack'],
            actions: [
                { label: 'GitHub', url: 'https://github.com/nikhilthesingh/DejaView' },
                { label: 'Live Demo', url: 'https://dejaview-qhig.onrender.com/', primary: true }
            ]
        },
        appup: {
            title: 'AppUP — Windows Application Updater',
            subtitle: 'Matrix-styled CLI updater for 1,500+ non-Store apps',
            videoId: '2OAN-6dDhVY',
            highlights: [
                'Designed a Rich-powered CLI with interactive menus.',
                'Delivered 70% update-effort reduction with centralized flows.',
                'Packaged as a standalone Windows executable using PyInstaller.'
            ],
            meta: ['Python', 'Rich', 'Windows', 'CLI Tool'],
            actions: [
                { label: 'View on GitHub', url: 'https://github.com/nikhilthesingh/AppUP', primary: true },
                { label: 'Download AppUP', url: 'https://raw.githubusercontent.com/nikhilthesingh/AppUP/main/AppUP.exe' }
            ]
        }
    };

    function openModal(key) {
        const data = caseData[key];
        if (!data) return;

        titleEl.textContent = data.title;
        subtitleEl.textContent = data.subtitle;
        highlightsEl.innerHTML = data.highlights.map(item => `<li>${item}</li>`).join('');
        metaEl.innerHTML = data.meta.map(item => `<span>${item}</span>`).join('');
        actionsEl.innerHTML = data.actions
            .map(action => {
                const cls = action.primary ? 'primary' : '';
                return `<a href="${action.url}" target="_blank" class="${cls}">${action.label}</a>`;
            })
            .join('');

        // Handle video embed
        const videoContainer = document.getElementById('case-video');
        if (data.videoId) {
            videoContainer.innerHTML = `
                <iframe 
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/${data.videoId}" 
                    title="Project Video Demo"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                    loading="lazy">
                </iframe>
            `;
            videoContainer.style.display = 'block';

            videoContainer.style.display = 'block';
        } else {
            videoContainer.style.display = 'none';
            videoContainer.innerHTML = '';
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-case-open]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-card');
            const key = card?.dataset.case;
            if (key) openModal(key);
        });
    });

    modal.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ========================================
   Spotlight Hover Effect
   ======================================== */
function initSpotlightHover() {
    const cards = document.querySelectorAll('.project-card, .about-card, .about-fact, .service-card, .achievement-card, .award-card, .cert-card, .achievement-metric, .skill-category, .pillar-card, .metric-card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.classList.add('card-spotlight');
        let rect = null;
        let rafId = null;
        let lastX = 0;
        let lastY = 0;

        const updateSpotlight = () => {
            if (!rect) {
                rafId = null;
                return;
            }
            card.style.setProperty('--spotlight-x', `${lastX}px`);
            card.style.setProperty('--spotlight-y', `${lastY}px`);
            rafId = null;
        };

        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            if (!rafId) rafId = requestAnimationFrame(updateSpotlight);
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            rect = null;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            card.style.removeProperty('--spotlight-x');
            card.style.removeProperty('--spotlight-y');
        });
    });
}

/* ========================================
   Back To Top
   ======================================== */
function initBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    const updateButton = rafThrottle((scrollY) => {
        if (scrollY > 600) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    registerScrollHandler(updateButton);

    button.addEventListener('click', () => {
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

/* ========================================
   Smooth Scroll Links
   ======================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target && lenis) {
                lenis.scrollTo(target, {
                    offset: -100,
                    duration: 1.5
                });
            }
        });
    });
}

/* ========================================
   Section Headers Animation
   ======================================== */
function initSectionHeaders() {
    const headers = document.querySelectorAll('.section-header, .contact-header');

    headers.forEach(header => {
        const number = header.querySelector('.section-number');
        const label = header.querySelector('.section-label');
        const title = header.querySelector('.section-title, .contact-title');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 80%'
            }
        });

        if (number) {
            tl.fromTo(number,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: 'power4.out' }
            );
        }
        if (label) {
            tl.fromTo(label,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' },
                '-=0.3'
            );
        }
        if (title) {
            tl.fromTo(title,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' },
                '-=0.4'
            );
        }
    });
}

/* ========================================
   Initialize All
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Core initializations
    initLenis();
    initCustomCursor();
    initAudioReactiveHero();
    initHeroPlayground();
    initNavigation();
    initSmoothScroll();
    initMagneticButtons();
    initSpotlightHover();
    initBackToTop();
    initCaseStudyModal();
    createHeroParticles();

    // Start preloader
    initPreloader();

    // Section animations (will trigger on scroll)
    initSectionHeaders();
    initAboutSection();
    initExperienceSection();
    initSkillsSection();
    initProjectsSection();
    initTrimaticSection();
    initAchievementsSection();
    initBeyondLogicSection();
    initContactSection();
});

/* ========================================
   Beyond Logic Section
   ======================================== */
function initBeyondLogicSection() {
    const beyond = document.querySelector('.beyond-logic');
    if (!beyond) return;

    // Create floating particles
    createBeyondParticles();

    // Split title into characters
    const splitTargets = beyond.querySelectorAll('[data-split]');
    splitTargets.forEach(target => {
        const text = target.textContent.trim();
        target.innerHTML = text
            .split('')
            .map(char => {
                if (char === ' ') return '<span class="title-char">&nbsp;</span>';
                return `<span class="title-char">${char}</span>`;
            })
            .join('');
    });

    // Character reveal animation
    const titleChars = beyond.querySelectorAll('.title-char');

    gsap.to(titleChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: beyond,
            start: 'top 70%'
        }
    });

    // Quote animation
    gsap.fromTo('.beyond-quote',
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.beyond-quote',
                start: 'top 80%'
            }
        }
    );

    // Metrics animation
    gsap.fromTo('.beyond-metrics',
        { opacity: 0, scale: 0.95 },
        {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.beyond-metrics',
                start: 'top 85%'
            }
        }
    );

    // CTA animation
    gsap.fromTo('.beyond-cta',
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.beyond-cta',
                start: 'top 90%'
            }
        }
    );

    // Orb parallax effect
    const orb = beyond.querySelector('.beyond-orb');
    if (orb) {
        gsap.to(orb, {
            y: -100,
            scrollTrigger: {
                trigger: beyond,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }
}

/* ========================================
   Scroll Progress Bar
   ======================================== */
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    let docHeight = document.documentElement.scrollHeight - window.innerHeight;

    const updateProgress = rafThrottle((scrollY) => {
        const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';
    });

    registerScrollHandler(updateProgress);

    window.addEventListener('resize', () => {
        docHeight = document.documentElement.scrollHeight - window.innerHeight;
        updateProgress(window.scrollY);
    });
}

/* ========================================
   Horizontal Sliding Text Animation
   ======================================== */
function initSlidingText() {
    const textRows = document.querySelectorAll('.text-row');
    if (!textRows.length) return;

    textRows.forEach((row, index) => {
        const direction = row.dataset.direction === 'right' ? 1 : -1;
        const speed = 0.5 + (index * 0.1);

        // Initial position based on direction
        gsap.set(row, { x: direction === 1 ? -200 : 0 });

        // Scroll-triggered horizontal movement
        gsap.to(row, {
            x: direction * 300,
            ease: 'none',
            scrollTrigger: {
                trigger: '.sliding-text-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: speed,
            }
        });
    });
}

/* ========================================
   Section Transform Effect
   ======================================== */
function initSectionTransforms() {
    const sections = document.querySelectorAll('.about, .experience, .skills, .projects, .trimatic, .achievements, .beyond-logic, .contact');

    sections.forEach(section => {
        section.classList.add('section-transform');

        ScrollTrigger.create({
            trigger: section,
            start: 'top 90%',
            end: 'top 40%',
            onEnter: () => section.classList.add('in-view'),
            onLeaveBack: () => section.classList.remove('in-view'),
        });
    });
}

/* ========================================
   Blur Reveal Effect for About Text
   ======================================== */
function initBlurReveal() {
    const aboutText = document.querySelector('.about-text');
    if (!aboutText) return;

    aboutText.classList.add('blur-reveal');

    ScrollTrigger.create({
        trigger: aboutText,
        start: 'top 80%',
        onEnter: () => aboutText.classList.add('revealed'),
        onLeaveBack: () => aboutText.classList.remove('revealed'),
    });
}

/* ========================================
   Parallax Effect for Hero
   ======================================== */
function initParallaxEffects() {
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');

    if (heroContent) {
        gsap.to(heroContent, {
            y: 100,
            opacity: 0.5,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            }
        });
    }

    if (heroBg) {
        gsap.to(heroBg, {
            y: -100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.5,
            }
        });
    }
}

/* ========================================
   Initialize All Scroll Effects
   ======================================== */
function initAllScrollEffects() {
    initScrollProgress();
    initSlidingText();
    initSectionTransforms();
    initBlurReveal();
    initParallaxEffects();
}

// Call scroll effects on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initAllScrollEffects();
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (lenis) lenis.stop();
    } else {
        if (lenis && document.querySelector('.preloader.hidden')) {
            lenis.start();
        }
    }
});

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
    initSkillConstellation();
});

/* ========================================
   ULTRA MODERN ENHANCEMENTS
   Advanced JavaScript Interactions
   ======================================== */

/* ========================================
   3D Card Tilt Effect
   ======================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('.service-card, .cert-card, .pillar-card');

    cards.forEach(card => {
        let rect = null;
        let rafId = null;
        let lastX = 0;
        let lastY = 0;

        const updateTilt = () => {
            if (!rect) {
                rafId = null;
                return;
            }
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((lastY - centerY) / centerY) * 10;
            const rotateY = ((centerX - lastX) / centerX) * 10;
            card.style.setProperty('--tilt-x', `${rotateY}deg`);
            card.style.setProperty('--tilt-y', `${rotateX}deg`);
            rafId = null;
        };

        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            if (!rafId) rafId = requestAnimationFrame(updateTilt);
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            rect = null;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });
}

/* ========================================
   Text Scramble Effect
   ======================================== */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

function initTextScramble() {
    const scrambleElements = document.querySelectorAll('.hero-title .title-word');

    scrambleElements.forEach((el, index) => {
        const fx = new TextScramble(el);
        const text = el.innerText;

        setTimeout(() => {
            fx.setText(text);
        }, index * 200);

        el.addEventListener('mouseenter', () => {
            fx.setText(text);
        });
    });
}

/* ========================================
   Particle Trail System
   ======================================== */
function initParticleTrail() {
    let particles = [];
    const maxParticles = 15;
    let lastSpawn = 0;
    let lastX = 0;
    let lastY = 0;
    let rafId = null;

    const spawnParticle = (now) => {
        if (particles.length < maxParticles && now - lastSpawn >= 60) {
            const particle = document.createElement('div');
            particle.className = 'particle-trail';
            particle.style.left = lastX + 'px';
            particle.style.top = lastY + 'px';
            document.body.appendChild(particle);
            particles.push(particle);
            lastSpawn = now;

            setTimeout(() => {
                particle.remove();
                particles = particles.filter(p => p !== particle);
            }, 800);
        }
        rafId = null;
    };

    document.addEventListener('mousemove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(spawnParticle);
    }, { passive: true });
}

/* ========================================
   Cursor Trail Effect
   ======================================== */
function initCursorTrail() {
    const trails = [];
    const maxTrails = 10;
    let mouseX = 0;
    let mouseY = 0;
    let lastSpawn = 0;
    let active = false;
    let idleTimer = null;

    const start = () => {
        if (active) return;
        active = true;
        requestAnimationFrame(tick);
    };

    const stop = () => {
        active = false;
    };

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        start();
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(stop, 120);
    }, { passive: true });

    function createTrail() {
        if (trails.length < maxTrails) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = mouseX + 'px';
            trail.style.top = mouseY + 'px';

            document.body.appendChild(trail);
            trails.push(trail);

            setTimeout(() => {
                trail.remove();
                const index = trails.indexOf(trail);
                if (index > -1) trails.splice(index, 1);
            }, 1000);
        }
    }

    const tick = (now) => {
        if (!active) return;

        if (now - lastSpawn >= 60) {
            createTrail();
            lastSpawn = now;
        }
        requestAnimationFrame(tick);
    };
}

/* ========================================
   Advanced Particle System
   ======================================== */
class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.particles = [];
        this.particleCount = options.count || 50;
        this.particleSize = options.size || 2;
        this.particleColor = options.color || 'rgba(255, 77, 0, 0.6)';
        this.speed = options.speed || 0.5;
        this.running = true;
        this.rafId = null;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.resize();
        this.init();
        this.animate = this.animate.bind(this);
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.speed,
                vy: (Math.random() - 0.5) * this.speed,
                size: Math.random() * this.particleSize + 1
            });
        }
    }

    animate() {
        if (!this.running) {
            this.rafId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.particleColor;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 77, 0, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        });

        this.rafId = requestAnimationFrame(this.animate);
    }

    start() {
        if (this.running) return;
        this.running = true;
        if (!this.rafId) this.animate();
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

function initParticleSystems() {
    const heroParticles = document.getElementById('hero-particles');
    const beyondParticles = document.getElementById('beyond-particles');

    const bindVisibility = (element, system) => {
        if (!element || !system || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    system.start();
                } else {
                    system.stop();
                }
            });
        }, { rootMargin: '200px 0px' });
        observer.observe(element);
    };

    if (heroParticles) {
        const heroSystem = new ParticleSystem(heroParticles, {
            count: 60,
            size: 2,
            speed: 0.3
        });
        bindVisibility(heroParticles, heroSystem);
    }

    if (beyondParticles) {
        const beyondSystem = new ParticleSystem(beyondParticles, {
            count: 40,
            size: 1.5,
            speed: 0.4
        });
        bindVisibility(beyondParticles, beyondSystem);
    }
}

/* ========================================
   Number Counter Animation
   ======================================== */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-number, .achievement-metric .metric-number');
    if (!counters.length) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = entry.target;
                const text = (target.dataset.count || target.textContent).trim();

                // Don't animate if it contains non-numeric text like "Top 10"
                if (text.includes('Top') || text.includes('top')) {
                    target.classList.add('counted');
                    return;
                }

                // Extract number and suffix (K, M, +, etc.)
                const hasK = text.includes('K');
                const hasM = text.includes('M');
                const hasPlus = text.includes('+');
                const numericPart = parseFloat(text.replace(/[^0-9.]/g, ''));

                if (isNaN(numericPart)) {
                    target.classList.add('counted');
                    return;
                }

                let current = 0;
                const increment = numericPart / 50;
                const duration = 2000;
                const stepTime = duration / 50;

                target.classList.add('counted');

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericPart) {
                        let finalText = numericPart.toString();
                        if (hasK) finalText += 'K';
                        if (hasM) finalText += 'M';
                        if (hasPlus) finalText += '+';
                        target.textContent = finalText;
                        clearInterval(timer);
                    } else {
                        let displayText = Math.floor(current * 10) / 10;
                        if (hasK) displayText += 'K';
                        if (hasM) displayText += 'M';
                        if (hasPlus) displayText += '+';
                        target.textContent = displayText;
                    }
                }, stepTime);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

/* ========================================
   Smooth Reveal on Scroll
   ======================================== */
function initSmoothReveal() {
    const elements = document.querySelectorAll('.smooth-reveal, .about-text, .about-fact, .timeline-item, .award-item');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    elements.forEach(el => {
        el.classList.add('smooth-reveal');
        observer.observe(el);
    });
}

/* ========================================
   Dynamic Background Effect
   ======================================== */
function initDynamicBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 50;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 50;
    }, { passive: true });

    let rafId = null;
    let isActive = true;

    const animate = () => {
        if (!isActive) {
            rafId = null;
            return;
        }

        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        const gradient = hero.querySelector('.hero-gradient');
        if (gradient) {
            gradient.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }

        rafId = requestAnimationFrame(animate);
    };

    const setActive = (state) => {
        isActive = state;
        if (isActive && !rafId) {
            rafId = requestAnimationFrame(animate);
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => setActive(entry.isIntersecting));
        }, { rootMargin: '200px 0px' });
        observer.observe(hero);
    }

    if (!prefersReducedMotion) {
        animate();
    }
}

/* ========================================
   Typewriter Effect
   ======================================== */
function initTypewriterEffect() {
    const elements = document.querySelectorAll('[data-typewriter]');

    elements.forEach((el, index) => {
        const text = el.textContent;
        el.textContent = '';
        el.style.display = 'inline-block';

        setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 50);
        }, index * 1000);
    });
}

/* ========================================
   Magnetic Elements
   ======================================== */
function enhanceMagneticElements() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const strength = 0.3;
            const offsetX = x * strength;
            const offsetY = y * strength;

            gsap.to(el, {
                x: offsetX,
                y: offsetY,
                duration: 0.4,
                ease: 'power2.out'
            });
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

/* ========================================
   Parallax Image Effect
   ======================================== */
function initParallaxImages() {
    return;
}

/* ========================================
   Liquid Button Effect
   ======================================== */
function initLiquidButtons() {
    const buttons = document.querySelectorAll('.cta-button, .submit-btn, .trimatic-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;

            const ripple = document.createElement('span');
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'liquid-ripple';

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/* ========================================
   Enhanced Scroll Animations
   ======================================== */
function initEnhancedScrollAnimations() {
    // Fade in sections
    gsap.utils.toArray('section')
        .filter(section => !section.classList.contains('projects') && !section.classList.contains('trimatic'))
        .forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 50%',
                    toggleActions: 'play none none none'
                }
            });
        });
}

/* ========================================
   Image Hover Distortion
   ======================================== */
function initImageDistortion() {
    const images = document.querySelectorAll('.project-image');

    images.forEach(img => {
        let rect = null;
        let rafId = null;
        let lastX = 0;
        let lastY = 0;
        const child = img.querySelector('img');
        if (!child) return;

        const updateDistortion = () => {
            if (!rect) {
                rafId = null;
                return;
            }
            const x = ((lastX - rect.left) / rect.width - 0.5) * 2;
            const y = ((lastY - rect.top) / rect.height - 0.5) * 2;
            child.style.transform = `scale(1.1) translate(${x * 10}px, ${y * 10}px)`;
            rafId = null;
        };

        img.addEventListener('mouseenter', () => {
            rect = img.getBoundingClientRect();
        });

        img.addEventListener('mousemove', (e) => {
            if (!rect) rect = img.getBoundingClientRect();
            lastX = e.clientX;
            lastY = e.clientY;
            if (!rafId) rafId = requestAnimationFrame(updateDistortion);
        }, { passive: true });

        img.addEventListener('mouseleave', () => {
            rect = null;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            child.style.transform = 'scale(1) translate(0, 0)';
        });
    });
}

/* ========================================
   Initialize All Modern Effects
   ======================================== */
function initModernEffects() {
    init3DTilt();
    initParticleTrail();
    initCursorTrail();
    initParticleSystems();
    animateCounters();
    initSmoothReveal();
    initDynamicBackground();
    enhanceMagneticElements();
    initParallaxImages();
    initLiquidButtons();
    initEnhancedScrollAnimations();
    initImageDistortion();
    initCertificateLightbox();
    initFloatingCertPreview();

    // Delayed effects
    setTimeout(() => {
        initTextScramble();
        initTypewriterEffect();
    }, 1000);

}

/* ========================================
   Floating Certificate Preview (3D Hover)
   ======================================== */
function initFloatingCertPreview() {
    // Find all elements with certificate images
    const cardsWithCerts = document.querySelectorAll('[data-cert-image]');

    cardsWithCerts.forEach((btn, index) => {
        const certImage = btn.getAttribute('data-cert-image');
        const card = btn.closest('.cert-card, .award-card, .timeline-content');

        if (!card || !certImage) {
            return;
        }

        // Set certificate as background using ::after pseudo-element
        card.style.setProperty('--cert-bg-image', `url('${certImage}')`);

        // Create spotlight reveal element
        const spotlight = document.createElement('div');
        spotlight.className = 'cert-spotlight-reveal';
        card.appendChild(spotlight);

        let isHovering = false;
        let rect = null;
        let rafId = null;
        let lastX = 0;
        let lastY = 0;

        const updateSpotlight = () => {
            if (!rect || !isHovering) {
                rafId = null;
                return;
            }
            const x = lastX - rect.left;
            const y = lastY - rect.top;

            spotlight.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px,
                    transparent 0%,
                    transparent 150px,
                    rgba(0, 0, 0, 0.05) 170px,
                    rgba(0, 0, 0, 0.12) 190px,
                    rgba(0, 0, 0, 0.22) 215px,
                    rgba(0, 0, 0, 0.35) 245px,
                    rgba(0, 0, 0, 0.48) 275px,
                    rgba(0, 0, 0, 0.60) 310px,
                    rgba(0, 0, 0, 0.70) 350px,
                    rgba(0, 0, 0, 0.78) 400px,
                    rgba(0, 0, 0, 0.84) 460px,
                    rgba(0, 0, 0, 0.88) 530px,
                    rgba(0, 0, 0, 0.91) 610px,
                    rgba(0, 0, 0, 0.93) 700px
                ),
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 77, 0, 0.12) 0%,
                    rgba(255, 77, 0, 0.08) 150px,
                    rgba(255, 77, 0, 0.04) 250px,
                    transparent 400px
                ),
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 140, 60, 0.06) 0%,
                    rgba(255, 140, 60, 0.03) 200px,
                    transparent 350px
                )
            `;

            spotlight.style.boxShadow = `
                inset 0 0 150px rgba(255, 77, 0, 0.08),
                inset 0 0 80px rgba(255, 140, 60, 0.05)
            `;
            rafId = null;
        };

        // Track mouse movement
        card.addEventListener('mouseenter', () => {
            isHovering = true;
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            if (!rect) rect = card.getBoundingClientRect();
            lastX = e.clientX;
            lastY = e.clientY;
            if (!rafId) rafId = requestAnimationFrame(updateSpotlight);
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
            rect = null;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            spotlight.style.clipPath = '';
            spotlight.style.background = '';
            spotlight.style.boxShadow = '';
        });
    });

    // Add CSS for background images
    const style = document.createElement('style');
    style.textContent = `
        .cert-card::after,
        .award-card::after,
        .timeline-content::after {
            background-image: var(--cert-bg-image);
        }
    `;
    document.head.appendChild(style);

}

/* ========================================
   Certificate Lightbox
   ======================================== */
function initCertificateLightbox() {
    const lightbox = document.getElementById('cert-lightbox');
    const lightboxImg = document.getElementById('cert-lightbox-img');
    const closeBtn = document.querySelector('.cert-lightbox-close');
    const overlay = document.querySelector('.cert-lightbox-overlay');
    const prevBtn = document.querySelector('.cert-nav-prev');
    const nextBtn = document.querySelector('.cert-nav-next');
    const currentSpan = document.getElementById('cert-current');
    const totalSpan = document.getElementById('cert-total');

    if (!lightbox) {
        return;
    }

    // Collect all certificate images
    const certButtons = document.querySelectorAll('[data-cert-image]');
    let certificates = [];
    let currentIndex = 0;

    certButtons.forEach(btn => {
        const imgSrc = btn.getAttribute('data-cert-image');
        if (imgSrc) {
            certificates.push(imgSrc);
        }
    });

    if (totalSpan) totalSpan.textContent = certificates.length;

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = certificates[currentIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateNav();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateNav() {
        if (currentSpan) currentSpan.textContent = currentIndex + 1;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === certificates.length - 1;
    }

    function showPrev() {
        if (currentIndex > 0) {
            openLightbox(currentIndex - 1);
        }
    }

    function showNext() {
        if (currentIndex < certificates.length - 1) {
            openLightbox(currentIndex + 1);
        }
    }

    // Attach event listeners to certificate buttons
    certButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(index);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (overlay) {
        overlay.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', showPrev);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', showNext);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

}

// Initialize modern effects after page load
window.addEventListener('load', () => {
    setTimeout(initModernEffects, 500);
    setTimeout(() => {
        initEducationTimeline();
        ScrollTrigger.refresh();
    }, 600);
});

/* ========================================
   EDUCATION HORIZONTAL JOURNEY TIMELINE
   ======================================== */
function initEducationTimeline() {
    const track = document.querySelector('.timeline-track');
    if (!track) {
        return;
    }

    // Path draw + rocket travel synced to scroll
    gsap.set('.journey-path', { scaleX: 0, transformOrigin: 'left center' });
    gsap.set('.rocket-ship', { left: '5%' });

    gsap.timeline({
        scrollTrigger: {
            trigger: '.education-journey-section',
            start: 'top 45%',
            end: 'center 5%',
            scrub: 1
        }
    })
        .to('.journey-path', { scaleX: 1, duration: 1, ease: 'none' }, 0)
        .to('.rocket-ship', { left: '95%', rotate: 5, duration: 1, ease: 'none' }, 0);

    // Reveal timeline stops
    gsap.to('.timeline-stop', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.timeline-track',
            start: 'top 65%',
            once: true
        }
    });
}

/* ========================================
   END EDUCATION HORIZONTAL JOURNEY
   ======================================== */
