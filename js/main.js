/**
 * ===================================================================
 * MAIN CLIENT SCRIPT
 * Lenis Smooth Scroll, GSAP Narrative ScrollTrigger, Custom Cursor,
 * Ambient Web Audio Synthesizer, and Dynamic Chapter Tracking
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 2. Initialize Three.js 3D Hero
  let hero3D = null;
  if (window.Hero3D) {
    hero3D = new Hero3D('hero-3d-canvas');
  }

  // 3. Setup GSAP & ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis with ScrollTrigger if Lenis exists
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    initScrollAnimations();
  }

  // 4. Top Scroll Progress Bar
  const progressBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (hero3D) hero3D.updateScroll(window.scrollY / totalHeight);
    }
  }, { passive: true });

  // 5. Custom Cursor
  initCustomCursor();

  // 6. Chapter Active State Tracker
  initChapterTracker();

  // 7. Ambient Audio Synthesizer
  initAmbientSound();

  // 8. Template Guide Drawer Modal
  initGuideModal();
});

/**
 * Scroll Animations using GSAP
 */
function initScrollAnimations() {
  // Hero reveal
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl.from('.hero-meta-badge', { y: 20, opacity: 0, duration: 0.8, delay: 0.2 })
        .from('.hero-title', { y: 30, opacity: 0, duration: 1 }, '-=0.5')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-3d-stage', { scale: 0.9, opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=0.8')
        .from('.hero-cta-group', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-scroll-cue', { opacity: 0, duration: 0.8 }, '-=0.4');

  // Chapters Fade-in on Scroll
  const chapters = document.querySelectorAll('.story-chapter');
  chapters.forEach((chapter) => {
    const header = chapter.querySelector('.chapter-header');
    if (header) {
      gsap.from(header.children, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out'
      });
    }

    // Glass cards staggered entrance
    const cards = chapter.querySelectorAll('.glass-card');
    if (cards.length > 0) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: cards[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out'
      });
    }

    // Editorial quote block
    const quote = chapter.querySelector('.editorial-quote-block');
    if (quote) {
      gsap.from(quote, {
        scrollTrigger: {
          trigger: quote,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }

    // Terminal snippet
    const terminal = chapter.querySelector('.code-preview-terminal');
    if (terminal) {
      gsap.from(terminal, {
        scrollTrigger: {
          trigger: terminal,
          start: 'top 85%',
        },
        x: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }

    // Timeline steps
    const timelineSteps = chapter.querySelectorAll('.timeline-step');
    if (timelineSteps.length > 0) {
      timelineSteps.forEach((step, index) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
          },
          x: -25,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power2.out'
        });
      });
    }
  });

  // Epilogue Box
  const epilogue = document.querySelector('.epilogue-box');
  if (epilogue) {
    gsap.from(epilogue, {
      scrollTrigger: {
        trigger: epilogue,
        start: 'top 80%',
      },
      scale: 0.96,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out'
    });
  }
}

/**
 * Custom Interactive Cursor with Hover Magnification
 */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover states on clickable items
  const hoverables = document.querySelectorAll('a, button, input, .glass-card, .hero-3d-canvas, .preset-btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/**
 * Chapter Active Tracker
 */
function initChapterTracker() {
  const chapters = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-chapters a');
  const sideItems = document.querySelectorAll('.side-track-item');

  function updateActive() {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    chapters.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        sideItems.forEach(item => {
          if (item.getAttribute('data-target') === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Smooth scroll click handler
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Web Audio Ambient Tone Generator (Optional soothing sound)
 */
function initAmbientSound() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let gainNode = null;
  let osc1 = null;
  let osc2 = null;

  soundBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 1.5);
      gainNode.connect(audioCtx.destination);

      // Low soothing harmonic tone
      osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3

      osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220.00, audioCtx.currentTime); // A3

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc1.start();
      osc2.start();

      isPlaying = true;
      soundBtn.classList.add('active');
      soundBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      `;
      soundBtn.setAttribute('title', 'Mute Ambient Sound');
    } else {
      if (gainNode) {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
        setTimeout(() => {
          if (osc1) osc1.stop();
          if (osc2) osc2.stop();
        }, 850);
      }
      isPlaying = false;
      soundBtn.classList.remove('active');
      soundBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      soundBtn.setAttribute('title', 'Play Ambient Sound');
    }
  });
}

/**
 * Interactive Guide Modal for User Content Customization
 */
function initGuideModal() {
  const guideToggle = document.getElementById('open-guide-btn');
  const guideClose = document.getElementById('close-guide-btn');
  const guideModal = document.getElementById('guide-modal');

  if (guideToggle && guideModal) {
    guideToggle.addEventListener('click', () => {
      guideModal.classList.remove('hidden');
    });
  }

  if (guideClose && guideModal) {
    guideClose.addEventListener('click', () => {
      guideModal.classList.add('hidden');
    });
  }

  if (guideModal) {
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) {
        guideModal.classList.add('hidden');
      }
    });
  }
}
