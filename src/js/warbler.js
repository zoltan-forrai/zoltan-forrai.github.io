import { getUserPref, resolvePrefValue } from "/src/js/setting.js";

const userPref = getUserPref();
const isMute = resolvePrefValue(userPref.audioAllow) === false;

const savedHearts = JSON.parse(localStorage.getItem("heartStates") || "{}");

document.querySelectorAll("#timeline p").forEach((update, index) => {
  const uniqueId = `heart-${index}`;

  const html = `
    <span class="interactions">
      <label tabindex="0" for="${uniqueId}" title="Like">
        <input tabindex="-1" type="checkbox" class="heart" id="${uniqueId}" />
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        </svg>
      </label>
      <a href="/beyond/contact" title="Comment">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
        </svg>
      </a>
      <a href="/rss.xml" title="Follow">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" />
          </svg>
        </a>
    </span>
  `;

  update.insertAdjacentHTML("beforeend", html);
  const checkbox = document.getElementById(uniqueId);
  if (savedHearts[uniqueId]) {
    checkbox.checked = true;
  }
  checkbox.addEventListener("change", () => {
    const heartStates = JSON.parse(localStorage.getItem("heartStates") || "{}");
    if (checkbox.checked) {
      heartStates[uniqueId] = true;
    } else {
      delete heartStates[uniqueId];
    }
    localStorage.setItem("heartStates", JSON.stringify(heartStates));
  });
  const label = document.querySelector(`label[for="${uniqueId}"]`);
  label.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
});

(function animation() {
  const firstPost = document.querySelector("#timeline p:first-of-type");

  if (!firstPost) return;

  const STORAGE_KEY = "last_seen_status";
  const currentDatetime = firstPost.getAttribute("datetime");
  const lastSeen = localStorage.getItem(STORAGE_KEY);
  const isNew = lastSeen !== currentDatetime;

  if (isNew) {
    localStorage.setItem(STORAGE_KEY, currentDatetime);

    const style = getComputedStyle(firstPost);
    const marginTop = parseFloat(style.marginTop);
    const marginBottom = parseFloat(style.marginBottom);
    const fullHeight = firstPost.offsetHeight + marginTop + marginBottom;
    document.documentElement.style.setProperty(
      "--first-post-height",
      `-${fullHeight}px`,
    );

    const styleTag = document.createElement("style");
    styleTag.textContent = `
      #timeline p:first-of-type {
        opacity: 0;
        transform: translateY(var(--first-post-height));
        animation: fadeIn 0.5s forwards 1s;
        margin-bottom: calc(var(--first-post-height) + 1rem);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(var(--first-post-height));
          margin-bottom: calc(var(--first-post-height) + 1rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
          margin-bottom: 1rem;
        }
      }
    `;
    document.head.appendChild(styleTag);

    const audio = new Audio("/assets/media/sound/tweet.mp3");
    audio.preload = "auto";
    audio.volume = 0.2;
    audio.load();
    setTimeout(() => {
      if (!isMute) {
        audio.currentTime = 0;
        audio.play();
      }
    }, 0);
  }
})();
