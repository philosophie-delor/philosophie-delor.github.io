(() => {
  'use strict';
  const root = document.getElementById('delor-full-search');
  if (!root) return;
  const de = root.dataset.language === 'de';
  const input = document.getElementById('delor-search-query');
  const form = document.getElementById('delor-search-form');
  const status = document.getElementById('delor-search-status');
  const results = document.getElementById('delor-search-results');
  const more = document.getElementById('delor-search-more');
  let indexPromise;
  let generation = 0;
  let timer;
  let hits = [];
  let shown = 0;

  function getIndex() {
    if (!indexPromise) {
      indexPromise = Promise.all([
        import(root.dataset.engine),
        fetch(root.dataset.index).then(response => {
          if (!response.ok) throw new Error('Search data unavailable');
          return response.json();
        })
      ]).then(async ([module, pages]) => {
        const Engine = window.MiniSearch || module.default;
        const index = new Engine({
          fields: ['title', 'content'],
          storeFields: ['title', 'content', 'href', 'section'],
          searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2, combineWith: 'AND' }
        });
        await index.addAllAsync(pages);
        return index;
      }).catch(error => { indexPromise = undefined; throw error; });
    }
    return indexPromise;
  }

  // Work with text nodes so neither article content nor search text becomes HTML.
  function highlight(text, terms, excerpt = false) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    const needles = [...new Set(terms.map(t => t.toLowerCase()).filter(Boolean))];
    const lower = text.toLowerCase();
    const matches = needles.map(t => lower.indexOf(t)).filter(p => p >= 0);
    const start = excerpt && matches.length ? Math.max(0, Math.min(...matches) - 90) : 0;
    const end = excerpt ? Math.min(text.length, start + 360) : text.length;
    const value = text.slice(start, end);
    const folded = value.toLowerCase();
    const fragment = document.createDocumentFragment();
    if (start) fragment.append(document.createTextNode('…'));
    let cursor = 0;
    while (cursor < value.length) {
      let next = -1, length = 0;
      for (const term of needles) {
        const pos = folded.indexOf(term, cursor);
        if (pos >= 0 && (next < 0 || pos < next || (pos === next && term.length > length))) {
          next = pos; length = term.length;
        }
      }
      if (next < 0) { fragment.append(document.createTextNode(value.slice(cursor))); break; }
      fragment.append(document.createTextNode(value.slice(cursor, next)));
      const mark = document.createElement('mark');
      mark.textContent = value.slice(next, next + length);
      fragment.append(mark);
      cursor = next + length;
    }
    if (end < text.length) fragment.append(document.createTextNode('…'));
    return fragment;
  }

  function showMore() {
    const batch = document.createDocumentFragment();
    for (const hit of hits.slice(shown, shown + 20)) {
      const item = document.createElement('li');
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      const url = new URL(hit.href, window.location.href);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== location.origin) continue;
      link.href = url.href;
      const titleTerms = Object.keys(hit.match || {}).filter(term => hit.match[term].includes('title'));
      const contentTerms = Object.keys(hit.match || {}).filter(term => hit.match[term].includes('content'));
      link.append(highlight(hit.title, titleTerms));
      heading.append(link);
      item.append(heading);
      if (hit.section) {
        const section = document.createElement('div');
        section.className = 'delor-result-section';
        section.textContent = hit.section;
        item.append(section);
      }
      const excerpt = document.createElement('p');
      excerpt.append(highlight(hit.content, contentTerms, true));
      item.append(excerpt);
      batch.append(item);
    }
    shown = Math.min(shown + 20, hits.length);
    results.append(batch);
    more.hidden = shown >= hits.length;
  }

  async function search(updateURL = true) {
    const request = ++generation;
    const query = input.value.trim();
    if (updateURL) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
    hits = []; shown = 0;
    results.replaceChildren(); more.hidden = true;
    results.setAttribute('aria-busy', 'false');
    if (!query) {
      status.textContent = de ? 'Gib einen Suchbegriff ein.' : 'Enter a search term.';
      return;
    }
    status.textContent = de ? 'Suche läuft …' : 'Searching …';
    results.setAttribute('aria-busy', 'true');
    try {
      const index = await getIndex();
      if (request !== generation) return;
      hits = index.search(query);
      status.textContent = hits.length
        ? (de ? `${hits.length} Treffer für „${query}“` : `${hits.length} results for “${query}”`)
        : (de ? `Keine Treffer für „${query}“. Versuche einen anderen Suchbegriff.` : `No results for “${query}”. Try another search term.`);
      showMore();
    } catch (error) {
      if (request !== generation) return;
      status.textContent = de ? 'Die Suche konnte nicht geladen werden. Bitte erneut auf Suchen klicken.' : 'Search could not be loaded. Please click Search to retry.';
    } finally {
      if (request === generation) results.setAttribute('aria-busy', 'false');
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
  input.addEventListener('input', () => { ++generation; clearTimeout(timer); timer = setTimeout(search, 250); });
  more.addEventListener('click', showMore);
  window.addEventListener('popstate', () => { clearTimeout(timer); input.value = new URL(location.href).searchParams.get('q') || ''; search(false); });
  input.value = (new URL(location.href).searchParams.get('q') || '').slice(0, 200);
  search(false);
})();
