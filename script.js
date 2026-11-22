/* UI Logic (Scroll & Theme) */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
});

const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const htmlEl = document.documentElement;
const themeColorMeta = document.getElementById('theme-color-meta');

function applyTheme(theme) {
    if (theme === 'light') {
        body.removeAttribute('data-theme');
        htmlEl.removeAttribute('data-theme');
        themeBtn.innerText = '◐';
        if (themeColorMeta) themeColorMeta.setAttribute('content', '#F9F7F4');
    } else {
        body.setAttribute('data-theme', 'dark');
        htmlEl.setAttribute('data-theme', 'dark');
        themeBtn.innerText = '☼';
        if (themeColorMeta) themeColorMeta.setAttribute('content', '#000000');
    }
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeBtn.addEventListener('click', () => {
    const nextTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
});

/* Mobile menu */
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuToggle.innerText = isOpen ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.innerText = '☰';
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

/* Swiper, Lazy Load & 360 Touch Guard */
document.addEventListener('DOMContentLoaded', function () {
    let portfolioLoaded = false;

    const swiper = new Swiper('.mySwiper', {
        loop: true,
        observer: true,
        observeParents: true,
        touchStartPreventDefault: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        on: {
            slideChange: function () {
                document.querySelectorAll('.swiper-slide.interactive').forEach(slide => {
                    slide.classList.remove('interactive');
                });

                loadLazyIframe(this);

                const prevSlide = this.slides[this.previousIndex];
                if (prevSlide) {
                    const iframe = prevSlide.querySelector('iframe');
                    if (iframe && iframe.getAttribute('src')) {
                        const currentSrc = iframe.src;
                        iframe.src = '';
                        iframe.src = currentSrc;
                    }
                }
            }
        }
    });

    function loadLazyIframe(swiperInstance) {
        const activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
        if (activeSlide) {
            const iframe = activeSlide.querySelector('iframe');
            if (iframe && iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
            }
        }
    }

    /* Load the first 360°-tour only when the user approaches the #portfolio block */
    const portfolioSection = document.getElementById('portfolio');
    if ('IntersectionObserver' in window && portfolioSection) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !portfolioLoaded) {
                    portfolioLoaded = true;
                    loadLazyIframe(swiper);
                    obs.disconnect();
                }
            });
        }, { rootMargin: '300px 0px' });

        observer.observe(portfolioSection);
    } else {
        loadLazyIframe(swiper);
    }

    /* Unlocking/Locking touches for 360°-panoramas on mobile */
    document.querySelector('.swiper-wrapper').addEventListener('click', function (e) {
        const guard = e.target.closest('.tour-guard');
        if (guard) {
            const slide = guard.closest('.swiper-slide');
            if (slide) slide.classList.add('interactive');
            return;
        }

        const lockBtn = e.target.closest('.tour-lock-btn');
        if (lockBtn) {
            const slide = lockBtn.closest('.swiper-slide');
            if (slide) slide.classList.remove('interactive');
        }
    });
});

/* Form Handling */
const form = document.getElementById('inquiry-form');
const status = document.getElementById('form-status');
const btn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.innerText = 'Sending...';
    btn.disabled = true;
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            status.style.display = 'block';
            status.style.color = 'var(--accent)';
            status.innerText = 'Thank you! Your inquiry has been sent.';
            form.reset();
        } else {
            throw new Error();
        }
    } catch {
        status.style.display = 'block';
        status.style.color = '#e05252';
        status.innerText = 'Oops! Error sending message.';
    } finally {
        btn.innerText = 'Submit Inquiry';
        btn.disabled = false;
    }
});