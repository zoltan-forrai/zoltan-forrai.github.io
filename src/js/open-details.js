import { getUserPref, resolvePrefValue } from "/src/js/setting.js";
import { playDetails } from "./audio.js";

const userPref = getUserPref();
const kbd = resolvePrefValue(userPref.keyboard.key_open);

const allDetails = document.querySelectorAll("details");

const topLevelDetails = [...allDetails].filter(
  (detail) => !detail.parentElement.closest("details"),
);

const isTyping = (target) => {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

document.addEventListener("keydown", (o) => {
  if (isTyping(o.target)) return;
  if (o.key === kbd) {
    const shouldOpen = topLevelDetails.some((detail) => !detail.open);

    topLevelDetails.forEach((detail) => {
      detail.open = shouldOpen;
    });
  }
});

allDetails.forEach((detail) => {
  detail.addEventListener("toggle", () => {
    playDetails(detail.open);
  });
});

document.querySelectorAll("summary").forEach((el) => {
  el.addEventListener("mousedown", (e) => {
    if (e.detail > 1) {
      // double-click or more
      e.preventDefault(); // prevents text selection
    }
  });
});
