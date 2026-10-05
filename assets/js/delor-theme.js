// One controller for the top-bar cycle button and the three sidebar buttons.
(() => {
  'use strict';
  const root = document.documentElement;
  const cycle = document.getElementById('delor-theme-toggle');
  const choices = document.querySelectorAll('[data-theme-choice]');
  const de = document.getElementById('delor-topbar')?.dataset.language === 'de';
  const themes = ['ayu-auto', 'ayu-light', 'ayu-dark'];
  const labels = { 'ayu-auto': 'Auto', 'ayu-light': de ? 'Hell' : 'Light', 'ayu-dark': de ? 'Dunkel' : 'Dark' };

  function currentTheme() {
    return themes.includes(root.dataset.theme) ? root.dataset.theme : 'ayu-auto';
  }

  function updateButtons() {
    const theme = currentTheme();
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    if (cycle) {
      cycle.dataset.mode = theme.replace('ayu-', '');
      cycle.title = de
        ? `Darstellung: ${labels[theme]}. Wechseln zu ${labels[next]}`
        : `Theme: ${labels[theme]}. Switch to ${labels[next]}`;
      cycle.setAttribute('aria-label', cycle.title);
    }
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  }

  function applyTheme(theme, persist = true) {
    if (!themes.includes(theme)) return;
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('book-ayu-theme', theme); } catch {}
    }
    updateButtons();
    document.dispatchEvent(new CustomEvent('delor-theme-change', { detail: { theme } }));
  }

  choices.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice)));
  cycle?.addEventListener('click', () => applyTheme(themes[(themes.indexOf(currentTheme()) + 1) % themes.length]));
  addEventListener('storage', event => {
    if (event.key === 'book-ayu-theme' || event.key === null) applyTheme(event.newValue || 'ayu-auto', false);
  });
  new MutationObserver(updateButtons).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  updateButtons();
})();
