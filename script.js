// Basic interactions: year, theme toggle, simple nav smooth scroll
document.addEventListener('DOMContentLoaded', () => {
  // year
  document.getElementById('yr').textContent = new Date().getFullYear();

  // theme toggle
  const toggle = document.getElementById('themeToggle');
  const preferred = localStorage.getItem('theme');
  if (preferred === 'dark') document.body.classList.add('dark');
  updateToggle();

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    updateToggle();
  });

  function updateToggle() {
    toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Projects modal logic
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

  function openModal(index) {
    const p = projects[index];
    if (!p) return;
    currentIndex = index;
    const title = p.dataset.title || '';
    const desc = p.dataset.desc || '';
    const tech = p.dataset.tech || '';
    const image = p.dataset.image || '';
    try { currentImages = JSON.parse(p.dataset.images || '[]'); } catch { currentImages = image ? [image] : []; }
    if (currentImages.length === 0 && image) currentImages = [image];

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalTech.textContent = tech;
    modalRepo.href = p.dataset.repo || '#';
    modalLive.href = p.dataset.live || '#';

    currentImageIndex = 0;
    updateModalImage();

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    // focus management
    const firstFocusable = modal.querySelector('button, a');
    if (firstFocusable) firstFocusable.focus();
  }

  function updateModalImage() {
    if (!currentImages || currentImages.length === 0) {
      modalImage.src = '';
      modalImage.alt = '';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }
    modalImage.src = currentImages[currentImageIndex];
    modalImage.alt = modalTitle.textContent + ' - image ' + (currentImageIndex + 1);
    prevBtn.style.display = (currentImages.length > 1) ? 'inline-block' : 'none';
    nextBtn.style.display = (currentImages.length > 1) ? 'inline-block' : 'none';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  // Click handlers to open modal
  projects.forEach((p, idx) => {
    p.addEventListener('click', () => openModal(idx));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(idx);
      }
    });
  });

  // Prev/Next image
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateModalImage();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateModalImage();
  });

  // Close buttons and overlay
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
  });

  // Click outside panel to close
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  // Preload images (optional)
  projects.forEach(p => {
    try {
      const imgs = JSON.parse(p.dataset.images || '[]');
      (imgs.length ? imgs : (p.dataset.image ? [p.dataset.image] : [])).forEach(src => {
        const img = new Image();
        img.src = src;
      });
    } catch {}
  });
});
