(() => {
  'use strict';
  const form = document.querySelector('.delor-top-search');
  if (!form) return;
  const input = form.querySelector('input');
  const box = form.querySelector('.delor-search-dropdown');
  const results = form.querySelector('#delor-top-results');
  const status = form.querySelector('.delor-top-search-status');
  const more = form.querySelector('.delor-top-search-more');
  const de = document.getElementById('delor-topbar').dataset.language === 'de';
  let pending, timer, generation = 0;
  function load() {
    if (!pending) pending = Promise.all([
      import(form.dataset.engine),
      fetch(form.dataset.index).then(r => { if (!r.ok) throw Error('Search unavailable'); return r.json(); })
    ]).then(async ([module, pages]) => {
      const Engine = window.MiniSearch || module.default;
      const index = new Engine({ fields: ['title','content'], storeFields: ['title','content','href'], searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: .2, combineWith: 'AND' } });
      await index.addAllAsync(pages);
      return index;
    }).catch(error => { pending = null; throw error; });
    return pending;
  }
  function close() { ++generation; clearTimeout(timer); box.hidden = true; }
  async function search() {
    const request = ++generation;
    const query = input.value.trim();
    if (!query) { close(); return; }
    const url = new URL(form.action);
    url.searchParams.set('q', query);
    more.href = url.href;
    results.replaceChildren();
    status.textContent = de ? 'Suche …' : 'Searching …';
    box.hidden = false;
    try {
      const index = await load();
      if (request !== generation) return;
      const hits = index.search(query).slice(0,5);
      for (const hit of hits) {
        const url = new URL(hit.href, location.href);
        if (url.origin !== location.origin || !['http:','https:'].includes(url.protocol)) continue;
        const li = document.createElement('li');
        const a = document.createElement('a'); a.href = url.href;
        const title = document.createElement('strong'); title.textContent = hit.title;
        const snippet = document.createElement('small');
        const text = String(hit.content || '').replace(/\s+/g,' ').trim();
        const positions = (hit.terms || []).map(t => text.toLowerCase().indexOf(t.toLowerCase())).filter(n => n >= 0);
        const start = positions.length ? Math.max(0, Math.min(...positions)-35) : 0;
        snippet.textContent = (start ? '…' : '') + text.slice(start,start+140) + (text.length>start+140 ? '…' : '');
        a.append(title,snippet); li.append(a); results.append(li);
      }
      const count = results.children.length;
      status.textContent = count ? (de ? `${count} ${count === 1 ? 'Vorschlag' : 'Vorschläge'}` : `${count} ${count === 1 ? 'suggestion' : 'suggestions'}`) : (de ? 'Keine Treffer.' : 'No results.');
    } catch {
      if (request === generation) status.textContent = de ? 'Schnellsuche nicht verfügbar. Bitte Detailsuche verwenden.' : 'Quick search unavailable. Please use full search.';
    }
  }
  input.addEventListener('input', () => { ++generation; clearTimeout(timer); timer = setTimeout(search,180); });
  input.addEventListener('focus', () => { if (input.value.trim()) search(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !box.hidden) { event.preventDefault(); box.querySelector('a')?.focus(); }
  });
  form.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); input.focus({preventScroll:true}); close(); }
    if (event.target === input || !['ArrowDown','ArrowUp'].includes(event.key)) return;
    const links = [...box.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = index + (event.key === 'ArrowDown' ? 1 : -1);
    (next < 0 ? input : links[Math.min(next, links.length-1)]).focus();
  });
  form.addEventListener('focusout', () => setTimeout(() => { if (!form.contains(document.activeElement)) close(); },0));
  document.addEventListener('pointerdown', event => { if (!form.contains(event.target)) close(); });
  matchMedia('(min-width: 1120px)').addEventListener('change', close);
})();
