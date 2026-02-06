/* ==========================================
   AR TECHNOCODE - INTERACTIVE SCRIPTS
   Neural Background + Simulator + Animations
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNeuralBackground();
    initCounterAnimations();
    initScrollAnimations();
    initSimulator();
});

/* ==========================================
   NEURAL NETWORK BACKGROUND
   ========================================== */
function initNeuralBackground() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        const maxDistance = 150;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener('resize', () => {
        resize();
        init();
    });
}

/* ==========================================
   COUNTER ANIMATIONS
   ========================================== */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * easeOut);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ==========================================
   SCROLL ANIMATIONS
   ========================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-header, .problem-card, .feature-card, .sector-card, .flow-step'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/* ==========================================
   SIMULATOR - ION VS HUMAN
   ========================================== */
function initSimulator() {
    const startBtn = document.getElementById('startSimulation');
    const resetBtn = document.getElementById('resetSimulation');

    if (!startBtn || !resetBtn) return;

    let ionTimer = 0;
    let humanTimer = 0;
    let ionInterval, humanInterval;
    let simulationRunning = false;

    const ionMessages = document.getElementById('ionMessages');
    const humanMessages = document.getElementById('humanMessages');
    const ionTimerEl = document.getElementById('ionTimer');
    const humanTimerEl = document.getElementById('humanTimer');
    const ionResult = document.getElementById('ionResult');
    const humanResult = document.getElementById('humanResult');

    const timeDifferenceEl = document.getElementById('timeDifference');
    const ionSummaryEl = document.getElementById('ionSummary');
    const humanSummaryEl = document.getElementById('humanSummary');

    const conversationFlow = {
        customer: [
            "Hola, quisiera información sobre sus servicios de limpieza dental",
            "¿Tienen disponibilidad para esta semana?",
            "Perfecto, ¿el jueves a las 3pm está disponible?",
            "Sí, agéndame por favor. Mi nombre es María González."
        ],
        ion: [
            "¡Hola María! 👋 Bienvenida a nuestra clínica. Ofrecemos limpieza dental profesional con tecnología ultrasónica. El procedimiento dura 45 minutos y tiene un costo de $85. ¿Le gustaría agendar una cita?",
            "¡Claro! Tenemos excelente disponibilidad. Le muestro los horarios: Martes 10am, Miércoles 2pm, Jueves 3pm y Viernes 11am. ¿Cuál le conviene mejor?",
            "¡Excelente elección! Jueves 3pm está disponible. ¿Me confirma su nombre completo para reservar?",
            "✅ ¡Listo María! Su cita está confirmada para el Jueves a las 3:00 PM. Le enviaré un recordatorio 24 horas antes. ¡La esperamos!"
        ],
        human: [
            "Hola, gracias por contactarnos...",
            "..." // Never responds more
        ]
    };

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function addMessage(container, text, type) {
        // Remove placeholder if exists
        const placeholder = container.querySelector('.message-placeholder');
        if (placeholder) placeholder.remove();

        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function startSimulation() {
        if (simulationRunning) return;
        simulationRunning = true;
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="btn-icon">⏳</span> Simulando...';

        // Reset
        ionMessages.innerHTML = '<div class="message-placeholder"><span>Esperando mensaje del cliente...</span></div>';
        humanMessages.innerHTML = '<div class="message-placeholder"><span>Esperando mensaje del cliente...</span></div>';
        ionTimer = 0;
        humanTimer = 0;
        ionResult.classList.remove('show');
        humanResult.classList.remove('show');

        // Start both timers
        ionInterval = setInterval(() => {
            ionTimer++;
            ionTimerEl.textContent = formatTime(ionTimer);
        }, 1000);

        humanInterval = setInterval(() => {
            humanTimer++;
            humanTimerEl.textContent = formatTime(humanTimer);
        }, 1000);

        // Simulate ION conversation (fast responses)
        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.customer[0], 'incoming');
        }, 1000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.ion[0], 'outgoing');
        }, 4000); // 3 second response

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.customer[1], 'incoming');
        }, 7000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.ion[1], 'outgoing');
        }, 10000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.customer[2], 'incoming');
        }, 13000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.ion[2], 'outgoing');
        }, 16000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.customer[3], 'incoming');
        }, 19000);

        setTimeout(() => {
            addMessage(ionMessages, conversationFlow.ion[3], 'outgoing');
            clearInterval(ionInterval);
            ionResult.classList.add('show');
        }, 22000);

        // Simulate Human conversation (slow/no response)
        setTimeout(() => {
            addMessage(humanMessages, conversationFlow.customer[0], 'incoming');
        }, 1000);

        // Human takes way longer or doesn't respond
        setTimeout(() => {
            const waitingMsg = document.createElement('div');
            waitingMsg.className = 'message incoming typing';
            waitingMsg.innerHTML = '⏰ <em>Sin respuesta...</em>';
            waitingMsg.style.opacity = '0.5';
            humanMessages.appendChild(waitingMsg);
        }, 15000);

        // End simulation after showing the difference
        setTimeout(() => {
            clearInterval(humanInterval);
            humanResult.classList.add('show');

            // Update summary
            const diff = humanTimer - (ionTimer || 22);
            timeDifferenceEl.textContent = `${Math.floor(diff / 60)} min ${diff % 60} seg`;
            ionSummaryEl.textContent = '✓ Cita agendada en 22 seg';
            humanSummaryEl.textContent = '✗ Cliente abandonó';

            simulationRunning = false;
            startBtn.disabled = false;
            startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Simulación';
        }, 30000);
    }

    function resetSimulation() {
        clearInterval(ionInterval);
        clearInterval(humanInterval);
        simulationRunning = false;

        ionTimer = 0;
        humanTimer = 0;
        ionTimerEl.textContent = '00:00';
        humanTimerEl.textContent = '00:00';

        ionMessages.innerHTML = '<div class="message-placeholder"><span>Esperando mensaje del cliente...</span></div>';
        humanMessages.innerHTML = '<div class="message-placeholder"><span>Esperando mensaje del cliente...</span></div>';

        ionResult.classList.remove('show');
        humanResult.classList.remove('show');

        timeDifferenceEl.textContent = '—';
        ionSummaryEl.textContent = '—';
        humanSummaryEl.textContent = '—';

        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">▶️</span> Iniciar Simulación';
    }

    startBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);
}

/* ==========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ==========================================
   PRE-QUALIFICATION FORM HANDLER
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const qualificationForm = document.getElementById('qualificationForm');
    const prequalForm = document.getElementById('prequalForm');
    const calendarContainer = document.getElementById('calendarContainer');

    if (qualificationForm && prequalForm && calendarContainer) {
        qualificationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(qualificationForm);
            const data = Object.fromEntries(formData.entries());

            // Log the lead (in production, you'd send this to your backend)
            console.log('Lead captured:', data);

            // You could send to a webhook here:
            // fetch('YOUR_WEBHOOK_URL', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });

            // Hide form with animation
            prequalForm.style.opacity = '0';
            prequalForm.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                prequalForm.style.display = 'none';

                // Show calendar
                calendarContainer.style.display = 'block';
                calendarContainer.style.opacity = '0';
                calendarContainer.style.transform = 'translateY(20px)';

                // Trigger animation
                setTimeout(() => {
                    calendarContainer.style.transition = 'all 0.5s ease';
                    calendarContainer.style.opacity = '1';
                    calendarContainer.style.transform = 'translateY(0)';

                    // Scroll to calendar
                    calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }, 400);
        });
    }
});
