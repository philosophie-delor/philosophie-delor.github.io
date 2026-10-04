(() => {
  'use strict';
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  function update() {
    const theme = root.dataset.theme || 'auto';
    const dark = theme.endsWith('dark') || (!theme.endsWith('light') && system.matches);
    document.querySelectorAll('source[data-delor-image-mode]').forEach(source => {
      const selected = (source.dataset.delorImageMode === 'dark') === dark;
      const media = selected ? 'all' : 'not all';
      if (source.media !== media) source.media = media;
    });
  }
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  system.addEventListener('change', update);
  update();
})();
