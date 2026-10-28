import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const autoplay = source.slice(source.indexOf('const showcase ='));

function fixture(reduced = false, messages = {}) {
  function element(dataset = {}) {
    const listeners = new Map(), attributes = new Map(), styles = new Map(), classes = new Set();
    return {
      dataset, attributes, styles, textContent: '', tabIndex: 0,
      style: { setProperty: (key, value) => styles.set(key, value) },
      classList: { contains: key => classes.has(key), toggle(key, on) { on ? classes.add(key) : classes.delete(key); } },
      setAttribute: (key, value) => attributes.set(key, value), removeAttribute: key => attributes.delete(key),
      addEventListener(type, fn) { listeners.set(type, fn); },
      emit(type, event = {}) { listeners.get(type)?.(event); },
      matches: () => false, focus() {}, scrollTo() {}, setPointerCapture() {}, scrollWidth: 100, clientWidth: 100,
    };
  }
  const pills = Array.from({ length: 5 }, (_, i) => Object.assign(element({ target: String(i), caption: `Screen ${i}` }), { id: `tab-${i}` }));
  const screens = pills.map(pill => element({ screen: pill.dataset.target }));
  const caption = element(), panel = element(), track = element(), toggle = element(), label = element(), showcase = element(), swipeSurface = element();
  const selectors = { '[data-caption]': caption, "[role='tabpanel']": panel, '.phone-screen': swipeSurface, '.pill-track': track, '[data-autoplay-toggle]': toggle, '[data-autoplay-label]': label };
  showcase.querySelector = key => selectors[key];
  showcase.querySelectorAll = key => key === '.feature-pill' ? pills : screens;
  const document = Object.assign(element(), { hidden: false, documentElement: { dataset: messages }, querySelector: () => showcase });
  const reduceMotion = Object.assign(element(), { matches: reduced });
  let frame, observer, options;
  runInNewContext(autoplay, {
    document, reduceMotion, stage: element(), requestAnimationFrame: callback => { frame = callback; },
    IntersectionObserver: class { constructor(callback, config) { observer = callback; options = config; } observe() {} },
  });
  return {
    pills, screens, showcase, swipeSurface, document, toggle, label, caption, reduceMotion,
    frame: time => frame(time),
    visible(on = true) { observer([{ isIntersecting: on, intersectionRatio: on ? 0.1 : 0 }]); },
    current: () => pills.findIndex(pill => pill.attributes.get('aria-selected') === 'true'),
    options,
  };
}

test('mouse hover and pointer selection do not silently stop autoplay', () => {
  const f = fixture();
  assert.equal(f.options.threshold, 0);
  f.visible();
  f.showcase.emit('pointerenter', { pointerType: 'mouse' });
  f.showcase.emit('focusin', { target: { matches: () => false } });
  f.frame(0); f.frame(4800);
  assert.equal(f.current(), 1);
  f.pills[3].emit('click');
  f.frame(4900); f.frame(9700);
  assert.equal(f.current(), 4);
  assert.equal(f.label.textContent, '자동 넘김 멈추기');
});

test('explicit pause stays paused and resume works with keyboard focus still inside', () => {
  const f = fixture(); f.visible();
  f.toggle.emit('click'); f.frame(0); f.frame(9000);
  assert.equal(f.current(), 0);
  f.pills[2].emit('click'); f.frame(14000);
  assert.equal(f.current(), 2);
  f.showcase.emit('focusin', { target: { matches: () => true } });
  f.toggle.emit('click'); f.frame(15000); f.frame(19800);
  assert.equal(f.current(), 3);
  assert.equal(f.caption.attributes.get('aria-live'), 'off');
});

test('keyboard navigation pauses visibly and keeps the selected panel accessible', () => {
  const f = fixture(); f.visible();
  f.showcase.emit('focusin', { target: { matches: () => true } });
  assert.equal(f.label.textContent, '자동 넘김 재생');
  assert.equal(f.caption.attributes.get('aria-live'), 'polite');
  f.pills[0].emit('keydown', { key: 'ArrowRight', preventDefault() {} });
  f.frame(0); f.frame(10000);
  assert.equal(f.current(), 1);
  assert.equal(f.pills[1].tabIndex, 0);
});

