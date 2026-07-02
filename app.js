/* BUILDVERSE APPLICATION SCRIPT */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    initFirebase();
    // Initialize systems
    initSPA();
    initCanvasParticles();
    initHeroShowcase();
    initRegistrationWizard();
    initCustomSelects();
    initStatsCounter();
    initCountdownTimer();
    initSeatsSimulation();
    initBillingToggle();

    // Initialize Auth & Router routing
    initAuthRouter();
});

/* ================= HERO INFINITE IMAGE SHOWCASE ================= */
// Single source of truth for the showcase — swap these paths for final
// assets whenever they're ready. Any number of images is supported; the
// track duplicates the set once for a seamless loop and CSS handles both
// the continuous scroll and the center-emphasis scaling.
const HERO_SHOWCASE_IMAGES = [
    { src: 'assets/events/army-1.webp', alt: 'BuildVerse mentor presenting multicopter frame design to Indian Army personnel' },
    { src: 'assets/events/army-2.webp', alt: 'BuildVerse mentor demonstrating drone assembly to Indian Army officers' },
    { src: 'assets/events/army-5.webp', alt: 'Group photo with Indian Army officers after a BuildVerse drone workshop' },
    { src: 'assets/events/bms-event.webp', alt: 'Collage of a BuildVerse workshop event at BMS Institute of Technology' },
    { src: 'assets/events/workshop-2.webp', alt: 'Group photo of BuildVerse workshop attendees outdoors with a drone landing pad' },
    { src: 'assets/events/workshop-5.webp', alt: 'BuildVerse mentor holding a hexacopter drone at a GIS and Drones training program' },
    { src: 'assets/events/workshop-9.webp', alt: 'Students assembling a drone frame together at a BuildVerse workshop' },
    { src: 'assets/events/workshop-10.webp', alt: 'BuildVerse mentor presenting an Introduction to UAV session with a quadcopter' },
    { src: 'assets/events/workshop-12.webp', alt: 'BuildVerse mentor teaching an Introduction to UAV session to students' }
];

function initHeroShowcase() {
    const track = document.getElementById('showcase-track');
    if (!track || HERO_SHOWCASE_IMAGES.length === 0) return;

    const speedPxPerSecond = 55; // constant horizontal speed, independent of image count
    const total = HERO_SHOWCASE_IMAGES.length;

    function buildCard(item, index) {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.style.setProperty('--i', index % total);

        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        img.loading = 'lazy';
        card.appendChild(img);

        return card;
    }

    // Render the set twice back-to-back so translateX(-50%) loops seamlessly.
    [...HERO_SHOWCASE_IMAGES, ...HERO_SHOWCASE_IMAGES].forEach((item, index) => {
        track.appendChild(buildCard(item, index));
    });

    track.style.setProperty('--total-count', total);

    function syncScrollSpeed() {
        const oneSetWidth = track.scrollWidth / 2;
        const duration = Math.max(oneSetWidth / speedPxPerSecond, 8);
        track.style.setProperty('--scroll-duration', `${duration}s`);
    }

    syncScrollSpeed();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncScrollSpeed, 200);
    });
}


/* ================= 1. SPA ROUTER SYSTEM ================= */
const VIEWS = [
    'home-view', 'workshop-view', 'membership-view', 'competition-view',
    'components-view', 'projects-view', 'portfolio-view',
    'community-view', 'contact-view', 'dashboards-view',
    'student-login-view', 'parent-login-view', 'mentor-login-view', 'admin-login-view'
];

function navigateTo(pageId, pushState = true) {
    // Hide all views, remove active classes
    VIEWS.forEach(view => {
        const viewEl = document.getElementById(view);
        if (viewEl) {
            viewEl.classList.remove('active');
            viewEl.style.display = 'none';
        }
    });

    let targetView = `${pageId}-view`;
    if (pageId.endsWith('-view')) {
        targetView = pageId;
        pageId = pageId.replace('-view', '');
    }

    const activeEl = document.getElementById(targetView);
    if (activeEl) {
        activeEl.style.display = 'block';
        void activeEl.offsetWidth;
        activeEl.classList.add('active');
    }

    // Update Nav bar links
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Close mobile menu if open
    closeMobileMenu();

    if (pushState) {
        const routePath = pageId === 'home' ? '/' : `/${pageId}`;
        window.history.pushState({}, '', routePath);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navbar scrolled styling
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggles
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock scrolling
    });
}

if (mobileMenuClose && mobileMenuOverlay) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('open');
        document.body.style.overflow = 'auto'; // Unlock scrolling
    }
}

// Handle navbar explore toggle and dashboards selection dropdown behavior
document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = dropdown.classList.contains('active-click');
            
            // Close all dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active-click'));
            
            // Toggle current
            if (!isActive) {
                dropdown.classList.add('active-click');
            }
        });
    }
});

// Close dropdowns on document click
document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active-click'));
});

function initSPA() {
    // Initial route handling is deferred to initAuthRouter
}


