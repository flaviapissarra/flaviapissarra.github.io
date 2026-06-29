// ============================================
// 1. NAVEGAÇÃO & SCROLL SUAVE
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { rootMargin: '-20% 0px -80% 0px' });

sections.forEach(section => observer.observe(section));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.getElementById(this.getAttribute('href').substring(1));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================================
// 2. HELPERS
// ============================================
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}
const k = (obj, key) => obj ? (obj[key] ?? obj[key.trim()] ?? '') : '';
const formatTitle = (name) => name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

// ============================================
// 3. PROJETOS - DADOS HARDCODED (TESTE)
// ============================================
async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // DADOS DE TESTE - funciona sem API
  const projectsData = [
    {
      domain: "LOGISTICS",
      title: "Cross-Border Freight Cost Dashboard",
      description: "Mapped shipping variances across 12 major ports. Automated reporting reduced manual data cleaning by 65%.",
      tools: ["Power BI", "SQL", "Python"],
      public_link: "#",
      request_access: "mailto:flaviapissarra+githubio@gmail.com"
    },
    {
      domain: "AI/TRANSLATION",
      title: "GenAI Translation Evaluator",
      description: "Automated quality assessment for technical translations using LLMs and custom evaluation metrics.",
      tools: ["Python", "OpenAI API", "Pandas", "JSON"],
      public_link: "#",
      request_access: "mailto:flaviapissarra+githubio@gmail.com"
    },
    {
      domain: "NLP",
      title: "NLP Sentiment Analysis",
      description: "Sentiment analysis pipeline for multilingual customer feedback and trade communications.",
      tools: ["Python", "NLTK", "Transformers", "Pandas"],
      public_link: "#",
      request_access: "mailto:flaviapissarra+githubio@gmail.com"
    },
    {
      domain: "DATA ENGINEERING",
      title: "SQL Data Pipeline",
      description: "ETL pipeline for automated data extraction from port logistics systems. Reduced query time by 80%.",
      tools: ["SQL", "PostgreSQL", "Python", "Airflow"],
      public_link: "#",
      request_access: "mailto:flaviapissarra+githubio@gmail.com"
    }
  ];

  grid.innerHTML = `
    <div class="carousel-wrapper">
      <button class="carousel-btn prev" aria-label="Anterior">‹</button>
      <div class="carousel-container">
        <div class="carousel-viewport">
          <div class="carousel-track">
            ${projectsData.map(p => `
              <div class="carousel-slide">
                <article class="project-card">
                  <div class="project-domain">${p.domain}</div>
                  <h3>${p.title}</h3>
                  <p>${p.description}</p>
                  ${p.tools?.length ? `<div class="project-tools">${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>` : ''}
                  <div class="project-links">
                    <a href="${p.public_link}" class="project-link">View project →</a>
                    <a href="${p.request_access}" class="project-link">Request access →</a>
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

// ============================================
// 4. OUTRAS SEÇÕES (JSON)
// ============================================
async function renderTranslation() {
  const data = await loadJSON('data/translations.json');
  const grid = document.getElementById('translation-grid');
  if (!data || !grid) return;
  grid.innerHTML = data.map(t => `
    <article class="translation-card">
      <div class="translation-pair">${k(t, 'pair')}</div>
      ${k(t, 'domains')?.length ? `<div class="project-tools">${k(t, 'domains').map(d => `<span class="tool-tag">${d}</span>`).join('')}</div>` : ''}
      <p>${k(t, 'description')}</p>
      ${k(t, 'excerpt') ? `<div class="translation-excerpt">"${k(t, 'excerpt')}"</div>` : ''}
      ${k(t, 'request_access') ? `<a href="${k(t, 'request_access')}" target="_blank" class="project-link">Request sample →</a>` : ''}
    </article>`).join('');
}

async function renderTimeline() {
  const data = await loadJSON('data/timeline.json');
  const el = document.getElementById('timeline');
  if (!data || !el) return;
  
  el.innerHTML = data.map(i => `
    <div class="timeline-item" id="${i.id}">
      <div class="timeline-dot"></div>
      ${k(i, 'icon') ? `<div class="timeline-icon">${k(i, 'icon')}</div>` : ''}
      <div class="timeline-type">${k(i, 'type')}</div>
      <div class="timeline-date">${k(i, 'date')}</div>
      <div class="timeline-company">${k(i, 'company')}</div>
      <h3>${k(i, 'title')}</h3>
      <p>${k(i, 'description')}</p>
    </div>
  `).join('');
}

async function renderLanguages() {
  const data = await loadJSON('data/languages.json');
  const grid = document.getElementById('languages-grid');
  if (!data || !grid) return;
  grid.innerHTML = data.map(l => {
    const details = k(l, 'details').trim();
    const first = details.split('•')[0].trim();
    return `
      <div class="language-card">
        <div class="lang-title">${k(l, 'icon')} ${k(l, 'lang')} - ${k(l, 'level')} - ${first}</div>
        <p class="lang-desc">${details.replace(first + ' • ', '')}</p>
      </div>`;
  }).join('');
}

// ============================================
// 5. INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderTranslation();
  renderTimeline();
  renderLanguages();
});
