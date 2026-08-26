async function init() {
  const data = await fetch("/src/json/works.json").then((response) =>
    response.json(),
  );

  const fullStarSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star-icon lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`;

  const halfStarSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star-half-icon lucide-star-half"><path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2 Z"/></svg>`;

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    let starsHTML = fullStarSVG.repeat(fullStars);
    if (hasHalfStar) starsHTML += halfStarSVG;

    return `<span class="star-rating" title="${rating}" aria-label="${rating} out of 5 stars">${starsHTML}</span>`;
  }

  function slugify(status) {
    return status.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function populateTable(works) {
    const tbody = document.querySelector("#main-table tbody");
    tbody.innerHTML = "";

    works.forEach((work) => {
      const row = document.createElement("tr");

      if (work.status) {
        const statusSlug = slugify(work.status);
        row.classList.add(statusSlug);
        row.dataset.status = statusSlug;
      } else {
        row.dataset.status = "";
      }
      row.dataset.rating = work.rating;

      const titleCell = document.createElement("td");

      titleCell.textContent = work.title;

      const authorsCell = document.createElement("td");
      authorsCell.textContent = work.authors.join(", ");

      const tagsCell = document.createElement("td");
      const tags = (Array.isArray(work.tags) ? work.tags : []).filter(
        (tag) => tag && tag.trim() !== "",
      );
      tagsCell.innerHTML = tags
        .map(
          (tag) => `<a href="#" class="tag-link" data-tag="${tag}">${tag}</a>`,
        )
        .join(" ");

      const ratingCell = document.createElement("td");
      ratingCell.innerHTML = renderStars(work.rating);

      row.append(titleCell, authorsCell, tagsCell, ratingCell);
      tbody.appendChild(row);
    });
  }

  populateTable(data.works);
  setupFilter();
  setupSorting();
}