/* ================= 2. CANVAS PARTICLE SYSTEM ================= */
function initCanvasParticles() {
    const canvas = document.getElementById('stem-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 60;
    const connectionDist = 120;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1.5;
            this.color = Math.random() > 0.5 ? '#00e5ff' : '#39ff14';
            this.isNode = Math.random() > 0.85; // STEM AI / Circuit nodes
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            if (this.isNode) {
                // Draw square halo for tech nodes
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(this.x - 6, this.y - 6, 12, 12);
            }
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (1 - (dist / connectionDist)) * 0.12;
                    ctx.strokeStyle = p1.color === p2.color ? p1.color : '#ffffff';
                    ctx.strokeStyle = ctx.strokeStyle === '#ffffff' ? `rgba(255,255,255,${alpha})` : `rgba(${p1.color === '#00e5ff' ? '0,229,255' : '57,255,20'},${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}


/* ================= 3. STATISTICS COUNTER INCREMENTER ================= */
function initStatsCounter() {
    const stats = [
        { id: 'stat-students', target: 350, labelSuffix: '+' },
        { id: 'stat-projects', target: 150, labelSuffix: '+' },
        { id: 'stat-competitions', target: 2, labelSuffix: '+' }
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;

        let count = 0;
        const speed = Math.ceil(stat.target / 100); // 100 steps
        
        const timer = setInterval(() => {
            count += speed;
            if (count >= stat.target) {
                el.innerText = stat.target.toLocaleString() + stat.labelSuffix;
                clearInterval(timer);
            } else {
                el.innerText = count.toLocaleString() + stat.labelSuffix;
            }
        }, 15);
    });
}


/* ================= 4. COUNTDOWN TIMER ================= */
let timerDuration = (14 * 24 * 60 * 60) + (0 * 60 * 60) + (50 * 60) + 3; // 14d 0h 50m 3s in seconds

function initCountdownTimer() {
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minsEl = document.getElementById('timer-minutes');
    const secsEl = document.getElementById('timer-seconds');

    if (!daysEl) return;

    const interval = setInterval(() => {
        if (timerDuration <= 0) {
            clearInterval(interval);
            return;
        }

        timerDuration--;

        const d = Math.floor(timerDuration / (24 * 60 * 60));
        const h = Math.floor((timerDuration % (24 * 60 * 60)) / (60 * 60));
        const m = Math.floor((timerDuration % (60 * 60)) / 60);
        const s = timerDuration % 60;

        daysEl.innerText = d.toString().padStart(2, '0');
        hoursEl.innerText = h.toString().padStart(2, '0');
        minsEl.innerText = m.toString().padStart(2, '0');
        secsEl.innerText = s.toString().padStart(2, '0');
    }, 1000);
}


/* ================= 5. LIMITED SEATS DYNAMIC UPDATE ================= */
let seatsFilled = 90;

function initSeatsSimulation() {
    const seatsTakenEl = document.getElementById('seats-taken');
    const progressEl = document.getElementById('seats-progress');

    if (!seatsTakenEl) return;

    // Simulate seats filling up periodically
    const seatInterval = setInterval(() => {
        if (seatsFilled >= 147) {
            clearInterval(seatInterval);
            return;
        }
        
        // Add random seat increment
        seatsFilled += Math.floor(Math.random() * 2) + 1;
        seatsTakenEl.innerText = `${seatsFilled} of 150 seats filled`;
        progressEl.style.width = `${(seatsFilled / 150) * 100}%`;
    }, 180000); // Every 3 minutes
}


/* ================= 6. MEMBERSHIP PLAN PRICING TOGGLE ================= */
let isAnnual = false;

function initBillingToggle() {
    const monthlyLbl = document.getElementById('billing-monthly');
    const annualLbl = document.getElementById('billing-annual');

    window.toggleBillingCycle = () => {
        isAnnual = !isAnnual;

        const explorerVal = document.getElementById('price-explorer');
        const innovatorVal = document.getElementById('price-innovator');
        const builderVal = document.getElementById('price-builder');

        if (isAnnual) {
            monthlyLbl.classList.remove('active');
            annualLbl.classList.add('active');

            if (explorerVal) explorerVal.innerText = '799';
            if (innovatorVal) innovatorVal.innerText = '1,599';
            if (builderVal) builderVal.innerText = '2,799';
        } else {
            monthlyLbl.classList.add('active');
            annualLbl.classList.remove('active');

            if (explorerVal) explorerVal.innerText = '999';
            if (innovatorVal) innovatorVal.innerText = '1,999';
            if (builderVal) builderVal.innerText = '3,499';
        }
    };
}

function selectMembership(planName) {
    alert(`Thank you for selecting the BuildVerse ${planName} membership. Our team will contact you on your registered WhatsApp/Mobile to finalize details!`);
}


/* ================= 7. FREE WORKSHOP REGISTRATION SYSTEM ================= */

/* ---- Multi-Step Wizard Controller ---- */
let wsCurrentWizardStep = 1;

function initRegistrationWizard() {
    const form = document.getElementById('workshop-registration-form');
    if (!form) return;

    form.querySelectorAll('.wizard-next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateWizardStep(wsCurrentWizardStep)) {
                goToWizardStep(parseInt(btn.dataset.nextTarget, 10));
            }
        });
    });

    form.querySelectorAll('.wizard-back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            goToWizardStep(parseInt(btn.dataset.backTarget, 10));
        });
    });

    // Strip any non-digit character as the user types (numbers only, 10-digit phone fields)
    ['mobile-num', 'whatsapp-num'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            const digitsOnly = el.value.replace(/\D/g, '');
            if (digitsOnly !== el.value) el.value = digitsOnly;
        });
    });
}

/* ---- Custom Dropdown Controller (progressive enhancement over native <select>) ---- */
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(wrapper => {
        const nativeSelect = wrapper.querySelector('select');
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const valueEl = wrapper.querySelector('.custom-select-value');
        const listEl = wrapper.querySelector('.custom-select-list');
        if (!nativeSelect || !trigger || !valueEl || !listEl) return;

        let highlightedIndex = -1;

        const getOptionEls = () => Array.from(listEl.querySelectorAll('.custom-select-option'));

        function buildOptions() {
            listEl.innerHTML = '';
            Array.from(nativeSelect.options).forEach((opt, idx) => {
                const li = document.createElement('li');
                li.className = 'custom-select-option';
                li.setAttribute('role', 'option');
                li.dataset.value = opt.value;
                li.textContent = opt.textContent;
                if (opt.value === nativeSelect.value) li.classList.add('selected');
                li.addEventListener('click', () => selectOption(opt.value, opt.textContent));
                li.addEventListener('mouseenter', () => setHighlighted(idx));
                listEl.appendChild(li);
            });
        }

        function setHighlighted(idx) {
            const options = getOptionEls();
            options.forEach(o => o.classList.remove('highlighted'));
            if (options[idx]) {
                options[idx].classList.add('highlighted');
                options[idx].scrollIntoView({ block: 'nearest' });
            }
            highlightedIndex = idx;
        }

        function syncDisplay() {
            const opt = nativeSelect.options[nativeSelect.selectedIndex];
            valueEl.textContent = opt ? opt.textContent : '';
            valueEl.classList.toggle('placeholder', !nativeSelect.value);
            getOptionEls().forEach(li => li.classList.toggle('selected', li.dataset.value === nativeSelect.value));
        }

        function selectOption(value) {
            nativeSelect.value = value;
            nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            closeDropdown();
            trigger.focus();
        }

        function openDropdown() {
            document.querySelectorAll('.custom-select.open').forEach(w => { if (w !== wrapper) w.classList.remove('open'); });
            wrapper.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            const selectedIdx = Array.from(nativeSelect.options).findIndex(o => o.value === nativeSelect.value);
            setHighlighted(selectedIdx >= 0 ? selectedIdx : 0);
        }

        function closeDropdown() {
            wrapper.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.classList.contains('open') ? closeDropdown() : openDropdown();
        });

        trigger.addEventListener('keydown', (e) => {
            const options = getOptionEls();
            if (!wrapper.classList.contains('open')) {
                if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                    e.preventDefault();
                    openDropdown();
                }
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlighted(Math.min(highlightedIndex + 1, options.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlighted(Math.max(highlightedIndex - 1, 0));
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const opt = options[highlightedIndex];
                if (opt) selectOption(opt.dataset.value);
            }
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) closeDropdown();
        });

        nativeSelect.addEventListener('change', syncDisplay);

        buildOptions();
        syncDisplay();
        wrapper.classList.add('js-enhanced');
    });
}

function validateWizardStep(stepNum) {
    const stepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
    if (!stepEl) return true;
    const controls = stepEl.querySelectorAll('input, select, textarea');
    for (const control of controls) {
        if (!control.reportValidity()) return false;
    }
    return true;
}

function goToWizardStep(stepNum) {
    wsCurrentWizardStep = stepNum;
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.toggle('active', parseInt(step.dataset.step, 10) === stepNum);
    });
    document.querySelectorAll('.wizard-step-dot').forEach(dot => {
        const dotStep = parseInt(dot.dataset.stepDot, 10);
        dot.classList.toggle('active', dotStep === stepNum);
        dot.classList.toggle('completed', dotStep < stepNum);
    });
    const wrapper = document.getElementById('registration-card-wrapper');
    if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetWizardToStep(stepNum = 1) {
    goToWizardStep(stepNum);
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();

    const studentName = document.getElementById('student-name').value;
    const parentName = document.getElementById('parent-name').value;
    const mobile = document.getElementById('mobile-num').value;
    const whatsapp = document.getElementById('whatsapp-num').value;
    const email = document.getElementById('student-email').value;
    const grade = document.getElementById('student-grade').value;
    const school = document.getElementById('school-name').value;
    const city = document.getElementById('city-name').value;
    
    // Optional field check since Exp/Tech fields can be admin disabled
    const prevExpEl = document.getElementById('prev-exp');
    const prevExp = prevExpEl ? prevExpEl.value : 'none';
    
    const interests = [];
    document.querySelectorAll('input[name="interest"]:checked').forEach(cb => {
        interests.push(cb.value);
    });

    const regId = `BV-ESP8266-${Math.floor(1000 + Math.random() * 9000)}`;

    const registrationData = {
        registrationId: regId,
        studentName,
        parentName,
        mobileNumber: mobile,
        whatsAppNumber: whatsapp,
        emailAddress: email,
        grade,
        schoolName: school,
        city,
        previousExperience: prevExp,
        interestedTechnologies: interests,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Render local ticket details
    document.getElementById('ticket-val-student').innerText = studentName;
    document.getElementById('ticket-val-grade').innerText = `Grade ${grade}`;
    document.getElementById('ticket-val-school').innerText = school;
    document.getElementById('ticket-val-city').innerText = city;
    document.getElementById('ticket-val-id').innerText = regId;

    // Swap Form and Success views
    document.getElementById('registration-card-wrapper').classList.add('hidden');
    document.getElementById('registration-success-wrapper').classList.remove('hidden');
    document.getElementById('registration-success-wrapper').scrollIntoView({ behavior: 'smooth' });

    try {
        if (db) {
            // Save to registrations collection
            await db.collection('registrations').add(registrationData);
            
            // Increment seats counter in active_workshop document
            const workshopRef = db.collection('workshops').doc('active_workshop');
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(workshopRef);
                if (doc.exists) {
                    const currentSeats = doc.data().seatsTaken || 0;
                    transaction.update(workshopRef, { seatsTaken: currentSeats + 1 });
                }
            });
            
            // Auto-create student user account for Student Portal access
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, "student123");
                const uid = userCredential.user.uid;
                await db.collection('users').doc(uid).set({
                    uid: uid,
                    email: email,
                    role: 'student',
                    name: studentName,
                    isPaid: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("Successfully auto-created student account.");
            } catch (signupError) {
                // If user already exists in auth, just log them or update Firestore role
                console.log("User may already exist in Auth: ", signupError.message);
            }
        }
    } catch (err) {
        console.error("Error saving registration to Firestore: ", err);
    }
}

function resetRegistrationForm() {
    const form = document.getElementById('workshop-registration-form');
    form.reset();
    // form.reset() doesn't fire 'change' on selects — resync the custom dropdown display
    form.querySelectorAll('select').forEach(sel => sel.dispatchEvent(new Event('change', { bubbles: true })));
    document.getElementById('registration-success-wrapper').classList.add('hidden');
    document.getElementById('registration-card-wrapper').classList.remove('hidden');
    resetWizardToStep(1);
}


/* ================= 8. COMPETITION ARENA OPERATIONS ================= */
function switchCompTab(tabId) {
    // Remove active state from all buttons
    document.querySelectorAll('[data-comp-tab]').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active state to selected button
    document.querySelector(`[data-comp-tab="${tabId}"]`).classList.add('active');

    // Hide all tabs
    document.querySelectorAll('.comp-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Show active tab panel
    document.getElementById(`comp-tab-${tabId}`).classList.add('active');
}

function joinCompetition(challengeName) {
    alert(`Enrolled in the ${challengeName}! Workspace resources and sensor mapping guides are loaded in your Student Dashboard.`);
    navigateToDashboard('student');
}

function registerUpcomingComp(challengeName) {
    alert(`Pre-registered for the ${challengeName}! We will ping you on WhatsApp when the sandbox repository opens.`);
}

function claimDailyXP() {
    alert(`Daily streak maintained! +50 XP and +10 BuildCoins added to Aarav's wallet.`);
}


/* ================= 9. WIKIPEDIA COMPONENT UNIVERSE ================= */
const COMPONENT_DB = {
    // --- BEGINNER Tier (8 Boards) ---
    uno: {
        title: 'Arduino Uno R3',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '5V',
        pins: '14 Digital I/O, 6 Analog Inputs',
        desc: 'The standard microcontroller board built on the ATmega328P. Excellent starting point for electronic circuits and programming basics.',
        specs: ['Processor: ATmega328P (8-bit AVR)', 'Operating Voltage: 5V', 'Clock Speed: 16 MHz', 'Flash Memory: 32 KB', 'SRAM: 2 KB'],
        tutorials: '1. Connect the Uno to your computer using a USB-B cable.\n2. Open Arduino IDE and select "Arduino Uno" under Tools > Board.\n3. Choose your port in Tools > Port.\n4. Upload the Blink example from File > Examples > 01.Basics > Blink.',
        code: `void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`,
        pinout: `       [ USB PORT ]\n      +--------------+\n      |  UNO   AREF -|\n      |        GND  -|\n      |        13   -|-- LED Built-in\n      |        12   -|\n      |  POWER 11~  -|\n      |  JACK  10~  -|\n      +--------------+`,
        apps: 'Basic plant watering indicators, smart traffic lights, buzzer alarms, and light sensing triggers.',
        related: ['Arduino Nano', 'Arduino Mega 2560']
    },
    nano: {
        title: 'Arduino Nano',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '5V',
        pins: '14 Digital I/O, 8 Analog Inputs',
        desc: 'A small, breadboard-friendly board using the ATmega328P. It shares almost identical pin-outs and capabilities with the Uno but in a tiny form factor.',
        specs: ['Processor: ATmega328P (8-bit AVR)', 'Operating Voltage: 5V', 'Clock Speed: 16 MHz', 'Flash Memory: 32 KB', 'SRAM: 2 KB'],
        tutorials: '1. Fit the Nano securely across the center channel of a breadboard.\n2. Connect via Mini-USB cable.\n3. Select "Arduino Nano" in the IDE.\n4. Note: If upload fails, try changing Processor to "ATmega328P (Old Bootloader)".',
        code: `void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  Serial.println(val);\n  delay(200);\n}`,
        pinout: `       +-------+\n  D1/TX|1    30|RAW\n  D0/RX|2    29|GND\n    RST|3    28|RST\n    GND|4    27|5V\n     D2|5    26|A7\n       +-------+`,
        apps: 'Mini line-following robots, wearable motion detectors, small joystick control pads.',
        related: ['Arduino Uno R3', 'ATtiny85 Dev Board']
    },
    mega: {
        title: 'Arduino Mega 2560',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '5V',
        pins: '54 Digital I/O, 16 Analog Inputs',
        desc: 'Larger microcontroller board featuring the ATmega2560. Provides vast expansion options for sensor arrays and complex mechanical projects.',
        specs: ['Processor: ATmega2560 (8-bit AVR)', 'Operating Voltage: 5V', 'Clock Speed: 16 MHz', 'Flash Memory: 256 KB', 'SRAM: 8 KB', 'Hardware Serials: 4 Ports'],
        tutorials: '1. Connect the Mega via USB-B cable.\n2. In Arduino IDE, select "Arduino Mega or Mega 2560" under Tools > Board.\n3. Verify connection port and write scripts addressing pins above D13 safely.',
        code: `void setup() {\n  Serial.begin(9600);\n  Serial1.begin(9600); // Secondary Hardware Serial port\n}\n\nvoid loop() {\n  if (Serial1.available()) {\n    Serial.write(Serial1.read());\n  }\n}`,
        pinout: `       [ USB PORT ]\n     +---------------+\n     | MEGA2560 AREF-|\n     |          D13 -|\n     |          D53 -|-- Extended IO\n     |          A15 -|\n     | POWER    A0  -|\n     +---------------+`,
        apps: '3D Printer main controller boards, heavy-duty robotic arms, massive multi-sensor weather hubs.',
        related: ['Arduino Uno R3', 'Arduino Due']
    },
    microbit: {
        title: 'BBC micro:bit',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '3.3V',
        pins: '25 Edge Connector Pins',
        desc: 'An open-source ARM-based board designed by the BBC for STEM education. Features a built-in LED matrix, accelerometer, compass, and BLE radio.',
        specs: ['Processor: Nordic nRF51822 (32-bit ARM Cortex-M0)', 'Operating Voltage: 3.3V', 'Clock Speed: 16 MHz', 'SRAM: 16 KB', 'LED Matrix: 5x5 Grid', 'Sensors: Accelerometer, Compass'],
        tutorials: '1. Connect micro:bit via Micro-USB to your PC.\n2. Open Microsoft MakeCode editor in your browser.\n3. Drag-and-drop block commands or write Python code.\n4. Click Download and drag the downloaded .hex file directly into the micro:bit drive folder.',
        code: `# BBC micro:bit MicroPython\nfrom microbit import *\n\nwhile True:\n    display.show(Image.HAPPY)\n    sleep(1000)\n    display.show(Image.SAD)\n    sleep(1000)`,
        pinout: `     +-------------------+\n     |    LED MATRIX     | \n     |   [A]       [B]   |\n     +===================+\n     | O  O  O  ||||| O  O|\n     | 0  1  2  3V3    GND|\n     +-------------------+`,
        apps: 'Introductory classroom coding games, simple step counters, compass locators, wireless remote controls.',
        related: ['Seeeduino XIAO', 'Raspberry Pi Pico']
    },
    xiao: {
        title: 'Seeeduino XIAO',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '3.3V',
        pins: '14 GPIO Pins (11 analog/digital)',
        desc: 'The smallest member of the Seeeduino family, containing a powerful SAMD21 ARM Cortex-M0+. Packs professional computing speeds into a thumbnail form factor.',
        specs: ['Processor: SAMD21 (32-bit ARM Cortex-M0+)', 'Operating Voltage: 3.3V', 'Clock Speed: 48 MHz', 'Flash Memory: 256 KB', 'SRAM: 32 KB', 'Interface: USB Type-C'],
        tutorials: '1. Solder pin headers onto the XIAO board if breadboarding.\n2. Connect via USB-C cable.\n3. Add Seeeduino SAMD Boards URL to Arduino IDE Preferences.\n4. Install SAMD Boards package and select "Seeeduino XIAO".',
        code: `void setup() {\n  pinMode(PIN_LED, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(PIN_LED, LOW);  // Turn on onboard LED\n  delay(500);\n  digitalWrite(PIN_LED, HIGH); // Turn off\n  delay(500);\n}`,
        pinout: `     +-----------+\n  D0 | 1      14 | 5V\n  D1 | 2      13 | GND\n  D2 | 3      12 | 3V3\n  D3 | 4  XIAO11 | D10\n     +-----------+`,
        apps: 'Smart rings, miniature wearable tech, compact keyboard macro pads, tiny robotics controllers.',
        related: ['Arduino Nano', 'ATtiny85 Dev Board']
    },
    attiny: {
        title: 'ATtiny85 Dev Board',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '5V',
        pins: '6 GPIO Pins, 4 Analog Inputs',
        desc: 'An ultra-compact development board powered by the ATtiny85 8-bit AVR chip. Best for lightweight projects that require minimal pins.',
        specs: ['Processor: ATtiny85 (8-bit AVR)', 'Operating Voltage: 5V (USB or RAW)', 'Clock Speed: 8/16 MHz', 'Flash Memory: 8 KB', 'SRAM: 512 Bytes'],
        tutorials: '1. Install Digistump drivers on your operating system.\n2. Add Digispark board URL to Arduino IDE Preferences.\n3. Select "Digispark (Default - 16mhz)" board.\n4. Click Upload in the IDE FIRST, then plug the board into USB port when prompted.',
        code: `// Digispark ATtiny85 LED blink\nvoid setup() {\n  pinMode(1, OUTPUT); // Pin 1 is onboard LED for model A\n}\n\nvoid loop() {\n  digitalWrite(1, HIGH);\n  delay(500);\n  digitalWrite(1, LOW);\n  delay(500);\n}`,
        pinout: `       [ USB PLUG ]\n      +------------+\n      |   ATTINY   |\n      | P0      P5 |\n      | P1      GND|\n      | P2      5V |\n      +------------+`,
        apps: 'Simple holiday lighting effects, custom servo trigger devices, single-button macros controllers.',
        related: ['Seeeduino XIAO', 'Arduino Nano']
    },
    pico: {
        title: 'Raspberry Pi Pico',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '3.3V',
        pins: '40-pin Dual-Inline-Package',
        desc: 'Low-cost, high-performance microcontroller board built around the Raspberry Pi RP2040 chip. Perfect for learning Python coding on edge electronics.',
        specs: ['Processor: RP2040 (Dual-core ARM Cortex-M0+ @ 133MHz)', 'Operating Voltage: 3.3V', 'SRAM: 264 KB', 'Flash Memory: 2 MB', 'Programmable I/O (PIO): 8 State Machines'],
        tutorials: '1. Connect Pico to PC via Micro-USB while holding the BOOTSEL button.\n2. Drag-and-drop the Thonny IDE MicroPython firmware (.uf2) onto the "RPI-RP2" drive.\n3. Open Thonny IDE, select MicroPython (Raspberry Pi Pico) as interpreter, and start programming.',
        code: `import machine\nimport time\n\nled = machine.Pin(25, machine.Pin.OUT) # Builtin LED\nwhile True:\n    led.value(1)\n    time.sleep(0.5)\n    led.value(0)\n    time.sleep(0.5)`,
        pinout: `       [ Micro-USB ]\n       +-----------+\n  GP0 -|1        40|- VBUS (5V)\n  GP1 -|2        39|- VSYS\n  GND -|3        38|- GND\n  GP2 -|4        37|- 3V3_EN\n  GP3 -|5        36|- 3V3 (OUT)\n       +-----------+`,
        apps: 'Sensors logging arrays, customized gaming pads, mechanical automation triggers, MicroPython lessons.',
        related: ['Raspberry Pi Pico W', 'Arduino Uno R3']
    },
    picow: {
        title: 'Raspberry Pi Pico W',
        diff: 'BEGINNER',
        diffClass: 'beginner',
        voltage: '3.3V',
        pins: '40-pin DIP layout',
        desc: 'Wireless-equipped version of the Pi Pico, incorporating an Infineon CYW43439 chip. Adds WiFi and BLE connectivity to the RP2040 core.',
        specs: ['Processor: RP2040 Dual-core @ 133MHz', 'Operating Voltage: 3.3V', 'Wireless: 2.4GHz WiFi & Bluetooth 5.2', 'SRAM: 264 KB', 'Flash Memory: 2 MB'],
        tutorials: '1. Download the Pico W specific MicroPython firmware (.uf2).\n2. Boot with BOOTSEL pressed and drop the file.\n3. Use Thonny IDE to run scripts importing the network library to link local WiFi routers.',
        code: `import network\nimport time\n\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect('My_WiFi', 'Password123')\n\nwhile not wlan.isconnected():\n    print("Connecting...")\n    time.sleep(1)\nprint("Connected! IP:", wlan.ifconfig()[0])`,
        pinout: `       [ Micro-USB ]\n       +-----------+\n  GP0 -|1        40|- VBUS (5V)\n  GP1 -|2        39|- VSYS\n  GND -|3        38|- GND\n       |   [WIFI]  |\n  GP2 -|4        37|- 3V3_EN\n       +-----------+`,
        apps: 'Wireless temperature monitors, simple REST clients, IoT smart switches, home-assistant dashboard nodes.',
        related: ['Raspberry Pi Pico', 'ESP8266 NodeMCU']
    },

    // --- INTERMEDIATE Tier (10 Boards) ---
    esp8266: {
        title: 'ESP8266 NodeMCU',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '30-pin board layout',
        desc: 'Low-cost Wi-Fi microcontroller board. A staple for intermediate students learning Internet of Things (IoT) webservers and MQTT streams.',
        specs: ['Processor: Tensilica L106 32-bit CPU (80/160 MHz)', 'Operating Voltage: 3.3V', 'WiFi: 802.11 b/g/n (2.4 GHz)', 'SRAM: 80 KB', 'Flash Memory: 4 MB'],
        tutorials: '1. Set up Arduino IDE Preferences with ESP8266 boards manager URL.\n2. Install ESP8266 board definitions.\n3. Connect via Micro-USB, select "NodeMCU 1.0 (ESP-12E Module)".\n4. Use the ESP8266WiFi library to build local web pages.',
        code: `#include <ESP8266WiFi.h>\nconst char* ssid = "WiFiName";\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, "password");\n  while(WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }\n  Serial.println("\\nConnected!");\n}\nvoid loop() {}`,
        pinout: `       +-----------+\n   A0 -| A0     D0 |- GPIO16\n  RSV -| RSV    D1 |- GPIO5 (SCL)\n  RSV -| RSV    D2 |- GPIO4 (SDA)\n  SD3 -| SD3    D3 |- GPIO0\n       +-----------+`,
        apps: 'Smart plugs relay controls, ambient web monitors, dynamic IFTTT alerts button controllers.',
        related: ['ESP32 DevKit', 'Raspberry Pi Pico W']
    },
    esp32: {
        title: 'ESP32 DevKitC',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '38-pin DevKit layout',
        desc: 'High-performance, dual-core WiFi & Bluetooth board. The industry standard tool for intermediate smart home, robotics and secure API logic.',
        specs: ['Processor: Tensilica LX6 Dual-Core (up to 240 MHz)', 'Operating Voltage: 3.3V', 'Wireless: WiFi + Bluetooth + BLE 4.2', 'SRAM: 520 KB', 'Flash Memory: 4 MB'],
        tutorials: '1. Connect ESP32 DevKit to PC using Micro-USB.\n2. Add ESP32 JSON repository URL in IDE preferences.\n3. Download ESP32 platform packages, select "ESP32 Dev Module" and select correct COM port.',
        code: `#include <WiFi.h>\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.mode(WIFI_STA);\n  Serial.println("Scan start");\n  int n = WiFi.scanNetworks();\n  Serial.printf("%d networks found\\n", n);\n}\nvoid loop() {}`,
        pinout: `      +---------------+\n  3V3 | 3V3       GND | GND\n  EN  | EN        D23 | GPIO23 (MOSI)\n  VP  | GPIO36    D22 | GPIO22 (SCL)\n  VN  | GPIO39    TX0 | GPIO1 (TX)\n      +---------------+`,
        apps: 'Smart home keyless lockers, MQTT sensor stations, Bluetooth asset trackers, local camera server rigs.',
        related: ['ESP8266 NodeMCU', 'ESP32-S3']
    },
    esp32s3: {
        title: 'ESP32-S3',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '40-pin layout',
        desc: 'Advanced dual-core ESP32 chip featuring dedicated vector computing instructions to accelerate AI models and image recognition tasks.',
        specs: ['Processor: Xtensa 32-bit LX7 Dual-Core @ 240 MHz', 'Operating Voltage: 3.3V', 'AI Acceleration: Vector Instructions Support', 'SRAM: 512 KB', 'WiFi & BLE 5.0'],
        tutorials: '1. Double check you have selected ESP32 S3 in the boards manager.\n2. Configure USB OTG vs USB UART port options in IDE settings.\n3. S3 models compile slower due to complex vector instructions compilation.',
        code: `// Vector operation placeholder\n#include "esp_dsp.h"\nvoid setup() {\n  Serial.begin(115200);\n  dsps_fft2r_init_fc32(NULL, CONFIG_DSP_MAX_FFT_SIZE);\n  Serial.println("DSP initialised.");\n}\nvoid loop() {}`,
        pinout: `      +---------------+\n  3V3 | 3V3       GND | GND\n  GPIO| D0        D19 | GPIO19 (OTG D-)\n  GPIO| D1        D20 | GPIO20 (OTG D+)\n      +---------------+`,
        apps: 'Edge computer vision classification, local voice command analysis, custom offline smart displays.',
        related: ['ESP32 DevKit', 'NVIDIA Jetson Nano']
    },
    esp32c3: {
        title: 'ESP32-C3',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '30-pin layouts',
        desc: 'Ultra-low cost single-core RISC-V microcontroller board. Provides security-focused, low-power WiFi and BLE5 connectivity for battery setups.',
        specs: ['Processor: 32-bit RISC-V Single-Core @ 160 MHz', 'Operating Voltage: 3.3V', 'SRAM: 400 KB', 'Flash: 4 MB', 'Wireless: WiFi + BLE 5.0'],
        tutorials: '1. Solder and mount ESP32-C3 modules on breadboard.\n2. Update ESP32 board library to version 2.0.0+ to unlock RISC-V compilers.\n3. Build low-power deep sleep loops using RTC pins.',
        code: `#include <esp_sleep.h>\nvoid setup() {\n  Serial.begin(115200);\n  esp_sleep_enable_timer_wakeup(10 * 1000000); // 10s sleep\n  Serial.println("Going to sleep...");\n  esp_deep_sleep_start();\n}\nvoid loop() {}`,
        pinout: `      +-------------+\n  3V3 | 3V3     GND | GND\n  GPIO| GPIO0   TX  | GPIO21\n  GPIO| GPIO1   RX  | GPIO20\n      +-------------+`,
        apps: 'Solar weather panels, low-power Bluetooth beacon tags, remote sensors nodes running on coin-cell batteries.',
        related: ['ESP32 DevKit', 'ESP8266 NodeMCU']
    },
    stm32: {
        title: 'STM32 Blue Pill',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '40-pin board layout',
        desc: 'Fast 32-bit ARM Cortex-M3 microcontroller module. Highly preferred for real-time applications requiring swift pin responses and hardware timers.',
        specs: ['Processor: STM32F103C8T6 (32-bit ARM Cortex-M3)', 'Operating Voltage: 3.3V', 'Clock Speed: 72 MHz', 'Flash Memory: 64 KB', 'SRAM: 20 KB'],
        tutorials: '1. Connect Blue Pill to computer using an ST-Link V2 programmer module.\n2. Wire SWDIO, SWCLK, GND, and 3.3V pins accordingly.\n3. Add STM32 board manager packages to Arduino IDE.\n4. Set Upload Method to "STLink" and compile.',
        code: `void setup() {\n  pinMode(PC13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(PC13, LOW);  // Onboard LED is Active LOW\n  delay(100);\n  digitalWrite(PC13, HIGH);\n  delay(100);\n}`,
        pinout: `       +---------------+\n  VBAT-|1            40|-GND\n   PC13|2            39|-CLK\n   PC14|3            38|-DIO\n   PC15|4            37|-PA15\n       +---------------+`,
        apps: 'High-speed line rovers timer loops, custom keyboard macro pads, custom motor driver bridges.',
        related: ['STM32 Black Pill', 'ESP32 DevKit']
    },
    stm32black: {
        title: 'STM32 Black Pill',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '40-pin board layout',
        desc: 'Upgraded version of the Blue Pill featuring a faster Cortex-M4 CPU, built-in USB Type-C, and hardware floating-point calculation instructions.',
        specs: ['Processor: STM32F411CEU6 (32-bit ARM Cortex-M4)', 'Operating Voltage: 3.3V', 'Clock Speed: 100 MHz', 'Flash Memory: 512 KB', 'SRAM: 128 KB', 'FPU: Hardware Floating Point Unit'],
        tutorials: '1. Wire ST-Link programmer to Black Pill SWD port.\n2. Download STM32CubeIDE or Arduino IDE board support files.\n3. Enable USB CDC under code configs to print serial logs over Type-C port.',
        code: `void setup() {\n  Serial.begin(115200);\n}\nvoid loop() {\n  float f = 3.14159 * random(1, 100);\n  Serial.println(f); // Processed via FPU hardware\n  delay(1000);\n}`,
        pinout: `       +---------------+
  3.3V-|1            40|-GND
  PC13|2            39|-PB15
  PB12|3            38|-PB14
       +---------------+`,
        apps: 'Flight stabilizer math boards, DSP filtering scripts, advanced digital keyboards.',
        related: ['STM32 Blue Pill', 'Teensy 4.1']
    },
    teensy: {
        title: 'Teensy 4.1',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '48-pin board footprint',
        desc: 'An extremely powerful, high-performance controller board featuring an ARM Cortex-M7. Ideal for heavy real-time data calculations, audio DSP, and high-speed communications.',
        specs: ['Processor: ARM Cortex-M7 @ 600 MHz', 'Operating Voltage: 3.3V', 'Flash Memory: 8 MB', 'RAM: 1024 KB', 'Peripherals: Ethernet Port Interface, MicroSD slot'],
        tutorials: '1. Download Teensyduino add-on client to install files inside Arduino folder.\n2. Choose "Teensy 4.1" under board menus.\n3. Run scripts to evaluate complex mathematical arrays at 600MHz processing speeds.',
        code: `void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  uint32_t t = micros();\n  // Calculate massive dummy loops\n  for (int i=0; i<10000; i++) { asm("nop"); }\n  Serial.printf("Time: %d us\\n", micros() - t);\n  delay(2000);\n}`,
        pinout: `       +-------+\n  GND -|1    48|- VIN (5V)\n  GP0 -|2    47|- GND\n  GP1 -|3    46|- 3.3V\n       +-------+`,
        apps: 'Audio synthesizers effects modules, CAN-bus vehicle telemetry nodes, high-precision robotics controllers.',
        related: ['STM32 Black Pill', 'Arduino Due']
    },
    due: {
        title: 'Arduino Due',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '54 Digital I/O, 12 Analog Inputs',
        desc: 'The first ARM-based Arduino board, built on a SAM3X8E chip. Adds robust 32-bit execution capabilities while maintaining compatibility with larger Arduino Mega shield layouts.',
        specs: ['Processor: AT91SAM3X8E (32-bit ARM Cortex-M3)', 'Operating Voltage: 3.3V', 'Clock Speed: 84 MHz', 'Flash Memory: 512 KB', 'SRAM: 96 KB'],
        tutorials: '1. Solder components or plug Due into power source.\n2. Ensure you plug the USB cable into the "Programming Port" (closer to DC jack).\n3. Install SAM3X8E board packages in IDE, compile, and upload.',
        code: `void setup() {\n  analogReadResolution(12); // Unlock 12-bit analog precision\n  Serial.begin(9600);\n}\nvoid loop() {\n  int val = analogRead(A0);\n  Serial.println(val);\n  delay(200);\n}`,
        pinout: `       [ PROGRAM PORT ]\n     +---------------+\n     | DUE      AREF-|\n     |          D53 -|-- 54 Digital pins\n     | POWER    A0  -|\n     +---------------+`,
        apps: 'High-precision scientific testing setups, industrial automation control grids, multiloop servo rigs.',
        related: ['Arduino Mega 2560', 'Teensy 4.1']
    },
    nano33: {
        title: 'Arduino Nano 33 IoT',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '30-pin board layout',
        desc: 'A modern, secure IoT-focused Nano board. Integrates an ARM Cortex-M0+ SAMD21 CPU alongside an ATECC608A cryptographic co-processor to handle secure web keys.',
        specs: ['Processor: SAMD21 (32-bit ARM Cortex-M0+)', 'Operating Voltage: 3.3V', 'Wireless: WiFi + Bluetooth + BLE (NINA-W10)', 'Security: ATECC608A Crypto Element', 'IMU: LSM6DS3 (6-Axis)'],
        tutorials: '1. Setup "Arduino SAMD (32-bits ARM Cortex-M0+)" board libraries.\n2. Connect Nano 33 IoT via Micro-USB.\n3. Import WiFiNINA library to interact with secure cloud databases.',
        code: `#include <WiFiNINA.h>\n#include <ArduinoBearSSL.h>\nvoid setup() {\n  Serial.begin(115200);\n  // Connect secure client certificates here\n  Serial.println("BearSSL initialised.");\n}\nvoid loop() {}`,
        pinout: `       +-------+\n  D1/TX|1    30|RAW\n  D0/RX|2    29|GND\n    RST|3    28|RST\n       | [IMU] |\n       +-------+`,
        apps: 'Secure commercial IoT sensors, encryption communication modules, motion gestures tracking grids.',
        related: ['Arduino Nano', 'ESP32 DevKit']
    },
    lopy4: {
        title: 'Pycom LoPy4',
        diff: 'INTERMEDIATE',
        diffClass: 'intermediate',
        voltage: '3.3V',
        pins: '38-pin module layout',
        desc: 'Quad-network MicroPython development board. Perfect for testing long-range telemetry projects using LoRa and Sigfox network nodes.',
        specs: ['Processor: Espressif ESP32 Dual-Core chipset', 'Operating Voltage: 3.3V', 'Connectivity: LoRa + Sigfox + WiFi + Bluetooth', 'Language: Native MicroPython Support', 'Range: Up to 40km in line-of-sight'],
        tutorials: '1. Place LoPy4 on a Pycom expansion board.\n2. Connect LoRa/Sigfox external antennas (do not boot without antennas to avoid RF damage).\n3. Install Pymakr plugin in VS Code to write code script packets.',
        code: `# MicroPython LoRa socket transmit\nfrom network import LoRa\nimport socket\n\nlora = LoRa(mode=LoRa.LORA, region=LoRa.EU868)\ns = socket.socket(socket.AF_LORA, socket.SOCK_RAW)\ns.setblocking(False)\ns.send('Ping via LoRa')`,
        pinout: `       +-----------+\n  3V3 -| 3.3V   GND |- GND\n  GP4 -| GPIO4  TX  |- TXD0\n  GP5 -| GPIO5  RX  |- RXD0\n       | [LORA MODULE]|\n       +-----------+`,
        apps: 'Off-grid forest weather indicators, long-range drone telemetry modules, rural agricultural tracking nodes.',
        related: ['ESP32 DevKit', 'Pixhawk 6C']
    },

    // --- ADVANCED Tier (11 Boards) ---
    rpi5: {
        title: 'Raspberry Pi 5',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V',
        pins: '40-pin GPIO Connector Header',
        desc: 'Full-scale single board computer utilizing a quad-core 64-bit Arm CPU. Serves as a localized desktop environment to execute Linux commands and advanced computer vision.',
        specs: ['Processor: BCM2712 (Quad-core ARM Cortex-A76 @ 2.4GHz)', 'Operating Voltage: 5V (USB-C PD 5A)', 'Graphics: VideoCore VII dual 4K outputs', 'RAM Options: 4GB / 8GB LPDDR4X', 'Clock: 2.4 GHz'],
        tutorials: '1. Download Raspberry Pi Imager client.\n2. Flash Raspberry Pi OS Bookworm onto a class 10 MicroSD card.\n3. Slide MicroSD into Pi 5 slot, connect 5V USB-C power source, and boot screen.\n4. Initialize python files using terminal consoles.',
        code: `import cv2\n\ncap = cv2.VideoCapture(0) # Open USB Webcam\nwhile True:\n    ret, frame = cap.read()\n    cv2.imshow('Pi 5 Camera stream', frame)\n    if cv2.waitKey(1) & 0xFF == ord('q'):\n        break\ncap.release()\ncv2.destroyAllWindows()`,
        pinout: `      =========================\n      GP2 -- SDA1    [5V] -- Vin\n      GP3 -- SCL1    [5V] -- Vin\n      GND -- Ground  GND  -- Ground\n      GP4 -- GPIO    TXD0 -- GP14\n      =========================`,
        apps: 'Smart Linux visual recognition systems, custom home assistant servers, robot operating system nodes.',
        related: ['Raspberry Pi CM5', 'NVIDIA Jetson Nano']
    },
    cm5: {
        title: 'Raspberry Pi CM5',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V (on IO Board)',
        pins: 'Dual high-density board connectors',
        desc: 'Industrial-grade Pi 5 compute engine module. Strips away onboard port sockets, enabling engineers to embed the processor core into custom printed boards.',
        specs: ['Processor: Broadcom BCM2712 Quad-Core @ 2.4GHz', 'Operating Voltage: 3.3V & 5V inputs', 'Storage: Onboard eMMC flash optional', 'Target use: Embedded industrial controls'],
        tutorials: '1. Mount the CM5 module onto a compatible CM5 IO carrier board.\n2. Connect IO board to PC micro-usb.\n3. Use rpiboot utility to mount onboard eMMC storage partition.\n4. Install Linux OS directly onto eMMC.',
        code: `# Linux console log command\nimport os\nprint("CPU Temp:", os.popen("vcgencmd measure_temp").read().strip())`,
        pinout: `      [ BOARD TO BOARD PLUGS ]\n      ========================\n      Pins 1-100: PCIe, HDMI, USB\n      Pins 101-200: GPIO, SD, Power\n      ========================`,
        apps: 'Commercial screen panels, smart retail kiosks, assembly line monitoring blocks.',
        related: ['Raspberry Pi 5', 'BeagleBone Black']
    },
    jetson: {
        title: 'NVIDIA Jetson Nano',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V',
        pins: '40-pin Expansion Header',
        desc: 'Advanced system-on-module featuring a 128-core Maxwell GPU. Best for running deep neural networks to process real-time visual streams.',
        specs: ['GPU: 128-core Maxwell GPU architecture', 'CPU: Quad-core ARM A57 (1.43 GHz)', 'Memory: 4 GB LPDDR4 RAM', 'AI performance: 472 GFLOPs'],
        tutorials: '1. Fetch the official NVIDIA Jetson SDK SD card image.\n2. Write image onto high-speed MicroSD.\n3. Boot system, open Linux bash shell, and launch jetson-inference repositories tools.',
        code: `import jetson.inference\nimport jetson.utils\n\nnet = jetson.inference.detectNet("ssd-mobilenet-v2")\ncamera = jetson.utils.videoSource("csi://0")\ndisplay = jetson.utils.videoOutput("display://0")\n\nwhile display.IsStreaming():\n    img = camera.Capture()\n    detections = net.Detect(img)\n    display.Render(img)`,
        pinout: `      =========================\n      3.3V -- Power    5.0V -- Power\n      I2C2 -- SDA      5.0V -- Power\n      I2C2 -- SCL      GND  -- Ground\n      =========================`,
        apps: 'Real-time street object detection, robotic arm garbage classification scanners, autonomous vehicle navigation systems.',
        related: ['Raspberry Pi 5', 'NVIDIA Jetson Orin Nano']
    },
    orin: {
        title: 'NVIDIA Jetson Orin Nano',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V',
        pins: '40-pin Expansion Header',
        desc: 'High-end AI robotics developer module. Delivers up to 80 times the computing power of the classic Jetson Nano, targeting heavy industrial AI.',
        specs: ['GPU: Ampere GPU with 1024 CUDA cores', 'CPU: 6-core ARM Cortex-A78AE CPU', 'AI Speed: 40 TOPS (Trillions of Operations)', 'Memory: 8 GB LPDDR5 RAM'],
        tutorials: '1. Connect Orin Nano using a DC jack barrel plug (supports 9V-20V range).\n2. Boot NVIDIA Ubuntu OS.\n3. Configure TensorRT to accelerate deep learning logic libraries compiles.',
        code: `# TensorRT engine load mock\nimport tensorrt as trt\nlogger = trt.Logger(trt.Logger.WARNING)\nbuilder = trt.Builder(logger)\nprint("TensorRT hardware engine initialized. TOPS: 40")`,
        pinout: `      =========================\n      3.3V -- Power    5.0V -- Power\n      GPIO -- GP12     TXD2 -- GP14\n      =========================`,
        apps: 'Self-driving delivery cars, high-speed warehouse mapping rovers, real-time factory assembly defect scans.',
        related: ['NVIDIA Jetson Nano', 'Raspberry Pi 5']
    },
    beaglebone: {
        title: 'BeagleBone Black',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V',
        pins: 'Dual 46-pin Expansion Headers',
        desc: 'High-performance computing board featuring dual Programmable Real-time Units (PRUs). Excellent option for low-latency feedback controls.',
        specs: ['Processor: AM3358 ARM Cortex-A8 (1 GHz)', 'PRU: Dual 32-bit RISC cores @ 200MHz', 'Flash: 4 GB eMMC onboard', 'RAM: 512 MB DDR3'],
        tutorials: '1. Plug board to PC using USB mini cable.\n2. Navigate to http://192.168.7.2 inside browser web pages.\n3. Code local JavaScript using Cloud9 IDE hosted directly on the BeagleBone.',
        code: `// Node.js Bonescript toggle LED\nvar b = require('bonescript');\nb.pinMode('USR3', b.OUTPUT);\nsetInterval(function() {\n  b.digitalWrite('USR3', b.HIGH);\n  setTimeout(function() { b.digitalWrite('USR3', b.LOW); }, 500);\n}, 1000);`,
        pinout: `       +----+====+----+\n  GND  |P9.1    P9.2| GND\n  3.3V |P9.3    P9.4| 3.3V\n  SYS5V|P9.5    P9.6| SYS5V\n       +----+====+----+`,
        apps: 'Real-time motor drive calculations, industrial valve telemetry controls, automated testing setups.',
        related: ['Raspberry Pi CM5', 'TI LaunchPad']
    },
    pixhawk6c: {
        title: 'Pixhawk 6C Autopilot',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V (via Power Module)',
        pins: '16 main PWM motor channels',
        desc: 'Modular flight controller board mapping to PX4 and ArduPilot standards. Perfect for programming autonomous drone flight grids.',
        specs: ['Processor: STM32H743 Cortex-M7 @ 480 MHz', 'Sensors: Triple redundant IMUs (BMI088/ICM42688P)', 'Interfaces: 6x UART, 4x I2C, 3x SPI, 2x CAN'],
        tutorials: '1. Secure Pixhawk on the center gravity axis of your multirotor.\n2. Plug the digital telemetry radio to TELEM1.\n3. Open QGroundControl, select PX4 firmware, and launch vehicle calibration panels.',
        code: `# Python Mavlink vehicle arm command\nfrom pymavlink import mavutil\nmaster = mavutil.mavlink_connection('udpin:localhost:14550')\nmaster.wait_heartbeat()\n# Arm motors\nmaster.mav.command_long_send(\n    master.target_system, master.target_component,\n    mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0, 1, 0, 0, 0, 0, 0, 0)`,
        pinout: `       +--------------+\n       |  PIXHAWK 6C  |\n  PWM  |[1][2][3][4]  |-- ESC outputs\n  I/O  |[5][6][7][8]  |\n  GPS  |[   GPS   ]   |-- GPS & Compass\n       +--------------+`,
        apps: 'Autonomous surveillance quadcopters, long-range mapping gliders, automated ground vehicles.',
        related: ['Pixhawk 6X', 'Cube Orange+']
    },
    pixhawk6x: {
        title: 'Pixhawk 6X Autopilot',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V (via Power Module)',
        pins: '16 PWM channels (isolated)',
        desc: 'Professional-grade UAV controller module. Integrates triple-redundant IMU sensors arrays inside a hardware-dampened casing to eliminate motor vibration errors.',
        specs: ['Processor: STM32H753 @ 480 MHz + STM32F100 failsafe coprocessor', 'IMU: Triple Redundant with hardware vibration isolation', 'Network: Integrated Ethernet bus support'],
        tutorials: '1. Slide Pixhawk 6X onto its corresponding aluminum baseboard carrier.\n2. Bind your transmitter radio receiver to RCIN port.\n3. Configure servo outputs to map fixed wing flight control surfaces.',
        code: `// PX4 C++ controller loop snippet\n#include <px4_platform_common/module.h>\nextern "C" __EXPORT int mc_att_control_main(int argc, char *argv[]) {\n  // Custom PID code executes here at 400Hz\n  return 0;\n}`,
        pinout: `       +--------------+\n       |  PIXHAWK 6X  |\n  ETH  |[  ETHERNET  ]|-- High-speed data\n  TELEM|[   TELEM 1  ]|-- Wireless Radio\n  RCIN |[    RCIN    ]|-- Receiver\n       +--------------+`,
        apps: 'High-payload search quadcopters, commercial photogrammetry planes, maritime mapping rovers.',
        related: ['Pixhawk 6C', 'Cube Orange+']
    },
    cubeorange: {
        title: 'Cube Orange+',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V (via Power Board)',
        pins: '14 Servo outputs (carrier socket)',
        desc: 'Enterprise-grade flight controller featuring dual heating elements inside the sensor module to maintain stable IMU temperatures in freezing climates.',
        specs: ['Processor: STM32H757 Dual-Core (Cortex-M7 @ 400MHz / M4 @ 240MHz)', 'IMUs: 3x redundant IMUs (isolated and heated)', 'Target use: Commercial industrial drone systems'],
        tutorials: '1. Insert the Cube Orange module into a carrier baseboard.\n2. Open ArduPilot Mission Planner client.\n3. Flash the target firmware version over USB.\n4. Calibrate dual compass antennas to ensure accurate path navigation.',
        code: `# ArduPilot custom script placeholder\n# Set auto return home if battery drops below 20%\nif battery_voltage() < 22.2:\n    set_mode("RTL")\n    print("Battery low - returning home!")`,
        pinout: `       +-----------+\n       |   CUBE    |\n       |  ORANGE+  |\n       | [GPS]     |\n  PINS |[IO PORTS] |-- Baseboard connectors\n       +-----------+`,
        apps: 'Industrial spray delivery drones, high-altitude research vehicles, rescue quadcopter arrays.',
        related: ['Pixhawk 6X', 'Holybro Durandal']
    },
    durandal: {
        title: 'Holybro Durandal',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '5V (via Power Module)',
        pins: '14 PWM outputs',
        desc: 'High-performance drone autopilot hardware featuring custom noise-isolated electronics designs to deliver stable flight profiles.',
        specs: ['Processor: STM32H743 (32-bit @ 480 MHz)', 'Clock Speed: 480 MHz', 'Sensor Bus: Isolated SPI channels', 'Barometer: Dual ICM20602 sensors'],
        tutorials: '1. Connect Durandal via USB-C to QGroundControl.\n2. Select multicopter or plane template configs.\n3. Build logic triggers checking sensor values to trigger rescue parachutes.',
        code: `# Mavlink custom fail-safe check\nif get_baro_alt_diff() > 5.0:\n    trigger_parachute_servo()\n    print("Parachute deployed!")`,
        pinout: `       +-------------+\n       |  DURANDAL   |\n  USART|[   USART1  ]|\n  PWM  |[ IO OUTS  ]|\n  I2C  |[   I2C1    ]|\n       +-------------+`,
        apps: 'Autonomous courier copters, research drones, extreme weather telemetry platforms.',
        related: ['Cube Orange+', 'Pixhawk 6X']
    },
    nxpimx: {
        title: 'NXP i.MX RT1060',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '3.3V',
        pins: '40-pin header expansion',
        desc: 'Real-time crossover processor matching microcontroller responses with the heavy processing power of full application processors.',
        specs: ['Processor: NXP i.MX RT1060 (ARM Cortex-M7 @ 600 MHz)', 'Operating Voltage: 3.3V', 'Clock Speed: 600 MHz', 'RAM: 1 MB on-chip SRAM'],
        tutorials: '1. Install NXP MCUXpresso IDE software packages.\n2. Connect RT1060 board via onboard debug link USB.\n3. Run scripts evaluating real-time feedback logic cycles.',
        code: `// MCUXpresso real-time GPIO read\n#include "fsl_gpio.h"\nvoid setup() {\n  GPIO_PinInit(GPIO1, 9, &(gpio_pin_config_t){kGPIO_DigitalOutput, 0});\n}\nvoid loop() {\n  GPIO_PinWrite(GPIO1, 9, 1);\n  delayMicroseconds(5);\n  GPIO_PinWrite(GPIO1, 9, 0);\n}`,
        pinout: `       +-------------+\n  3V3 -|1          40|-GND\n  GP2 -|2          39|-TXD1\n  GP3 -|3          38|-RXD1\n       +-------------+`,
        apps: 'Real-time motor feedback controls, industrial signal processing, advanced audio mixing.',
        related: ['Teensy 4.1', 'TI LaunchPad']
    },
    tilaunchpad: {
        title: 'TI LaunchPad C2000',
        diff: 'ADVANCED',
        diffClass: 'advanced',
        voltage: '3.3V / 5V',
        pins: 'Dual 20-pin BoosterPack Headers',
        desc: 'High-performance microcontrollers board designed by Texas Instruments for precision digital real-time controls.',
        specs: ['Processor: TMS320F28379D (Dual 32-bit DSP C28x)', 'Operating Voltage: 3.3V & 5V', 'Clock Speed: 200 MHz', 'Flash Memory: 1 MB', 'ADCs: 4x 16-bit analog precision converters'],
        tutorials: '1. Connect LaunchPad to PC via Micro-USB.\n2. Launch TI Code Composer Studio (CCS) software suite.\n3. Load ADC motor feedback templates, run debugging steps, and flash the board.',
        code: `// TI DSP ADC read loop\n#include "F2837xD_device.h"\nvoid main(void) {\n  InitSysCtrl();\n  // Start precision ADC conversions\n  AdcaRegs.ADCSOCFRC1.bit.SOC0 = 1;\n  while(AdcaRegs.ADCINTFLG.bit.ADCINT1 == 0);\n  uint16_t val = AdcaRegs.ADCRESULT0;\n}`,
        pinout: `       +-------------+\n  3.3V |P1.1    P1.2 | 5.0V\n  ADC  |P1.3    P1.4 | GND\n  GPIO |P1.5    P1.6 | GPIO\n       +-------------+`,
        apps: 'High-end electric motor controllers, grid solar inverters, battery management systems.',
        related: ['BeagleBone Black', 'NXP i.MX RT1060']
    }
};

function openComponentDetails(compId) {
    const data = COMPONENT_DB[compId];
    if (!data) return;

    // Load data into modal elements
    document.getElementById('modal-comp-difficulty').innerText = data.diff;
    // Set appropriate color class for difficulty
    const diffTag = document.getElementById('modal-comp-difficulty');
    diffTag.className = `difficulty-tag ${data.diffClass}`;
    
    document.getElementById('modal-comp-title').innerText = data.title;
    document.getElementById('modal-comp-desc').innerText = data.desc;
    document.getElementById('modal-comp-voltage').innerText = data.voltage;
    document.getElementById('modal-comp-pins').innerText = data.pins;
    document.getElementById('modal-comp-tutorials').innerText = data.tutorials;
    document.getElementById('modal-comp-pinout').innerText = data.pinout;
    document.getElementById('modal-comp-apps').innerText = data.apps;
    document.getElementById('modal-comp-code').innerText = data.code;

    // Format specs list
    const specsContainer = document.getElementById('modal-comp-specs');
    specsContainer.innerHTML = '';
    data.specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerText = spec;
        specsContainer.appendChild(li);
    });

    // Format related elements
    const relatedContainer = document.getElementById('modal-comp-related');
    relatedContainer.innerHTML = '';
    data.related.forEach(rel => {
        const span = document.createElement('span');
        span.innerText = rel;
        relatedContainer.appendChild(span);
    });

    // Show modal
    document.getElementById('component-detail-modal').classList.remove('hidden');
}

