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
// RENDER: PROJECTS (CARROSSEL)
// ============================================
async function renderProjects() {
  const projects = await loadJSON('data/projects.json');
  const grid = document.getElementById('projects-grid');
  if (!projects || !grid) return;

  // Cria a estrutura do carrossel
  grid.innerHTML = `
    <div class="carousel-container">
      <button class="carousel-btn prev" aria-label="Projeto anterior">‹</button>
      <div class="carousel-track">
        ${projects.map(p => `
          <div class="carousel-slide">
            <article class="project-card">
              <div class="project-domain">${k(p, 'domain')}</div>
              <h3>${k(p, 'title')}</h3>
              <p>${k(p, 'description')}</p>
              ${Array.isArray(k(p, 'tools')) ? `
                <div class="project-tools">
                  ${k(p, 'tools').map(t => `<span class="tool-tag">${t}</span>`).join('')}
                </div>
              ` : ''}
              <div class="project-links">
                ${k(p, 'public_link') ? `<a href="${k(p, 'public_link')}" target="_blank" rel="noopener" class="project-link">View code →</a>` : ''}
                /* ${k(p, 'request_access') ? `<a href="${k(p, 'request_access')}" target="_blank" rel="noopener" class="project-link">Request demo access →</a>` : ''} */
              </div>
            </article>
          </div>
        `).join('')}
      </div>
      <button class="carousel-btn next" aria-label="Próximo projeto">›</button>
      <div class="carousel-dots"></div>
    </div>
  `;

  // Inicializa o carrossel
  initCarousel();
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
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === Math.floor(currentIndex / slidesPerView));
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
// RENDER: PROJECTS (BUSCA DO GITHUB)
// ============================================
const GITHUB_API = 'https://api.github.com/repos/flaviapissarra/ctecl/contents/p';

async function renderProjects() {
  try {
    // Busca a lista de pastas de projetos
    const response = await fetch(GITHUB_API);
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const items = await response.json();
    // Filtra apenas pastas (diretórios)
    const projects = items.filter(item => item.type === 'dir');
    
    // Busca metadata de cada projeto
    const projectsData = await Promise.all(
      projects.map(async (project) => {
        try {
          const metadataUrl = `${project.url}/metadata.json`;
          const metadataRes = await fetch(metadataUrl);
          if (metadataRes.ok) {
            return await metadataRes.json();
          }
          // Se não tiver metadata.json, cria um objeto básico
          return {
            domain: 'PROJECT',
            title: project.name.replace(/_/g, ' ').toUpperCase(),
            description: 'Project details coming soon...',
            tools: [],
            public_link: project.html_url,
            request_access: 'mailto:flaviapissarra+githubio@gmail.com'
          };
        } catch (err) {
          console.error(`Error loading metadata for ${project.name}:`, err);
          return {
            domain: 'PROJECT',
            title: project.name.replace(/_/g, ' ').toUpperCase(),
            description: 'Project details coming soon...',
            tools: [],
            public_link: project.html_url,
            request_access: 'mailto:flaviapissarra+githubio@gmail.com'
          };
        }
      })
    );

    const grid = document.getElementById('projects-grid');
    if (!grid || projectsData.length === 0) return;

    // Cria a estrutura do carrossel
    grid.innerHTML = `
      <div class="carousel-container">
        <button class="carousel-btn prev" aria-label="Projeto anterior">‹</button>
        <div class="carousel-track">
          ${projectsData.map(p => `
            <div class="carousel-slide">
              <article class="project-card">
                <div class="project-domain">${p.domain || 'PROJECT'}</div>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                ${Array.isArray(p.tools) && p.tools.length > 0 ? `
                  <div class="project-tools">
                    ${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}
                  </div>
                ` : ''}
                <div class="project-links">
                  ${p.public_link ? `<a href="${p.public_link}" target="_blank" rel="noopener" class="project-link">View code →</a>` : ''}
                  ${p.request_access ? `<a href="${p.request_access}" target="_blank" rel="noopener" class="project-link">Request demo access →</a>` : ''}
                </div>
              </article>
            </div>
          `).join('')}
        </div>
        <button class="carousel-btn next" aria-label="Próximo projeto">›</button>
        <div class="carousel-dots"></div>
      </div>
    `;

    // Inicializa o carrossel
    initCarousel();
    
  } catch (error) {
    console.error('Error loading projects:', error);
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Unable to load projects. Please try again later.</p>';
    }
  }
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
