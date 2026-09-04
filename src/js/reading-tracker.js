const meters = document.querySelectorAll("meter");

meters.forEach((meter) => {
  meter.setAttribute("low", 49);
  meter.setAttribute("optimum", 50);
  meter.setAttribute("max", 50);

  meter.setAttribute("title", `${meter.value} / 50`);
});

async function setReadingMeter() {
  try {
    const response = await fetch("/interests/projects/reading.html");
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const firstEntry = doc.querySelector("section p");
    if (!firstEntry) return;

    const target = document.getElementById("reading");
    if (!target) return;

    const date = firstEntry.querySelector("b").textContent;
    const value = parseInt(
      firstEntry.querySelector("meter").getAttribute("value"),
      10,
    );

    const max = 50;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const fillRatio = Math.min(Math.max(value / max, 0), 1);
    const offset = circumference * (1 - fillRatio);

    const fillColor = value >= max ? "limegreen" : "darkorange";
    const textColor = getComputedStyle(target).color;

    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="${radius}" fill="none" stroke="grey" stroke-width="4" />
        <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${fillColor}" stroke-width="4"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="53" text-anchor="middle" font-size="10" fill="${textColor}">${date}</text>
      </svg>`;

    const encoded = encodeURIComponent(svg);
    const dataUri = `url("data:image/svg+xml,${encoded}")`;

    target.style.backgroundImage = dataUri;
    target.setAttribute("title", `${value} / 50`);
  } catch (err) {
    console.error("Failed to build reading meter:", err);
  }
}

document.addEventListener("DOMContentLoaded", setReadingMeter);
document.addEventListener("themechange", setReadingMeter);
