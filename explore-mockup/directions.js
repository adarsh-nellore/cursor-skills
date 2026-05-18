// Renders directions.json as a comparison grid (explore-mockup Beat 1 preview).

(function () {
  const root = document.getElementById('directions');
  const title = document.getElementById('page-h1');
  const subtitle = document.getElementById('page-subtitle');

  function card(d) {
    const el = document.createElement('article');
    el.className = 'dir-card';
    el.innerHTML =
      '<div class="tag">' + (d.id || '') + '</div>' +
      '<h2>' + (d.title || 'Direction') + '</h2>' +
      '<p>' + (d.summary || '') + '</p>' +
      '<dl>' +
      '<dt>Cornerstone</dt><dd>' + (d.cornerstone || '') + '</dd>' +
      '<dt>Nav model</dt><dd>' + (d.nav_model || '') + '</dd>' +
      '<dt>Tradeoffs</dt><dd>' + (d.tradeoffs || '') + '</dd>' +
      '<dt>Risks</dt><dd>' + (d.risks || '') + '</dd>' +
      '</dl>';
    return el;
  }

  fetch('directions.json')
    .then(function (r) {
      if (!r.ok) throw new Error('directions.json missing');
      return r.json();
    })
    .then(function (data) {
      document.title = (data.product || 'Product') + ' — IA directions';
      title.textContent = (data.product || 'Product') + ' — IA directions';
      subtitle.textContent =
        (data.primary_persona || '') +
        (data.subtitle ? ' · ' + data.subtitle : '');
      root.textContent = '';
      (data.directions || []).forEach(function (d) {
        root.appendChild(card(d));
      });
      if (!(data.directions || []).length) {
        root.textContent = 'No directions in directions.json';
      }
    })
    .catch(function (err) {
      root.textContent = 'Could not load directions.json: ' + err.message;
    });
})();
