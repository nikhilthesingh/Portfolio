/* ========================================
   CREATIVE TRANSFORMATION - Portal Experience
   Enhanced animations & unique interactions
   ======================================== */

// ========================================
// 1. CURSOR TRAIL EFFECT
// Performance-optimized cursor wake
// ========================================
function initCursorTrail() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = document.getElementById('cursor-trail-container');
    if (!container) return;

    const trailPool = [];
    const poolSize = 20;
    let trailIndex = 0;
    let lastX = 0, lastY = 0;

    // Pre-create trail elements for performance
    for (let i = 0; i < poolSize; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        container.appendChild(trail);
        trailPool.push(trail);
    }

    function spawnTrail(x, y) {
        const trail = trailPool[trailIndex];
        trailIndex = (trailIndex + 1) % poolSize;

        trail.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        trail.classList.remove('active');

        // Force reflow for animation restart
        void trail.offsetWidth;
        trail.classList.add('active');
    }

    let throttleTimer = null;
    document.addEventListener('mousemove', (e) => {
        if (throttleTimer) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only spawn trail if moved enough distance
        if (distance > 30) {
            lastX = e.clientX;
            lastY = e.clientY;
            spawnTrail(e.clientX, e.clientY);
        }

        throttleTimer = setTimeout(() => {
            throttleTimer = null;
        }, 50);
    }, { passive: true });
}

// ========================================
// 3. SIGNATURE SIGIL FUNCTIONALITY
// Floating brand element
// ========================================
function initSigil() {
    const sigil = document.getElementById('sigil');
    if (!sigil) return;

    // Click to scroll to top
    sigil.addEventListener('click', () => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.5 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Burst effect on click
        createParticleBurst(sigil.getBoundingClientRect());
    });

    // Show/hide based on scroll position
    let sigilVisible = false;
    const toggleSigil = (scrollY) => {
        const shouldShow = scrollY > window.innerHeight;
        if (shouldShow !== sigilVisible) {
            sigilVisible = shouldShow;
            gsap.to(sigil, {
                opacity: shouldShow ? 1 : 0,
                scale: shouldShow ? 1 : 0.8,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    // Initial state
    gsap.set(sigil, { opacity: 0, scale: 0.8 });

    // Listen to scroll
    if (window.lenis) {
        window.lenis.on('scroll', ({ scroll }) => toggleSigil(scroll));
    } else {
        window.addEventListener('scroll', () => toggleSigil(window.scrollY), { passive: true });
    }
}

// ========================================
// 4. ORBITAL PROGRESS INDICATOR
// Creative scroll progress visualization
// ========================================
function initOrbitalProgress() {
    const fill = document.getElementById('progress-fill');
    const dot = document.getElementById('progress-dot');
    const orbital = document.getElementById('progress-orbital');
    if (!fill || !dot || !orbital) return;

    const radius = 25;
    const centerX = 30;
    const centerY = 30;
    const dotSize = 7; // dot width/height
    const circumference = 2 * Math.PI * radius;

    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = circumference;

    // Initial hide
    gsap.set(orbital, { opacity: 0, scale: 0.8 });

    let orbitalVisible = false;
    const updateProgress = (scrollY) => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

        // Update stroke
        const offset = circumference - (progress * circumference);
        fill.style.strokeDashoffset = offset;

        // Update dot position (rotate around circle, starting from top)
        const angle = (progress * 360 - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle) - (dotSize / 2);
        const y = centerY + radius * Math.sin(angle) - (dotSize / 2);
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        // Show/hide orbital
        const shouldShow = scrollY > 200;
        if (shouldShow !== orbitalVisible) {
            orbitalVisible = shouldShow;
            gsap.to(orbital, {
                opacity: shouldShow ? 1 : 0,
                scale: shouldShow ? 1 : 0.8,
                duration: 0.3
            });
        }
    };

    if (window.lenis) {
        window.lenis.on('scroll', ({ scroll }) => updateProgress(scroll));
    } else {
        window.addEventListener('scroll', () => updateProgress(window.scrollY), { passive: true });
    }
}

// ========================================
// 5. PARTICLE BURST EFFECT
// Celebration particles
// ========================================
function createParticleBurst(rect) {
    const burst = document.createElement('div');
    burst.className = 'particle-burst';
    burst.style.left = rect.left + rect.width / 2 + 'px';
    burst.style.top = rect.top + rect.height / 2 + 'px';
    document.body.appendChild(burst);

    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'burst-particle';

        const angle = (i / particleCount) * 360;
        const distance = 50 + Math.random() * 50;
        const tx = Math.cos(angle * Math.PI / 180) * distance;
        const ty = Math.sin(angle * Math.PI / 180) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.backgroundColor = Math.random() > 0.5 ? '#ff6b00' : '#c8a415';

        burst.appendChild(particle);
    }

    // Clean up after animation
    setTimeout(() => burst.remove(), 1000);
}

// ========================================
// 6. SECTION AWARENESS
// Track which section is active
// ========================================
function initSectionAwareness() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                document.body.setAttribute('data-section', entry.target.id);
            }
        });
    }, {
        threshold: [0.3, 0.5, 0.7]
    });

    sections.forEach(section => observer.observe(section));
}

