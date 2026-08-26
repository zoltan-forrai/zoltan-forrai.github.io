import { getUserPref } from "/src/js/setting.js";
getUserPref();

await import("/src/js/external-links.js");
await import("/src/js/scroll.js");
await import("/src/js/audio.js");

// it also imports "header-menu.js"
if (document.querySelector("#site-header")) {
  await import("/src/js/site-header.js");
}

if (document.querySelector(".my-sigil")) {
  await import("/src/js/my-sigil.js");
}

if (document.querySelector("#status")) {
  await import("/src/js/status.js");
}

if (document.querySelector("#music-player")) {
  await import("/src/js/music-player.js");
}

if (document.querySelector("details")) {
  await import("/src/js/open-details.js");
}

if (document.querySelector("#timeline")) {
  await import("/src/js/warbler.js");
}

if (document.querySelector("#gallery")) {
  await import("/src/js/img-zoom.js");
}

if (document.querySelector("#deck")) {
  await import("/src/js/cards-deck.js");
}

if (document.querySelector('[src="/SRC/btn.gif"]')) {
  await import("/src/js/button.js");
}

if (document.querySelector("#drop-zone")) {
  await import("/src/js/file-field.js");
}

if (document.querySelector("#menu-buttons")) {
  await import("/src/js/header-menu.js");
}

if (document.querySelector("#my-writing")) {
  await import("/src/js/word-count.js");
  await import("/src/js/tag.js");
  await import("/src/js/img-zoom.js");
}
