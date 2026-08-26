const header = `
  <div class="title-bar" >
    <a href="/">
      <img
        class="brand-logo"
        width="30"
        height="30"
        alt=""
        src="/assets/media/img/brand/brand-skull.png" />
      <span class="site-title">Gildrom Qeeney</span>
    </a>
    <menu id="header-menu"></menu>
  </div>
  <nav class="closed">
    <ul class="nav-bar-ul">
      <li tabindex="0" class="drop-down-title">
        <span id="icon-personal">Personal</span>
        <ul class="drop-down-menu">
          <li><a href="/personal/about">My Lore</a></li>
          <li><a href="/personal/warbler">Warbler</a></li>
          <li><a href="/personal/faq">Answers</a></li>
        </ul>
      </li>
      <li tabindex="0" class="drop-down-title">
        <span id="icon-literary">Literary</span>
        <ul class="drop-down-menu">
          <li><a href="/literary/fiction">Fiction</a></li>
          <li><a href="/literary/library">Library</a></li>
          <li><a href="/literary/theory">Theory</a></li>
        </ul>
      </li>
      <li tabindex="0" class="drop-down-title">
        <span id="icon-interests">Interests</span>
        <ul class="drop-down-menu">
          <li><a href="/interests/essays">Essays</a></li>
          <li><a href="/interests/projects">Projects</a></li>
          <li><a href="/interests/art">Artwork</a></li>
        </ul>
      </li>
      <li tabindex="0" class="drop-down-title">
        <span id="icon-beyond">Beyond</span>
        <ul class="drop-down-menu">
          <li><a href="/beyond/patronage">Patronage</a></li>
          <li><a href="/beyond/contact">Contact</a></li>
          <li><a href="/beyond/secret">Secret</a></li>
        </ul>
      </li>
    </ul>
  </nav>
`;

const siteHeader = document.querySelector("#site-header");
siteHeader.innerHTML = header;

// the site-headder always have a menu...
await import("./header-menu.js");

// and the menu always have a burger when it is part of the site-header !
const btnBurger = {
  id: "btn-burger",
  html: `<button id="btn-burger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg></button>`,
  onClick: () => {
    const navBar = document.querySelector("#site-header nav");
    navBar.classList.toggle("closed");
  },
};

const headerMenu = document.querySelector("#header-menu");
headerMenu.insertAdjacentHTML("beforeend", btnBurger.html);
document
  .getElementById(btnBurger.id)
  .addEventListener("click", btnBurger.onClick);

const letterMap = {
  p: "icon-personal",
  l: "icon-literary",
  i: "icon-interests",
  b: "icon-beyond",
};

const topLevelItems = Array.from(
  document.querySelectorAll("#site-header .drop-down-title"),
);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping =
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable;
  if (isTyping) return;

  const iconId = letterMap[event.key.toLowerCase()];
  if (iconId) {
    const title = document.getElementById(iconId)?.closest(".drop-down-title");
    title?.focus();
    return;
  }

  const current = document.activeElement;
  const currentTitle = current.closest(".drop-down-title");
  if (!currentTitle) return;

  const isTopLevel = current === currentTitle;
  const links = Array.from(currentTitle.querySelectorAll(".drop-down-menu a"));

  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    const index = topLevelItems.indexOf(currentTitle);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = index + step;
    if (nextIndex >= 0 && nextIndex < topLevelItems.length) {
      topLevelItems[nextIndex].focus();
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const next = isTopLevel ? links[0] : links[links.indexOf(current) + 1];
    next?.focus();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (isTopLevel) return;
    const index = links.indexOf(current);
    if (index <= 0) {
      currentTitle.focus();
    } else {
      links[index - 1].focus();
    }
  }
});
