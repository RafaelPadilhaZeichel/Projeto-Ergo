import './style.css'

// --- 0. CONFIGURAÇÕES INICIAIS ---
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

declare var Lenis: any;

// @ts-ignore
const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
});

function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 1. TITLE ALERT ---
const originalTitle = document.title;
window.addEventListener('blur', () => { document.title = "👷 Volte para a Érgo!"; });
window.addEventListener('focus', () => { document.title = originalTitle; });

// --- 2. HELPERS ---
function query<T extends HTMLElement>(selector: string): T | null { return document.querySelector<T>(selector); }
function queryAll(selector: string): NodeListOf<HTMLElement> { return document.querySelectorAll(selector); }

// --- 3. CURSOR & SPOTLIGHT ---
const spotlight = document.getElementById('gridSpotlight');
const cursorWrapper = document.querySelector('[data-cursor]') as HTMLElement;
const cursorText = cursorWrapper?.querySelector('.cursor-text') as HTMLElement;

if (window.innerWidth > 992 && cursorWrapper) {
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        if(spotlight) { spotlight.style.setProperty('--x', `${x}px`); spotlight.style.setProperty('--y', `${y}px`); }
        if(cursorWrapper) cursorWrapper.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
    const hoverEls = queryAll('a, button, .service-card, .accordion-header');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => cursorWrapper.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorWrapper.classList.remove('hovered'));
    });
    const textEls = queryAll('[data-cursor-text]');
    textEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const txt = el.getAttribute('data-cursor-text');
            if(cursorText && txt) { cursorText.innerText = txt; cursorWrapper.classList.add('text-mode'); }
        });
        el.addEventListener('mouseleave', () => cursorWrapper.classList.remove('text-mode'));
    });
}

// --- 4. SCRAMBLE TEXT ---
class ScrambleText {
    el: HTMLElement; chars: string; frame: number; queue: any[]; resolve: any; frameRequest: number;
    constructor(el: HTMLElement) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.frame = 0; this.queue = []; this.frameRequest = 0; this.update = this.update.bind(this); }
    setText(newText: string) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || ''; const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40); const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = ''; let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; } 
            else if (this.frame >= start) { if (!char || Math.random() < 0.28) { char = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].char = char; } output += `<span style="color:#FF6700">${char}</span>`; } 
            else { output += from; }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { if(this.resolve) this.resolve(); } else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}

// --- 5. PRELOADER & REVEAL ---
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = '100%';
    setTimeout(() => { if(preloader) { preloader.classList.add('fade-out'); setTimeout(() => { preloader.style.display='none'; query('.hero')?.classList.add('active'); }, 500); } }, 1200);
});

// --- 6. OBSERVER ---
let ranCounters = false;
function runCounters() {
    if(ranCounters) return; ranCounters = true;
    queryAll('.counter').forEach(c => {
        const target = +c.getAttribute('data-target')!;
        let curr = 0; const inc = target / 100;
        const update = () => { curr+=inc; if(curr<target){c.innerText=Math.ceil(curr).toString();requestAnimationFrame(update);}else{c.innerText=target.toString();} };
        update();
    });
}
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if(entry.target.classList.contains('reveal') || entry.target.classList.contains('reveal-blur')) entry.target.classList.add('active');
            if(entry.target.classList.contains('scramble-text')) {
                const el = entry.target as HTMLElement;
                if(!el.dataset.scrambled) { new ScrambleText(el).setText(el.innerText); el.dataset.scrambled="true"; }
            }
            if(entry.target.classList.contains('stats-bar')) runCounters();
        }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-blur, .scramble-text, .stats-bar').forEach(el => observer.observe(el));

// --- 7. NAV & BACK TO TOP ---
const header = query('header');
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if(window.scrollY > 50) header?.classList.add('scrolled'); else header?.classList.remove('scrolled');
    if(window.scrollY > 500) backBtn?.classList.add('visible'); else backBtn?.classList.remove('visible');
    
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const pBar = document.getElementById("readingProgress");
    if(pBar) pBar.style.width = scrolled + "%";
});
backBtn?.addEventListener('click', () => lenis.scrollTo(0));

// --- 8. MENU MOBILE ---
const nav = document.getElementById('navLinks'); const overlay = document.getElementById('menuOverlay');
const openBtn = document.getElementById('openMenuBtn'); const closeBtn = document.getElementById('closeMenuBtn');
function toggleMenu() { nav?.classList.toggle('active'); overlay?.classList.toggle('active'); }
openBtn?.addEventListener('click', toggleMenu); closeBtn?.addEventListener('click', toggleMenu); overlay?.addEventListener('click', toggleMenu);
queryAll('.nav-links a').forEach(l => l.addEventListener('click', () => { toggleMenu(); lenis.scrollTo(l.getAttribute('href')); }));

// --- 9. MODAL (CORRIGIDO PARA DESTRAVAR) ---
const modal = document.getElementById('projectModal');
const mImg = document.getElementById('modalImg') as HTMLImageElement;
const mTitle = document.getElementById('modalTitle'); const mDesc = document.getElementById('modalDesc'); const mCat = document.getElementById('modalCategory'); const mList = document.getElementById('modalSpecsList');
const closeM = query('.close-modal');