test('hidden tab time is not counted and viewport re-entry resumes remaining time', () => {
  const f = fixture(); f.visible(); f.frame(0); f.frame(2000);
  f.document.hidden = true; f.document.emit('visibilitychange');
  f.document.hidden = false; f.document.emit('visibilitychange');
  f.frame(100000);
  assert.equal(f.current(), 0);
  f.frame(102800); assert.equal(f.current(), 1);
  f.visible(false); f.frame(110000); f.frame(120000);
  assert.equal(f.current(), 1);
  f.visible(); f.frame(130000); f.frame(134800);
  assert.equal(f.current(), 2);
});

test('reduced motion starts paused but explicit play runs a full cycle', () => {
  const f = fixture(true); f.visible(); f.frame(0); f.frame(6000);
  assert.equal(f.current(), 0);
  assert.equal(f.label.textContent, '자동 넘김 재생');
  f.toggle.emit('click');
  for (let i = 0; i <= 5; i++) f.frame(10000 + i * 4800);
  assert.equal(f.current(), 0);
  assert.equal(f.label.textContent, '자동 넘김 멈추기');
});

function swipeStart(f, x = 200, y = 100) {
  f.swipeSurface.emit('pointerdown', { isPrimary: true, button: 0, pointerId: 1, clientX: x, clientY: y });
}
function swipeEnd(f, x, y = 100) {
  f.swipeSurface.emit('pointerup', { pointerId: 1, clientX: x, clientY: y });
}

test('horizontal swipe wraps both ways and restarts a full autoplay interval', () => {
  const f = fixture(); f.visible(); f.frame(0); f.frame(4700);
  swipeStart(f); f.frame(10000);
  assert.equal(f.current(), 0, 'timer must not advance while a finger is down');
  swipeEnd(f, 100);
  assert.equal(f.current(), 1);
  assert.equal(f.label.textContent, '자동 넘김 멈추기');
  f.frame(11000); f.frame(15799); assert.equal(f.current(), 1);
  f.frame(15800); assert.equal(f.current(), 2);
  f.pills[0].emit('click'); swipeStart(f); swipeEnd(f, 280);
  assert.equal(f.current(), 4);
  assert.equal(f.screens[4].styles.get('--dir'), -1);
  swipeStart(f); swipeEnd(f, 100);
  assert.equal(f.current(), 0);
  assert.equal(f.screens[0].styles.get('--dir'), 1);
});

test('vertical scroll, taps, canceled gestures and pinch do not change screens or stop autoplay', () => {
  for (const action of [
    f => swipeEnd(f, 180),
    f => swipeEnd(f, 240, 250),
    f => { f.swipeSurface.emit('pointercancel'); swipeEnd(f, 100); },
    f => { f.swipeSurface.emit('lostpointercapture'); swipeEnd(f, 100); },
    f => { f.swipeSurface.emit('pointerdown', { isPrimary: false }); swipeEnd(f, 100); },
    f => { f.document.emit('visibilitychange'); swipeEnd(f, 100); },
  ]) {
    const f = fixture(); f.visible(); swipeStart(f); action(f);
    assert.equal(f.current(), 0);
    f.frame(0); f.frame(4800); assert.equal(f.current(), 1);
  }
});

test('swiping preserves explicit pause and reduced-motion preference', () => {
  for (const reduced of [false, true]) {
    const f = fixture(reduced); f.visible();
    if (!reduced) f.toggle.emit('click');
    swipeStart(f); swipeEnd(f, 100);
    assert.equal(f.current(), 1);
    f.frame(0); f.frame(10000);
    assert.equal(f.current(), 1);
    assert.equal(f.label.textContent, '자동 넘김 재생');
  }
});


test('autoplay controls use the rendered page language', () => {
  const f = fixture(false, { autoplayPlay: 'Play slideshow', autoplayPause: 'Pause slideshow' });
  assert.equal(f.label.textContent, 'Pause slideshow');
  f.toggle.emit('click');
  assert.equal(f.label.textContent, 'Play slideshow');
});
