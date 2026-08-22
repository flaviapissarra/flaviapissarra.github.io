/* =========================================
   FLAVIAPP · SPA LOGIC & DATA RENDERER
   ========================================= */

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
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    return null;
  }
}

// 3. RENDER FUNCTIONS
async function renderProjects() {
  const data = await fetchData('projects');
  const container = document.getElementById('projects-grid');
  if (!data || !container) return;
  
  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="card-tools">${item.tools.map(t => `<span>${t.trim()}</span>`).join('')}</div>
      <div style="margin-top:0.5rem; display:flex; gap:1rem;">
        ${item.public_link ? `<a href="${item.public_link}" class="card-link" target="_blank">View Project ↗</a>` : ''}
        ${item.request_access ? `<a href="${item.request_access}" class="card-link" target="_blank">Request Access ↗</a>` : ''}
      </div>
    </div>
  `).join('');
}

async function renderTranslations() {
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

async function renderTimeline() {
  const data = await fetchData('timeline');
  if (!data) return;
  
  const filterContainer = document.getElementById('timeline-filters');
  const listContainer = document.getElementById('timeline');

  if (filterContainer && data.categories) {
    filterContainer.innerHTML = Object.keys(data.categories).map(key => 
      `<button class="filter-btn" data-filter="${key}">${data.categories[key].label.trim()}</button>`
    ).join('');
    filterContainer.insertAdjacentHTML('afterbegin', `<button class="filter-btn active" data-filter="all">All</button>`);
  }

  if (listContainer && data.rows) {
    listContainer.innerHTML = data.rows.map(row => {
      const catColor = data.categories[row.category]?.color || '#38bdf8';
      return `
        <div class="timeline-item" data-category="${row.category}">
          <span class="t-year">${row.startYear} – ${row.endYear}</span>
          <h4 class="t-title">${row.title.trim()}</h4>
          <div class="t-inst">${row.institution.trim()}</div>
          <p class="t-desc">${row.description.trim()}</p>
          <span class="timeline-category-badge" style="color:${catColor}; border:1px solid ${catColor}30; background:${catColor}15;">
            ${data.categories[row.category]?.label.trim() || row.category}
          </span>
        </div>
      `;
    }).join('');
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

async function renderLanguages() {
  const data = await fetchData('languages');
  const container = document.getElementById('languages-grid');
  if (!data || !container) return;
  
  container.innerHTML = data.map(item => `
    <div class="card">
      <div class="flag">${item.icon.trim()}</div>
      <h3>${item.lang.trim()}</h3>
      <div class="level">${item.level.trim()}</div>
      <p>${item.details.trim()}</p>
    </div>
  `).join('');
}

// 4. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderTranslations();
  renderTimeline();
  renderLanguages();
});
