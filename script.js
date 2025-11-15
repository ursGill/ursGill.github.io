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
