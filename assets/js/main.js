/* =========================================
   FLAVIAPP · SPA LOGIC & DATA RENDERER
   ========================================= */

// Utility: Clean trailing spaces from JSON keys & values
function cleanData(obj) {
  if (Array.isArray(obj)) return obj.map(cleanData);
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      cleaned[key.trim()] = cleanData(obj[key]);
    }
    return cleaned;
  }
  return typeof obj === 'string' ? obj.trim() : obj;
}

// 1. NAVIGATION LOGIC
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
    document.querySelector('.content-viewport').scrollTop = 0;
  });
});

// 2. DATA FETCHER
async function fetchData(filename) {
  try {
    const response = await fetch(`data/${filename}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    return cleanData(raw);
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    return null;
  }
}

// 3. RENDER FUNCTIONS
async function renderExperience() {
  const data = await fetchData('timeline');
  if (!data) return;
  
  const filterContainer = document.getElementById('timeline-filters');
  const listContainer = document.getElementById('timeline');
  const categories = data.categories || {};

  // Render Filters
  if (filterContainer && Object.keys(categories).length) {
    filterContainer.innerHTML = Object.keys(categories).map(key => 
      `<button class="filter-btn" data-filter="${key}">${categories[key].label}</button>`
    ).join('');
    filterContainer.insertAdjacentHTML('afterbegin', `<button class="filter-btn active" data-filter="all">All</button>`);
  }

  // Render Rows
  if (listContainer && data.rows) {
    listContainer.innerHTML = data.rows.map(row => {
      const cat = categories[row.category] || {};
      const catColor = cat.color || '#94a3b8';
      
      return `
        <div class="timeline-item" data-category="${row.category}">
          <span class="t-year" style="color: ${catColor} !important;">${row.startYear} – ${row.endYear}</span>
          <h4 class="t-title">${row.title}</h4>
          <div class="t-inst">${row.institution}</div>
          <p class="t-desc">${row.description}</p>
          <span class="timeline-category-badge" style="color:${catColor}; border-color: ${catColor}40; background:${catColor}15;">
            ${cat.label || row.category}
          </span>
        </div>
      `;
    }).join('');
  }

  // Filter Logic
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      listContainer.querySelectorAll('.timeline-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
      });
    });
  }
}

async function renderProjects() {
  const data = await fetchData('projects');
  const container = document.getElementById('projects-grid');
  if (!data || !container) return;
  
  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="card-tools">${item.tools.map(t => `<span>${t}</span>`).join('')}</div>
      <div style="margin-top:0.5rem; display:flex; gap:1rem;">
        ${item.public_link ? `<a href="${item.public_link}" class="card-link" target="_blank">View Project ↗</a>` : ''}
        ${item.request_access ? `<a href="${item.request_access}" class="card-link" target="_blank">Request Access </a>` : ''}
      </div>
    </div>
  `).join('');
}

async function renderLinguistics() {
  const data = await fetchData('translations');
  const container = document.getElementById('translation-grid');
  if (!data || !container) return;
  
  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.pair}</h3>
      <p>${item.description}</p>
      ${item.excerpt ? `<blockquote style="border-left:3px solid var(--accent-blue); padding-left:0.6rem; margin:0.5rem 0; font-style:italic; color:#cbd5e1; font-size:0.8rem;">"${item.excerpt}"</blockquote>` : ''}
      <a href="${item.request_access}" class="card-link" target="_blank">Request Sample ↗</a>
    </div>
  `).join('');
}

async function renderLanguages() {
  const data = await fetchData('languages');
  const container = document.getElementById('languages-grid');
  if (!data || !container) return;
  
  container.innerHTML = data.map(item => `
    <div class="card">
      <div class="flag">${item.icon}</div>
      <h3>${item.lang}</h3>
      <div class="level">${item.level}</div>
      <p>${item.details}</p>
    </div>
  `).join('');
}

// 4. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderExperience();
  renderProjects();
  renderLinguistics();
  renderLanguages();
});
