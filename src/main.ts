import './style.css'

// --- 0. FORCE SCROLL TO TOP ON REFRESH ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

function query<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function queryAll(selector: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(selector);
}

// --- 1. CURSOR BLOCO BIM ---
const cursorWrapper = document.querySelector('[data-cursor]') as HTMLElement;

if (cursorWrapper) {
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorWrapper.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 400, fill: "forwards" });
    });

    const interactiveElements = queryAll('a, button, .project-item, .service-card, .testimonial-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorWrapper.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorWrapper.classList.remove('hovered'));
    });
}

// --- 2. BOTÃO MAGNÉTICO ---
const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach((btn) => {
    const button = btn as HTMLElement;
    button.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0px, 0px)';
    });
});

// --- 3. PRELOADER ---
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    
    if (progressBar) progressBar.style.width = '100%';

    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                query('.hero')?.classList.add('active');
            }, 500);
        }
    }, 1200);
});

// --- 4. TEXT SPLIT ANIMATION ---
function initSplitText() {
    const splitElements = queryAll('.animate-text-split');
    splitElements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        const chars = text.split('');
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.innerText = char;
            span.className = 'split-char';
            if (char === ' ') span.innerHTML = '&nbsp;';
            span.style.transitionDelay = `${index * 0.03}s`;
            el.appendChild(span);
        });
    });
}
initSplitText();

// --- 5. MENU MOBILE ---
const nav = document.getElementById('navLinks');
const overlay = document.getElementById('menuOverlay');
const openBtn = document.getElementById('openMenuBtn');
const closeBtn = document.getElementById('closeMenuBtn');

function toggleMenu(forceClose = false) {
  const isActive = nav?.classList.contains('active');
  if (isActive || forceClose) {
    nav?.classList.remove('active');
    overlay?.classList.remove('active');
  } else {
    nav?.classList.add('active');
    overlay?.classList.add('active');
  }
}

openBtn?.addEventListener('click', () => toggleMenu());
closeBtn?.addEventListener('click', () => toggleMenu());
overlay?.addEventListener('click', () => toggleMenu(true));

// --- 6. SCROLL SPY & BACK TO TOP ---
const sections = queryAll('section');
const navLinks = queryAll('.nav-links a');
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 250)) {
            const id = section.getAttribute('id');
            if(id) currentSection = id;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href')?.includes(currentSection)) {
            link.classList.add('active-link');
        }
    });

    if (window.scrollY > 500) {
        backToTopBtn?.classList.add('visible');
    } else {
        backToTopBtn?.classList.remove('visible');
    }
});

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 7. PARALLAX EFFECT ---
const heroBg = query('.hero-bg-wrapper');
window.addEventListener('scroll', () => {
    if (heroBg) {
        const scrollPosition = window.pageYOffset;
        heroBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
    }
});

// --- 8. LIGHTBOX / MODAL DETALHADO ---
const modal = document.getElementById('projectModal');
const modalImg = document.getElementById('modalImg') as HTMLImageElement;
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalCategory = document.getElementById('modalCategory');
const modalSpecsList = document.getElementById('modalSpecsList');
const modalContactBtn = document.getElementById('modalContactBtn');
const closeModal = query('.close-modal');
const projectImages = queryAll('.project-img');

if (modal && modalImg && modalTitle && modalDesc && modalCategory && modalSpecsList) {
    projectImages.forEach(img => {
        img.parentElement?.addEventListener('click', () => {
            const dataImg = img as HTMLImageElement;
            modalImg.src = dataImg.src;
            modalTitle.innerText = dataImg.dataset.title || 'Projeto Érgo';
            modalDesc.innerText = dataImg.dataset.desc || 'Descrição não disponível.';
            modalCategory.innerText = dataImg.dataset.category || 'Engenharia';
            
            modalSpecsList.innerHTML = '';
            const specs = dataImg.dataset.specs?.split(';') || [];
            specs.forEach(spec => {
                const li = document.createElement('li');
                li.innerText = spec.trim();
                modalSpecsList.appendChild(li);
            });

            modal.style.display = "flex";
            document.body.style.overflow = 'hidden';
        });
    });

    const closeAction = () => {
        modal.style.display = "none";
        document.body.style.overflow = 'auto'; 
    };

    closeModal?.addEventListener('click', closeAction);
    
    if (modalContactBtn) {
        modalContactBtn.addEventListener('click', closeAction);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAction();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeAction();
        }
    });
}

// --- 9. INFINITE MARQUEE ---
const track = query('.slider-track');
if (track) {
    const items = Array.from(track.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
    });
}

// --- 10. SCROLL SUAVE ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const href = anchor.getAttribute('href');
    if (href) {
      const target = document.querySelector(href);
      if (target) {
        const offsetPosition = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        toggleMenu(true);
      }
    }
  });
});

// --- 11. SPOTLIGHT ---
const cardsContainer = document.getElementById('cards-container');
const cards = queryAll('.service-card');
if (cardsContainer) {
  cardsContainer.onmousemove = (e) => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  };
}

// --- 12. OBSERVER (Atualizado) ---
const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      if (entry.target.classList.contains('stats-bar')) runCounters();
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal, .reveal-blur, .stats-bar, .animate-text-split').forEach(el => observer.observe(el));

// --- 13. COUNTERS ---
let hasRunCounters = false;
function runCounters() {
  if (hasRunCounters) return;
  hasRunCounters = true;
  const counters = queryAll('.counter');
  counters.forEach(counter => {
    const target = +(counter.getAttribute('data-target') || 0);
    const duration = 2000; 
    const increment = target / (duration / 16);
    let current = 0;
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.innerText = Math.ceil(current).toString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target.toString();
      }
    };
    updateCounter();
  });
}

// --- 14. PARTNER FLIP ---
const partnerContainer = query('.partners-interactive');
partnerContainer?.addEventListener('click', () => {
  partnerContainer.classList.toggle('swapped');
});