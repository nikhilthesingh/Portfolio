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
    const prefersNativeTouchScroll = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (prefersReducedMotion || prefersNativeTouchScroll) {
        window.lenis = null;
        return;
    }

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

    // Connect Lenis to GSAP (single RAF loop shared with GSAP ticker)
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(500, 33);

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

    // Smooth cursor animation with idle detection
    let cursorMoving = false;
    let cursorIdleTimer = null;

    // Single mousemove handler for performance
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!cursorMoving) {
            cursorMoving = true;
            animateCursor();
        }
        clearTimeout(cursorIdleTimer);
        cursorIdleTimer = setTimeout(() => { cursorMoving = false; }, 100);
    }, { passive: true });

    function animateCursor() {
        if (!cursorMoving) return;

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
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

        // Ring follows with delay
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        const scaleX = (1 + stretch * 0.35) * hoverScale;
        const scaleY = (1 - stretch * 0.15) * hoverScale;
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${scaleX}, ${scaleY})`;

        // Glow follows softly
        if (cursorGlow) {
            glowX += (mouseX - glowX) * 0.06;
            glowY += (mouseY - glowY) * 0.06;
            cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        }

        if (cursorLabel) {
            cursorLabel.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }

        requestAnimationFrame(animateCursor);
    }

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

            ctx.fillStyle = `rgba(255, 107, 0, ${0.15 + value * 0.6})`;
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

    playground.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    let playgroundActive = false;
    let playgroundIdleTimer = null;

    const startPlayground = () => {
        if (!playgroundActive) {
            playgroundActive = true;
            animatePlayground();
        }
        clearTimeout(playgroundIdleTimer);
        playgroundIdleTimer = setTimeout(() => { playgroundActive = false; }, 200);
    };

    playground.addEventListener('mousemove', (e) => {
        updateTarget(e);
        startPlayground();
    }, { passive: true });

    function animatePlayground() {
        if (!playgroundActive) return;

        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        if (orb) {
            orb.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }

        items.forEach((item) => {
            const depth = parseFloat(item.dataset.depth || '1');
            item.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
        });

        requestAnimationFrame(animatePlayground);
    }
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
    const isMobile = window.innerWidth <= 768;

    const revealMain = () => {
        main.classList.add('visible');
        preloader.classList.add('hidden');
        if (window.lenis) window.lenis.start();
        initHeroAnimation();
    };

    const tl = gsap.timeline({
        defaults: { ease: 'power4.out' }
    });

    // Counter animation
    let count = { value: 0 };
    gsap.to(count, {
        value: 100,
        duration: isMobile ? 1.1 : 2.5,
        ease: 'power2.inOut',
        onUpdate: () => {
            counter.textContent = String(Math.floor(count.value)).padStart(3, '0');
        }
    });

    if (isMobile) {
        tl
            .to(titles, {
                y: 0,
                duration: 0.55,
                stagger: 0.08,
                ease: 'power3.out'
            }, 0)
            .to(line, {
                scaleX: 1,
                duration: 0.35,
                ease: 'power2.out'
            }, 0.1)
            .to({}, { duration: 0.18 })
            .to(bgTop, {
                y: '-100%',
                duration: 0.55,
                ease: 'power3.inOut'
            })
            .to(bgBottom, {
                y: '100%',
                duration: 0.55,
                ease: 'power3.inOut'
            }, '<')
            .add(revealMain, '-=0.2');

        return;
    }

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
        .add(revealMain, '-=0.5');
}

/* ========================================
   Hero Section Animation - Cinematic Split Screen
   ======================================== */
function initHeroAnimation() {
    const isCinematic = document.querySelector('.hero-cinematic');

    if (isCinematic) {
        initHeroCinematic();
    } else {
        initHeroClassic();
    }
}

function initHeroCinematic() {
    const isMobile = window.innerWidth <= 768;

    // Descriptor text options
    const descriptors = ['Developer', 'Creator', 'Entrepreneur', 'Innovator'];

    if (isMobile) {
        // MOBILE: Keep stacked split layout, but animate panels out horizontally.
        const tl = gsap.timeline({
            delay: 0,
            defaults: { ease: 'power3.out' }
        });

        // Phase 1: Top panel exits left, bottom panel exits right.
        tl.to('.split-left', {
            xPercent: -100,
            duration: 0.9,
            ease: 'power3.inOut'
        })
        .to('.split-right', {
            xPercent: 100,
            duration: 0.9,
            ease: 'power3.inOut'
        }, '<')

        // Phase 2: Name appears quickly
        .to('.name-letter', {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.06
        }, '-=0.45')

        // Phase 3: Surname
        .to('.surname-letter', {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.04
        }, '-=0.4')

        // Phase 4: Descriptor
        .to('.hero-descriptor', {
            opacity: 1,
            duration: 0.45
        }, '-=0.2')

        // Phase 5: Hide split panels and start typing
        .add(() => {
            const splitEl = document.querySelector('.hero-split');
            if (splitEl) splitEl.style.display = 'none';
            typeDescriptor(descriptors, 0, {
                typeSpeed: 58,
                holdDuration: 1300,
                eraseSpeed: 34,
                pauseBetween: 260,
                loop: true
            });
        })

        // Phase 6: Quick transition to content
        .to({}, { duration: 1.6 })
        .add(() => {
            transitionToRevealedContent();
        });

    } else {
        // DESKTOP: Full cinematic animation
        const tl = gsap.timeline({
            delay: 0.2,
            defaults: { ease: 'power4.out' }
        });

        // Phase 1: Depth layers fade in subtly
        tl.to('.hero-depth-layer', {
            opacity: 0.6,
            duration: 1,
            stagger: 0.15,
            ease: 'power2.out'
        })

        // Phase 2: Split panels slide away horizontally
        .to('.split-left', {
            xPercent: -100,
            duration: 1.4,
            ease: 'power4.inOut'
        }, '-=0.3')
        .to('.split-right', {
            xPercent: 100,
            duration: 1.4,
            ease: 'power4.inOut'
        }, '<')

        // Phase 3: Giant name letters emerge from center
        .to('.name-letter', {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            stagger: {
                each: 0.08,
                from: 'center'
            },
            ease: 'power4.out'
        }, '-=0.8')

        // Phase 4: Surname letters fade up
        .to('.surname-letter', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: {
                each: 0.05,
                from: 'center'
            },
            ease: 'power3.out'
        }, '-=0.5')

        // Phase 5: Descriptor appears
        .to('.hero-descriptor', {
            opacity: 1,
            duration: 0.6
        }, '-=0.3')

        // Phase 6: Hide split panels completely and show revealed content
        .add(() => {
            document.querySelector('.hero-split').style.display = 'none';
            typeDescriptor(descriptors, 0);
        })

        // Phase 7: Transition to revealed content after a moment
        .to({}, { duration: 2 })
        .add(() => {
            transitionToRevealedContent();
        });

        // Initialize parallax effect for depth layers (desktop only)
        initHeroParallax();
    }
}

function typeDescriptor(descriptors, index, options = {}) {
    const textEl = document.querySelector('.descriptor-text');
    if (!textEl) return;

    const {
        typeSpeed = 80,
        holdDuration = 2000,
        eraseSpeed = 40,
        pauseBetween = 300,
        loop = true
    } = options;

    const text = descriptors[index];
    let charIndex = 0;
    textEl.textContent = '';

    const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
            textEl.textContent += text[charIndex];
            charIndex++;
        } else {
            clearInterval(typeInterval);
            if (!loop) return;
            // Wait then erase and type next
            setTimeout(() => {
                eraseDescriptor(descriptors, index, options);
            }, holdDuration);
        }
    }, typeSpeed);
}

function eraseDescriptor(descriptors, index, options = {}) {
    const textEl = document.querySelector('.descriptor-text');
    if (!textEl) return;

    const {
        eraseSpeed = 40,
        pauseBetween = 300
    } = options;

    const eraseInterval = setInterval(() => {
        if (textEl.textContent.length > 0) {
            textEl.textContent = textEl.textContent.slice(0, -1);
        } else {
            clearInterval(eraseInterval);
            // Type next descriptor
            const nextIndex = (index + 1) % descriptors.length;
            setTimeout(() => {
                typeDescriptor(descriptors, nextIndex, options);
            }, pauseBetween);
        }
    }, eraseSpeed);
}

function transitionToRevealedContent() {
    const hero = document.querySelector('.hero-cinematic');
    const emergence = document.querySelector('.hero-emergence');
    const revealed = document.querySelector('.hero-revealed-content');
    const isMobile = window.innerWidth <= 768;

    if (!hero || !emergence || !revealed) return;

    if (isMobile) {
        // MOBILE: Cinematic transition aligned with desktop pacing
        const tl = gsap.timeline();

        hero.classList.add('content-revealed');

        tl.to(emergence, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        })
        .set(emergence, { display: 'none' })
        .to(revealed, {
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            onStart: () => {
                revealed.style.pointerEvents = 'auto';
            }
        }, '-=0.2')
        .fromTo('.hero-playground',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
            '-=0.25'
        )
        .to(['.hero-kicker', '.hero-description', '.hero-actions'], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.12
        }, '-=0.2')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.4
        }, '-=0.2');

    } else {
        // DESKTOP: Full animation
        const tl = gsap.timeline();

        // Fade out emergence
        tl.to(emergence, {
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'power2.inOut'
        })
        // Fade in revealed content
        .to(revealed, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            onStart: () => {
                revealed.style.pointerEvents = 'auto';
            }
        }, '-=0.4')
        // Animate revealed content elements
        .to('.hero-kicker', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.5')
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        .fromTo('.hero-playground',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            '-=0.4'
        )
        .fromTo('.play-item',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
            '-=0.4'
        )
        .to('.audio-pill', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.8
        }, '-=0.4')
        .to('.decoration-circle', {
            opacity: 0.3,
            scale: 1,
            duration: 1
        }, '-=0.6')
        .to('.decoration-dots', {
            opacity: 0.5,
            duration: 0.8
        }, '-=0.6');
    }
}

function initHeroParallax() {
    const layers = document.querySelectorAll('.hero-depth-layer');
    const letters = document.querySelectorAll('.name-letter');
    const hero = document.querySelector('.hero');

    if (!layers.length || window.innerWidth < 768) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isActive = true;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function animate() {
        if (!isActive) {
            rafId = null;
            return;
        }

        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        layers.forEach((layer, i) => {
            const depth = (i + 1) * 15;
            layer.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
        });

        // Subtle letter rotation on mouse move
        letters.forEach((letter, i) => {
            const offset = (i - letters.length / 2) * 2;
            letter.style.transform = `
                rotateY(${currentX * 3 + offset}deg)
                rotateX(${-currentY * 2}deg)
            `;
        });

        rafId = requestAnimationFrame(animate);
    }

    // Only run animation when hero is visible
    if ('IntersectionObserver' in window && hero) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isActive = true;
                    if (!rafId) animate();
                } else {
                    isActive = false;
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                }
            });
        }, { rootMargin: '100px 0px' });
        observer.observe(hero);
    }

    animate();
}

// Classic hero animation (fallback)
function initHeroClassic() {
    const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: 'power4.out' }
    });

    tl
        .to('.hero-kicker', {
            opacity: 1,
            y: 0,
            duration: 1
        })
        .to('.title-word', {
            y: 0,
            duration: 1.2,
            stagger: 0.1
        }, '-=0.6')
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.8')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.6')
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
        .to('.audio-pill', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        .to('.hero-scroll', {
            opacity: 1,
            duration: 1
        }, '-=0.4')
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
        const isOpen = mobileMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
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
            navToggle.setAttribute('aria-expanded', 'false');
            if (lenis) lenis.start();
        });
    });
}

/* ========================================
   Active Navigation State
   ======================================== */
function initActiveNavState() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-link[href^="#"]'));
    if (!navLinks.length) return;

    const setActive = (id) => {
        const hash = `#${id}`;
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
        mobileLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    };

    const sections = navLinks
        .map((link) => {
            const target = document.querySelector(link.getAttribute('href'));
            return target ? { id: target.id, target } : null;
        })
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        let best = null;
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
                best = entry;
            }
        });
        if (best && best.target.id) {
            setActive(best.target.id);
        }
    }, {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.35, 0.55, 0.75]
    });

    sections.forEach(({ target }) => observer.observe(target));
}

