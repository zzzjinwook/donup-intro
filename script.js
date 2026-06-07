const header = document.querySelector("[data-header]");
const navLinks = Array.from(document.querySelectorAll(".desktop-nav a"));
const sections = Array.from(document.querySelectorAll("[data-section]"));
const reveals = Array.from(document.querySelectorAll(".reveal"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const problemStory = document.querySelector("[data-problem-story]");
const problemSteps = problemStory
  ? Array.from(problemStory.querySelectorAll("[data-problem-step]"))
  : [];
let activeProblemIndex = -1;

document.documentElement.classList.add("js-enabled");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
);

reveals.forEach((item, index) => {
  const customDelay = item.dataset.delay;
  item.style.transitionDelay = customDelay
    ? `${Number(customDelay)}ms`
    : `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const isDark = visible.target.classList.contains("section-dark");
    header.classList.toggle("is-light", !isDark);

    const id = visible.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", id && link.getAttribute("href") === `#${id}`);
    });
  },
  { threshold: [0.22, 0.45, 0.7] }
);

sections.forEach((section) => sectionObserver.observe(section));

function updateScrollEffects() {
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.08);
    const rect = item.getBoundingClientRect();
    const centerDistance = rect.top + rect.height / 2 - window.innerHeight / 2;
    const offset = centerDistance * speed * -1;
    item.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });

  updateProblemStory();
}

function updateProblemStory() {
  if (!problemStory || problemSteps.length === 0) return;

  const rect = problemStory.getBoundingClientRect();
  const scrollRange = Math.max(problemStory.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);
  const activeIndex = Math.min(
    problemSteps.length - 1,
    Math.floor(progress * problemSteps.length)
  );

  if (activeIndex !== activeProblemIndex) {
    const activeStep = problemSteps[activeIndex];
    const gif = activeStep?.querySelector(".problem-flow-media img");

    if (gif) {
      const source = gif.getAttribute("src").split("?")[0];
      gif.setAttribute("src", `${source}?replay=${Date.now()}`);
    }

    activeProblemIndex = activeIndex;
  }

  problemSteps.forEach((step, index) => {
    const isActive = index === activeIndex;
    step.classList.toggle("is-active", isActive);
    step.setAttribute("aria-hidden", String(!isActive));
  });
}

let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      updateScrollEffects();
      ticking = false;
    });
    ticking = true;
  },
  { passive: true }
);

window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();
