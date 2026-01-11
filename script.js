/* ==========================
   YEAR
========================== */
const yr = document.getElementById("yr");
if (yr) yr.textContent = new Date().getFullYear();

/* ==========================
   THEME (single source of truth)
========================== */
const themeToggle = document.getElementById("themeToggle");
const mobileThemeToggle = document.getElementById("mobileThemeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  localStorage.setItem("theme", theme);
  updateToggleIcon();
}

function updateToggleIcon() {
  if (!themeToggle) return;
  themeToggle.textContent =
    document.body.classList.contains("light") ? "🌙" : "☀️";
}

// Initial theme
applyTheme(localStorage.getItem("theme") || "dark");

// Desktop toggle
themeToggle?.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light") ? "dark" : "light");
});

// Mobile toggle
mobileThemeToggle?.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light") ? "dark" : "light");
});

/* ==========================
   MOBILE MENU
========================== */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isHidden = mobileMenu.getAttribute("aria-hidden") === "true";
    mobileMenu.setAttribute("aria-hidden", String(!isHidden));
    menuToggle.setAttribute("aria-expanded", String(isHidden));
  });

  mobileMenu.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("click", () => {
      mobileMenu.setAttribute("aria-hidden", "true");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ==========================
   PROJECT MODAL
========================== */
/* ==========================
   PROJECT MODAL
========================== */

const projects = document.querySelectorAll(".project");
const modal = document.getElementById("projectModal");
const modalPanel = modal?.querySelector(".modal-panel");
const modalLeft = modal?.querySelector(".modal-left");
const modalImage = document.getElementById("modalImage");

let images = [];
let index = 0;

let touchStartX = 0;
let touchEndX = 0;

projects.forEach(p => {
  p.addEventListener("click", () => openModal(p));
  p.addEventListener("keydown", e => {
    if (e.key === "Enter") openModal(p);
  });
});

function openModal(p) {
  images = JSON.parse(p.dataset.images || "[]");
  index = 0;

  const modalLive = document.getElementById("modalLive");
  const modalRepo = document.getElementById("modalRepo");
  const modalDownload = document.getElementById("modalDownload");

  document.getElementById("modalTitle").textContent = p.dataset.title || "";
  document.getElementById("modalDesc").textContent = p.dataset.desc || "";
  document.getElementById("modalTech").textContent = p.dataset.tech || "";

  /* ---------- IMAGE SECTION ---------- */
  if (images.length > 0) {
    modalLeft.style.display = "block";
    modal.classList.remove("no-image");
    modalImage.src = images[0];
  } else {
    modalLeft.style.display = "none";
    modal.classList.add("no-image");
  }

  

  /* ---------- LIVE ---------- */
  if (p.dataset.live?.trim()) {
    modalLive.href = p.dataset.live;
    modalLive.style.display = "inline-flex";
  } else {
    modalLive.style.display = "none";
  }

  /* ---------- REPO ---------- */
  if (p.dataset.repo?.trim()) {
    modalRepo.href = p.dataset.repo;
    modalRepo.style.display = "inline-flex";
  } else {
    modalRepo.style.display = "none";
  }

  /* ---------- DOWNLOAD ---------- */
  if (p.dataset.download?.trim()) {
    modalDownload.href = p.dataset.download;
    modalDownload.style.display = "inline-flex";
  } else {
    modalDownload.style.display = "none";
  }

  updateImg();
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}


function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateImg() {
  if (!modalImage || images.length === 0) return;
  modalImage.src = images[index];
}

/* ---------- Swipe Support ---------- */
function handleSwipe() {
  if (images.length <= 1) return;

  const swipeDistance = touchEndX - touchStartX;
  const threshold = 40;

  if (Math.abs(swipeDistance) < threshold) return;

  if (swipeDistance < 0) {
    index = (index + 1) % images.length;
  } else {
    index = (index - 1 + images.length) % images.length;
  }

  updateImg();
}

if (modalImage) {
  modalImage.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modalImage.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

/* ---------- Controls ---------- */
document.getElementById("prevImage")?.addEventListener("click", () => {
  index = (index - 1 + images.length) % images.length;
  updateImg();
});

document.getElementById("nextImage")?.addEventListener("click", () => {
  index = (index + 1) % images.length;
  updateImg();
});

document.querySelectorAll("[data-close]").forEach(b =>
  b.addEventListener("click", closeModal)
);

modal?.addEventListener("click", e => {
  if (!modalPanel.contains(e.target)) closeModal();
});

modalPanel?.addEventListener("click", e => e.stopPropagation());

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modal?.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});



/* ==========================
   GITHUB REPOS (graceful fallback)
========================== */
const reposList = document.getElementById("reposList");
const reposFallback = document.getElementById("reposFallback");

fetch("https://api.github.com/users/ursGill/repos?per_page=50")
  .then(r => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) throw new Error();

    reposList.innerHTML = data.map(r => `
      <article class="repo-card">
        <a href="${r.html_url}" target="_blank" rel="noopener">
          <strong>${r.name}</strong>
        </a>
        <p>${r.description || ""}</p>
      </article>
    `).join("");
  })
  .catch(() => {
    reposList.innerHTML = "";
    if (reposFallback) reposFallback.hidden = false;
  });