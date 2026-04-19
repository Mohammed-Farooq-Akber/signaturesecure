/* ============================================
   SIGNATURE SECURE USA — main.js
   Particles · Custom Cursor · Magnetic Buttons
   AOS · Navbar · Counter · Scroll FX
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── PARTICLE CANVAS ─── */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let W, H;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x    = Math.random() * W;
            this.y    = Math.random() * H;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.alpha  = Math.random() * 0.5 + 0.1;
            this.gold   = Math.random() > 0.6;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.gold
                ? `rgba(201,168,76,${this.alpha})`
                : `rgba(247,245,240,${this.alpha * 0.4})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    // Connect nearby particles with gold lines
    function drawConnections() {
        const maxDist = 100;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist && particles[i].gold && particles[j].gold) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(201,168,76,${0.12 * (1 - dist / maxDist)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    /* ─── CUSTOM CURSOR ─── */
    const cursorGlow = document.getElementById('cursorGlow');
    const cursorDot  = document.getElementById('cursorDot');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
    });

    // Smooth trailing cursor glow
    function animateCursor() {
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top  = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor scale on hoverable elements
    const hoverEls = document.querySelectorAll('a, button, .service-card, .feature-card, .value-card, select, input, textarea');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.width  = '70px';
            cursorGlow.style.height = '70px';
            cursorDot.style.transform = 'translate(-50%,-50%) scale(1.8)';
        });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.width  = '40px';
            cursorGlow.style.height = '40px';
            cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
        });
    });


    /* ─── MAGNETIC BUTTONS ─── */
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });


    /* ─── NAVBAR SCROLL ─── */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });


    /* ─── MOBILE TOGGLE ─── */
    const toggle  = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const spans = toggle.querySelectorAll('span');
        if (navLinks.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
            spans[1].style.opacity   = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
        } else {
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            toggle.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
        });
    });


    /* ─── SMOOTH SCROLL ─── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - offset,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* ─── AOS (Animate On Scroll) ─── */
    const aosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));


    /* ─── FEATURE / SERVICE CARD STAGGER ─── */
    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.feature-card, .service-card');
                cards.forEach((card, i) => {
                    setTimeout(() => {
                        card.style.opacity   = '1';
                        card.style.transform = 'none';
                    }, i * 90);
                });
                gridObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.features-grid, .services-grid').forEach(grid => {
        grid.querySelectorAll('.feature-card, .service-card').forEach(card => {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'opacity 0.7s ease, transform 0.7s ease, border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease';
        });
        gridObserver.observe(grid);
    });


    /* ─── PRICING TABLE ROW STAGGER ─── */
    const tableObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const rows = entry.target.querySelectorAll('tbody tr');
                rows.forEach((row, i) => {
                    row.style.opacity   = '0';
                    row.style.transform = 'translateX(-20px)';
                    row.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s, background 0.25s ease`;
                    setTimeout(() => {
                        row.style.opacity   = '1';
                        row.style.transform = 'translateX(0)';
                    }, 100 + i * 60);
                });
                tableObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const pricingTable = document.querySelector('.pricing-table');
    if (pricingTable) tableObserver.observe(pricingTable);


    /* ─── COUNTER ANIMATION ─── */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.stat-num').forEach(el => {
                    const target = parseInt(el.dataset.target || el.textContent);
                    if (isNaN(target) || target <= 1) return;
                    let current = 0;
                    const duration = 1800;
                    const start = performance.now();
                    function step(ts) {
                        const progress = Math.min((ts - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        current = Math.round(target * eased);
                        el.textContent = current;
                        if (progress < 1) requestAnimationFrame(step);
                        else el.textContent = target;
                    }
                    requestAnimationFrame(step);
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stats-row').forEach(el => counterObserver.observe(el));


    /* ─── HERO SEAL TILT ─── */
    const heroSeal = document.getElementById('heroSeal');
    if (heroSeal) {
        document.addEventListener('mousemove', e => {
            const cx = window.innerWidth  / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            heroSeal.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg)`;
        });
    }


    /* ─── GLITCH TEXT EFFECT ─── */
    const glitchEl = document.querySelector('.glitch');
    if (glitchEl) {
        setInterval(() => {
            if (Math.random() > 0.85) {
                glitchEl.style.textShadow = `${Math.random()*4-2}px 0 rgba(201,168,76,0.8), ${Math.random()*-4+2}px 0 rgba(36,54,96,0.8)`;
                setTimeout(() => { glitchEl.style.textShadow = ''; }, 100);
            }
        }, 2000);
    }


    /* ─── SCROLL PROGRESS LINE ─── */
    const progressLine = document.createElement('div');
    progressLine.style.cssText = `
        position:fixed; top:0; left:0; height:2px; z-index:9999;
        background:linear-gradient(90deg,#c9a84c,#e8c96d);
        transform-origin:left; transform:scaleX(0);
        transition:transform 0.1s ease; pointer-events:none;
        width:100%;
    `;
    document.body.appendChild(progressLine);

    window.addEventListener('scroll', () => {
        const scrollTop  = window.pageYOffset;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const progress   = scrollTop / docHeight;
        progressLine.style.transform = `scaleX(${progress})`;
    });


    /* ─── VALUE CARD HOVER RIPPLE ─── */
    document.querySelectorAll('.value-card, .feature-card').forEach(card => {
        card.addEventListener('click', e => {
            const ripple = document.createElement('div');
            const rect = card.getBoundingClientRect();
            ripple.style.cssText = `
                position:absolute;
                border-radius:50%;
                background:rgba(201,168,76,0.2);
                width:20px; height:20px;
                left:${e.clientX - rect.left - 10}px;
                top:${e.clientY - rect.top - 10}px;
                transform:scale(0);
                animation:rippleOut 0.6s ease forwards;
                pointer-events:none; z-index:10;
            `;
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Inject ripple keyframe
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `@keyframes rippleOut { to { transform:scale(25); opacity:0; } }`;
    document.head.appendChild(rippleStyle);


    /* ─── SECTION REVEAL PARALLAX ─── */
    const sections = document.querySelectorAll('.section');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = rect.top * 0.05;
                const bg = sec.querySelector('.section-bg-texture, .pricing-bg');
                if (bg) bg.style.transform = `translateY(${offset}px)`;
            }
        });
    });

});
