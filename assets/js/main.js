/* =========================================
   FLAVIAPP · MAIN.JS
   Data Loader & Dynamic Rendering
   ========================================= */

// 1. HELPER: Fetch JSON safely
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

// 2. RENDER: Projects (Research)
async function loadProjects() {
  const data = await fetchData('projects');
  const container = document.getElementById('projects-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card">
      <span class="card-category">${item.domain}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      
      <div class="card-tools">
        ${item.tools.map(tool => `<span>${tool}</span>`).join('')}
      </div>
      
      <div class="card-actions">
        ${item.public_link && item.public_link !== '#' 
          ? `<a href="${item.public_link}" class="card-link" target="_blank">View project →</a>` 
          : ''}
        ${item.request_access 
          ? `<a href="${item.request_access}" class="card-link" target="_blank">Request access →</a>` 
          : ''}
      </div>
    </div>
  `).join('');
}

// 3. RENDER: Translations (Linguistics)
async function loadTranslations() {
  const data = await fetchData('translations');
  const container = document.getElementById('translation-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card">
      <span class="card-category">${item.domains.join(' · ')}</span>
      <h3 class="translation-pair">${item.pair}</h3>
      <p>${item.description}</p>
      ${item.excerpt 
        ? `<blockquote class="translation-excerpt">"${item.excerpt}"</blockquote>` 
        : ''}
      <div class="card-actions">
        <a href="${item.request_access}" class="card-link" target="_blank">Request sample →</a>
      </div>
    </div>
  `).join('');
}

// 4. RENDER: Timeline (Trajectory)
async function loadTimeline() {
  const data = await fetchData('timeline');
  if (!data) return;

  const filterContainer = document.getElementById('timeline-filters');
  const listContainer = document.getElementById('timeline');

  // 4a. Render Filters based on Categories
  if (filterContainer && data.categories) {
    filterContainer.innerHTML = Object.keys(data.categories).map(key => {
      const cat = data.categories[key];
      return `<button class="filter-btn" data-filter="${key}">${cat.label}</button>`;
    }).join('');
    
    // Add "All" button
    const allBtn = `<button class="filter-btn active" data-filter="all">All</button>`;
    filterContainer.insertAdjacentHTML('afterbegin', allBtn);
  }

  // 4b. Render Rows
  if (listContainer && data.rows) {
    listContainer.innerHTML = data.rows.map(row => {
      const catColor = data.categories[row.category]?.color || '#6B7280';
      const yearRange = row.startYear === row.endYear ? row.startYear : `${row.startYear} – ${row.endYear}`;

      return `
        <div class="timeline-row" data-category="${row.category}">
          <div class="timeline-years">${yearRange}</div>
          <h4 class="timeline-title">${row.title}</h4>
          <div class="timeline-institution">${row.institution}</div>
          <p class="timeline-desc">${row.description}</p>
          <span class="timeline-category-badge" style="color: ${catColor}; border: 1px solid ${catColor}20; background: ${catColor}10;">
            ${data.categories[row.category]?.label || row.category}
          </span>
        </div>
      `;
    }).join('');
  }

  // 4c. Filter Logic
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;

      // Update active state
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const filterValue = e.target.dataset.filter;
      const rows = listContainer.querySelectorAll('.timeline-row');

      rows.forEach(row => {
        if (filterValue === 'all' || row.dataset.category === filterValue) {
          row.style.display = 'block';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// 5. RENDER: Languages
async function loadLanguages() {
  const data = await fetchData('languages');
  const container = document.getElementById('languages-grid');
  if (!data || !container) return;

  container.innerHTML = data.map(item => `
    <div class="card language-card">
      <div class="language-flag">${item.icon}</div>
      <h3 class="language-name">${item.lang}</h3>
      <div class="language-level">${item.level}</div>
      <p class="language-details">${item.details}</p>
    </div>
  `).join('');
}

// 6. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  // Load all data
  loadProjects();
  loadTranslations();
  loadTimeline();
  loadLanguages();

  // Scroll Spy & Active Link Logic
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });
});
