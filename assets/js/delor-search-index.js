// Shared by the top-bar and full-page search. One index per language and engine.
(() => {
  'use strict';
  const indexes = new Map();

  function getIndex(source) {
    const { engine, index: data } = source.dataset;
    const key = JSON.stringify([engine, data]);
    if (!indexes.has(key)) {
      const pending = Promise.all([
        import(engine),
        fetch(data).then(response => {
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
      }).catch(error => {
        indexes.delete(key);
        throw error;
      });
      indexes.set(key, pending);
    }
    return indexes.get(key);
  }

  window.DelorSearch = Object.freeze({ getIndex });
})();
