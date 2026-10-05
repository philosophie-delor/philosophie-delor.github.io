(() => {
  'use strict';
  const bar = document.getElementById('delor-topbar');
  if (!bar) return;
  const body = document.body;
  const de = bar.dataset.language === 'de';
  const menuNarrow = matchMedia('(max-width: 899.98px)');
  const tocNarrow = matchMedia('(max-width: 1399.98px)');
  const page = document.querySelector('main.container > .book-page');
  const backdrop = document.getElementById('delor-panel-backdrop');
  const panels = {
    menu: { element: document.querySelector('main.container > .book-menu'), button: document.getElementById('delor-menu-toggle'), media: menuNarrow, label: de ? 'Hauptmenü' : 'Main menu' },
    toc: { element: document.querySelector('main.container > .book-toc'), button: document.getElementById('delor-toc-toggle'), media: tocNarrow, label: de ? 'Seitenübersicht' : 'Page navigation' }
  };
  let active = null;
  let savedScroll = null;
  let returnFocus = null;
  let frame;

  function hasContent(element) {
    if (!element) return false;
    const clone = element.cloneNode(true);
    clone.querySelectorAll('style, script, template, [hidden]').forEach(n => n.remove());
    return !!(clone.textContent.trim() || clone.querySelector('img, input, select, button, video'));
  }

  for (const [name, panel] of Object.entries(panels)) {
    panel.content = panel.element?.querySelector('.book-menu-content, .book-toc-content');
    panel.exists = !!panel.content && hasContent(panel.content);
    panel.button.hidden = !panel.exists;
    if (!panel.exists) {
      panel.element?.classList.add('delor-empty-panel');
      continue;
    }
    panel.element.id ||= `delor-${name}-panel`;
    panel.button.setAttribute('aria-controls', panel.element.id);
    panel.element.tabIndex = -1;
    panel.element.setAttribute('aria-label', panel.label);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'delor-panel-close';
    close.textContent = de ? 'Schließen ×' : 'Close ×';
    close.addEventListener('click', () => closePanel());
    panel.content.prepend(close);
    panel.button.addEventListener('click', () => active === name ? closePanel() : openPanel(name));
    panel.element.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || !active) return;
      closePanel(false);
    });
  }

  function setMode() {
    if (active && !panels[active].media.matches) closePanel(false);
    for (const panel of Object.values(panels)) {
      if (!panel.exists) continue;
      panel.element.classList.toggle('delor-overlay', panel.media.matches);
      const closed = panel.media.matches && panel !== panels[active];
      panel.element.inert = closed;
      if (closed) panel.element.setAttribute('aria-hidden', 'true');
      else panel.element.removeAttribute('aria-hidden');
    }
  }

  function openPanel(name) {
    const panel = panels[name];
    if (!panel?.media.matches || !panel.exists) return;
    if (!active) {
      savedScroll = { x: scrollX, y: scrollY };
      returnFocus = document.activeElement;
    }
    if (active) {
      panels[active].element.removeAttribute('role');
      panels[active].element.removeAttribute('aria-modal');
    }
    active = name;
    body.dataset.delorPanel = name;
    backdrop.hidden = false;
    if (page) page.inert = true;
    panel.element.setAttribute('role', 'dialog');
    panel.element.setAttribute('aria-modal', 'true');
    updateButtons();
    setMode();
    panel.element.focus({ preventScroll: true });
    if (name === 'toc') {
      updateCurrentHeading();
      const selected = panel.content.querySelector('.delor-toc-current');
      if (selected) {
        const rect = selected.getBoundingClientRect();
        const parentRect = panel.content.getBoundingClientRect();
        panel.content.scrollTop += rect.top - parentRect.top - panel.content.clientHeight / 3;
      }
    }
  }

  function closePanel(restoreFocus = true) {
    if (!active) return;
    const panel = panels[active];
    active = null;
    delete body.dataset.delorPanel;
    backdrop.hidden = true;
    if (page) page.inert = false;
    panel.element.removeAttribute('role');
    panel.element.removeAttribute('aria-modal');
    updateButtons();
    setMode();
    if (savedScroll) window.scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
    savedScroll = null;
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function updateButtons() {
    for (const [name, panel] of Object.entries(panels)) {
      const open = active === name;
      panel.button.setAttribute('aria-expanded', String(open));
      panel.button.setAttribute('aria-label', de ? `${panel.label} ${open ? 'schließen' : 'öffnen'}` : `${open ? 'Close' : 'Open'} ${panel.label.toLowerCase()}`);
    }
  }

  const headingLinks = Array.from(panels.toc.content?.querySelectorAll('a[href]') || []).map(link => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return null;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return null; }
    const heading = document.getElementById(id);
    return heading ? { link, heading } : null;
  }).filter(Boolean);

  function updateCurrentHeading() {
    if (!headingLinks.length) return;
    const threshold = bar.getBoundingClientRect().bottom + 32;
    let current = headingLinks[0];
    for (const item of headingLinks) {
      if (item.heading.getBoundingClientRect().top <= threshold) current = item;
    }
    for (const item of headingLinks) {
      item.link.classList.toggle('delor-toc-current', item === current);
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }

  backdrop.addEventListener('click', () => closePanel());
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); closePanel(); return; }
    if (event.key !== 'Tab') return;
    const items = Array.from(panels[active].element.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'))
      .filter(el => !el.disabled && el.getClientRects().length);
    if (!items.length) { event.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) {
      event.preventDefault(); last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) {
      event.preventDefault(); first.focus({ preventScroll: true });
    }
  });
  document.addEventListener('touchmove', event => {
    if (active && !panels[active].content.contains(event.target)) event.preventDefault();
  }, { passive: false });
  addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = null; updateCurrentHeading(); });
  }, { passive: true });
  menuNarrow.addEventListener('change', setMode);
  tocNarrow.addEventListener('change', setMode);
  const language = document.getElementById('delor-language');
  language?.addEventListener('change', () => { location.href = language.value; });
  // Clear the original mobile switches; the original header is replaced visually.
  document.querySelectorAll('#menu-control, #toc-control').forEach(input => { input.checked = false; });
  body.classList.add('delor-nav-ready');
  bar.hidden = false;
  setMode();
  updateCurrentHeading();
})();
