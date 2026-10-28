document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const topbar = document.querySelector("[data-topbar]");
// 페이지 안 섹션 링크(#...)만 위치를 추적한다. /security 같은 다른 페이지 링크는 제외.
const sectionLinks = Array.from(document.querySelectorAll(".topbar-nav a")).filter((link) =>
  link.getAttribute("href").startsWith("#")
);
const trackedSections = sectionLinks
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);
const heroFrame = document.querySelector("[data-hero-frame]");
const heroObjects = Array.from(document.querySelectorAll(".hero-scene .obj"));
const floatObjects = Array.from(document.querySelectorAll("[data-scroll-depth]"));
const stage = document.querySelector("[data-stage]");
const fan = document.querySelector("[data-fan]");
const finale = document.querySelector(".finale");
const automation = document.querySelector("#automation");
const faq = document.querySelector("#faq");

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

// 요소의 위쪽이 화면 start 비율에서 end 비율까지 올라오는 동안 0→1
function enterProgress(element, start, end) {
  const top = element.getBoundingClientRect().top / window.innerHeight;
  return clamp01((start - top) / (start - end));
}

/* ---------- 등장 효과: 같은 묶음 안에서는 차례로 ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
);

document.querySelectorAll(".reveal").forEach((item) => {
  const siblings = Array.from(item.parentElement.children).filter((child) => child.classList.contains("reveal"));
  item.style.setProperty("--delay", `${Math.min(siblings.indexOf(item), 4) * 90}ms`);
  revealObserver.observe(item);
});

/* ---------- 스크롤 연동 ---------- */

function updateOnScroll() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const animate = !reduceMotion.matches;

  topbar.classList.toggle("is-scrolled", y > 8);

  if (heroFrame && animate) {
    heroFrame.style.setProperty("--shrink", clamp01(y / (vh * 0.9)).toFixed(3));
  }

  // 자동 기록 섹션이 화면 가운데쯤 오면 페이지 전체가 어두워지고, 마무리 장면 전까지 유지한다.
  const isNight =
    automation.getBoundingClientRect().top < vh * 0.55 && faq.getBoundingClientRect().bottom > vh * 0.45;
  document.body.classList.toggle("is-night", isNight);
  topbar.classList.toggle("is-night", isNight);

  if (animate) {
    if (stage) stage.style.setProperty("--enter", enterProgress(stage, 1, 0.35).toFixed(3));
    if (fan) fan.style.setProperty("--fan", enterProgress(fan, 0.95, 0.3).toFixed(3));
    if (finale) {
      const rise = enterProgress(finale, 1, 0.2).toFixed(3);
      finale.querySelectorAll(".obj").forEach((obj, index) => {
        obj.style.setProperty("--rise", clamp01(rise * 1.3 - index * 0.06).toFixed(3));
      });
    }
    floatObjects.forEach((obj) => {
      const rect = obj.parentElement.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const distance = rect.top + rect.height / 2 - vh / 2;
      obj.style.setProperty("--sy", `${(distance * Number(obj.dataset.scrollDepth)).toFixed(1)}px`);
    });
  }

  let current = null;
  trackedSections.forEach((section) => {
    if (section.getBoundingClientRect().top < vh * 0.4) current = section.id;
  });
  sectionLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${current}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

let scrollQueued = false;
function queueScrollUpdate() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    updateOnScroll();
  });
}

window.addEventListener("scroll", queueScrollUpdate, { passive: true });
window.addEventListener("resize", queueScrollUpdate);
updateOnScroll();

/* ---------- 히어로 오브젝트: 포인터를 따라 살짝 움직임 ---------- */

if (heroFrame) {
  heroFrame.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const rect = heroFrame.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    heroObjects.forEach((obj) => {
      const depth = Number(obj.dataset.depth || 0.5);
      obj.style.setProperty("--px", `${(dx * depth * -40).toFixed(1)}px`);
      obj.style.setProperty("--py", `${(dy * depth * -30).toFixed(1)}px`);
    });
  });

  heroFrame.addEventListener("pointerleave", () => {
    heroObjects.forEach((obj) => {
      obj.style.setProperty("--px", "0px");
      obj.style.setProperty("--py", "0px");
    });
  });
}

/* ---------- 기능 미리보기: 진행 막대가 차면 다음 알약으로 ---------- */

const showcase = document.querySelector("[data-showcase]");

