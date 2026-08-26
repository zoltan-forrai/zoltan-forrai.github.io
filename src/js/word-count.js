const display = document.querySelector("#word-count");

if (display) {
  const article = document.querySelector("article");
  const clone = article.cloneNode(true);

  const title = clone.querySelector("h1");
  if (title) title.remove();

  const text = clone.textContent;
  const words = text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || [];

  console.log(words.length);

  const display = document.querySelector("#word-count");

  display.textContent = `${words.length} words`;
}
