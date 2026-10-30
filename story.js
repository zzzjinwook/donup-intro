// DonUp 섹션 레일·제품 스토리·흐름 장면. story.css와 짝을 이룬다.
// script.js와 같은 전역에서 돌기 때문에 이름이 겹치지 않도록 전부 즉시 실행 함수 안에 둔다.
// 각 부분은 필요한 DOM이 없으면 아무것도 하지 않는다(상세 페이지에서도 로드된다).
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

  /* ---------- 좌측 섹션 레일 ---------- */

  function setupSectionRail() {
    const rail = document.querySelector("[data-section-nav]");
    if (!rail) return;
    const wide = window.matchMedia("(min-width: 1180px)");
    const items = Array.from(rail.querySelectorAll('a[href^="#"]'))
      .map((link) => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
      .filter((item) => item.section);
    if (!items.length) return;

    let current = null;
    let queued = false;

    function update() {
      queued = false;
      if (!wide.matches) return;
      // 화면 위쪽 40% 지점을 지난 마지막 섹션이 현재 위치다.
      const line = window.innerHeight * 0.4;
      const tops = items.map((item) => item.section.getBoundingClientRect().top);
      let next = null;
      tops.forEach((top, index) => {
        if (top <= line) next = items[index];
      });
      if (next === current) return;
      current?.link.removeAttribute("aria-current");
      next?.link.setAttribute("aria-current", "location");
      current = next;
    }

    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    wide.addEventListener("change", queue);
    // 레일 링크로 이동하면 스크롤이 끝나기 전에 바로 표시를 옮긴다.
    items.forEach((item) =>
      item.link.addEventListener("click", () => {
        current?.link.removeAttribute("aria-current");
        item.link.setAttribute("aria-current", "location");
        current = item;
      })
    );
    queue();
  }

  /* ---------- #everyday 제품 스토리 ---------- */

  function setupProductStory() {
    const story = document.querySelector(".product-story");
    if (!story) return;
    const steps = Array.from(story.querySelectorAll("details.story-step[data-story-step]"));
    if (!steps.length) return;
    const keys = steps.map((step) => step.dataset.storyStep);
    const screens = Array.from(story.querySelectorAll("[data-story-screen]"));
    // 스크롤 연동은 넓고 충분히 높은 화면에서만. 좁거나 낮은 화면은 단순 세로 배치 + 클릭.
    const roomy = window.matchMedia("(min-width: 900px) and (min-height: 640px)");

    // 코드가 바꾼 open 상태를 기억해 두고, toggle 이벤트가 사용자 조작인지 구분한다.
    const expected = new Map();
    let active = null;
    let lastZone = -1;
    let inView = false;
    let frame = 0;

    function setOpen(step, open) {
      if (step.open === open) return;
      expected.set(step, open);
      step.open = open;
    }

    function activate(key) {
      if (!keys.includes(key)) return;
      active = key;
      story.dataset.storyActive = key;
      steps.forEach((step) => setOpen(step, step.dataset.storyStep === key));
      // 보이는 화면 한 장만 보조기술에 남긴다.
      screens.forEach((screen) => {
        const current = screen.dataset.storyScreen === key;
        screen.classList.toggle("is-current", current);
        if (current) screen.removeAttribute("aria-hidden");
        else screen.setAttribute("aria-hidden", "true");
      });
    }

    steps.forEach((step) => {
      step.addEventListener("toggle", () => {
        if (expected.has(step) && expected.get(step) === step.open) {
          expected.delete(step);
          return;
        }
        expected.delete(step);
        // 사용자가 연 패널: 그 화면으로 바꾸고 나머지는 닫는다.
        // 지금 스크롤 구간(lastZone)은 그대로 두므로 다음 구간에 들어가기 전까지 덮어쓰지 않는다.
        if (step.open) activate(step.dataset.storyStep);
      });
    });

    const scrollMode = () => roomy.matches && !reduceMotion.matches;

    function measure() {
      frame = 0;
      if (!scrollMode()) return;
      const rect = story.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? clamp01(-rect.top / travel) : 0;
      story.style.setProperty("--story-progress", progress.toFixed(4));
      const zone = Math.min(keys.length - 1, Math.floor(progress * keys.length));
      if (zone !== lastZone) {
        lastZone = zone;
        // 키보드로 읽는 링크가 닫힌 패널 안으로 숨지 않게 한다.
        const reading = story.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
        if (!reading) activate(keys[zone]);
      }
    }

    // 스크롤할 때만 한 프레임 계산한다. 화면 밖이면 아예 예약하지 않는다.
    function queue() {
      if (!frame && inView && scrollMode()) frame = requestAnimationFrame(measure);
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    function applyMode() {
      const on = scrollMode();
      story.classList.toggle("is-scroll-story", on);
      story.style.setProperty("--story-steps", String(keys.length));
      if (!on) {
        stop();
        story.style.removeProperty("--story-progress");
        lastZone = -1;
        return;
      }
      queue();
    }

    // 화면 밖이면 프레임 루프를 멈춘다.
    new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) queue();
      else stop();
    }).observe(story);

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    roomy.addEventListener("change", applyMode);
    reduceMotion.addEventListener("change", applyMode);

    // 처음 상태: 마크업에서 열려 있는 패널, 없으면 첫 단계.
    const initial = steps.find((step) => step.open) || steps[0];
    activate(initial.dataset.storyStep);
    applyMode();
  }

  /* ---------- #flow 흐름 장면 ---------- */

  function setupFlowScenes() {
    document.querySelectorAll("[data-flow-scene]").forEach((scene) => {
      const container = scene.closest(".flow-story") || scene;
      const entries = Array.from(scene.querySelectorAll(".flow-entry"));
      const bars = Array.from(scene.querySelectorAll(".flow-bar"));
      const hub = scene.querySelector(".flow-hub");
      const replay = container.querySelector("[data-flow-replay]");
      if (!entries.length || !hub) return;

      entries.forEach((entry, index) => entry.style.setProperty("--flow-i", index));
      bars.forEach((bar, index) => bar.style.setProperty("--flow-i", index));

      // 각 항목 오른쪽 점에서 허브 중심까지의 거리
      function measureTravel() {
        const hubRect = hub.getBoundingClientRect();
        const hubX = hubRect.left + hubRect.width / 2;
        const hubY = hubRect.top + hubRect.height / 2;
        const offsets = entries.map((entry) => {
          const rect = entry.getBoundingClientRect();
          return [hubX - rect.right, hubY - (rect.top + rect.height / 2)];
        });
        entries.forEach((entry, index) => {
          entry.style.setProperty("--flow-dx", `${offsets[index][0].toFixed(1)}px`);
          entry.style.setProperty("--flow-dy", `${offsets[index][1].toFixed(1)}px`);
        });
      }

      let timer = 0;
      const cycleMs = 3700;

      // 자동 재생 전에는 첫 프레임(빈 막대)에서 멈춰 둔다. 들어올 때 최종 상태가 번쩍였다 사라지지 않게.
      if (!reduceMotion.matches) {
        measureTravel();
        scene.classList.add("is-playing", "is-paused");
      }

      function play(byUser) {
        if (!byUser && reduceMotion.matches) return; // 최종 상태 그대로
        measureTravel();
        clearTimeout(timer);
        if (!byUser && scene.classList.contains("is-paused")) {
          scene.classList.remove("is-paused");
        } else {
          scene.classList.remove("is-playing", "is-user-play", "is-paused");
          void scene.offsetWidth; // 같은 애니메이션을 처음부터 다시 시작
          scene.classList.toggle("is-user-play", byUser);
          scene.classList.add("is-playing");
        }
        if (replay) replay.disabled = true;
        timer = setTimeout(() => {
          // 마지막 프레임은 기본 스타일과 같으므로 클래스를 떼도 최종 상태로 남는다.
          scene.classList.remove("is-playing", "is-user-play");
          if (replay) replay.disabled = false;
        }, cycleMs);
      }

      replay?.addEventListener("click", () => play(true));
      // 동작 줄이기를 켜면 멈춰 둔 첫 프레임 대신 최종 상태를 보여 준다.
      reduceMotion.addEventListener("change", () => {
        if (reduceMotion.matches && scene.classList.contains("is-paused")) {
          scene.classList.remove("is-playing", "is-paused");
        }
      });

      // 처음 화면에 충분히 들어왔을 때 한 번만 자동 재생
      const observer = new IntersectionObserver(
        (records) => {
          if (!records.some((record) => record.isIntersecting)) return;
          observer.disconnect();
          play(false);
        },
        { threshold: 0.45 }
      );
      observer.observe(scene);
    });
  }

  setupSectionRail();
  setupProductStory();
  setupFlowScenes();
})();
