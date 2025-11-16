/* ==========================
   script.js
   Full interactivity: theme toggle, modal system,
   mobile optimizations, and image navigation
============================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================
  // YEAR AUTO-UPDATE
  // ==========================
  document.getElementById('yr').textContent = new Date().getFullYear();

   // ---------------------
// GitHub repos widget
// ---------------------
(function setupGitHubRepos(){
  const username = 'YOUR_GITHUB_USERNAME'; // <<< replace this
  const listEl = document.getElementById('reposList');
  const errorEl = document.getElementById('reposError');
  const filterInput = document.getElementById('repoFilter');
  const refreshBtn = document.getElementById('refreshRepos');

  // Config
  const PER_PAGE = 100;
  const CACHE_KEY = `gh_repos_${username}`;
  const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  // Optional: add a token for higher rate limits.
  // WARNING: do NOT embed permanent personal tokens in client-side code for public sites.
  // If you need higher rate limits, use a server or GitHub Actions to fetch and inject during build.
  const GITHUB_TOKEN = null; // or 'ghp_xxx' (not recommended client-side)

  function apiFetch(url){
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if(GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;
    return fetch(url, { headers }).then(r => {
      if(!r.ok) throw new Error(`GitHub API error: ${r.status}`);
      return r.json();
    });
  }

  async function fetchRepos(){
    errorEl.style.display = 'none';
    listEl.innerHTML = `<div style="color:var(--muted)">Loading repositories…</div>`;

    // Check cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && (Date.now() - cached.t) < CACHE_TTL){
        renderRepos(cached.data);
        return;
      }
    } catch {}

    const url = `https://api.github.com/users/${username}/repos?per_page=${PER_PAGE}&sort=updated`;
    try {
      const data = await apiFetch(url);
      // Keep only public repos, and map to simplified shape
      const repos = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        html_url: r.html_url,
        description: r.description || '',
        stargazers: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        language: r.language || '',
        homepage: r.homepage || '',
        updated_at: r.updated_at
      }));
      // Cache
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: repos })); } catch {}
      renderRepos(repos);
    } catch (err){
      listEl.innerHTML = '';
      errorEl.style.display = 'block';
      errorEl.textContent = 'Failed to load repos. ' + err.message;
      console.error(err);
    }
  }

  function renderRepos(repos){
    if(!Array.isArray(repos) || repos.length === 0){
      listEl.innerHTML = '<div style="color:var(--muted)">No repositories found.</div>';
      return;
    }

    const q = (filterInput.value || '').trim().toLowerCase();
    const filtered = repos.filter(r => {
      if(!q) return true;
      return r.name.toLowerCase().includes(q) ||
             (r.description && r.description.toLowerCase().includes(q)) ||
             (r.language && r.language.toLowerCase().includes(q));
    });

    listEl.innerHTML = filtered.map(r => `
      <article class="repo-card" tabindex="0" role="article" aria-labelledby="repo-${r.id}-title">
        <div class="repo-title">
          <a id="repo-${r.id}-title" href="${r.html_url}" target="_blank" rel="noreferrer">${escapeHtml(r.name)}</a>
          <div style="font-size:13px;color:var(--muted)">${r.stargazers} ★</div>
        </div>
        <div class="repo-desc">${escapeHtml(r.description || '')}</div>
        <div class="repo-meta">
          ${r.language ? `<span class="pill">${escapeHtml(r.language)}</span>` : ''}
          <span class="pill">Updated ${timeAgo(r.updated_at)}</span>
          <span class="pill">${r.forks} forks</span>
        </div>
        <div class="repo-links">
          ${r.homepage ? `<a class="btn small" href="${r.homepage}" target="_blank" rel="noreferrer">Live</a>` : ''}
          <a class="btn outline small" href="${r.html_url}" target="_blank" rel="noreferrer">View</a>
        </div>
      </article>
    `).join('');
  }

  // Small helpers
  function escapeHtml(s){
    if(!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function timeAgo(iso){
    if(!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso).getTime())/1000);
    if(diff < 60) return `${diff}s`;
    if(diff < 3600) return `${Math.floor(diff/60)}m`;
    if(diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  }

  // Events
  filterInput.addEventListener('input', debounce(()=> {
    // re-render using cached data
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && cached.data) renderRepos(cached.data);
    } catch { }
  }, 220), { passive: true });

  refreshBtn.addEventListener('click', () => {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    fetchRepos();
  });

  // Debounce
  function debounce(fn, wait=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

  // Initial fetch (on idle, to avoid heavy startup)
  if('requestIdleCallback' in window){
    requestIdleCallback(fetchRepos, { timeout: 500 });
  } else {
    setTimeout(fetchRepos, 300);
  }
})();


  // ==========================
  // THEME TOGGLE
  // ==========================
  const toggle = document.getElementById('themeToggle');
  const preferred = localStorage.getItem('theme');
  if (preferred === 'dark') document.body.classList.add('dark');
  updateToggle();

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
    updateToggle();
  });

  function updateToggle() {
    toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }

  // ==========================
  // SMOOTH SCROLL
  // ==========================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, { passive: true });
  });

  // ==========================
  // PROJECTS MODAL
  // ==========================
  const projects = Array.from(document.querySelectorAll('.project'));
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalImage = document.getElementById('modalImage');
  const modalLive = document.getElementById('modalLive');
  const modalRepo = document.getElementById('modalRepo');
  const prevBtn = document.getElementById('prevImage');
  const nextBtn = document.getElementById('nextImage');
  const closeButtons = document.querySelectorAll('[data-close]');

  let currentIndex = -1;
  let currentImages = [];
  let currentImageIndex = 0;

  // OPEN MODAL
  function openModal(index) {
    const p = projects[index];
    if (!p) return;

    currentIndex = index;
    modalTitle.textContent = p.dataset.title;
    modalDesc.textContent = p.dataset.desc;
    modalTech.textContent = p.dataset.tech;

    modalLive.href = p.dataset.live || '#';
    modalRepo.href = p.dataset.repo || '#';

    try {
      currentImages = JSON.parse(p.dataset.images || '[]');
    } catch {
      currentImages = p.dataset.image ? [p.dataset.image] : [];
    }
    if (currentImages.length === 0 && p.dataset.image) {
      currentImages = [p.dataset.image];
    }

    currentImageIndex = 0;
    updateModalImage();

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first element for accessibility
    const firstFocusable = modal.querySelector('button, a');
    if (firstFocusable) firstFocusable.focus();
  }

  // UPDATE MODAL IMAGE
  function updateModalImage() {
    if (!currentImages || currentImages.length === 0) {
      modalImage.removeAttribute('src');
      return;
    }

    const src = currentImages[currentImageIndex];
    modalImage.dataset.src = src;
    modalImage.src = src;
    modalImage.alt = modalTitle.textContent + ' - Image ' + (currentImageIndex + 1);

    prevBtn.style.display = currentImages.length > 1 ? 'inline-block' : 'none';
    nextBtn.style.display = currentImages.length > 1 ? 'inline-block' : 'none';
  }

  // CLOSE MODAL
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  // OPEN MODAL VIA CLICK or ENTER
  projects.forEach((p, idx) => {
    p.addEventListener('click', () => openModal(idx));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(idx);
      }
    });
  });

  // IMAGE NAVIGATION
  prevBtn.addEventListener('click', () => {
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateModalImage();
  });

  nextBtn.addEventListener('click', () => {
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateModalImage();
  });

  // CLOSE BUTTONS
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

  // CLICK OVERLAY TO CLOSE
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  // KEYBOARD SUPPORT
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
  });

  // PRELOAD A FEW IMAGES (IDLE)
  onIdle(() => {
    projects.slice(0, 2).forEach(p => {
      try {
        const imgs = JSON.parse(p.dataset.images || '[]');
        (imgs.length ? imgs : [p.dataset.image]).forEach(src => {
          const img = new Image();
          img.src = src;
        });
      } catch {}
    });
  });

  // ==========================
  // UTILS
  // ==========================
  function onIdle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 200 });
    else setTimeout(fn, 200);
  }

});