function setupFilter() {
  const searchInput = document.querySelector(
    'input[type="search"][name="filter"]',
  );
  const rows = document.querySelectorAll("#main-table tbody tr");
  if (!searchInput) return;

  const form = searchInput.closest("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilter();
    });
    form.addEventListener("reset", () => {
      rows.forEach((row) => {
        row.style.display = "";
      });
    });
  }

  const applyFilter = () => {
    const cleanedInput = searchInput.value
      .replace(/[#,\s]+/g, " ")
      .toLowerCase();
    const rawTokens = cleanedInput
      .split(" ")
      .filter((token) => token.trim() !== "" && token !== "-");
    const includeTokens = [];
    const excludeTokens = [];
    const ratingTokens = [];
    rawTokens.forEach((token) => {
      const isExclude = token.startsWith("-") && token.length > 1;
      const value = isExclude ? token.slice(1) : token;

      if (/^\d+(\.\d+)?$/.test(value)) {
        ratingTokens.push({ value: parseFloat(value), exclude: isExclude });
      } else if (isExclude) {
        excludeTokens.push(value);
      } else {
        includeTokens.push(value);
      }
    });

    rows.forEach((row) => {
      const combined =
        `${row.textContent} ${row.dataset.status || ""}`.toLowerCase();
      const rowRating = parseFloat(row.dataset.rating);

      const includesAll = includeTokens.every((token) =>
        combined.includes(token),
      );
      const excludesAll = excludeTokens.every(
        (token) => !combined.includes(token),
      );
      const matchesRatings = ratingTokens.every(({ value, exclude }) => {
        const isWholeNumberToken = Number.isInteger(value);
        const matches =
          isWholeNumberToken ?
            Math.floor(rowRating) === value
          : rowRating === value;
        return exclude ? !matches : matches;
      });

      row.style.display =
        includesAll && excludesAll && matchesRatings ? "" : "none";
    });
  };

  searchInput.addEventListener("input", applyFilter);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") searchInput.blur();
  });

  const tbody = document.querySelector("#main-table tbody");

  tbody.addEventListener("click", (e) => {
    const tagLink = e.target.closest(".tag-link");
    if (!tagLink) return;
    e.preventDefault();
    searchInput.value = tagLink.dataset.tag;
    applyFilter();
    searchInput.focus();
  });

  // Arrow-key navigation for tag links: left/right within a row, up/down across rows
  tbody.addEventListener("keydown", (e) => {
    const link = e.target.closest(".tag-link");
    if (!link) return;

    const isHorizontal = e.key === "ArrowLeft" || e.key === "ArrowRight";
    const isVertical = e.key === "ArrowUp" || e.key === "ArrowDown";
    if (!isHorizontal && !isVertical) return;

    e.preventDefault();

    const currentRow = link.closest("tr");
    const linksInCurrentRow = Array.from(
      currentRow.querySelectorAll(".tag-link"),
    );
    const linkIndex = linksInCurrentRow.indexOf(link);

    if (isHorizontal) {
      const delta = e.key === "ArrowLeft" ? -1 : 1;
      const targetIndex = linkIndex + delta;
      if (targetIndex < 0 || targetIndex >= linksInCurrentRow.length) return;
      linksInCurrentRow[targetIndex].focus();
      return;
    }

    const visibleRows = Array.from(tbody.children).filter(
      (row) => row.style.display !== "none",
    );
    const rowIndex = visibleRows.indexOf(currentRow);
    if (rowIndex === -1) return;

    const targetRowIndex = e.key === "ArrowUp" ? rowIndex - 1 : rowIndex + 1;
    if (targetRowIndex < 0 || targetRowIndex >= visibleRows.length) return;

    const targetRow = visibleRows[targetRowIndex];
    const linksInTargetRow = Array.from(
      targetRow.querySelectorAll(".tag-link"),
    );
    if (linksInTargetRow.length === 0) return;

    const targetLink =
      linksInTargetRow[Math.min(linkIndex, linksInTargetRow.length - 1)];
    targetLink.focus();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q");
  if (query) {
    searchInput.value = query;
    applyFilter();
  }
}

function setupSorting() {
  const tbody = document.querySelector("#main-table tbody");
  const originalRows = Array.from(tbody.children);
  const sortableColumns = ["title", "authors", "tags", "rating"];

  let sortState = { column: null, direction: null };

  function getSortValue(row, columnId) {
    switch (columnId) {
      case "title":
        return row.children[0].textContent.trim().toLowerCase();
      case "authors":
        return row.children[1].textContent.trim().toLowerCase();
      case "tags":
        return row.children[2].textContent.trim().toLowerCase();
      case "rating":
        return parseFloat(row.dataset.rating) || 0;
      default:
        return "";
    }
  }

  function updateIndicators() {
    sortableColumns.forEach((columnId) => {
      const th = document.getElementById(columnId);
      if (!th) return;

      th.removeAttribute("data-sort-direction");
      const existingIndicator = th.querySelector(".sort-indicator");
      if (existingIndicator) existingIndicator.remove();

      if (sortState.column === columnId && sortState.direction) {
        th.setAttribute("data-sort-direction", sortState.direction);
        const indicator = document.createElement("span");
        indicator.className = "sort-indicator";
        indicator.textContent =
          sortState.direction === "asc" ? "\u25B2" : "\u25BC";
        indicator.style.position = "absolute";
        indicator.style.right = "0.4em";
        indicator.style.top = "50%";
        indicator.style.transform = "translateY(-50%)";
        th.appendChild(indicator);
      }
    });
  }

  function applySort() {
    if (!sortState.column) {
      originalRows.forEach((row) => tbody.appendChild(row));
      updateIndicators();
      return;
    }

    const rows = Array.from(tbody.children);
    rows.sort((a, b) => {
      const valA = getSortValue(a, sortState.column);
      const valB = getSortValue(b, sortState.column);
      let cmp;
      if (typeof valA === "number" && typeof valB === "number") {
        cmp = valA - valB;
      } else {
        cmp = String(valA).localeCompare(String(valB));
      }
      return sortState.direction === "asc" ? cmp : -cmp;
    });

    rows.forEach((row) => tbody.appendChild(row));
    updateIndicators();
  }

  function activateSort(columnId) {
    if (sortState.column === columnId) {
      if (sortState.direction === "asc") {
        sortState.direction = "desc";
      } else if (sortState.direction === "desc") {
        sortState = { column: null, direction: null };
      }
    } else {
      sortState = { column: columnId, direction: "asc" };
    }
    applySort();
  }

  const headerElements = sortableColumns
    .map((columnId) => document.getElementById(columnId))
    .filter(Boolean);

  headerElements.forEach((th, index) => {
    const columnId = sortableColumns[index];

    th.style.cursor = "pointer";
    th.style.position = "relative";
    th.setAttribute("tabindex", "0");
    th.setAttribute("role", "button");
    th.setAttribute("aria-label", `Sort by ${columnId}`);

    th.addEventListener("click", () => activateSort(columnId));

    th.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateSort(columnId);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const delta = e.key === "ArrowLeft" ? -1 : 1;
        const targetIndex = index + delta;
        if (targetIndex >= 0 && targetIndex < headerElements.length) {
          headerElements[targetIndex].focus();
        }
      }
    });
  });
}

init();
