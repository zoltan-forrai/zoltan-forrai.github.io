const externalLinks = document.querySelectorAll('[href*="//"], [href^="http"]');
externalLinks.forEach((link) => {
  link.setAttribute("target", "_blank");
});
