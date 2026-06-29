// ============================================
// NAVEGAÇÃO POR SCROLL SUAVE
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// IntersectionObserver para destacar o link ativo conforme rola
const observerOptions = {
  root: null,
  rootMargin: '-20% 0px -80% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      
      // Remove active de todos os links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Adiciona active no link correspondente
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, observerOptions);

// Observa todas as seções
sections.forEach(section => observer.observe(section));

// Smooth scroll para links de navegação
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Smooth scroll para links no hero (View Projects, My Trajectory)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  if (!anchor.classList.contains('nav-link')) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});

// ============================================
// HELPER: CARREGAR JSON
// ============================================
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Erro ao carregar ${path}:`, err);
    return null;
  }
}

// Helper para ler chaves com espaços
const k = (obj, key) => {
  if (!obj) return '';
  return obj[key] ?? obj[key + ' '] ?? obj[key.trim()] ?? '';
};

// ============================================
// RENDER: PROJECTS (CARROSSEL - GITHUB API)
// ============================================
const GITHUB_REPO = 'flaviapissarra/ctecl';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/p`;

async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/p`);
    if (!res.ok) throw new Error('API Error');
    const items = await res.json();
    const dirs = items.filter(i => i.type === 'dir');

    const projectsData = await Promise.all(dirs.map(async (dir) => {
      try {
        const metaRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/p/${dir.name}/metadata.json`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          return JSON.parse(atob(meta.content));
        }
      } catch {}
      return { domain: 'PROJECT', title: formatTitle(dir.name), description: 'Project details coming soon...', tools: [], public_link: `https://flaviapissarra.github.io/ctecl/p/${dir.name}/` };
    }));

    grid.innerHTML = `
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" aria-label="Anterior">‹</button>
        <div class="carousel-container">
          <div class="carousel-viewport">
            <div class="carousel-track">
              ${projectsData.map(p => `
                <div class="carousel-slide">
                  <article class="project-card">
                    <div class="project-domain">${p.domain || 'PROJECT'}</div>
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    ${p.tools?.length ? `<div class="project-tools">${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>` : ''}
                    <div class="project-links">
                      ${p.public_link ? `<a href="${p.public_link}" target="_blank" class="project-link">View project →</a>` : ''}
                      ${p.request_access ? `<a href="${p.request_access}" target="_blank" class="project-link">Request access →</a>` : ''}
                    </div>
                  </article>
                </div>`).join('')}
            </div>
          </div>
        </div>
        <button class="carousel-btn next" aria-label="Próximo">›</button>
      </div>
      <div class="carousel-dots"></div>`;
      
    initCarousel();
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; color:var(--color-text-muted);">Unable to load projects right now.</p>';
  }
}

function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return;
  
  const track = wrapper.querySelector('.carousel-track');
  const slides = wrapper.querySelectorAll('.carousel-slide');
  const prevBtn = wrapper.querySelector('.prev');
  const nextBtn = wrapper.querySelector('.next');
  const dotsContainer = wrapper.parentElement.querySelector('.carousel-dots');
  let currentIndex = 0;

  const getSlidesPerView = () => window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;

  function update() {
    const spv = getSlidesPerView();
    const slideWidth = slides[0].offsetWidth;
    const gap = 16;
    track.style.transform = `translateX(-${currentIndex * (slideWidth + gap)}px)`;
    
    const totalDots = Math.ceil(slides.length / spv);
    dotsContainer.innerHTML = Array.from({ length: totalDots }, (_, i) => 
      `<button class="carousel-dot ${i === Math.floor(currentIndex / spv) ? 'active' : ''}" data-index="${i}"></button>`
    ).join('');
    
    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.onclick = () => { currentIndex = parseInt(dot.dataset.index) * spv; update(); };
    });

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= slides.length - spv;
  }

  prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; update(); } };
  nextBtn.onclick = () => { if (currentIndex < slides.length - getSlidesPerView()) { currentIndex++; update(); } };
  
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { currentIndex = 0; update(); }, 200); });
  update();
}

