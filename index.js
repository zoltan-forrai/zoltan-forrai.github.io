// Menu html inset
if (document.querySelector("title-bar")) {
  await import("/SRC/js/menu.js");
}

// Audio Toggle
if (document.getElementById("toggleBtn")) {
  await import("/SRC/js/audio.js");
}

// Theme Toggle
if (document.querySelector("toggle-btn")) {
  await import("/SRC/js/theme.js");
}

// Spotify Box
if (document.querySelector("pspotify-p")) {
  await import("/SRC/js/spotify.js");
}

//Zoom
if (
  document.querySelector("tweet-timeline") ||
  document.querySelector("gallery-row")
) {
  await import("/SRC/js/zoom.js");
}

// Filter
if (document.querySelector("deck-section")) {
  await import("/SRC/js/filter.js");
  await import("/SRC/js/wip.js");
}

// Summary
if (document.querySelector("summary")) {
  await import("/SRC/js/summary.js");
}

(function () {
  const SCROLL_SELECTOR = "tbody"; // update if the page has multiple tables

  const candidate = document.querySelector(SCROLL_SELECTOR);

  // Only use the tbody as the scroll source if it's actually the thing scrolling
  // (overflow-y set to auto/scroll and its content taller than itself).
  function isScrollable(el) {
    if (!el) return false;
    const overflowY = getComputedStyle(el).overflowY;
    const scrollable = overflowY === "auto" || overflowY === "scroll";
    return scrollable && el.scrollHeight > el.clientHeight;
  }

  const usingTbody = isScrollable(candidate);
  const scrollEl = usingTbody ? candidate : window;

  const track = document.createElement("div");
  track.id = "custom-scroll-track";

  const fill = document.createElement("div");
  fill.id = "custom-scroll-fill";

  track.appendChild(fill);
  document.body.appendChild(track);

  // ---- Inject styling ----
  const style = document.createElement("style");
  style.textContent = `
    #custom-scroll-track {
      position: fixed;
      top: 0;
      right: 1px;
      width: 4px;
      height: 100%;
      background: rgba(0, 0, 0, 0.0);
      z-index: 9999;
      pointer-events: none;
    }

    #custom-scroll-fill {
      width: 100%;
      height: 0%;
      border-radius: 0px 0px 20px 20px;
      background: light-dark(hsla(0, 0%, 0%, 0.7), hsla(0, 0%, 100%, 0.3));
      transition: height 0.1s ease-out;
    }
`;
  document.head.appendChild(style);

  // ---- Scroll logic ----
  let ticking = false;

  function updateFill() {
    let scrollTop, scrollableHeight;

    if (usingTbody) {
      scrollTop = scrollEl.scrollTop;
      scrollableHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    }

    const percent =
      scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
    fill.style.height = percent + "%";
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateFill);
      ticking = true;
    }
  }

  scrollEl.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", updateFill);

  if (usingTbody && window.ResizeObserver) {
    const ro = new ResizeObserver(onScroll);
    ro.observe(scrollEl);
  }

  // Run once immediately in case the page loads mid-scroll (e.g. anchor link)
  updateFill();
})();
