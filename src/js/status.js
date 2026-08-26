const target = document.querySelector("#status");

const feedFile = await fetch("/rss.xml");
const feedText = await feedFile.text();
const feedDoc = new DOMParser().parseFromString(feedText, "application/xml");
const firstItem = feedDoc.querySelector("item");

(async function () {
  if (firstItem && target) {
    const titleEl = firstItem.querySelector("title");
    const descEl = firstItem.querySelector("description");

    const text = (titleEl?.textContent || descEl?.textContent || "").trim();

    target.textContent = text;

    const guidEl = firstItem.querySelector("guid");
    const href = guidEl?.textContent?.trim();

    if (href) target.href = href;

    const datetime = firstItem.querySelector("pubDate")?.textContent;

    if (datetime) target.setAttribute("title", datetime);
  }
})();
