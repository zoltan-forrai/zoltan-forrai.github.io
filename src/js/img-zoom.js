const images = document.querySelectorAll("#gallery img");

let overlay = null;
let zoomImg = null;
let currentIndex = -1;
let isSwiping = false;
let startX = 0;
let endX = 0;

function updateImage() {
  const currentImg = images[currentIndex];
  zoomImg.src = currentImg.src;

  if (currentImg.alt) {
    overlay.dataset.caption = currentImg.alt;
  } else {
    delete overlay.dataset.caption;
  }

  if (currentImg.id) {
    history.replaceState(null, "", "#" + currentImg.id);
  } else {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  updateImage();
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateImage();
}

function handleKey(e) {
  if (e.key === "ArrowRight") {
    showNext();
  } else if (e.key === "ArrowLeft") {
    showPrev();
  } else if (e.key === "Escape") {
    closeGallery();
  }
}

function openGallery(index) {
  currentIndex = index;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    zoomImg = document.createElement("img");
    overlay.appendChild(zoomImg);

    document.addEventListener("keydown", handleKey);

    overlay.addEventListener("touchstart", (e) => {
      isSwiping = false;
      startX = e.touches[0].clientX;
    });

    overlay.addEventListener("touchmove", () => {
      isSwiping = true;
    });

    overlay.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    });

    overlay.addEventListener("click", () => {
      if (!isSwiping) closeGallery();
    });

    document.body.appendChild(overlay);
  }

  updateImage();
}

function closeGallery() {
  if (!overlay) return;
  document.removeEventListener("keydown", handleKey);
  overlay.remove();
  overlay = null;
  zoomImg = null;
  currentIndex = -1;
  history.replaceState(null, "", location.pathname + location.search);
}

images.forEach((img, index) => {
  img.setAttribute("tabindex", "0");

  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (overlay) {
        closeGallery();
        return;
      }
      openGallery(index);
    }
  });

  img.addEventListener("click", () => {
    if (overlay) {
      closeGallery();
      return;
    }
    openGallery(index);
  });
});

// Open or switch to the image matching the current URL hash
function syncToHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const targetIndex = Array.from(images).findIndex((img) => img.id === hash);
  if (targetIndex === -1) return;
  openGallery(targetIndex);
}

window.addEventListener("hashchange", syncToHash);
syncToHash();
