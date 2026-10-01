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

  // Keep keyboard focus on the thumbnail that matches the large view
  currentImg.focus();

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

function openLink(index) {
  const url = images[index].dataset.link;
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function moveFocus(from, key) {
  const rects = Array.from(images).map((img) => img.getBoundingClientRect());
  const current = rects[from];
  const cx = current.left + current.width / 2;
  const cy = current.top + current.height / 2;
  const tolerance = current.width / 2;

  const vertical = key === "ArrowUp" || key === "ArrowDown";
  const forward = key === "ArrowDown" || key === "ArrowRight";

  // Describe every other image relative to the current one
  const others = rects
    .map((r, i) => ({
      index: i,
      dx: r.left + r.width / 2 - cx,
      dy: r.top + r.height / 2 - cy,
    }))
    .filter((o) => o.index !== from);

  let target = null;

  if (vertical) {
    // Same column, in the requested direction, nearest first
    target = others
      .filter(
        (o) => Math.abs(o.dx) < tolerance && (forward ? o.dy > 0 : o.dy < 0),
      )
      .sort((a, b) => Math.abs(a.dy) - Math.abs(b.dy))[0];
  } else {
    // Other columns on the requested side
    const side = others.filter(
      (o) => Math.abs(o.dx) >= tolerance && (forward ? o.dx > 0 : o.dx < 0),
    );
    if (side.length) {
      // Find the nearest neighbouring column, then the closest image in it by height
      const nearest = Math.min(...side.map((o) => Math.abs(o.dx)));
      target = side
        .filter((o) => Math.abs(o.dx) - nearest < tolerance)
        .sort((a, b) => Math.abs(a.dy) - Math.abs(b.dy))[0];
    }
  }

  if (target) images[target.index].focus();
}

function handleKey(e) {
  const focusedIndex = Array.from(images).indexOf(document.activeElement);
  const imageFocused = focusedIndex !== -1;
  const isArrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
    e.key,
  );

  // Stop the page scrolling when Space is used on a focused image or in the overlay
  if (e.key === " " && (imageFocused || overlay)) {
    e.preventDefault();
  }

  // Move focus around the grid while the large view is closed
  if (!overlay && imageFocused && isArrow) {
    e.preventDefault();
    moveFocus(focusedIndex, e.key);
    return;
  }

  // With nothing focused, any arrow key lands on the first image
  if (
    !overlay &&
    !imageFocused &&
    (document.activeElement === document.body || !document.activeElement) &&
    isArrow
  ) {
    e.preventDefault();
    images[0].focus();
    return;
  }

  // Ignore keys held down
  if (e.repeat) return;

  if (overlay) {
    if (e.key === "ArrowRight") {
      showNext();
    } else if (e.key === "ArrowLeft") {
      showPrev();
    } else if (e.key === "Escape" || e.key === " ") {
      closeGallery();
    } else if (e.key === "Enter") {
      e.preventDefault();
      openLink(currentIndex);
    }
    return;
  }

  if (e.key === " " && imageFocused) {
    openGallery(focusedIndex);
  } else if (e.key === "Enter" && imageFocused) {
    e.preventDefault();
    openLink(focusedIndex);
  }
}

function openGallery(index) {
  currentIndex = index;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    zoomImg = document.createElement("img");
    overlay.appendChild(zoomImg);

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
  overlay.remove();
  overlay = null;
  zoomImg = null;
  currentIndex = -1;
  history.replaceState(null, "", location.pathname + location.search);
}

document.addEventListener("keydown", handleKey);

images.forEach((img, index) => {
  img.setAttribute("tabindex", "0");

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
