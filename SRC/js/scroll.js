console.log("scroll loaded");

class CustomScrollbar {
  constructor(scrollSelector = "tbody") {
    this.scrollSelector = scrollSelector;

    this.usingCustomEl = false;
    this.scrollEl = window;

    this.isDragging = false;
    this.dragStartY = 0;
    this.dragStartTop = 0;

    this.ticking = false;

    this.isMobile = this._detectMobile();

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onTrackMouseEnter = this.onTrackMouseEnter.bind(this);
    this.onTrackMouseLeave = this.onTrackMouseLeave.bind(this);
    this.onTrackMouseDown = this.onTrackMouseDown.bind(this);
    this.onWindowMouseMove = this.onWindowMouseMove.bind(this);
    this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
    this.updateFill = this.updateFill.bind(this);

    this._resolveScrollTarget();
    this._buildDom();
    this._injectStyles();
    this._bindEvents();

    this.updateFill();
  }

  _detectMobile() {
    const coarsePointer =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const touchCapable =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const narrowViewport = window.innerWidth <= 820;
    return coarsePointer || (touchCapable && narrowViewport);
  }

  _resolveScrollTarget() {
    const candidate = document.querySelector(this.scrollSelector);
    this.usingCustomEl = this._isScrollable(candidate);
    this.scrollEl = this.usingCustomEl ? candidate : window;
  }

  _isScrollable(el) {
    if (!el) return false;
    const overflowY = getComputedStyle(el).overflowY;
    const scrollable = overflowY === "auto" || overflowY === "scroll";
    return scrollable && el.scrollHeight > el.clientHeight;
  }

  _buildDom() {
    this.track = document.createElement("div");
    this.track.id = "custom-scroll-track";

    this.fill = document.createElement("div");
    this.fill.id = "custom-scroll-fill";

    this.track.appendChild(this.fill);
    document.body.appendChild(this.track);

    if (this.isMobile) {
      this.track.classList.add("mobile");
    }
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #custom-scroll-track {
        position: fixed;
        top: 0;
        right: 1px;
        width: 4px;
        height: 100%;
        padding-left: 14px;
        box-sizing: content-box;
        background: rgba(0, 0, 0, 0.0);
        z-index: 9;
        cursor: grab;
        transition: width 0.15s ease-out;
      }

      #custom-scroll-track.mobile {
        cursor: default;
        pointer-events: none;
      }

      #custom-scroll-track:hover,
      #custom-scroll-track.dragging {
        width: 6px;
      }

      #custom-scroll-track.dragging {
        cursor: grabbing;
      }

      html:has(body.custom-scroll-dragging),
      body.custom-scroll-dragging,
      body.custom-scroll-dragging * {
        cursor: grabbing !important;
      }

      #custom-scroll-fill {
        width: 100%;
        height: 0%;
        border-radius: 0px 0px 20px 20px;
        background: linear-gradient(
          to top,
          light-dark(hsla(from var(--c-g-45) h s 15%), hsl( from var(--c-g-40) h 20% l )),
          light-dark(var(--c-g-45), hsl( from var(--c-g-25) h 30% l )),
          light-dark(var(--c-g-45), hsl( from var(--c-g-10) h 40% l ))
        );
        transition: height 0.1s ease-out, transform 0.15s ease-out;


      
      }

      #custom-scroll-fill.dragging {
        transition: none;
      }

      #custom-scroll-fill.peek {
        height: 40px;
        transform: translateY(0px);
      }
    `;
    document.head.appendChild(style);
  }

  _bindEvents() {
    this.scrollEl.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize);
    window.addEventListener("load", this.updateFill);

    if (this.usingCustomEl && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.onScroll);
      this.resizeObserver.observe(this.scrollEl);
    }

    if (this.isMobile) {
      // Visual only on mobile: no hover peek, no drag handlers at all.
      return;
    }

    this.track.addEventListener("mouseenter", this.onTrackMouseEnter);
    this.track.addEventListener("mouseleave", this.onTrackMouseLeave);
    this.track.addEventListener("mousedown", this.onTrackMouseDown);

    window.addEventListener("mousemove", this.onWindowMouseMove);
    window.addEventListener("mouseup", this.onWindowMouseUp);
  }

  getScrollMetrics() {
    if (this.usingCustomEl) {
      return {
        top: this.scrollEl.scrollTop,
        max: this.scrollEl.scrollHeight - this.scrollEl.clientHeight,
      };
    }
    return {
      top: window.scrollY || document.documentElement.scrollTop,
      max: document.documentElement.scrollHeight - window.innerHeight,
    };
  }

  setScrollTop(value) {
    if (this.usingCustomEl) {
      this.scrollEl.scrollTop = value;
    } else {
      window.scrollTo(0, value);
    }
  }

  updateFill() {
    if (this.fill.classList.contains("peek")) {
      this.ticking = false;
      return;
    }
    const { top, max } = this.getScrollMetrics();
    const percent = max > 0 ? (top / max) * 100 : 0;
    this.fill.style.height = percent + "%";
    this.ticking = false;
  }

  requestFillUpdate() {
    if (!this.ticking) {
      requestAnimationFrame(this.updateFill);
      this.ticking = true;
    }
  }

  onScroll() {
    if (this.fill.classList.contains("peek")) {
      this.fill.classList.remove("peek");
    }
    this.requestFillUpdate();
  }

  onResize() {
    this.requestFillUpdate();
  }

  onTrackMouseEnter() {
    const { top } = this.getScrollMetrics();
    if (top <= 0) {
      this.fill.classList.add("peek");
      this.fill.style.height = ""; // let the .peek CSS height take over
    }
  }

  onTrackMouseLeave() {
    if (this.isDragging) return;
    this.fill.classList.remove("peek");
    this.updateFill();
  }

  onTrackMouseDown(e) {
    this.isDragging = true;
    this.dragStartY = e.clientY;

    this.fill.classList.add("dragging");
    this.fill.classList.remove("peek");
    this.track.classList.add("dragging");
    document.body.classList.add("custom-scroll-dragging");

    const rect = this.track.getBoundingClientRect();
    const clickPercent = (e.clientY - rect.top) / rect.height;
    const { max } = this.getScrollMetrics();
    const target = clickPercent * max;
    this.setScrollTop(target);
    this.dragStartTop = target;

    e.preventDefault();
  }

  onWindowMouseMove(e) {
    if (!this.isDragging) return;
    const { max } = this.getScrollMetrics();
    const trackHeight = this.track.clientHeight;
    const deltaY = e.clientY - this.dragStartY;
    const deltaScroll = (deltaY / trackHeight) * max;
    this.setScrollTop(this.dragStartTop + deltaScroll);
  }

  onWindowMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.fill.classList.remove("dragging");
    this.track.classList.remove("dragging");
    document.body.classList.remove("custom-scroll-dragging");
  }

  destroy() {
    this.scrollEl.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("load", this.updateFill);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (!this.isMobile) {
      this.track.removeEventListener("mouseenter", this.onTrackMouseEnter);
      this.track.removeEventListener("mouseleave", this.onTrackMouseLeave);
      this.track.removeEventListener("mousedown", this.onTrackMouseDown);

      window.removeEventListener("mousemove", this.onWindowMouseMove);
      window.removeEventListener("mouseup", this.onWindowMouseUp);
    }

    this.track.remove();
    document.body.classList.remove("custom-scroll-dragging");
  }
}

new CustomScrollbar("tbody");
