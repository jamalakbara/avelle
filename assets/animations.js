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