/* ========================================
   Section Mood System
   ======================================== */
function initSectionMoodSystem() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const moods = {
        hero: ['rgba(255, 108, 24, 0.2)', 'rgba(255, 190, 86, 0.12)'],
        about: ['rgba(255, 160, 92, 0.18)', 'rgba(255, 235, 158, 0.1)'],
        experience: ['rgba(255, 120, 50, 0.2)', 'rgba(220, 170, 62, 0.12)'],
        skills: ['rgba(255, 142, 64, 0.18)', 'rgba(125, 255, 179, 0.08)'],
        projects: ['rgba(255, 118, 42, 0.2)', 'rgba(255, 208, 119, 0.1)'],
        trimatic: ['rgba(255, 94, 0, 0.2)', 'rgba(255, 191, 91, 0.13)'],
        education: ['rgba(255, 130, 60, 0.17)', 'rgba(0, 255, 136, 0.08)'],
        achievements: ['rgba(255, 114, 40, 0.2)', 'rgba(100, 150, 255, 0.11)'],
        beyond: ['rgba(255, 104, 28, 0.2)', 'rgba(255, 190, 86, 0.12)'],
        contact: ['rgba(255, 106, 38, 0.18)', 'rgba(255, 218, 132, 0.12)']
    };

    const sections = [
        'hero',
        'about',
        'experience',
        'skills',
        'projects',
        'trimatic',
        'education',
        'achievements',
        'beyond',
        'contact'
    ];

    const root = document.documentElement;
    const setMood = (key) => {
        const values = moods[key];
        if (!values) return;
        gsap.to(root, {
            '--mood-a': values[0],
            '--mood-b': values[1],
            duration: 0.8,
            overwrite: true,
            ease: 'power2.out'
        });
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;
        const key = visible[0].target.dataset.mood;
        setMood(key);
    }, {
        rootMargin: '-30% 0px -35% 0px',
        threshold: [0.2, 0.5, 0.8]
    });

    sections.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        section.dataset.mood = id;
        observer.observe(section);
    });
}

