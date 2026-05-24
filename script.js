/* =========================================
   PORTFOLIO 3D - SCRIPT
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---- GSAP Setup ----
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Lenis Smooth Scroll ----
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // ---- UI Sound Synthesizer ----
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let audioUnlocked = false;

    // Unlock AudioContext on first interaction
    document.body.addEventListener('click', () => {
        if (!audioUnlocked && audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => { audioUnlocked = true; });
        } else {
            audioUnlocked = true;
        }
    }, { once: true });

    function playHoverSound() {
        if (!audioUnlocked) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    function playClickSound() {
        if (!audioUnlocked) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    // Bind sounds to interactive elements
    document.querySelectorAll('a, button, .project-card, .skill-card').forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
        el.addEventListener('click', playClickSound);
    });

    // ---- Magnetic UI Logic ----
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const x = (e.clientX - centerX) * 0.35;
            const y = (e.clientY - centerY) * 0.35;
            gsap.to(el, { x: x, y: y, duration: 0.6, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // ---- Enhanced Cursor with Trail ----
    const canUseEnhancedCursor = window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion;
    
    // Remove old cursor elements if they exist in HTML
    const oldDot = document.getElementById('cursor-dot');
    const oldRing = document.getElementById('cursor-ring');
    if (oldDot) oldDot.remove();
    if (oldRing) oldRing.remove();

    if (canUseEnhancedCursor) {
        const dots = [];
        const numDots = 14;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        // Create dot elements for trail
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'cursor-trail-dot cursor-lead' : 'cursor-trail-dot';
            document.body.appendChild(dot);
            dots.push({ x: mouseX, y: mouseY, el: dot });
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dots[0].el.style.opacity = '1';
        });

        const animateTrail = () => {
            let x = mouseX;
            let y = mouseY;

            dots.forEach((dot, index) => {
                const nextDot = dots[index + 1] || dots[0];
                
                dot.x += (x - dot.x) * (index === 0 ? 1 : 0.45);
                dot.y += (y - dot.y) * (index === 0 ? 1 : 0.45);
                
                dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%) scale(${Math.max(0.1, (numDots - index) / numDots)})`;
                
                if (index !== 0) {
                    dot.el.style.opacity = ((numDots - index) / numDots) * 0.8;
                }
                
                x = dot.x;
                y = dot.y;
            });
            
            requestAnimationFrame(animateTrail);
        };
        animateTrail();

        // Handle hover states for the lead dot
        document.querySelectorAll('a, button, .project-card, .skill-card, .form-input, .magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => {
                dots[0].el.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                dots[0].el.classList.remove('cursor-hover');
            });
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            dots.forEach(dot => dot.el.style.opacity = '0');
        });
        document.addEventListener('mouseenter', () => {
            dots[0].el.style.opacity = '1';
        });
    }

    if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(0.85);
    }

    // Safety fallback: never let preloader trap the page
    window.setTimeout(() => {
        const activePreloader = document.getElementById('preloader');
        if (activePreloader && activePreloader.style.display !== 'none') {
            activePreloader.style.display = 'none';
            startHeroAnimation();
            ScrollTrigger.refresh();
        }
    }, 2200);

    // ---- Preloader ----
    const preloader = document.getElementById('preloader');
    const preloaderTl = gsap.timeline();

    preloaderTl
        .from('.preloader-text', { opacity: 0, y: 15, duration: 0.3, ease: 'power3.out' })
        .from('.preloader-subtext', { opacity: 0, y: 10, duration: 0.2, ease: 'power3.out' }, '-=0.15')
        .to('.preloader-line', { width: '100%', duration: 0.6, ease: 'power3.inOut' })
        .to('.preloader-inner', { scale: 1.5, opacity: 0, filter: 'blur(12px)', duration: 0.35, ease: 'power2.in' })
        .to(preloader, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            yPercent: -10,
            duration: 0.6, ease: 'expo.inOut',
            onComplete: () => { preloader.style.display = 'none'; startHeroAnimation(); }
        }, '-=0.15');

    // ---- Hero Entrance Animation ----
    function startHeroAnimation() {
        gsap.set('.hero-content', { autoAlpha: 1 });
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl
            .from('#hero-tilt', {
                scale: 0.6, opacity: 0, rotateY: 30, rotateX: 15,
                duration: 2, ease: 'power4.out'
            })
            .from('.hero-image-glow', { opacity: 0, scale: 0.5, duration: 1.5 }, '-=1.5')
            .from('.hero-title-word', { y: 60, opacity: 0, duration: 1.2 }, '-=1.2')
            .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8 }, '-=0.8')
            .from('.hero-meta', { opacity: 0, y: 20, duration: 0.6 }, '-=0.6')
            .from('.hero-cta-group', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
            .from('#scroll-indicator', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')
            .call(() => ScrollTrigger.refresh(), null, '+=0.1');
    }

    // Refresh on full load to ensure perfect scroll calculations
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // ---- Hero 3D Mouse Tilt ----
    const heroTilt = document.getElementById('hero-tilt');
    const heroSection = document.getElementById('hero');

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(heroTilt, { rotateY: x * 25, rotateX: -y * 18, duration: 0.8, ease: 'power2.out' });
        gsap.to('.hero-image-glow', { x: x * 50, y: y * 50, duration: 1 });
    });

    heroSection.addEventListener('mouseleave', () => {
        gsap.to(heroTilt, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
    });

    // ---- Hero Text Transition ----
    const transitionWords = ["3D WebGL Experiences", "Award Winning Interfaces", "Interactive Portfolios", "Pixel Perfect Designs"];
    let currentWordIndex = 0;
    const transitionElement = document.getElementById('hero-transition-text');
    
    if (transitionElement) {
        setInterval(() => {
            gsap.to(transitionElement, { opacity: 0, y: -10, duration: 0.4, onComplete: () => {
                currentWordIndex = (currentWordIndex + 1) % transitionWords.length;
                transitionElement.innerText = transitionWords[currentWordIndex];
                gsap.fromTo(transitionElement, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
            }});
        }, 3000);
    }

    // ---- Hero Parallax on Scroll ----
    gsap.to('#hero .hero-content', {
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
        y: -150, opacity: 0, scale: 0.95
    });

    // ---- Universal Scroll Reveals for Sections ----
    // This systematically glides elements upward as they enter the viewport
    document.querySelectorAll('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: { trigger: header, start: 'top 85%' },
            y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
    });

    document.querySelectorAll('.about-text p').forEach((p, index) => {
        gsap.from(p, {
            scrollTrigger: { trigger: p, start: 'top 85%' },
            y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: index * 0.05
        });
    });

    document.querySelectorAll('.stat-card, .skill-card, .project-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 90%' },
            y: 50, opacity: 0, scale: 0.95, duration: 0.7, ease: 'back.out(1.2)'
        });
    });

    // ---- Intersection Observer for Numbers & Progress ----

    // Use IntersectionObserver as a bulletproof way to trigger visibility
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                
                // Trigger skill bars specifically
                if (entry.target.classList.contains('skills-grid')) {
                    document.querySelectorAll('.skill-fill').forEach(bar => {
                        gsap.to(bar, { width: bar.dataset.width + '%', duration: 1.5, ease: 'power2.out', delay: 0.5 });
                    });
                }
                
                // Stat counters
                if (entry.target.classList.contains('about-stats')) {
                    document.querySelectorAll('.stat-number').forEach(el => {
                        const target = parseInt(el.dataset.count);
                        gsap.to(el, { innerText: target, duration: 2, snap: { innerText: 1 }, ease: 'power2.out' });
                    });
                }

                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    // Header parallax
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.fromTo(header, 
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: header, start: 'top 90%' } }
        );
    });

    // Content reveals
    gsap.utils.toArray('.about-text p, .stat-card, .skill-card, .project-card, .contact-text, .contact-form').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: {
                trigger: el, start: 'top 95%'
            }}
        );
    });

    // Observe specific grids for compound logic
    document.querySelectorAll('.skills-grid, .about-stats').forEach(el => revealObserver.observe(el));

    // Project card 3D tilt on hover
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, { rotateY: x * 15, rotateX: -y * 10, scale: 1.03, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // Extra safety refresh for all scroll triggers
    setTimeout(() => ScrollTrigger.refresh(), 1000);
    setTimeout(() => ScrollTrigger.refresh(), 2000);

    // ---- Navbar Scroll Behavior ----
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        navbar.classList.toggle('nav-scrolled', currentScroll > 100);
        navbar.classList.toggle('nav-hidden', currentScroll > lastScroll && currentScroll > 400);
        lastScroll = currentScroll;
    });

    // ---- Smooth Scroll for Nav Links ----
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });



    // ---- Contact Form (dummy) ----
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit');
        btn.innerHTML = '<span>Sent! ✓</span>';
        btn.style.background = '#1a8f4a';
        setTimeout(() => {
            btn.innerHTML = '<span>Send Message</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
            btn.style.background = '';
            e.target.reset();
        }, 2000);
    });

    // ---- About Image Tilt ----
    const aboutTilt = document.getElementById('about-img-tilt');
    if (aboutTilt) {
        aboutTilt.addEventListener('mousemove', (e) => {
            const rect = aboutTilt.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(aboutTilt, { rotateY: x * 20, rotateX: -y * 20, duration: 0.6, ease: 'power2.out' });
        });
        aboutTilt.addEventListener('mouseleave', () => {
            gsap.to(aboutTilt, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
        });
    }

    // ---- Three.js Global Background ----
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'three-canvas-container';
    document.body.prepend(canvasContainer);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    // Objects
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xc41e3a, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    
    // Abstract shapes for different sections
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(12, 3, 100, 16), material);
    torusKnot.position.set(-15, -10, -30);
    scene.add(torusKnot);

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 0), material);
    icosahedron.position.set(15, -35, -40);
    scene.add(icosahedron);
    
    const torus = new THREE.Mesh(new THREE.TorusGeometry(15, 2, 16, 100), material);
    torus.position.set(-20, -65, -50);
    scene.add(torus);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xc41e3a, 2);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 10;

    // Animation Loop
    let clock = new THREE.Clock();
    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);
        const elapsedTime = clock.getElapsedTime();
        
        torusKnot.rotation.x = elapsedTime * 0.2;
        torusKnot.rotation.y = elapsedTime * 0.3;
        
        icosahedron.rotation.x = elapsedTime * 0.1;
        icosahedron.rotation.y = elapsedTime * 0.2;
        
        torus.rotation.x = elapsedTime * 0.15;
        torus.rotation.y = elapsedTime * 0.1;

        renderer.render(scene, camera);
    }
    animateThreeJS();

    // Scroll effect on Camera
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        camera.position.y = -(scrollY * 0.02);
        camera.position.x = Math.sin(scrollY * 0.002) * 5;
    });

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ---- Cybersecurity Modal Logic ----
    const cyberModal = document.getElementById('cybersecurity-modal');
    const openCyberBtn = document.querySelector('.cyber-btn');
    const closeCyberBtn = document.getElementById('close-cyber-modal');
    const cyberScroller = document.getElementById('cyber-scroller');

    function openModal() {
        if (!cyberModal) return;
        cyberModal.classList.add('active');
        if (typeof lenis !== 'undefined') lenis.stop();
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!cyberModal) return;
        cyberModal.classList.remove('active');
        if (typeof lenis !== 'undefined') lenis.start();
        document.body.style.overflow = '';
    }

    if (openCyberBtn) openCyberBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeCyberBtn) closeCyberBtn.addEventListener('click', closeModal);
    
    if (cyberModal) {
        cyberModal.addEventListener('click', (e) => {
            if (!e.target.closest('.glass-panel') && !e.target.closest('.cyber-close-btn')) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cyberModal && cyberModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ---- Professional Form Submission (Web3Forms / AJAX) ----
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent ugly page refresh
            
            const submitBtn = document.getElementById('btn-submit');
            const originalBtnText = submitBtn.innerHTML;
            
            // Visual feedback: Sending state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';
            
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                const result = await response.json();
                
                if (response.status === 200) {
                    // Success state
                    submitBtn.style.background = '#10b981'; // Success green
                    submitBtn.style.borderColor = '#10b981';
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = '<span>Sent Successfully!</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                    contactForm.reset(); // Clear the form
                    
                    // Reset button after 4 seconds
                    setTimeout(() => {
                        submitBtn.style.background = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.style.pointerEvents = 'auto';
                    }, 4000);
                } else {
                    console.error('Form submission failed:', result);
                    submitBtn.innerHTML = '<span>Error. Try Again.</span>';
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                submitBtn.innerHTML = '<span>Network Error.</span>';
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
            }
        });
    }
});
