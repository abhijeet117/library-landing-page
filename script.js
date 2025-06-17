document.addEventListener("DOMContentLoaded", () => {

    // Initialize AOS Library
    AOS.init({ once: true, duration: 800, offset: 100 });
    
    // Header/Navigation Logic
    (() => {
        const menuButton = document.querySelector('.mobile-menu-button');
        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.drawer-overlay');
        const closeButton = document.querySelector('.drawer-close-button');
        const sections = document.querySelectorAll('section, footer');
        const desktopNav = document.querySelector('header .nav-links');

        if (!menuButton || !drawer || !overlay || !closeButton || !desktopNav) {
            console.error("Header elements not found, navigation will not work correctly.");
            return;
        }
        
        const mobileNav = desktopNav.cloneNode(true);
        drawer.insertBefore(mobileNav, closeButton.nextSibling);
        const mobileNavLinks = drawer.querySelectorAll('.nav-links a');

        const toggleDrawer = () => {
            drawer.classList.toggle('open');
            overlay.classList.toggle('open');
        };

        menuButton.addEventListener('click', toggleDrawer);
        closeButton.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', toggleDrawer);
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (drawer.classList.contains('open')) {
                    toggleDrawer();
                }
            });
        });
        
        // Navigation highlighting logic
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetId = `#${entry.target.id}`;
                    // Remove active class from all navigation links
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.classList.remove('active');
                    });
                    // Add active class to the link corresponding to the visible section
                    document.querySelectorAll(`.nav-links a[href='${targetId}']`).forEach(link => {
                        link.classList.add('active');
                    });
                }
            });
        }, { 
            root: null,
            // FINAL FIX: This rootMargin creates a horizontal band in the middle of the screen.
            // A section is considered "active" when it crosses this band,
            // which is more reliable for sections of different heights.
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0 
        });

        sections.forEach(section => {
            if (section.id) navObserver.observe(section);
        });
    })();
    
    // Header Animation (Three.js)
    (() => {
        const canvas = document.querySelector('#header-animation');
        if(!canvas) return;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
        camera.position.set(0, 0, 10);
        let particles;
        const particleCount = 200;
        function createParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const color = new THREE.Color('#60a5fa');
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 25;
                positions[i3 + 1] = (Math.random() - 0.5) * 2;
                positions[i3 + 2] = (Math.random() - 0.5) * 10;
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({ color, size: 0.1, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true });
            return new THREE.Points(geometry, material);
        }
        particles = createParticles();
        scene.add(particles);
        function resizeRendererToDisplaySize() {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth, height = canvas.clientHeight;
            if (canvas.width !== width || canvas.height !== height) {
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        }
        let mouseX = 0;
        document.addEventListener('mousemove', (event) => { mouseX = (event.clientX / window.innerWidth) * 2 - 1; }, false);
        function animate(time) {
            time *= 0.0001;
            resizeRendererToDisplaySize();
            camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
            camera.lookAt(scene.position);
            particles.rotation.y = time;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    })();

    // Hero Section Animation (Three.js)
    (() => {
        const canvas = document.querySelector('#hero-animation');
        if(!canvas) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(50);
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const velocities = Array.from({ length: particleCount }, () => ({ x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.05 }));
        for (let i = 0; i < particleCount * 3; i++) { positions[i] = (Math.random() - 0.5) * 100; }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.7 });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        function animateHero() {
            requestAnimationFrame(animateHero);
            const pos = particles.geometry.getAttribute('position');
            for (let i = 0; i < pos.count; i++) {
                let x = pos.getX(i), y = pos.getY(i);
                x += velocities[i].x; y += velocities[i].y;
                if (x > 50 || x < -50) velocities[i].x *= -1;
                if (y > 50 || y < -50) velocities[i].y *= -1;
                pos.setXY(i, x, y);
            }
            pos.needsUpdate = true;
            renderer.render(scene, camera);
        }
        animateHero();
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    })();
    
    // Facilities Section Card Animation & Glow Effect
    (() => {
        const facilityCards = document.querySelectorAll('.facility-card');
        if (!facilityCards.length) return;
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                        entry.target.classList.add('glow-on-scroll');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        facilityCards.forEach(card => { observer.observe(card); });
    })();
    
    // Catalog Section Logic
    (() => {
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        const photoCards = document.querySelectorAll('#catalog .photo-card');
        if (!viewMoreBtn || !photoCards.length) return;

        const initialVisible = 4;

        // Hide cards that are not initially visible
        photoCards.forEach((card, index) => {
            if (index >= initialVisible) {
                card.classList.add('hidden');
            }
        });

        // Observer to animate cards into view when they are visible on screen
        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Animate if the card is intersecting and not marked as hidden
                if (entry.isIntersecting && !entry.target.classList.contains('hidden')) {
                    entry.target.classList.add('is-visible', 'apply-glow');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        // Observe all cards
        photoCards.forEach(card => {
            cardObserver.observe(card);
        });
        
        // Handle the button click to reveal the rest of the cards
        viewMoreBtn.addEventListener('click', () => {
            photoCards.forEach((card, index) => {
                if (index >= initialVisible) {
                    // Removing 'hidden' will allow the observer to trigger the animation
                    card.classList.remove('hidden');
                }
            });
            // Hide the button after it's been used
            viewMoreBtn.style.display = 'none';
        });
    })();
    
    // Optimized Particle Background
    const initParticleBackground = (sectionSelector, canvasSelector) => {
        const canvas = document.querySelector(canvasSelector);
        const section = document.querySelector(sectionSelector);
        if (!canvas || !section) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, section.clientWidth / section.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        
        const setSize = () => {
            const width = section.clientWidth;
            const height = section.clientHeight;
            if(width > 0 && height > 0) {
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };
        setSize();

        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000 * 3; i++) { posArray[i] = (Math.random() - 0.5) * 20; }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particleMesh = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ size: 0.025, color: '#87ceeb', blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 }));
        scene.add(particleMesh);

        const clock = new THREE.Clock();
        let animationFrameId = null;
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            particleMesh.rotation.y = elapsedTime * 0.05;
            particleMesh.rotation.x = elapsedTime * 0.05;
            renderer.render(scene, camera);
            animationFrameId = window.requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(setSize);
        resizeObserver.observe(section);
        
        const intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!animationFrameId) animate();
            } else if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }, { threshold: 0.01 });
        intersectionObserver.observe(section);
    };
    initParticleBackground('#facilities', '#facilities-bg');
    initParticleBackground('#catalog', '#catalog-bg');
    initParticleBackground('#timings', '#timings-bg');
    initParticleBackground('#pricing', '#pricing-bg');
    
    // Team Card animations
    (() => {
        function hexToRgba(hex, alpha) {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
            else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        document.querySelectorAll('.team-member-card').forEach(card => {
            const canvas = card.querySelector('.particle-canvas');
            if (!canvas) return;

            const color = card.dataset.color || '#fde047';
            const textColor = card.dataset.textColor || '#facc15';
            const avatarContainer = card.querySelector('.avatar-container');
            if (avatarContainer) {
                if(avatarContainer.querySelector('img')) { avatarContainer.style.boxShadow = `0 0 25px 5px ${hexToRgba(color, 0.4)}, inset 0 0 15px 2px ${hexToRgba(color, 0.2)}`; } 
                else if (avatarContainer.querySelector('span')) { avatarContainer.style.boxShadow = `0 0 25px 5px ${hexToRgba(color, 0.4)}, inset 0 0 15px 2px ${hexToRgba(color, 0.2)}`; avatarContainer.querySelector('span').style.color = textColor; }
            }
            const pElement = card.querySelector('p');
            if (pElement) pElement.style.color = textColor;
            
            const ctx = canvas.getContext('2d');
            let particles = [];
            let animationFrameId = null;
            
            function Particle(x, y, r, c) { this.x = x; this.y = y; this.radius = r; this.color = c; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; }
            Particle.prototype.draw = function() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); };
            Particle.prototype.update = function() { this.x += this.vx; this.y += this.vy; const s = canvas.width / (window.devicePixelRatio || 1); if (this.x + this.radius > s || this.x - this.radius < 0) this.vx *= -1; if (this.y + this.radius > s || this.y - this.radius < 0) this.vy *= -1; this.draw(); };
            
            function animateParticles() { const s = canvas.width / (window.devicePixelRatio || 1); ctx.clearRect(0, 0, s, s); particles.forEach(p => p.update()); animationFrameId = requestAnimationFrame(animateParticles); }
            function initParticles() { particles = []; const size = canvas.width / (window.devicePixelRatio || 1); for (let i = 0; i < 35; i++) { particles.push(new Particle(Math.random() * size, Math.random() * size, Math.random() * 1.5 + 0.5, hexToRgba(color, 0.8))); } }

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    if (!animationFrameId) {
                        const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr);
                        initParticles();
                        animateParticles();
                    }
                    card.style.boxShadow = `0 0 30px 5px ${hexToRgba(color, 0.2)}`;
                } else {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                }
            }, { threshold: 0.1 });
            observer.observe(card);
        });
    })();
    
    // Footer Dynamic Year
    (() => { const yearSpan = document.getElementById('current-year'); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } })();

    // Developer Connect Button Particle Animation
    (() => {
        const canvas = document.getElementById('dev-btn-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const color = '#90ffb1'; 
        function resizeCanvas() { const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); }
        function Particle(x, y) { this.x = x; this.y = y; this.radius = Math.random() * 1 + 0.5; this.color = color; this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3; }
        Particle.prototype.draw = function() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); };
        Particle.prototype.update = function() { this.x += this.vx; this.y += this.vy; const size = canvas.getBoundingClientRect().width; if (this.x + this.radius > size || this.x - this.radius < 0) this.vx *= -1; if (this.y + this.radius > size || this.y - this.radius < 0) this.vy *= -1; this.draw(); };
        function initParticles() { particles = []; const size = canvas.getBoundingClientRect().width; for (let i = 0; i < 15; i++) { particles.push(new Particle(Math.random() * size, Math.random() * size)); } }
        function animateParticles() { const size = canvas.getBoundingClientRect().width; ctx.clearRect(0, 0, size, size); particles.forEach(p => p.update()); requestAnimationFrame(animateParticles); }
        resizeCanvas(); initParticles(); animateParticles();
        window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
    })();

    // Footer Icon Glow
    (() => {
        const footer = document.getElementById('contact');
        if (!footer) return;
        const iconsToGlow = footer.querySelectorAll('.social-icon, .dev-connect-btn');
        if (!iconsToGlow.length) return;

        const glowObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                iconsToGlow.forEach((icon, index) => {
                    setTimeout(() => {
                        icon.classList.add('is-glowing');
                    }, index * 200);
                });
                observer.unobserve(footer);
            }
        }, { threshold: 0.5 });

        glowObserver.observe(footer);
    })();

});