/* ========================================
   Project Card Motion
   ======================================== */
function initProjectCardMotion() {
    if (prefersReducedMotion || window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
        let rect;
        let rafId = null;
        let pointerX = 0;
        let pointerY = 0;

        const update = () => {
            if (!rect) {
                rafId = null;
                return;
            }

            const x = pointerX - rect.left;
            const y = pointerY - rect.top;
            const dx = (x / rect.width) - 0.5;
            const dy = (y / rect.height) - 0.5;

            card.style.setProperty('--card-tilt-x', `${(-dy * 7).toFixed(2)}deg`);
            card.style.setProperty('--card-tilt-y', `${(dx * 9).toFixed(2)}deg`);
            card.style.setProperty('--spot-x', `${x.toFixed(1)}px`);
            card.style.setProperty('--spot-y', `${y.toFixed(1)}px`);
            rafId = null;
        };

        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
            card.classList.add('card-motion');
        });

        card.addEventListener('mousemove', (event) => {
            if (!rect) rect = card.getBoundingClientRect();
            pointerX = event.clientX;
            pointerY = event.clientY;

            if (!rafId) {
                rafId = requestAnimationFrame(update);
            }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            rect = null;
            card.classList.remove('card-motion');
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            card.style.setProperty('--card-tilt-x', '0deg');
            card.style.setProperty('--card-tilt-y', '0deg');
            card.style.setProperty('--spot-x', '50%');
            card.style.setProperty('--spot-y', '50%');
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

    // Headline words animation
    const headlineWords = document.querySelectorAll('.headline-word');
    if (headlineWords.length) {
        gsap.to(headlineWords, {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.about-headline',
                start: 'top 80%'
            },
            onComplete: () => {
                headlineWords.forEach(w => w.classList.add('revealed'));
            }
        });
    }

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

    // Section transition line animation
    const transitionLine = document.querySelector('.about .transition-line');
    if (transitionLine) {
        gsap.to(transitionLine, {
            scaleX: 1,
            opacity: 0.5,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about',
                start: 'bottom 80%',
                end: 'bottom 30%',
                scrub: 1
            }
        });
    }
}