function closeComponentDetails() {
    document.getElementById('component-detail-modal').classList.add('hidden');
}

function copyModalCode() {
    const codeText = document.getElementById('modal-comp-code').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        alert('Code snippet copied to clipboard!');
    });
}

// Search and Filter Components
function filterComponents(category) {
    // Update active pill styling
    document.querySelectorAll('[data-cat-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-cat-filter="${category}"]`).classList.add('active');

    // Filter cards
    const cards = document.querySelectorAll('#components-grid-container .comp-grid-card');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchComponents() {
    const query = document.getElementById('component-search-input').value.toLowerCase();
    const cards = document.querySelectorAll('#components-grid-container .comp-grid-card');
    
    // Reset category filter pills to all
    document.querySelectorAll('[data-cat-filter]').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-cat-filter="all"]').classList.add('active');

    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        if (name.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}


/* ================= 10. PROJECT DATABASE FILTER & MODALS ================= */
const PROJECT_DB = {
    irrigation: {
        title: 'Smart Irrigation System',
        diff: 'BEGINNER',
        desc: 'Automatic plant watering system powered by an Arduino Nano. Connects to soil moisture probes, evaluates metrics, and opens solenoid water pumps.',
        materials: ['Arduino Nano controller', 'Soil moisture sensor probe', '5V water pump', '5V single-channel relay board', 'Jumper wires & breadboard', 'Power supply battery pack'],
        steps: [
            'Connect the A0 pin of the soil sensor to pin A0 of the Arduino.',
            'Connect the VCC of soil sensor to 5V, GND to GND.',
            'Connect Arduino digital pin D3 to the input pin of the relay module.',
            'Bridge the water pump power wire through the Common and Normally Open terminals of the relay.',
            'Write the firmware: read analog values from A0. If value is below threshold (dry soil), set D3 HIGH to trigger pump. Delay 5 seconds.'
        ],
        skills: ['Circuit Wiring', 'Analog Signal Reading', 'Relay Switching Logic', 'Basic C++ control loops'],
        industry: 'Smart agriculture dashboards, drip watering controller blocks, industrial greenhouse sensor configurations.'
    },
    doorlock: {
        title: 'IoT Smart Door Lock',
        diff: 'INTERMEDIATE',
        desc: 'Wi-Fi enabled home access lock. Students interface custom RFID cards alongside hosting a secure local dashboard to command door relays.',
        materials: ['ESP8266 or ESP32 board', 'RC522 RFID reader module', 'RFID tokens/cards', '12V solenoid door lock', '12V external power brick', 'N-channel MOSFET module'],
        steps: [
            'Wire the RFID RC522 to SPI pins (SDA, SCK, MOSI, MISO) of the ESP32.',
            'Wire the gate pin of MOSFET module to ESP32 pin D5.',
            'Bridge the 12V lock power line through the MOSFET drain and source.',
            'Upload ESP32 firmware configured to establish locally hosted page views.',
            'Implement RFID validation logs. Create button pathways on the webpage to toggle D5 output state.'
        ],
        skills: ['SPI logic interfaces', 'MOSFET circuit switches', 'Web API integrations', 'Client-Server communication'],
        industry: 'Hotel keyless entries, modern corporate badge setups, residential smart-locks configurations.'
    },
    drone: {
        title: 'Drone Autonomous Telemetry',
        diff: 'ADVANCED',
        desc: 'Advanced UAV tracking system. Interface telemetry radios to transceive coordinates, enabling automated flight paths without manual controllers.',
        materials: ['Pixhawk flight controller board', 'UBLOX GPS module', '433MHz Telemetry radio transceiver', 'QGroundControl software engine', 'Brushless motors & ESC blocks'],
        steps: [
            'Mount the GPS module onto the chassis. Wire the port into the Pixhawk GPS socket.',
            'Connect telemetry transceiver to Pixhawk TELEM1 socket. Mount secondary transceiver to desktop PC USB.',
            'Run flight configuration diagnostics in QGroundControl.',
            'Calibrate sensors (accelerometer, magnetometer compass).',
            'Write coordinates waypoint file. Upload paths wirelessly. Test autonomous auto-takeoff scripts.'
        ],
        skills: ['Sensors calibration', 'Radio packet streams', 'Waypoints plotting math', 'Autopilot software suites'],
        industry: 'Agricultural mapping cameras, terrain delivery drones, autonomous search scouting quadcopters.'
    },
    'ai-robot': {
        title: 'AI Object Sorter Robot',
        diff: 'ADVANCED',
        desc: 'Autonomous robotic arm sorting setup. Interfaces camera streams on an NVIDIA Jetson Nano, evaluating trash classifications via neural networks.',
        materials: ['NVIDIA Jetson Nano board', 'USB Web camera or CSI Camera', '3-Axis robotic arm chassis', 'PCA9685 PWM driver board', 'External 5V 4A power supply'],
        steps: [
            'Connect CSI camera module to camera port of Jetson Nano.',
            'Connect PCA9685 driver block to I2C pins of Jetson Nano.',
            'Wire servos of robotic arm to PCA9685 driver channels.',
            'Configure Python scripts pulling SSD-MobileNet classification weights.',
            'Evaluate labels. Trigger target coordinate algorithms commanding servos to pick and drop target items.'
        ],
        skills: ['Neural net inference', 'GPU matrix processing', 'I2C motor drivers', 'Robotic kinematics math'],
        industry: 'Automated warehouse sorters (Amazon style), industrial sorting grids, autonomous quality control assemblies.'
    }
};

function openProjectDetails(projId) {
    const data = PROJECT_DB[projId];
    if (!data) return;

    // Load data into modal elements
    document.getElementById('modal-proj-difficulty').innerText = data.diff;
    document.getElementById('modal-proj-difficulty').className = `difficulty-tag ${data.diff.toLowerCase()}`;
    document.getElementById('modal-proj-title').innerText = data.title;
    document.getElementById('modal-proj-industry').innerText = data.industry;

    // Format materials list
    const materialsContainer = document.getElementById('modal-proj-materials');
    materialsContainer.innerHTML = '';
    data.materials.forEach(mat => {
        const li = document.createElement('li');
        li.innerText = mat;
        materialsContainer.appendChild(li);
    });

    // Format steps list
    const stepsContainer = document.getElementById('modal-proj-steps');
    stepsContainer.innerHTML = '';
    data.steps.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        stepsContainer.appendChild(li);
    });

    // Format skills
    const skillsContainer = document.getElementById('modal-proj-skills');
    skillsContainer.innerHTML = '';
    data.skills.forEach(skill => {
        const span = document.createElement('span');
        span.innerText = skill;
        skillsContainer.appendChild(span);
    });

    // Show modal
    document.getElementById('project-detail-modal').classList.remove('hidden');
}