// ========================================
// 7. LIQUID HOVER EFFECT
// Mouse-following hover gradient
// ========================================
function initLiquidHover() {
    const elements = document.querySelectorAll('.liquid-hover, .project-card, .service-card, .about-card');

    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty('--x', x + '%');
            el.style.setProperty('--y', y + '%');
        });
    });
}

// ========================================
// 8. RIPPLE EFFECT ON BUTTONS
// Click ripple animation
// ========================================
function initRippleEffect() {
    const buttons = document.querySelectorAll('.cta-button, .trimatic-btn, .submit-btn, .contact-cta');

    buttons.forEach(btn => {
        btn.classList.add('ripple-container');

        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ========================================
// 9. DIMENSIONAL SECTION TRANSITIONS
// Warp effect between sections
// ========================================
function initDimensionalTransitions() {
    const sections = document.querySelectorAll('.section-warp');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 90%',
            end: 'top 10%',
            onEnter: () => section.classList.add('entering'),
            onLeave: () => section.classList.remove('entering'),
            onEnterBack: () => section.classList.add('entering'),
            onLeaveBack: () => section.classList.remove('entering')
        });
    });
}

// ========================================
// 10. SCROLL-TRIGGERED REVEALS
// Enhanced reveal animations
// ========================================
function initScrollReveals() {
    // Reveal up animation
    const revealUp = document.querySelectorAll('.reveal-up');
    revealUp.forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => el.classList.add('in-view'),
            once: true
        });
    });

    // Stagger children animation
    const staggerGroups = document.querySelectorAll('.stagger-up');
    staggerGroups.forEach(group => {
        ScrollTrigger.create({
            trigger: group,
            start: 'top 85%',
            onEnter: () => group.classList.add('in-view'),
            once: true
        });
    });
}

