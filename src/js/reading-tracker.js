const meters = document.querySelectorAll("meter");

meters.forEach((meter) => {
  meter.setAttribute("low", 49);
  meter.setAttribute("optimum", 50);
  meter.setAttribute("max", 50);

  meter.setAttribute("title", `${meter.value} / 50`);
});
