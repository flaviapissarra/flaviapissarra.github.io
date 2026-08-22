/* =========================================
   FLAVIAPP · SPA LOGIC
   ========================================= */

// 1. TAB SWITCHING LOGIC
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    const targetId = btn.dataset.target;
    document.getElementById(targetId).classList.add('active');
    document.querySelector('.content-viewport').scrollTop = 0;
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

// 3. RENDER FUNCTIONS
async function loadProjects() {
  const data = await fetchData('projects');
  const container = document.getElementById('projects-grid');
  if (!data || !container) return;
  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="card-tools">${item.tools.map(t => `<span>${t}</span>`).join('')}</div>
      <a href="${item.public_link}" class="card-link" target="_blank">View Project ↗</a>
    </div>
  `).join('');
}

async function loadTranslations() {
  const data = await fetchData('translations');
  const container = document.getElementById('translation-grid');
  if (!data || !container) return;
  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.pair}</h3>
      <p>${item.description}</p>
      <a href="${item.request_access}" class="card-link" target="_blank">Request Sample ↗</a>
    </div>
  `).join('');
}

async function loadTimeline() {
  const data = await fetchData('timeline');
  if (!data) return;
  const filterContainer = document.getElementById('timeline-filters');
  const listContainer = document.getElementById('timeline');

  if (filterContainer && data.categories) {
    filterContainer.innerHTML = Object.keys(data.categories).map(key => 
      `<button class="filter-btn" data-filter="${key}">${data.categories[key].label}</button>`
    ).join('');
    filterContainer.insertAdjacentHTML('afterbegin', `<button class="filter-btn active" data-filter="all">All</button>`);
  }

  if (listContainer && data.rows) {
    listContainer.innerHTML = data.rows.map(row => `
      <div class="timeline-item" data-category="${row.category}">
        <span class="t-year">${row.startYear} – ${row.endYear}</span>
        <h4 class="t-title">${row.title}</h4>
        <div class="t-inst">${row.institution}</div>
      </div>
    `).join('');
  }

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

async function loadLanguages() {
  const data = await fetchData('languages');
  const container = document.getElementById('languages-grid');
  if (!data || !container) return;
  container.innerHTML = data.map(item => `
    <div class="card">
      <div style="font-size:1.5rem; margin-bottom:0.2rem;">${item.icon}</div>
      <h3>${item.lang}</h3>
      <div class="level">${item.level}</div>
      <p>${item.details}</p>
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