if(modal) {
    queryAll('.project-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.project-img') as HTMLImageElement;
            mImg.src = img.src; mTitle!.innerText = img.dataset.title!; mDesc!.innerText = img.dataset.desc!; mCat!.innerText = img.dataset.category!;
            mList!.innerHTML = ''; img.dataset.specs!.split(';').forEach(s => { const li = document.createElement('li'); li.innerText=s.trim(); mList!.appendChild(li); });
            
            modal.style.display = 'flex'; 
            document.body.classList.add('modal-open'); // Adiciona classe para destravar cursor
            lenis.stop();
        });
    });

    const shut = () => { 
        modal.style.display='none'; 
        document.body.classList.remove('modal-open'); 
        lenis.start(); 
    };

    closeM?.addEventListener('click', shut);
    const contactBtn = document.getElementById('modalContactBtn');
    if (contactBtn) contactBtn.addEventListener('click', shut);
    modal.addEventListener('click', e => { if(e.target===modal) shut(); });
    document.addEventListener('keydown', e => { if(e.key === "Escape" && modal.style.display === "flex") shut(); });
}

// --- 10. WHATSAPP FORM ---
const form = document.getElementById('whatsappForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('formName') as HTMLInputElement).value;
        const service = (document.getElementById('formService') as HTMLSelectElement).value;
        const details = (document.getElementById('formMessage') as HTMLTextAreaElement).value;
        const text = `*Site Érgo Contato*%0A%0A👤 *Nome:* ${name}%0A🏗️ *Interesse:* ${service}%0A📝 *Detalhes:* ${details}`;
        window.open(`https://wa.me/5527998616636?text=${text}`, '_blank');
        (form as HTMLFormElement).reset();
    });
}

// --- 11. ACCORDION (CORREÇÃO DE CLASSE) ---
queryAll('.accordion-header').forEach(h => h.addEventListener('click', function(this:HTMLElement){
    // Usamos 'accordion-open' para não brigar com o 'active' da animação de reveal
    this.parentElement?.classList.toggle('accordion-open');
    
    const c = this.nextElementSibling as HTMLElement;
    if(this.parentElement?.classList.contains('accordion-open')) {
        c.style.maxHeight = c.scrollHeight + "px"; 
    } else {
        c.style.maxHeight = "0";
    }
}));

// --- 12. PARTNER FLIP ---
const partnerContainer = query('.partners-interactive');
if(partnerContainer) partnerContainer.addEventListener('click', () => partnerContainer.classList.toggle('swapped'));

// --- 13. INFINITE MARQUEE ---
const track = query('.slider-track');
if (track) { Array.from(track.children).forEach(item => track.appendChild(item.cloneNode(true))); }

// --- 14. BOTÕES MAGNÉTICOS ---
const magnets = document.querySelectorAll('.magnetic-btn') as NodeListOf<HTMLElement>;

magnets.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        // Calcula a distância do mouse para o centro do botão
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move o botão suavemente na direção do mouse (0.4 é a força)
        btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        // Volta para o lugar original
        btn.style.transform = 'translate(0, 0)';
    });
});

// --- 15. TILT EFFECT NOS PROJETOS ---
const projects = document.querySelectorAll('.project-item') as NodeListOf<HTMLElement>;

projects.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // Posição X do mouse dentro do elemento
        const y = e.clientY - rect.top;  // Posição Y do mouse dentro do elemento
        
        // Calcula a rotação baseada na posição do mouse
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5; // -5 deg máx rotação
        const rotateY = ((x - centerX) / centerX) * 5;  // 5 deg máx rotação

        // Aplica a rotação na imagem ou no container
        const img = card.querySelector('.project-img') as HTMLElement;
        if(img) {
            img.style.transform = `scale(1.1) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        const img = card.querySelector('.project-img') as HTMLElement;
        if(img) {
            // Reseta a transformação (mantém apenas o scale 1.1 ou volta ao normal se preferir)
            img.style.transform = `scale(1) perspective(1000px) rotateX(0) rotateY(0)`;
        }
    });
});

// --- 16. SCROLL SPY (MENU ATIVO) ---
const sections = document.querySelectorAll('section');
const navLi = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        // HTMLElement precisa do cast se estiver usando TypeScript estrito, 
        // mas aqui vamos simplificar mantendo a lógica original
        const sectionTop = section.offsetTop;
        
        // O valor 200 é um ajuste para o link ativar um pouco antes 
        // da seção bater no topo exato da tela.
        if (window.scrollY >= (sectionTop - 300)) {
            current = section.getAttribute('id') || '';
        }
    });

    navLi.forEach(a => {
        a.classList.remove('active-link');
        // Verifica se o href do link contém o ID da seção atual
        if (a.getAttribute('href')?.includes(current)) {
            a.classList.add('active-link');
        }
    });
});

// --- 17. TEXT REVEAL POR PALAVRA ---
const textElements = document.querySelectorAll('.reveal-text p, .hero p, .services-section p');

textElements.forEach(el => {
    // 1. Quebra o texto em palavras
    const text = el.textContent || '';
    const words = text.split(' ');
    el.innerHTML = ''; // Limpa o texto original
    
    // 2. Cria spans para cada palavra
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word-span';
        span.style.transitionDelay = `${index * 30}ms`; // Delay progressivo
        el.appendChild(span);
    });

    // 3. Observer para ativar a animação
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const spans = entry.target.querySelectorAll('.word-span');
                spans.forEach(s => s.classList.add('visible'));
                observer.unobserve(entry.target); // Só anima uma vez
            }
        });
    }, { threshold: 0.1 });

    observer.observe(el);
});