import {
  getUserPref,
  resolvePrefValue,
  setUserPrefValue,
  saveUserPref,
} from "./setting.js";
import { playMuteClick, playPop } from "./audio.js";

function applyTheme(value) {
  if (value === "light") {
    document.documentElement.id = "light";
  } else {
    document.documentElement.removeAttribute("id");
  }
  document.dispatchEvent(new Event("themechange"));
}

function toggleTheme() {
  playPop(true);
  const userPref = getUserPref();
  const themeNode = userPref.themes.theme;
  const current = resolvePrefValue(themeNode);
  const next = current === "light" ? "dark" : "light";

  setUserPrefValue(userPref, themeNode, next);

  if (!document.startViewTransition) {
    applyTheme(next);
    return;
  }

  document.startViewTransition(() => {
    applyTheme(next);
  });
}

// Apply the stored theme immediately, before buttons are wired up,
// so a reload reflects whatever the user last chose.
applyTheme(resolvePrefValue(getUserPref().themes.theme));

function applyAudio(allowed) {
  const audioBtn = document.getElementById("btn-audio");
  if (audioBtn) audioBtn.classList.toggle("muted", !allowed);
}

function toggleAudio() {
  const userPref = getUserPref();
  const next = !userPref.audioAllow;

  userPref.audioAllow = next;
  saveUserPref(userPref);
  applyAudio(next);
  playMuteClick(!next);
}

// Apply the stored mute state immediately, same as theme.
applyAudio(getUserPref().audioAllow);

const btnAudio = {
  id: "btn-audio",
  keyPref: "key_mute",
  html: `<button id="btn-audio" title="Press: 'M'" aria-label="toggle audio"></button>`,
  onClick: toggleAudio,
};

const btnTheme = {
  id: "btn-theme",
  keyPref: "key_theme",
  html: `<button id="btn-theme" title="Press: 'T'"><span id="theme-track"></span><span id="theme-thumb"></span></button>`,
  onClick: toggleTheme,
};

const buttons = [btnAudio, btnTheme];

const headerMenu = document.querySelector("#header-menu");
if (headerMenu) {
  headerMenu.innerHTML = buttons.map((btn) => btn.html).join("");
}

const menuButtons = document.querySelector("#menu-buttons");
if (menuButtons) {
  menuButtons.innerHTML = buttons.map((btn) => btn.html).join("");
}

buttons.forEach((btn) => {
  document.getElementById(btn.id).addEventListener("click", btn.onClick);
});

document.addEventListener("keydown", (e) => {
  const target = e.target;
  const isTyping =
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable;

  if (isTyping) return;

  const userPref = getUserPref();
  const pressedKey = e.key.toLowerCase();

  const match = buttons.find((btn) => {
    const boundKey = resolvePrefValue(userPref.keyboard[btn.keyPref]);
    return boundKey.toLowerCase() === pressedKey;
  });

  if (match) match.onClick();
});
