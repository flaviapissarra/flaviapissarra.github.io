/* =========================================
   FLAVIAPP · MAIN.JS (Fluid Scroll Logic)
   ========================================= */

// 1. DYNAMIC BACKGROUND SCROLL EFFECT
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  blobs.forEach((blob, i) => {
    const speed = (i + 1) * 0.05;
    const rotate = (i + 1) * 0.02;
    blob.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * rotate}deg)`;
  });
});

// 2. DATA LOADER
async function fetchData(filename) {
  try {
    const response = await fetch(`data/${filename}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// 3. RENDER: Projects
async function loadProjects() {
  const data = await fetchData('projects');
  const container = document.getElementById('projects-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card">
      <span class="card-category" style="color:var(--accent-blue)">${item.domain}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="card-tools">
        ${item.tools.map(tool => `<span>${tool}</span>`).join('')}
      </div>
      <div style="margin-top:1rem; display:flex; gap:1rem;">
        ${item.public_link && item.public_link !== '#' ? `<a href="${item.public_link}" class="card-link" target="_blank">View project →</a>` : ''}
        ${item.request_access ? `<a href="${item.request_access}" class="card-link" target="_blank">Request access →</a>` : ''}
      </div>
    </div>
  `).join('');
}

// 4. RENDER: Translations
async function loadTranslations() {
  const data = await fetchData('translations');
  const container = document.getElementById('translation-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card">
      <span class="card-category" style="color:var(--accent-gold)">${item.domains.join(' · ')}</span>
      <h3>${item.pair}</h3>
      <p>${item.description}</p>
      ${item.excerpt ? `<blockquote class="translation-excerpt">"${item.excerpt}"</blockquote>` : ''}
      <div style="margin-top:1rem;">
        <a href="${item.request_access}" class="card-link" target="_blank">Request sample →</a>
      </div>
    </div>
  `).join('');
}

// 5. RENDER: Timeline
async function loadTimeline() {
  const data = await fetchData('timeline');
  if (!data) return;

  const filterContainer = document.getElementById('timeline-filters');
  const listContainer = document.getElementById('timeline');

  // Render Filters
  if (filterContainer && data.categories) {
    filterContainer.innerHTML = Object.keys(data.categories).map(key => {
      const cat = data.categories[key];
      return `<button class="filter-btn" data-filter="${key}">${cat.label}</button>`;
    }).join('');
    filterContainer.insertAdjacentHTML('afterbegin', `<button class="filter-btn active" data-filter="all">All</button>`);
  }

  // Render Rows
  if (listContainer && data.rows) {
    listContainer.innerHTML = data.rows.map(row => {
      const yearRange = row.startYear === row.endYear ? row.startYear : `${row.startYear} – ${row.endYear}`;
      const catLabel = data.categories[row.category]?.label || row.category;
      
      return `
        <div class="timeline-row" data-category="${row.category}">
          <span class="timeline-category-badge">${catLabel}</span>
          <div class="timeline-years">${yearRange}</div>
          <h4 class="timeline-title">${row.title}</h4>
          <div class="timeline-institution">${row.institution}</div>
          <p class="timeline-desc">${row.description}</p>
        </div>
      `;
    }).join('');
  }

  // Filter Logic
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      listContainer.querySelectorAll('.timeline-row').forEach(row => {
        row.style.display = (filter === 'all' || row.dataset.category === filter) ? 'block' : 'none';
      });
    });
  }
}

// 6. RENDER: Languages
async function loadLanguages() {
  const data = await fetchData('languages');
  const container = document.getElementById('languages-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card language-card" style="text-align:center;">
      <div class="language-flag">${item.icon}</div>
      <h3>${item.lang}</h3>
      <div style="color:var(--accent-blue); font-weight:600; margin-bottom:0.5rem;">${item.level}</div>
      <p style="font-size:0.85rem; color:var(--text-muted);">${item.details}</p>
    </div>
  `).join('');
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadTranslations();
  loadTimeline();
  loadLanguages();
});