function closeProjectDetails() {
    document.getElementById('project-detail-modal').classList.add('hidden');
}

function applyProjectFilters() {
    const age = document.getElementById('filter-age').value;
    const diff = document.getElementById('filter-difficulty').value;
    const cost = document.getElementById('filter-cost').value;
    const tech = document.getElementById('filter-tech').value;

    const cards = document.querySelectorAll('#projects-grid-container .project-grid-card');
    cards.forEach(card => {
        const cardAge = card.getAttribute('data-age');
        const cardDiff = card.getAttribute('data-diff');
        const cardCost = card.getAttribute('data-cost');
        const cardTech = card.getAttribute('data-tech');

        const matchAge = age === 'all' || cardAge === age;
        const matchDiff = diff === 'all' || cardDiff === diff;
        const matchCost = cost === 'all' || cardCost === cost;
        const matchTech = tech === 'all' || cardTech === tech;

        if (matchAge && matchDiff && matchCost && matchTech) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function resetProjectFilters() {
    document.getElementById('filter-age').value = 'all';
    document.getElementById('filter-difficulty').value = 'all';
    document.getElementById('filter-cost').value = 'all';
    document.getElementById('filter-tech').value = 'all';
    applyProjectFilters();
}


/* ================= 11. WORKSHOP PORTFOLIO LIGHTBOX ================= */
function filterPortfolio(group) {
    // Update pills active states
    document.querySelectorAll('[data-portfolio-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-portfolio-filter="${group}"]`).classList.add('active');

    // Filter items (data-group may hold multiple space-separated categories)
    const items = document.querySelectorAll('#portfolio-gallery-container .gallery-item');
    items.forEach(item => {
        const itemGroups = item.getAttribute('data-group').split(' ');
        if (group === 'all' || itemGroups.includes(group)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function openLightbox(imgSrc, captionText) {
    const overlay = document.getElementById('lightbox-overlay');
    const image = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');

    image.src = imgSrc;
    caption.innerText = captionText;
    overlay.classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox-overlay').classList.add('hidden');
}


/* ================= 12. MOCK DASHBOARD PORTALS SWITCHER ================= */
function navigateToDashboard(portalId) {
    // Route to dashboards view first
    navigateTo('dashboards');
    
    // Switch to active portal panel
    switchDashboardPortal(portalId);
}

function switchDashboardPortal(portalId) {
    // Update tab active buttons
    document.querySelectorAll('[data-portal]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-portal') === portalId) {
            btn.classList.add('active');
        }
    });

    // Hide all portal dashboards
    document.querySelectorAll('.dashboard-portal-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });

    // Show active portal dashboard
    const activePortal = document.getElementById(`portal-${portalId}`);
    if (activePortal) {
        activePortal.style.display = 'block';
        void activePortal.offsetWidth;
        activePortal.classList.add('active');
    }
}

// Student Dash methods
function downloadCertificate(certName) {
    alert(`Generating verifiable cryptographic certificate file for "${certName}". Download started!`);
}

// Parent Dash methods
function manageSubscription() {
    alert(`Routing to Stripe Billing Customer Portal mockup. You can edit card numbers, cancel subscription, or download invoices.`);
}

function downloadReport(period) {
    alert(`Downloading PDF progress report card for ${period}. Check your browser downloads folder!`);
}

function handleMessageMentor(e) {
    e.preventDefault();
    const msg = document.getElementById('mentor-msg-input').value;
    if (msg.trim() === '') return;
    alert(`Message transmitted to Lead Mentor: "${msg}". You will receive their response directly via SMS/WhatsApp within 4 hours.`);
    document.getElementById('mentor-msg-input').value = '';
}

// Mentor Dash methods
function gradeStudent(student) {
    const score = prompt(`Enter grading score / remarks for ${student}'s moisture sensor Arduino code:`, '100 / Excellent wiring paths');
    if (score) {
        alert(`Grade logs synced successfully. Parent and Student dashboards will update instantly.`);
    }
}

function reviewCodeSubmission(student) {
    alert(`Opening Git sandbox browser tab for ${student}'s source code. Code compilation: OK.`);
}

// Admin Dash methods
function banUser(userId) {
    alert(`Loaded management console overlay for account: "${userId}". Access configurations: ACTIVE.`);
}


/* ================= 13. CONTACT & GENERAL INTERACTIONS ================= */
function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    alert(`Thank you, ${name}! Your support ticket has been registered. Our STEM coordinator will ping you within 2 hours.`);
    document.getElementById('contact-us-form').reset();
}


/* ================= 14. FIREBASE BACKEND SYSTEM ================= */

const firebaseConfig = {
    apiKey: "AIzaSyDYFGFNKn8yxVko1H8pm2NLO2IdDJtIJAY",
    authDomain: "buildverse-platform.firebaseapp.com",
    projectId: "buildverse-platform",
    storageBucket: "buildverse-platform.firebasestorage.app",
    messagingSenderId: "606234645749",
    appId: "1:606234645749:web:52dac59b7b8df6adace1bc",
    measurementId: "G-E2WT9J24NN"
};

let db = null;
let auth = null;

// Initialize Firebase with Mock Fallback for local sandbox testing
function initFirebase() {
    // If running locally with the placeholder apiKey, force mockup mode for zero-latency offline testing
    const isLocalPlaceholder = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && firebaseConfig.apiKey === "AIzaSyFakeKeyPlaceholderForBuildVerse123";
    
    if (isLocalPlaceholder) {
        console.log("Local development with placeholder credentials detected. Starting in mockup mode.");
        setupMockFallbacks();
        return;
    }
    
    try {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            auth = firebase.auth();
            console.log("Firebase SDK initialized successfully.");
            
            auth.onAuthStateChanged(user => {
                handleAuthStateChanged(user);
            });
            
            seedFirestoreDatabase();
            
            db.collection('workshops').doc('active_workshop').onSnapshot(doc => {
                if (doc.exists) applyWorkshopSettings(doc.data());
            }, err => console.log("Realtime snapshot error:", err));
            
            db.collection('community_links').doc('whatsapp').onSnapshot(doc => {
                if (doc.exists) updateWhatsAppLinks(doc.data().url);
            });
        } else {
            setupMockFallbacks();
        }
    } catch (err) {
        console.error("Firebase fail, fall back to mock:", err);
        setupMockFallbacks();
    }
}

// SPA Routing triggers
function initAuthRouter() {
    window.addEventListener('popstate', () => handleUrlRouting());
    handleUrlRouting();
}

function handleUrlRouting() {
    const path = window.location.pathname.toLowerCase();
    const cleanPath = path === '/' || path === '/home' || path === '' ? 'home' : path.replace('/', '');
    
    if (cleanPath.endsWith('-login')) {
        navigateTo(cleanPath, false);
    } else if (cleanPath.endsWith('-dashboard')) {
        navigateToDashboard(cleanPath.replace('-dashboard', ''), false);
    } else {
        const targetView = `${cleanPath}-view`;
        if (document.getElementById(targetView)) {
            navigateTo(cleanPath, false);
        } else {
            navigateTo('home', false);
        }
    }
}

// Redirect and checks
function navigateToDashboard(portalId, pushState = true) {
    if (!auth || !auth.currentUser) {
        navigateTo(`${portalId}-login`, pushState);
        return;
    }
    
    getUserRole(auth.currentUser.uid, (role) => {
        if (role !== portalId && role !== 'admin') {
            alert(`Access Denied: You do not have permissions for the ${portalId} portal.`);
            navigateTo(`${role}-dashboard`, pushState);
            return;
        }
        
        navigateTo('dashboards', false);
        
        const switcherBar = document.querySelector('.dashboard-header-portal');
        if (switcherBar) switcherBar.style.display = (role === 'admin') ? 'flex' : 'none';
        
        switchDashboardPortal(portalId);
        renderPortalData(portalId, auth.currentUser.uid);
        
        if (pushState) {
            window.history.pushState({}, '', `/${portalId}-dashboard`);
        }
    });
}

function getUserRole(uid, callback) {
    if (!db) {
        callback(window.mockUserRole || 'student');
        return;
    }
    db.collection('users').doc(uid).get()
        .then(doc => callback(doc.exists ? doc.data().role : 'student'))
        .catch(() => callback('student'));
}

function handleAuthStateChanged(user) {
    const btn = document.getElementById('dashboard-dropdown-btn');
    if (user) {
        getUserRole(user.uid, (role) => {
            if (btn) btn.innerHTML = `${role.toUpperCase()} PORTAL <svg class="chevron-icon" viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2"></polyline></svg>`;
        });
    } else {
        if (btn) btn.innerHTML = `Dashboards <svg class="chevron-icon" viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2"></polyline></svg>`;
    }
}

function handleLogout() {
    if (auth && typeof auth.signOut === 'function') {
        auth.signOut().then(() => {
            alert("Signed out successfully.");
            navigateTo('home');
        });
    } else {
        window.mockUserRole = null;
        if (typeof mockAuth !== 'undefined') mockAuth.currentUser = null;
        alert("Mock user signed out.");
        navigateTo('home');
    }
}

function toggleAuthMode(role, mode) {
    const loginForm = document.getElementById(`${role}-login-form`);
    const signupForm = document.getElementById(`${role}-signup-form`);
    if (mode === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

async function handleLoginSubmit(event, role) {
    event.preventDefault();
    const email = document.getElementById(`${role}-email-input`).value.trim();
    const password = document.getElementById(`${role}-password-input`).value;
    const errorEl = document.getElementById(`${role}-login-error`);
    
    errorEl.classList.add('hidden');
    errorEl.innerText = '';
    
    try {
        let userCredential;
        try {
            userCredential = await auth.signInWithEmailAndPassword(email, password);
        } catch (authError) {
            const defaults = {
                'student@buildverse.in': { role: 'student', name: 'Aarav Sharma' },
                'parent@buildverse.in': { role: 'parent', name: 'Priya Sharma' },
                'mentor@buildverse.in': { role: 'mentor', name: 'Dr. Anuj Sen' },
                'admin@buildverse.in': { role: 'admin', name: 'Super Admin' }
            };
            if (defaults[email] && password === `${role}123`) {
                userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection('users').doc(userCredential.user.uid).set({
                    uid: userCredential.user.uid,
                    email,
                    role: defaults[email].role,
                    name: defaults[email].name
                });
            } else {
                throw authError;
            }
        }
        navigateToDashboard(role);
    } catch (err) {
        errorEl.classList.remove('hidden');
        errorEl.innerText = err.message;
    }
}

async function handleSignupSubmit(event, role) {
    event.preventDefault();
    const name = document.getElementById(`${role}-name-signup`).value.trim();
    const email = document.getElementById(`${role}-email-signup`).value.trim();
    const password = document.getElementById(`${role}-password-signup`).value;
    const errorEl = document.getElementById(`${role}-signup-error`);
    
    errorEl.classList.add('hidden');
    errorEl.innerText = '';
    
    try {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const userProfile = { uid: userCred.user.uid, email, role, name, isPaid: false };
        
        if (role === 'parent') {
            userProfile.studentEmailLink = document.getElementById('parent-student-email-signup').value.trim();
        }
        await db.collection('users').doc(userCred.user.uid).set(userProfile);
        navigateToDashboard(role);
    } catch (err) {
        errorEl.classList.remove('hidden');
        errorEl.innerText = err.message;
    }
}

function renderPortalData(portalId, uid) {
    if (!db) return;
    
    if (portalId === 'student') {
        db.collection('users').doc(uid).get().then(doc => {
            if (doc.exists) {
                const uData = doc.data();
                document.getElementById('student-welcome-name').innerText = `Welcome back, ${uData.name || 'Aarav Sharma'}!`;
                document.getElementById('student-welcome-plan').innerText = `${uData.isPaid ? 'Active Explorer Plan' : 'Explorer Plan (Inactive)'} • Enrolled in IoT track`;
                
                // Show/hide paywall
                const paywall = document.getElementById('student-paywall');
                const panel = document.getElementById('portal-student');
                if (uData.isPaid) {
                    paywall.classList.add('hidden');
                    panel.classList.remove('paywalled');
                } else {
                    paywall.classList.remove('hidden');
                    panel.classList.add('paywalled');
                }
            }
        });
        
        db.collection('projects').where('uid', '==', uid).get().then(snap => {
            const container = document.querySelector('.projects-track-list');
            if (container) {
                container.innerHTML = '';
                if (snap.empty) {
                    container.innerHTML = '<div class="text-center" style="color: var(--color-text-secondary); padding: 1.5rem 0;">No active projects recorded. Submit code in your lessons.</div>';
                } else {
                    snap.forEach(doc => {
                        const p = doc.data();
                        container.innerHTML += `<div class="project-track-item"><div><strong>${p.title}</strong><p>Status: ${p.status || 'Review Pending'}</p></div><span class="status-tag status-${p.status === 'Approved' ? 'approved' : 'pending'}">${p.status || 'Pending'}</span></div>`;
                    });
                }
            }
        });
        
        db.collection('certificates').where('uid', '==', uid).get().then(snap => {
            const container = document.querySelector('.certificates-list-widget');
            if (container) {
                container.innerHTML = '';
                if (snap.empty) {
                    container.innerHTML = '<div class="text-center" style="color: var(--color-text-secondary); padding: 1rem 0;">No certificates unlocked yet.</div>';
                } else {
                    snap.forEach(doc => {
                        container.innerHTML += `<div class="certificate-row"><span>📜 ${doc.data().title}</span><button class="btn btn-secondary btn-xs" onclick="downloadCertificate('${doc.data().title}')">Download</button></div>`;
                    });
                }
            }
        });
    } else if (portalId === 'parent') {
        db.collection('users').doc(uid).get().then(doc => {
            if (doc.exists) {
                const uData = doc.data();
                const studentEmail = uData.studentEmailLink;
                
                // Show/hide parent paywall
                const paywall = document.getElementById('parent-paywall');
                const panel = document.getElementById('portal-parent');
                if (uData.isPaid) {
                    paywall.classList.add('hidden');
                    panel.classList.remove('paywalled');
                } else {
                    paywall.classList.remove('hidden');
                    panel.classList.add('paywalled');
                }
                
                document.getElementById('parent-child-name').innerText = studentEmail || 'No linked student account';
                
                if (studentEmail) {
                    db.collection('users').where('email', '==', studentEmail).get().then(studentSnap => {
                        if (!studentSnap.empty) {
                            const studentData = studentSnap.docs[0].data();
                            const studentUid = studentData.uid;
                            
                            document.getElementById('parent-child-name').innerText = `${studentData.name} (${studentEmail})`;
                            
                            // Synchronize parent paywall to child's payment status
                            if (studentData.isPaid && !uData.isPaid) {
                                db.collection('users').doc(uid).update({ isPaid: true });
                                paywall.classList.add('hidden');
                                panel.classList.remove('paywalled');
                            }
                            
                            // Load child's actual projects
                            db.collection('projects').where('uid', '==', studentUid).get().then(projSnap => {
                                const container = document.getElementById('parent-projects-list');
                                if (container) {
                                    container.innerHTML = '';
                                    if (projSnap.empty) {
                                        container.innerHTML = '<div class="text-center" style="color: var(--color-text-secondary); padding: 1rem 0;">No active projects recorded for your child.</div>';
                                    } else {
                                        projSnap.forEach(projDoc => {
                                            const p = projDoc.data();
                                            container.innerHTML += `<div class="project-track-item"><div><strong>${p.title}</strong><p>Status: ${p.status || 'Review Pending'}</p></div><span class="status-tag status-${p.status === 'Approved' ? 'approved' : 'pending'}">${p.status || 'Pending'}</span></div>`;
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    } else if (portalId === 'mentor') {
        db.collection('registrations').limit(10).get().then(snap => {
            const tbody = document.querySelector('.leaderboard-table tbody');
            if (tbody && !snap.empty) {
                tbody.innerHTML = '';
                snap.forEach(doc => {
                    tbody.innerHTML += `<tr><td>${doc.data().studentName}</td><td>Grade ${doc.data().grade}</td><td>${doc.data().city || 'Bengaluru'}</td><td><button class="btn btn-secondary btn-xs" onclick="gradeStudent('${doc.data().studentName}')">Grade</button></td></tr>`;
                });
            }
        });
    } else if (portalId === 'admin') {
        db.collection('registrations').orderBy('timestamp', 'desc').limit(20).get().then(snap => {
            const tbody = document.querySelector('#portal-admin .leaderboard-table tbody');
            if (tbody) {
                tbody.innerHTML = snap.empty ? '<tr><td colspan="4" class="text-center">No registrations found.</td></tr>' : '';
                snap.forEach(doc => {
                    const r = doc.data();
                    const d = r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleDateString() : 'Just now';
                    tbody.innerHTML += `<tr><td>${r.emailAddress}</td><td>Grade ${r.grade}</td><td>${d}</td><td><button class="btn btn-secondary btn-xs" onclick="alert('Student: ${r.studentName}\\nParent: ${r.parentName}\\nMobile: ${r.mobileNumber}')">View</button></td></tr>`;
                });
            }
        });
        
        db.collection('workshops').doc('active_workshop').get().then(doc => {
            if (doc.exists) {
                const d = doc.data();
                document.getElementById('admin-ws-title').value = d.title || '';
                document.getElementById('admin-ws-banner').value = d.banner || '';
                document.getElementById('admin-ws-desc').value = d.description || '';
                document.getElementById('admin-ws-datetime').value = d.dateTime || '';
                document.getElementById('admin-ws-countdown').value = d.countdownEnd || '';
                document.getElementById('admin-ws-status').value = d.status || 'open';
                document.getElementById('admin-ws-maxseats').value = d.maxSeats || 150;
                document.getElementById('admin-ws-whatsapp').value = d.whatsAppCommunityLink || '';
                document.getElementById('admin-ws-giveaway').value = d.giveawayInfo || '';
                document.getElementById('admin-ws-certs').value = d.certInfo || '';
                document.getElementById('admin-ws-faq1-q').value = d.faq1_q || '';
                document.getElementById('admin-ws-faq1-a').value = d.faq1_a || '';
                document.getElementById('admin-ws-faq2-q').value = d.faq2_q || '';
                document.getElementById('admin-ws-faq2-a').value = d.faq2_a || '';
                document.getElementById('admin-ws-mentor-name').value = d.mentorName || '';
                document.getElementById('admin-ws-mentor-title').value = d.mentorTitle || '';
                document.getElementById('admin-ws-field-exp').checked = d.fieldExp !== false;
                document.getElementById('admin-ws-field-tech').checked = d.fieldTech !== false;
                document.getElementById('admin-ws-gallery').value = (d.gallery || []).join(', ');
            }
        });
    }
}

async function handleSaveSettings(event) {
    event.preventDefault();
    if (!db) return;
    const settings = {
        title: document.getElementById('admin-ws-title').value,
        banner: document.getElementById('admin-ws-banner').value,
        description: document.getElementById('admin-ws-desc').value,
        dateTime: document.getElementById('admin-ws-datetime').value,
        countdownEnd: document.getElementById('admin-ws-countdown').value,
        status: document.getElementById('admin-ws-status').value,
        maxSeats: parseInt(document.getElementById('admin-ws-maxseats').value, 10) || 150,
        whatsAppCommunityLink: document.getElementById('admin-ws-whatsapp').value,
        giveawayInfo: document.getElementById('admin-ws-giveaway').value,
        certInfo: document.getElementById('admin-ws-certs').value,
        faq1_q: document.getElementById('admin-ws-faq1-q').value,
        faq1_a: document.getElementById('admin-ws-faq1-a').value,
        faq2_q: document.getElementById('admin-ws-faq2-q').value,
        faq2_a: document.getElementById('admin-ws-faq2-a').value,
        mentorName: document.getElementById('admin-ws-mentor-name').value,
        mentorTitle: document.getElementById('admin-ws-mentor-title').value,
        fieldExp: document.getElementById('admin-ws-field-exp').checked,
        fieldTech: document.getElementById('admin-ws-field-tech').checked,
        gallery: document.getElementById('admin-ws-gallery').value.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };
    try {
        await db.collection('workshops').doc('active_workshop').update(settings);
        await db.collection('community_links').doc('whatsapp').set({ url: settings.whatsAppCommunityLink });
        const successLbl = document.getElementById('admin-save-success');
        if (successLbl) {
            successLbl.style.display = 'inline';
            setTimeout(() => { successLbl.style.display = 'none'; }, 3000);
        }
    } catch (err) {
        alert("Error saving settings: " + err.message);
    }
}

function applyWorkshopSettings(data) {
    if (!data) return;
    const title = document.getElementById('workshop-page-title');
    const desc = document.getElementById('workshop-page-description');
    if (title) title.innerText = data.title;
    if (desc) desc.innerText = data.description;
    
    if (data.countdownEnd) window.wsTargetDate = new Date(data.countdownEnd);
    
    const taken = data.seatsTaken || 90;
    const max = data.maxSeats || 150;
    const seatsPrg = document.getElementById('seats-progress');
    const seatsLbl = document.getElementById('seats-taken');
    if (seatsPrg) seatsPrg.style.width = `${Math.min(100, Math.floor((taken/max)*100))}%`;
    if (seatsLbl) seatsLbl.innerText = `${taken} of ${max} seats filled`;
    
    const submits = document.querySelectorAll('#workshop-registration-form button[type="submit"]');
    submits.forEach(btn => {
        btn.disabled = data.status === 'closed';
        btn.innerText = data.status === 'closed' ? "Registrations Closed" : "Reserve My Free Seat";
    });
    
    const exp = document.getElementById('prev-exp');
    if (exp) exp.closest('.form-group').style.display = (data.fieldExp !== false) ? 'block' : 'none';
    const tech = document.querySelector('.checkbox-pill-grid');
    if (tech) tech.closest('.form-group').style.display = (data.fieldTech !== false) ? 'block' : 'none';
    
    const gEl = document.querySelector('.benefit-box:nth-child(1) p');
    if (gEl && data.giveawayInfo) gEl.innerText = data.giveawayInfo;
    const cEl = document.querySelector('.benefit-box:nth-child(2) p');
    if (cEl && data.certInfo) cEl.innerText = data.certInfo;
    
    const f1q = document.getElementById('faq-dynamic-q1');
    const f1a = document.getElementById('faq-dynamic-a1');
    if (f1q && data.faq1_q) f1q.innerText = data.faq1_q;
    if (f1a && data.faq1_a) f1a.innerText = data.faq1_a;
    
    const f2q = document.getElementById('faq-dynamic-q2');
    const f2a = document.getElementById('faq-dynamic-a2');
    if (f2q && data.faq2_q) f2q.innerText = data.faq2_q;
    if (f2a && data.faq2_a) f2a.innerText = data.faq2_a;
}

function updateWhatsAppLinks(url) {
    if (!url) return;
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => el.href = url);
}

async function seedFirestoreDatabase() {
    if (!db) return;
    try {
        const doc = await db.collection('workshops').doc('active_workshop').get();
        if (doc.exists) return;
        
        await db.collection('workshops').doc('active_workshop').set({
            title: "Free ESP8266 Innovation Workshop",
            description: "Build your first IoT project using ESP8266 and enter the world of AI, Robotics, Drones and Automation.",
            banner: "assets/workshop_screenshot.png",
            dateTime: "July 15, 2026 • 5:00 PM",
            countdownEnd: "2026-07-15T17:00:00",
            status: "open",
            maxSeats: 150,
            seatsTaken: 90,
            giveawayInfo: "Active students stand a chance to win 1 of 5 ESP8266 starter kits, breadboards, jumper wires, and sensory packages.",
            certInfo: "Every student receives a cryptographic digital certificate of participation to add to their academic portfolio.",
            mentorName: "Dr. Anuj Sen",
            mentorTitle: "IoT Architect & PhD in Embedded Systems",
            faq1_q: "Do I need prior coding experience?",
            faq1_a: "No, this is a beginner-friendly workshop starting from scratch.",
            faq2_q: "Will hardware kits be provided?",
            faq2_a: "Yes! All registered students get access to digital simulators and high-performing starter boards.",
            fieldExp: true,
            fieldTech: true,
            gallery: ["assets/home_screenshot.png", "assets/workshop_screenshot.png"]
        });
        await db.collection('community_links').doc('whatsapp').set({ url: "https://wa.me/919000000000" });
    } catch (e) {
        console.error("Seed error:", e);
    }
}

// High-fidelity local emulator mockup fallbacks for offline development
function setupMockFallbacks() {
    console.log("Mock fallback database loaded.");
    
    // Wire compact mock instances to global scope
    const mockStorage = {};
    const getMockCollection = (colName) => ({
        doc: (id) => ({
            get: async () => ({ exists: mockStorage[`${colName}/${id}`] !== undefined, data: () => mockStorage[`${colName}/${id}`] }),
            set: async (d) => { mockStorage[`${colName}/${id}`] = d; },
            update: async (d) => { mockStorage[`${colName}/${id}`] = { ...mockStorage[`${colName}/${id}`], ...d }; },
            onSnapshot: (cb) => { cb({ exists: mockStorage[`${colName}/${id}`] !== undefined, data: () => mockStorage[`${colName}/${id}`] }); return () => {}; }
        }),
        where: (field, op, val) => ({
            get: async () => {
                const docs = Object.keys(mockStorage)
                    .filter(k => k.startsWith(`${colName}/`))
                    .map(k => ({ id: k.split('/')[1], data: () => mockStorage[k] }))
                    .filter(d => d.data()[field] === val);
                return { empty: docs.length === 0, forEach: cb => docs.forEach(cb) };
            }
        }),
        add: async (d) => {
            const id = 'mock_' + Math.random().toString(36).substr(2, 9);
            mockStorage[`${colName}/${id}`] = d;
            return { id };
        },
        orderBy: function() { return this; },
        limit: (n) => ({
            get: async () => {
                const docs = Object.keys(mockStorage)
                    .filter(k => k.startsWith(`${colName}/`))
                    .map(k => ({ id: k.split('/')[1], data: () => mockStorage[k] }))
                    .slice(0, n);
                return { empty: docs.length === 0, forEach: cb => docs.forEach(cb) };
            }
        })
    });
    
    db = {
        collection: getMockCollection,
        runTransaction: async (cb) => cb({ get: async (ref) => ref.get(), update: (ref, data) => ref.update(data) })
    };
    
    auth = {
        currentUser: null,
        signInWithEmailAndPassword: async (email, password) => {
            const u = { email, uid: 'mock_uid_' + email.replace(/[^a-zA-Z]/g, '') };
            auth.currentUser = u;
            mockStorage[`users/${u.uid}`] = { uid: u.uid, email, role: email.includes('admin') ? 'admin' : email.includes('mentor') ? 'mentor' : email.includes('parent') ? 'parent' : 'student', name: email.split('@')[0] };
            return { user: u };
        },
        createUserWithEmailAndPassword: async (email, password) => {
            const u = { email, uid: 'mock_uid_' + email.replace(/[^a-zA-Z]/g, '') };
            auth.currentUser = u;
            mockStorage[`users/${u.uid}`] = { uid: u.uid, email, role: 'student', name: email.split('@')[0] };
            return { user: u };
        },
        signOut: async () => { auth.currentUser = null; },
        onAuthStateChanged: (cb) => { cb(auth.currentUser); return () => {}; }
    };
    
    // Seed initial mock storage
    mockStorage['workshops/active_workshop'] = {
        title: "Free ESP8266 Innovation Workshop",
        description: "Build your first IoT project using ESP8266 and enter the world of AI, Robotics, Drones and Automation.",
        banner: "assets/workshop_screenshot.png",
        dateTime: "July 15, 2026 • 5:00 PM",
        countdownEnd: "2026-07-15T17:00:00",
        status: "open",
        maxSeats: 150,
        seatsTaken: 90,
        giveawayInfo: "Active students stand a chance to win 1 of 5 ESP8266 starter kits, breadboards, jumper wires, and sensory packages.",
        certInfo: "Every student receives a cryptographic digital certificate of participation to add to their academic portfolio.",
        mentorName: "Dr. Anuj Sen",
        mentorTitle: "IoT Architect & PhD in Embedded Systems",
        faq1_q: "Do I need prior coding experience?",
        faq1_a: "No, this is a beginner-friendly workshop starting from scratch.",
        faq2_q: "Will hardware kits be provided?",
        faq2_a: "Yes! All registered students get access to digital simulators and high-performing starter boards.",
        fieldExp: true,
        fieldTech: true,
        gallery: ["assets/home_screenshot.png", "assets/workshop_screenshot.png"]
    };
    mockStorage['community_links/whatsapp'] = { url: "https://wa.me/919000000000" };
    
    // Apply settings immediately
    applyWorkshopSettings(mockStorage['workshops/active_workshop']);
    updateWhatsAppLinks(mockStorage['community_links/whatsapp'].url);
    
    // Trigger initial auth check
    auth.onAuthStateChanged(user => handleAuthStateChanged(user));
}

// Student & Parent Pass Activation simulation
window.activateStudentPass = function() {
    if (!auth || !auth.currentUser) {
        alert("Please log in first.");
        return;
    }
    const uid = auth.currentUser.uid;
    const btn = document.getElementById('btn-activate-student-pass') || document.getElementById('btn-activate-parent-pass');
    if (btn) btn.innerText = "Processing Secure Payment...";
    
    setTimeout(() => {
        db.collection('users').doc(uid).get().then(async (doc) => {
            if (doc.exists) {
                const uData = doc.data();
                const role = uData.role;
                
                // Update local/Firestore status
                if (db.collection('users').doc(uid).update) {
                    await db.collection('users').doc(uid).update({ isPaid: true });
                } else {
                    // Mock update
                    await db.collection('users').doc(uid).set({ ...uData, isPaid: true });
                }
                
                // If parent, also update child
                if (role === 'parent' && uData.studentEmailLink) {
                    const email = uData.studentEmailLink;
                    const studentSnap = await db.collection('users').where('email', '==', email).get();
                    if (!studentSnap.empty) {
                        studentSnap.forEach(async (sDoc) => {
                            if (db.collection('users').doc(sDoc.id).update) {
                                await db.collection('users').doc(sDoc.id).update({ isPaid: true });
                            } else {
                                await db.collection('users').doc(sDoc.id).set({ ...sDoc.data(), isPaid: true });
                            }
                        });
                    }
                }
                
                alert("🎉 Subscription Payment Successful! Your BuildVerse Student Pass is now fully active.");
                renderPortalData(role, uid);
            }
        });
    }, 1200);
};