// Helper para formatar títulos
function formatTitle(name) {
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================
// CARROSSEL CONTROLS
// ============================================
function initCarousel() {
  const container = document.querySelector('.carousel-container');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const slides = container.querySelectorAll('.carousel-slide');
  const prevBtn = container.querySelector('.carousel-btn.prev');
  const nextBtn = container.querySelector('.carousel-btn.next');
  const dotsContainer = container.querySelector('.carousel-dots');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let slidesPerView = getSlidesPerView();

  // Cria os dots
  const totalDots = Math.ceil(slides.length / slidesPerView);
  dotsContainer.innerHTML = Array.from({ length: totalDots }, (_, i) => 
    `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
  ).join('');

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function updateCarousel() {
    const slideWidth = slides[0].offsetWidth;
    const gap = parseInt(getComputedStyle(track).gap) || 16;
    const offset = currentIndex * (slideWidth + gap);
    
    track.style.transform = `translateX(-${offset}px)`;

    // Atualiza dots
    const currentDotIndex = Math.floor(currentIndex / slidesPerView);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentDotIndex);
    });

    // Atualiza botões
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= slides.length - slidesPerView;
  }

  function nextSlide() {
    if (currentIndex < slides.length - slidesPerView) {
      currentIndex++;
      updateCarousel();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const dotIndex = parseInt(dot.dataset.index);
      currentIndex = dotIndex * slidesPerView;
      updateCarousel();
    });
  });

  // Atualiza no resize
  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    currentIndex = 0;
    updateCarousel();
  });

  // Inicializa
  updateCarousel();
}

// ============================================
// RENDER: TRANSLATION
// ============================================
async function renderTranslation() {
  const data = await loadJSON('data/translations.json');
  const grid = document.getElementById('translation-grid');
  if (!data || !grid) return;

  grid.innerHTML = data.map(t => `
    <article class="translation-card">
      <div class="translation-pair">${k(t, 'pair')}</div>
      ${Array.isArray(k(t, 'domains')) ? `
        <div class="translation-domains">
          ${k(t, 'domains').map(d => `<span class="tool-tag">${d}</span>`).join('')}
        </div>
      ` : ''}
      <p>${k(t, 'description')}</p>
      ${k(t, 'excerpt') ? `<div class="translation-excerpt">"${k(t, 'excerpt')}"</div>` : ''}
      ${k(t, 'request_access') ? `<a href="${k(t, 'request_access')}" target="_blank" rel="noopener" class="translation-cta">Request sample access →</a>` : ''}
    </article>
  `).join('');
}

// ============================================
// RENDER: TIMELINE
// ============================================
async function renderTimeline() {
  const timeline = await loadJSON('data/timeline.json');
  const container = document.getElementById('timeline');
  if (!timeline || !container) return;

  container.innerHTML = timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      ${k(item, 'icon') ? `<div class="timeline-icon">${k(item, 'icon')}</div>` : ''}
      <div class="timeline-type">${k(item, 'type')}</div>
      <div class="timeline-date">${k(item, 'date')}</div>
      <h3>${k(item, 'title')}</h3>
      <p>${k(item, 'description')}</p>
    </div>
  `).join('');
}

// ============================================
// RENDER: LANGUAGES
// ============================================
async function renderLanguages() {
  const languages = await loadJSON('data/languages.json');
  const grid = document.getElementById('languages-grid');
  if (!languages || !grid) return;

  grid.innerHTML = languages.map(l => {
    const icon = k(l, 'icon').trim();
    const lang = k(l, 'lang').trim();
    const level = k(l, 'level').trim();
    const details = k(l, 'details').trim();
    const firstDetail = details.split('•')[0].trim();
    
    return `
      <div class="language-card">
        <div class="lang-title">${icon} ${lang} - ${level} - ${firstDetail}</div>
        <p class="lang-desc">${details.replace(firstDetail + ' • ', '')}</p>
      </div>
    `;
  }).join('');
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderTranslation();
  renderTimeline();
  renderLanguages();
});
