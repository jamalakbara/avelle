/**
 * Awwwards-Worthy Animations
 * Stack: Lenis (Smooth Scroll) + GSAP (ScrollTrigger)
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // 3. Global Reveal Animations
    initRevealAnimations();

    // 4. Collection-Specific Animations
    initCollectionAnimations();
});

function initRevealAnimations() {
    // Text Reveal (Slide up with clip-path)
    const splitTypes = document.querySelectorAll('.reveal-text');

    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, { types: 'chars,words' });

        gsap.from(text.chars, {
            scrollTrigger: {
                trigger: char,
                start: 'top 80%',
                end: 'top 20%',
                scrub: false,
                markers: false
            },
            y: 100,
            opacity: 0,
            stagger: 0.02,
            duration: 1,
            ease: 'power4.out',
            onComplete: () => {
                // Optional cleanup or callback
            }
        });
    });

    // Image Parallax
    const parallaxImages = document.querySelectorAll('[data-parallax]');
    parallaxImages.forEach(img => {
        gsap.to(img, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
    // Generic Fade Up
    const fadeElements = document.querySelectorAll('.reveal-up');
    fadeElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Hero Specific Parallax (Smoother, subtle)
    const heroParallax = document.querySelectorAll('[data-parallax-hero]');
    heroParallax.forEach(bg => {
        gsap.to(bg, {
            yPercent: 15, // Move DOWN slightly to create depth (background moves slower than foreground)
            ease: "none",
            scrollTrigger: {
                trigger: bg.parentElement, // Trigger based on section
                start: "top top", // Start when section top is at viewport top
                end: "bottom top",
                scrub: true
            }
        });
    });
}

/**
 * Collection-Specific Animations
 */
function initCollectionAnimations() {
    initCollectionHeroAnimation();
    initCollectionGridStagger();
    initMagneticCards();
    initCardParallax();
}

/**
 * Collection Hero Banner Animation
 */
function initCollectionHeroAnimation() {
    const hero = document.querySelector('[data-collection-hero]');
    if (!hero) return;

    // Mark hero as visible for CSS transitions
    gsap.to(hero, {
        scrollTrigger: {
            trigger: hero,
            start: 'top 80%',
            onEnter: () => hero.classList.add('is-visible'),
            once: true
        }
    });
}

/**
 * Staggered Product Grid Reveal
 */
function initCollectionGridStagger() {
    const cards = document.querySelectorAll('.collection-product-card');
    if (cards.length === 0) return;

    cards.forEach((card, index) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                onEnter: () => {
                    setTimeout(() => {
                        card.classList.add('is-revealed');
                    }, index * 50); // Stagger by 50ms per card
                },
                once: true
            }
        });
    });
}

/**
 * Magnetic Cursor Effect for Product Cards
 * Cards subtly follow cursor movement
 */
function initMagneticCards() {
    // Only run on devices with hover capability and no motion preference
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.collection-product-card[data-magnetic]');

    cards.forEach(card => {
        const strength = 20; // Maximum movement in pixels

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const moveX = (x / rect.width) * strength;
            const moveY = (y / rect.height) * strength;

            gsap.to(card, {
                x: moveX,
                y: moveY,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

/**
 * Parallax Effect Inside Product Cards
 * Product images move subtly within their containers on scroll
 */
function initCardParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const images = document.querySelectorAll('.collection-product-card__image[data-card-parallax]');

    images.forEach(img => {
        gsap.to(img, {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.collection-product-card'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}