if (showcase) {
  const messages = document.documentElement?.dataset ?? {};
  const pills = Array.from(showcase.querySelectorAll(".feature-pill"));
  const screens = Array.from(showcase.querySelectorAll("[data-screen]"));
  const caption = showcase.querySelector("[data-caption]");
  const panel = showcase.querySelector("[role='tabpanel']");
  const swipeSurface = showcase.querySelector(".phone-screen");
  const track = showcase.querySelector(".pill-track");
  const toggle = showcase.querySelector("[data-autoplay-toggle]");
  const toggleLabel = showcase.querySelector("[data-autoplay-label]");
  const duration = 4800;
  let index = 0;
  let elapsed = 0;
  let lastTime = null;
  let isInView = false;
  let swipe = null;
  // 동작 줄이기를 켠 사용자는 멈춘 상태로 시작하고, 재생을 직접 누른 경우에만 넘어간다.
  let isPausedByUser = reduceMotion.matches;

  function isAutoplaying() {
    return !isPausedByUser;
  }

  function renderToggle() {
    const paused = !isAutoplaying();
    toggle.setAttribute("aria-pressed", String(paused));
    toggleLabel.textContent = paused ? (messages.autoplayPlay || "자동 넘김 재생") : (messages.autoplayPause || "자동 넘김 멈추기");
    // 자동으로 넘어가는 동안에는 바뀔 때마다 읽지 않고, 멈춘 뒤 직접 고른 화면만 알린다.
    caption.setAttribute("aria-live", paused ? "polite" : "off");
  }

  function select(nextIndex, { focus = false } = {}) {
    const previous = index;
    index = (nextIndex + pills.length) % pills.length;
    elapsed = 0;
    lastTime = null;
    const pill = pills[index];
    // 다음 화면은 오른쪽에서, 이전 화면은 왼쪽에서 들어온다.
    const direction = nextIndex >= previous ? 1 : -1;

    pills.forEach((item, itemIndex) => {
      const isCurrent = itemIndex === index;
      item.classList.toggle("is-current", isCurrent);
      item.setAttribute("aria-selected", String(isCurrent));
      item.tabIndex = isCurrent ? 0 : -1;
      item.style.setProperty("--progress", isCurrent && !isAutoplaying() ? "1" : "0");
    });

    screens.forEach((screen) => {
      screen.style.setProperty("--dir", direction);
      const isActive = screen.dataset.screen === pill.dataset.target;
      const wasActive = screen.classList.contains("is-active");
      screen.classList.toggle("is-active", isActive);
      screen.classList.toggle("is-leaving", wasActive && !isActive);
      if (isActive) screen.removeAttribute("aria-hidden");
      else screen.setAttribute("aria-hidden", "true");
    });
    stage.dataset.tint = pill.dataset.tint || "pink";
    panel.setAttribute("aria-labelledby", pill.id);
    caption.textContent = pill.dataset.caption;

    // 모바일 가로 목록에서 현재 알약을 보이게 하되, 페이지 세로 위치는 건드리지 않는다.
    if (track.scrollWidth > track.clientWidth) {
      const left = pill.offsetLeft - (track.clientWidth - pill.offsetWidth) / 2;
      track.scrollTo({ left, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    if (focus) pill.focus();
  }

  function tick(time) {
    const isRunning = isAutoplaying() && isInView && !document.hidden && swipe === null;
    if (isRunning && lastTime !== null) {
      elapsed += time - lastTime;
      const progress = Math.min(elapsed / duration, 1);
      pills[index].style.setProperty("--progress", progress.toFixed(4));
      if (progress >= 1) select(index + 1);
    }
    lastTime = isRunning ? time : null;
    requestAnimationFrame(tick);
  }

  pills.forEach((pill, pillIndex) => {
    pill.addEventListener("click", () => {
      select(pillIndex);
    });
    pill.addEventListener("keydown", (event) => {
      const moves = { ArrowRight: pillIndex + 1, ArrowLeft: pillIndex - 1, Home: 0, End: pills.length - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      isPausedByUser = true;
      renderToggle();
      select(moves[event.key], { focus: true });
    });
  });

  toggle.addEventListener("click", () => {
    isPausedByUser = !isPausedByUser;
    renderToggle();
    select(index);
  });

  // 세로 스크롤·확대는 브라우저에 맡기고, 명확한 가로 스와이프만 화면 전환으로 처리한다.
  swipeSurface.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) {
      swipe = null;
      return;
    }
    if (event.button !== 0) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, index };
    lastTime = null;
    swipeSurface.setPointerCapture(event.pointerId);
  });
  swipeSurface.addEventListener("pointerup", (event) => {
    if (!swipe || event.pointerId !== swipe.id) return;
    const gesture = swipe;
    swipe = null;
    lastTime = null;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      select(gesture.index + (dx < 0 ? 1 : -1));
    }
  });
  for (const type of ["pointercancel", "lostpointercapture"]) {
    swipeSurface.addEventListener(type, () => { swipe = null; lastTime = null; });
  }
  swipeSurface.addEventListener("dragstart", (event) => event.preventDefault());

  // 키보드 탐색은 명시적으로 멈추되, 재생 버튼에 남은 포커스가 재생을 막지 않게 한다.
  showcase.addEventListener("focusin", (event) => {
    if (event.target.matches(":focus-visible")) {
      isPausedByUser = true;
      renderToggle();
    }
  });

  new IntersectionObserver(
    ([entry]) => {
      isInView = entry.isIntersecting;
      lastTime = null;
    },
    { threshold: 0 }
  ).observe(showcase);

  // 백그라운드에서 RAF가 중단된 시간을 슬라이드 재생 시간에 더하지 않는다.
  document.addEventListener("visibilitychange", () => { swipe = null; lastTime = null; });

  reduceMotion.addEventListener("change", () => {
    isPausedByUser = reduceMotion.matches;
    renderToggle();
    select(index);
  });
  renderToggle();
  select(0);
  requestAnimationFrame(tick);
}
