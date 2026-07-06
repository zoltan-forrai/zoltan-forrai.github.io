const wip = document.querySelectorAll('a[data-tags~="wip"]');

wip.forEach((el) => {
  const angle1 = 10 + Math.random() * 25;
  const angle2 = 10 + Math.random() * 25;

  const negativeFirst = Math.random() < 0.5;

  const notice1 = document.createElement("dev-notice");
  const notice2 = document.createElement("dev-notice");

  notice1.style.transform = `rotate(${negativeFirst ? -angle1 : angle1}deg)`;
  notice2.style.transform = `rotate(${negativeFirst ? angle2 : -angle2}deg)`;

  const span = document.createElement("span");
  span.textContent = "work in progress";
  notice2.appendChild(span);

  el.insertBefore(notice2, el.firstChild);
  el.insertBefore(notice1, el.firstChild);
});
