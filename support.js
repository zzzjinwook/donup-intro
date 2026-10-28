// 도움말(/support)과 개인정보 보호(/security) 공통: 등장 효과, 도움말 검색, 링크로 연 질문, 하위 메뉴 위치.
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- 등장 효과 ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
);

function observeReveal(items) {
  items.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--delay", `${Math.min(index, 5) * 70}ms`);
    revealObserver.observe(item);
  });
}

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

// 주제 카드에 그 주제의 설명과 질문 수를 덧붙인다(빌드는 제목만 넣는다).
document.querySelectorAll(".support-nav a[href^='#']").forEach((link) => {
  const section = document.getElementById(link.getAttribute("href").slice(1));
  if (!section || link.querySelector(".support-nav-title")) return;
  const title = document.createElement("span");
  title.className = "support-nav-title";
  title.textContent = link.textContent.trim();
  link.replaceChildren(title);
  const description = section.querySelector(".description");
  if (description) {
    const desc = document.createElement("span");
    desc.className = "support-nav-desc";
    desc.textContent = description.textContent.trim();
    link.append(desc);
  }
  const count = document.createElement("span");
  count.className = "support-nav-count";
  count.textContent = `질문 ${section.querySelectorAll(".support-faq").length}개`;
  link.append(count);
});
// 빌드가 넣은 도움말 카드와 주제 묶음도 같은 방식으로 등장시킨다.
observeReveal(Array.from(document.querySelectorAll(".support-nav a")));
observeReveal(Array.from(document.querySelectorAll(".support-category")));

/* ---------- 링크(#faq-...)로 들어오면 그 질문을 연다 ---------- */

function openFromHash() {
  // 앵커 id는 모두 ASCII라 디코딩하지 않는다(잘못된 %가 있어도 오류 없이 넘어간다).
  const id = location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!(target instanceof HTMLDetailsElement)) return;
  document.querySelectorAll(".support-faq.is-target").forEach((item) => item.classList.remove("is-target"));
  target.open = true;
  target.classList.add("is-target");
  target.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
}

window.addEventListener("hashchange", openFromHash);
openFromHash();

/* ---------- 문의: 외부 메일 앱을 실행하기 전에 작성 방법을 표시 ---------- */

const copyEmail = document.querySelector("[data-copy-email]");
if (copyEmail && navigator.clipboard?.writeText) {
  const email = document.getElementById("contact-email");
  const status = document.querySelector("[data-copy-status]");
  copyEmail.hidden = false;
  copyEmail.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email.value);
      status.textContent = "메일 주소를 복사했어요. 받는 사람에 붙여 넣어 주세요.";
    } catch {
      email.focus();
      email.select();
      status.textContent = "브라우저가 복사를 허용하지 않았어요. 선택된 주소를 직접 복사해 주세요.";
    }
  });
}

/* ---------- 도움말 검색 ---------- */

const searchForm = document.querySelector("[data-support-search]");

if (searchForm) {
  const input = searchForm.querySelector("input");
  const clearButton = searchForm.querySelector("[data-support-clear]");
  const countLabel = document.querySelector("[data-support-count]");
  const emptyNote = document.querySelector("[data-support-empty]");
  const nav = document.querySelector(".support-nav");
  const categories = Array.from(document.querySelectorAll(".support-category"));
  const items = Array.from(document.querySelectorAll(".support-faq")).map((details) => {
    const summary = details.querySelector("summary");
    // summary는 flex라서 글자를 한 요소로 감싸야 강조 표시를 넣어도 글자 사이가 벌어지지 않는다.
    if (!summary.querySelector(".support-q")) {
      const label = document.createElement("span");
      label.className = "support-q";
      label.textContent = summary.textContent;
      summary.replaceChildren(label);
    }
    return {
      details,
      summary,
      originalSummary: summary.innerHTML,
      text: details.textContent.replace(/\s+/g, " ").toLowerCase(),
      wasOpen: details.open,
    };
  });

  const normalize = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const escapeHTML = (value) =>
    value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  // 질문 제목 안의 일치 부분만 표시한다(답 본문은 원문 그대로 둔다).
  function highlight(item, terms) {
    if (!terms.length) {
      item.summary.innerHTML = item.originalSummary;
      return;
    }
    const label = item.summary.querySelector(".support-q");
    const source = label.textContent;
    const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    label.innerHTML = escapeHTML(source).replace(pattern, "<mark>$1</mark>");
  }

  function applySearch() {
    const query = normalize(input.value);
    const terms = query.split(" ").filter(Boolean);
    let matches = 0;

    items.forEach((item) => {
      item.summary.innerHTML = item.originalSummary;
      const isMatch = terms.every((term) => item.text.includes(term));
      item.details.hidden = !isMatch;
      if (isMatch) {
        matches += 1;
        highlight(item, terms);
      }
      // 검색 중에는 찾은 질문을 펼쳐 보여 주고, 검색을 지우면 원래 상태로 돌린다.
      item.details.open = terms.length ? isMatch && matches <= 3 : item.wasOpen;
    });

    categories.forEach((category) => {
      category.hidden = !category.querySelector(".support-faq:not([hidden])");
    });

    const isSearching = terms.length > 0;
    if (nav) nav.hidden = isSearching;
    clearButton.hidden = !isSearching;
    emptyNote.hidden = !isSearching || matches > 0;
    countLabel.textContent = isSearching ? `${matches}개의 답을 찾았어요` : "";
  }

  searchForm.hidden = false;
  searchForm.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", applySearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      applySearch();
    }
  });
  clearButton.addEventListener("click", () => {
    input.value = "";
    applySearch();
    input.focus();
  });
}

/* ---------- 개인정보 보호 페이지: 하위 메뉴 현재 위치 ---------- */

const subnavLinks = Array.from(document.querySelectorAll(".subnav nav a[href^='#']"));

if (subnavLinks.length) {
  const sections = subnavLinks.map((link) => document.getElementById(link.getAttribute("href").slice(1)));
  let queued = false;

  function updateSubnav() {
    queued = false;
    let current = sections[0];
    sections.forEach((section) => {
      if (section && section.getBoundingClientRect().top < window.innerHeight * 0.35) current = section;
    });
    subnavLinks.forEach((link, index) => {
      const isActive = sections[index] === current;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(updateSubnav);
    },
    { passive: true }
  );
  updateSubnav();
}
