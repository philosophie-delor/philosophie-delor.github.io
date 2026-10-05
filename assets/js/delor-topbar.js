(() => {
  'use strict';
  const bar = document.getElementById('delor-topbar');
  if (!bar) return;
  const links = bar.querySelector('.delor-top-links');
  const items = [...bar.querySelectorAll('.delor-top-item')];
  const language = document.getElementById('delor-language');
  const theme = document.getElementById('delor-theme-toggle');
  const search = bar.querySelector('.delor-top-search');
  const input = search?.querySelector('input');
  const searchButton = search?.querySelector('button');
  let frame;

  function freeSpace() {
    const style = getComputedStyle(bar);
    const children = [...bar.children].filter(el => !el.hidden && getComputedStyle(el).display !== 'none');
    const used = children.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    return bar.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      - used - parseFloat(style.columnGap || 0) * Math.max(0, children.length - 1);
  }

  function layout() {
    frame = null;
    const wasCompact = search?.dataset.compact === 'true';
    const wasExpanded = search?.hasAttribute('data-expanded');
    const hadFocus = input && document.activeElement === input;
    items.forEach(el => { el.hidden = false; });
    if (links) links.hidden = !items.length;
    if (language) language.hidden = false;
    if (theme) theme.hidden = false;
    delete bar.dataset.titleCompact;
    if (input) {
      input.hidden = false;
      input.style.width = '160px';
      delete search.dataset.expanded;
      search.dataset.compact = 'false';
    }
    // Preserve a usable search field first. Extra navigation gives way before it.
    for (const item of [...items].reverse()) {
      if (freeSpace() >= 0) break;
      item.hidden = true;
    }
    if (links) links.hidden = items.every(el => el.hidden);
    for (const control of [language, theme]) {
      if (freeSpace() >= 0) break;
      if (control) control.hidden = true;
    }
    if (freeSpace() < 0) bar.dataset.titleCompact = 'true';
    if (input && freeSpace() < 0) {
      input.hidden = true;
      search.dataset.compact = 'true';
      // The compact search frees enough space to restore the full site name on many phones.
      delete bar.dataset.titleCompact;
      if (freeSpace() < 0) bar.dataset.titleCompact = 'true';
    }
    if (input && !input.hidden) input.style.width = `${160 + Math.min(140, Math.max(0, freeSpace()))}px`;
    if (searchButton) {
      if (search.dataset.compact === 'true') {
        searchButton.setAttribute('aria-expanded', 'false');
        searchButton.title = bar.dataset.language === 'de' ? 'Suche öffnen' : 'Open search';
      } else {
        searchButton.removeAttribute('aria-expanded');
        searchButton.title = bar.dataset.language === 'de' ? 'Detailsuche' : 'Full search';
      }
      searchButton.setAttribute('aria-label', searchButton.title);
    }
    bar.querySelectorAll('.delor-top-item[hidden] details[open]').forEach(el => { el.open = false; });
    // Mobile keyboards change the viewport height. Keep an open search usable.
    if (wasExpanded && search.dataset.compact === 'true') {
      search.dataset.expanded = 'true';
      input.hidden = false;
      searchButton.setAttribute('aria-expanded', 'true');
      if (hadFocus && document.activeElement !== input) input.focus({ preventScroll: true });
    }
    if (hadFocus && input.hidden) searchButton.focus({ preventScroll: true });
    const width = String(bar.clientWidth);
    const compact = search?.dataset.compact === 'true';
    if (bar.dataset.layoutWidth !== width || compact !== wasCompact) {
      bar.dispatchEvent(new CustomEvent('delor-topbar-layout', { detail: { compact, wasCompact } }));
    }
    bar.dataset.layoutWidth = width;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(layout);
  }
  new ResizeObserver(schedule).observe(bar);
  document.fonts?.ready.then(schedule);
  addEventListener('resize', schedule);
  // Navigation initializes its toggle visibility before this deferred script runs.
  layout();

  const topMenus = [...bar.querySelectorAll('.delor-top-item > details')];
  function closeMenus(except) {
    topMenus.forEach(details => { if (details !== except) details.open = false; });
  }
  topMenus.forEach(details => {
    details.addEventListener('toggle', () => { if (details.open) closeMenus(details); });
  });
  document.addEventListener('pointerdown', event => {
    if (!links?.contains(event.target)) closeMenus();
  });
  links?.addEventListener('click', event => { if (event.target.closest('a[href]')) closeMenus(); });
  links?.addEventListener('keydown', event => {
    const details = event.target.closest('details');
    if (event.key === 'Escape' && details) {
      event.preventDefault();
      details.open = false;
      details.querySelector('summary').focus({ preventScroll: true });
    } else if (event.key === 'ArrowDown' && event.target.tagName === 'SUMMARY') {
      event.preventDefault();
      details.open = true;
      details.querySelector('a[href]')?.focus();
    }
  });
})();