// ========================================
// 11. EASTER EGG - KONAMI CODE
// Hidden feature activation
// ========================================
function initKonamiCode() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateEasterEgg() {
    // Flash effect
    document.body.classList.add('konami-activated');
    setTimeout(() => document.body.classList.remove('konami-activated'), 500);

    // Create burst from center
    const rect = {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        width: 0,
        height: 0
    };

    for (let i = 0; i < 5; i++) {
        setTimeout(() => createParticleBurst(rect), i * 100);
    }

    // Show secret message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 107, 0, 0.9);
        color: #000;
        padding: 2rem 4rem;
        border-radius: 16px;
        font-family: 'Oswald', sans-serif;
        font-size: 1.5rem;
        text-transform: uppercase;
        z-index: 10000;
        animation: scaleIn 0.3s ease-out;
    `;
    message.textContent = "You found the secret!";
    document.body.appendChild(message);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scaleIn {
            from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        message.style.animation = 'scaleIn 0.3s ease-out reverse';
        setTimeout(() => message.remove(), 300);
    }, 2000);
}

// ========================================
// 12. FLOATING HERO PARTICLES
// Additional depth particles
// ========================================
function createFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';

        gsap.set(particle, {
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            scale: 0.5 + Math.random() * 0.5
        });

        hero.appendChild(particle);

        // Animate floating
        gsap.to(particle, {
            y: -100 - Math.random() * 100,
            x: (Math.random() - 0.5) * 200,
            opacity: 0.8,
            duration: 3 + Math.random() * 2,
            delay: i * 0.2,
            repeat: -1,
            ease: 'power1.inOut',
            yoyo: true
        });

        // Random fade
        gsap.to(particle, {
            opacity: 0.3 + Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

// ========================================
// 13. MAGNETIC CARDS ENHANCEMENT
// Stronger 3D effect on cards
// ========================================
function initMagneticCards() {
    const cards = document.querySelectorAll('.project-card, .service-card, .cert-card, .award-card');
    if (window.matchMedia('(hover: none)').matches) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        });
    });
}

// ========================================
// 14. TEXT SCRAMBLE EFFECT
// Scramble text on hover
// ========================================
class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.originalText = el.textContent;
    }

    scramble() {
        const text = this.originalText;
        let iteration = 0;

        const interval = setInterval(() => {
            this.el.textContent = text
                .split('')
                .map((char, index) => {
                    if (index < iteration) return text[index];
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1/3;
        }, 30);
    }

    reset() {
        this.el.textContent = this.originalText;
    }
}

function initTextScramble() {
    // Only target simple text elements, not titles with nested giant typography
    const elements = document.querySelectorAll('.project-title, .slide-title');

    elements.forEach(el => {
        // Skip elements with complex child elements that would break layout
        if (el.querySelector('span, div')) return;

        const scrambler = new TextScrambler(el);

        el.addEventListener('mouseenter', () => scrambler.scramble());
        el.addEventListener('mouseleave', () => scrambler.reset());
    });
}

// ========================================
// 15. BREATHING ELEMENTS
// Subtle pulsing animation
// ========================================
function initBreathingElements() {
    const elements = document.querySelectorAll('.playground-orb, .identity-core, .sigil-core');
    elements.forEach(el => el.classList.add('breathing'));

    const glowElements = document.querySelectorAll('.marker-dot, .award-dot');
    glowElements.forEach(el => el.classList.add('breathing-glow'));
}

// ========================================
// 16. SMOOTH SECTION SCROLL SNAPPING (Optional)
// Enable via data attribute
// ========================================
function initSectionSnapping() {
    const sections = document.querySelectorAll('[data-snap]');
    if (!sections.length || window.innerWidth < 1024) return;

    sections.forEach(section => {
        section.style.scrollSnapAlign = 'start';
    });

    document.documentElement.style.scrollSnapType = 'y proximity';
}

// ========================================
// INITIALIZE ALL CREATIVE EFFECTS
// ========================================
function initCreativeEffects() {
    if (window.__portfolioCreativeEffectsInitialized) return;
    window.__portfolioCreativeEffectsInitialized = true;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initSigil(); // Keep basic functionality
        initOrbitalProgress();
        initSectionAwareness();
        return;
    }

    // Initialize all effects
    initCursorTrail();
    initSigil();
    initOrbitalProgress();
    initSectionAwareness();
    initLiquidHover();
    initRippleEffect();
    initMagneticCards();
    initDimensionalTransitions();
    initScrollReveals();
    initKonamiCode();
    initBreathingElements();

    // Text scramble can be performance intensive
    // Uncomment if desired:
    // initTextScramble();
}

// Initialize after DOM is ready and main.js has run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Delay to let main.js initialize first
        setTimeout(initCreativeEffects, 100);
    });
} else {
    setTimeout(initCreativeEffects, 100);
}

// Also run some effects after full page load
window.addEventListener('load', () => {
    // Refresh ScrollTrigger with new elements
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});