// Initialize section transitions globally
function initSectionTransitions() {
    const transitions = document.querySelectorAll('.section-transition .transition-line');

    transitions.forEach(line => {
        gsap.fromTo(line,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: line.closest('section'),
                    start: 'bottom 70%',
                    end: 'bottom 20%',
                    scrub: 1
                }
            }
        );
    });
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

    if (window.matchMedia('(max-width: 768px)').matches) {
        gsap.fromTo('.orbit-tag',
            { y: 18, opacity: 0, scale: 0.94 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.45,
                stagger: 0.03,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.skills-constellation',
                    start: 'top 82%',
                    once: true
                }
            }
        );

        document.querySelectorAll('.orbit-tag').forEach((tag) => {
            tag.addEventListener('touchstart', () => {
                tag.classList.add('tag-tap');
                setTimeout(() => tag.classList.remove('tag-tap'), 380);
            }, { passive: true });
        });
    }

    initSkillConstellation();
}

/* ========================================
   Skills Constellation Placement
   ======================================== */
function initSkillConstellation() {
    const orbits = document.querySelectorAll('.orbit');
    if (!orbits.length) return;

    if (window.innerWidth < 768) {
        initMobileSkillTicker(orbits);
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

    resetMobileSkillTicker(orbits);

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

function initMobileSkillTicker(orbits) {
    // On mobile, skills animate as horizontal scrolling ticker lanes
    orbits.forEach((orbit, index) => {
        let track = orbit.querySelector('.orbit-track');

        if (!track) {
            track = document.createElement('div');
            track.className = 'orbit-track';
            const directTags = Array.from(orbit.querySelectorAll(':scope > .orbit-tag'));
            directTags.forEach((tag) => track.appendChild(tag));
            orbit.appendChild(track);
        }

        // Remove any existing clones
        track.querySelectorAll('[data-dup="true"]').forEach((dup) => dup.remove());

        const baseTags = Array.from(track.querySelectorAll('.orbit-tag:not([data-dup])'));
        if (!baseTags.length) return;

        // Clone tags enough times to fill the track width
        const minTrackWidth = Math.max(orbit.clientWidth * 2.5, 800);
        let safety = 0;

        while (track.scrollWidth < minTrackWidth && safety < 8) {
            baseTags.forEach((tag) => {
                const clone = tag.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('data-dup', 'true');
                track.appendChild(clone);
            });
            safety += 1;
        }

        // Add one more cycle for seamless loop
        baseTags.forEach((tag) => {
            const clone = tag.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('data-dup', 'true');
            track.appendChild(clone);
        });

        track.dataset.cloned = 'true';

        // Mark as mobile ticker and set animation properties
        orbit.classList.add('mobile-ticker');
        orbit.style.setProperty('--lane-speed', `${22 + index * 6}s`);
        orbit.style.setProperty('--lane-direction', index % 2 === 0 ? 'normal' : 'reverse');

        // Calculate lane distance for seamless loop
        requestAnimationFrame(() => {
            const baseWidth = baseTags.reduce((sum, tag) => {
                return sum + tag.getBoundingClientRect().width + 16; // 16px = 1rem gap
            }, 0);
            orbit.style.setProperty('--lane-distance', `${baseWidth}px`);
        });
    });
}

function resetMobileSkillTicker(orbits) {
    orbits.forEach((orbit) => {
        orbit.classList.remove('mobile-ticker');
        orbit.style.removeProperty('--lane-speed');
        orbit.style.removeProperty('--lane-direction');
        orbit.style.removeProperty('--lane-distance');

        const track = orbit.querySelector('.orbit-track');
        if (track) {
            track.querySelectorAll('[data-dup="true"]').forEach((dup) => dup.remove());
            track.dataset.cloned = 'false';
        }
    });
}

/* ========================================
   Projects Section
   ======================================== */
let horizontalScrollTrigger = null;

function initProjectsSection() {
    const projectsContainer = document.querySelector('.projects-horizontal');
    const isHorizontal = projectsContainer;

    if (isHorizontal && window.innerWidth > 768) {
        projectsContainer.classList.remove('mobile-vertical');
        initHorizontalProjects();
    } else {
        // Kill any existing horizontal scroll trigger on mobile
        if (horizontalScrollTrigger) {
            horizontalScrollTrigger.kill();
            horizontalScrollTrigger = null;
        }
        if (projectsContainer) {
            projectsContainer.classList.add('mobile-vertical');
            // Clear GSAP transforms on track
            const track = projectsContainer.querySelector('.projects-track');
            if (track) {
                gsap.set(track, { clearProps: 'all' });
            }
        }
        initVerticalProjects();
    }
}

function initHorizontalProjects() {
    const track = document.querySelector('.projects-track');
    const slides = document.querySelectorAll('.project-slide');
    const progressFill = document.querySelector('.progress-fill');
    const progressCurrent = document.querySelector('.progress-current');
    const container = document.querySelector('.projects-track-container');

    if (!track || !container || slides.length === 0) return;

    const contentSlides = Array.from(slides).filter((slide) => !slide.classList.contains('end-card'));

    const getTrackMetrics = () => {
        const containerWidth = container.clientWidth;
        const firstSlide = slides[0];
        const firstSlideWidth = firstSlide
            ? firstSlide.getBoundingClientRect().width
            : Math.min(650, window.innerWidth * 0.8);

        const edgePadding = Math.max((containerWidth - firstSlideWidth) / 2, 24);
        track.style.paddingLeft = `${edgePadding}px`;
        track.style.paddingRight = `${edgePadding}px`;

        const distance = Math.max(track.scrollWidth - containerWidth, 0);
        return { distance };
    };

    // Prime dimensions before creating ScrollTrigger
    getTrackMetrics();

    // Kill existing trigger if any
    if (horizontalScrollTrigger) {
        horizontalScrollTrigger.kill();
        horizontalScrollTrigger = null;
    }

    // Create horizontal scroll animation with pinning
    const horizontalScroll = gsap.to(track, {
        x: () => -getTrackMetrics().distance,
        ease: 'none',
        scrollTrigger: {
            trigger: '.projects-track-container',
            start: 'top top',
            end: () => `+=${getTrackMetrics().distance}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
                gsap.set(track, { x: 0 });
                getTrackMetrics();
            },
            onUpdate: (self) => {
                // Update progress bar
                if (progressFill) {
                    gsap.set(progressFill, { scaleX: self.progress });
                }

                // Update slide counter
                const totalSlides = contentSlides.length;
                const activeIndex = Math.min(
                    Math.floor(self.progress * totalSlides) + 1,
                    totalSlides
                );

                if (progressCurrent) {
                    progressCurrent.textContent = String(activeIndex).padStart(2, '0');
                }

                // Highlight active slide
                slides.forEach((slide, i) => {
                    const isActive = i === activeIndex - 1;
                    slide.classList.toggle('is-active', isActive);
                });
            }
        }
    });

    // Store reference to kill on mobile/resize
    horizontalScrollTrigger = horizontalScroll.scrollTrigger;

    // Animate slide content as they come into view
    slides.forEach((slide, i) => {
        if (slide.classList.contains('end-card')) return;

        const info = slide.querySelector('.slide-info');
        const image = slide.querySelector('.slide-image img');

        if (info) {
            gsap.fromTo(info,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: slide,
                        containerAnimation: horizontalScroll,
                        start: 'left 80%',
                        end: 'left 50%',
                        scrub: 1
                    }
                }
            );
        }

        // Parallax on slide images
        if (image) {
            gsap.to(image, {
                x: 50,
                ease: 'none',
                scrollTrigger: {
                    trigger: slide,
                    containerAnimation: horizontalScroll,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                }
            });
        }
    });

    // Intro animation
    gsap.fromTo('.projects-intro',
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.projects-horizontal',
                start: 'top 80%'
            }
        }
    );
}

function initVerticalProjects() {
    // Fallback for mobile - simple staggered reveal
    const slides = document.querySelectorAll('.project-slide');

    gsap.fromTo(slides,
        { y: 80, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '.projects-horizontal, .projects',
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
   Magnetic Buttons
   ======================================== */
function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;
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
            // Support both old .project-card and new .project-slide
            const card = btn.closest('.project-slide') || btn.closest('.project-card');
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
    if (window.matchMedia('(hover: none)').matches) return;
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

            const target = document.querySelector(href);

            if (!target) return;

            e.preventDefault();

            if (lenis) {
                lenis.scrollTo(target, {
                    offset: -100,
                    duration: 1.5
                });
                return;
            }

            const top = target.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: 'smooth' });
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
    initActiveNavState();
    initSmoothScroll();
    initMagneticButtons();
    initSectionMoodSystem();
    initSpotlightHover();
    initBackToTop();
    initCaseStudyModal();
    initProjectCardMotion();

    // Start preloader
    initPreloader();

    // Safety timeout: if preloader hasn't finished in 8s, force-show content
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            document.getElementById('main')?.classList.add('visible');
            if (window.lenis) window.lenis.start();
            // Also trigger hero animation if it didn't run
            initHeroAnimation();
        }
    }, 8000);

    // Section animations (will trigger on scroll)
    initSectionHeaders();
    initAboutSection();
    initExperienceSection();
    initSkillsSection();
    initProjectsSection();
    initTrimaticSection();
    initAchievementsSection();
    initCertificateLightbox();
    initFloatingCertPreview();
    initBeyondLogicSection();
    initContactSection();
    initSectionTransitions();

    // Scroll-driven effects
    initAllScrollEffects();
});

/* ========================================
   Beyond Logic Section
   ======================================== */
function initBeyondLogicSection() {
    const beyond = document.querySelector('.beyond-logic');
    if (!beyond) return;

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

// Scroll effects are initialized once in the main DOMContentLoaded handler above
// (Removed duplicate DOMContentLoaded listener)

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    const noiseLayer = document.querySelector('.noise-layer');

    if (document.hidden) {
        if (lenis) lenis.stop();
        if (noiseLayer) noiseLayer.classList.add('paused');
        // Pause all particle systems when page is hidden
        particleSystems.forEach(system => system.stop());
    } else {
        if (lenis && document.querySelector('.preloader.hidden')) {
            lenis.start();
        }
        if (noiseLayer) noiseLayer.classList.remove('paused');
        // Resume particle systems when page becomes visible
        // (IntersectionObserver will re-check visibility on next scroll)
    }
});

// Refresh ScrollTrigger on resize (debounced to avoid excessive recalc)
let resizeTimer = null;
let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const crossedBreakpoint = (lastWidth > 768 && currentWidth <= 768) ||
                                   (lastWidth <= 768 && currentWidth > 768);

        if (crossedBreakpoint) {
            // Reinitialize projects section when crossing mobile/desktop breakpoint
            initProjectsSection();
        }

        ScrollTrigger.refresh();
        initSkillConstellation();
        lastWidth = currentWidth;
    }, 250);
});

/* ========================================
   ULTRA MODERN ENHANCEMENTS
   Advanced JavaScript Interactions
   ======================================== */

/* ========================================
   3D Card Tilt Effect
   ======================================== */
function init3DTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
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

/* initTextScramble disabled — innerHTML manipulation on hero title words
   conflicts with GSAP entrance animation causing visual fighting */
function initTextScramble() { /* disabled for performance */ }

/* ========================================
   Particle Trail System
   ======================================== */
/* initParticleTrail removed — DOM element creation on every mouse move
   causes GC pressure and layout thrashing, major source of jitter */
function initParticleTrail() { /* disabled for performance */ }

/* ========================================
   Cursor Trail Effect
   ======================================== */
/* initCursorTrail removed — same DOM thrashing issue as particle trail.
   Custom cursor already provides visual feedback. */
function initCursorTrail() { /* disabled for performance */ }

/* ========================================
   Advanced Particle System
   ======================================== */
// Global array to track particle systems for visibility pausing
const particleSystems = [];

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.particles = [];
        this.particleCount = options.count || 50;
        this.particleSize = options.size || 2;
        this.particleColor = options.color || 'rgba(255, 107, 0, 0.6)';
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
                    this.ctx.strokeStyle = `rgba(255, 107, 0, ${0.2 * (1 - distance / 100)})`;
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
            count: 30,
            size: 2,
            speed: 0.3
        });
        particleSystems.push(heroSystem);
        bindVisibility(heroParticles, heroSystem);
    }

    if (beyondParticles) {
        const beyondSystem = new ParticleSystem(beyondParticles, {
            count: 20,
            size: 1.5,
            speed: 0.4
        });
        particleSystems.push(beyondSystem);
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
    if (window.matchMedia('(hover: none)').matches) return;
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
    let isHovering = false;

    const animate = () => {
        if (!isActive || !isHovering) {
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
        if (isActive && isHovering && !rafId) {
            rafId = requestAnimationFrame(animate);
        } else if (!isActive && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };

    // Only animate when mouse is over hero
    hero.addEventListener('mouseenter', () => {
        isHovering = true;
        if (isActive && !rafId && !prefersReducedMotion) {
            rafId = requestAnimationFrame(animate);
        }
    });

    hero.addEventListener('mouseleave', () => {
        isHovering = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => setActive(entry.isIntersecting));
        }, { rootMargin: '200px 0px' });
        observer.observe(hero);
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
/* enhanceMagneticElements disabled — duplicates initMagneticButtons + initCustomCursor magnetic handling */
function enhanceMagneticElements() { /* already handled by initMagneticButtons and initCustomCursor */ }

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
            // Avoid duplicate ripples when creative.js ripple effect is active.
            if (this.classList.contains('ripple-container')) return;

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

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
/* initEnhancedScrollAnimations removed — generic section fade-in
   conflicts with specific GSAP section animations causing double animation */
function initEnhancedScrollAnimations() { /* disabled — conflicts with section-specific animations */ }

/* ========================================
   Image Hover Distortion
   ======================================== */
/* initImageDistortion disabled — conflicts with CSS hover scale on project images.
   Both set .project-image img transform causing jitter. CSS handles zoom. */
function initImageDistortion() { /* disabled for performance */ }

/* ========================================
   Initialize All Modern Effects
   ======================================== */
function initModernEffects() {
    if (window.__portfolioModernEffectsInitialized) return;
    window.__portfolioModernEffectsInitialized = true;

    init3DTilt();
    initParticleTrail();
    initParticleSystems();
    animateCounters();
    initSmoothReveal();
    initDynamicBackground();
    enhanceMagneticElements();
    initParallaxImages();
    initLiquidButtons();
    initEnhancedScrollAnimations();
    initImageDistortion();

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
    if (window.__portfolioFloatingCertPreviewInitialized) return;
    window.__portfolioFloatingCertPreviewInitialized = true;

    const supportsHover = !window.matchMedia('(hover: none)').matches;
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
        let spotlight = card.querySelector('.cert-spotlight-reveal');
        if (!spotlight) {
            spotlight = document.createElement('div');
            spotlight.className = 'cert-spotlight-reveal';
            card.appendChild(spotlight);
        }

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
                    rgba(255, 107, 0, 0.12) 0%,
                    rgba(255, 107, 0, 0.08) 150px,
                    rgba(255, 107, 0, 0.04) 250px,
                    transparent 400px
                ),
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(230, 196, 64, 0.06) 0%,
                    rgba(230, 196, 64, 0.03) 200px,
                    transparent 350px
                )
            `;

            spotlight.style.boxShadow = `
                inset 0 0 150px rgba(255, 107, 0, 0.08),
                inset 0 0 80px rgba(230, 196, 64, 0.05)
            `;
            rafId = null;
        };

        if (supportsHover) {
            // Track mouse movement only on hover-capable devices.
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
        }
    });

    // Add CSS for background images
    if (!document.getElementById('cert-preview-bg-style')) {
        const style = document.createElement('style');
        style.id = 'cert-preview-bg-style';
        style.textContent = `
            .cert-card::after,
            .award-card::after,
            .timeline-content::after {
                background-image: var(--cert-bg-image);
            }
        `;
        document.head.appendChild(style);
    }

}

/* ========================================
   Certificate Lightbox
   ======================================== */
function initCertificateLightbox() {
    if (window.__portfolioCertLightboxInitialized) return;
    window.__portfolioCertLightboxInitialized = true;

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

    const isMobileTimeline = window.matchMedia('(max-width: 1024px)').matches;

    // Path draw + rocket travel synced to scroll
    if (isMobileTimeline) {
        gsap.set('.journey-path', { scaleY: 0, transformOrigin: 'center top' });
        gsap.set('.rocket-ship', {
            left: '50%',
            top: '8%',
            xPercent: -50,
            yPercent: -50,
            rotate: 90
        });

        gsap.timeline({
            scrollTrigger: {
                trigger: '.education-journey-section',
                start: 'top 70%',
                end: 'bottom 25%',
                scrub: 1
            }
        })
            .to('.journey-path', { scaleY: 1, duration: 1, ease: 'none' }, 0)
            .to('.rocket-ship', { top: '92%', rotate: 90, duration: 1, ease: 'none' }, 0);
    } else {
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
    }

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
