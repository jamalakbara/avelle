/*
 * Curated card color swatches.
 * Clicking a swatch swaps the card image to that variant (no page reload) and
 * updates the card link to the selected variant. Uses event delegation so a
 * single listener covers every curated-card on the page (works with the
 * deduped script_tag include in snippets/curated-card.liquid).
 */
(function () {
  if (window.__curatedCardSwatchesInit) return;
  window.__curatedCardSwatchesInit = true;

  function selectSwatch(swatch) {
    var card = swatch.closest('.curated-card');
    if (!card) return;

    var img = card.querySelector('.curated-card__image');
    var src = swatch.getAttribute('data-img');
    if (img && src) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = src;
    }

    var url = swatch.getAttribute('data-url');
    if (url && card.tagName === 'A') card.setAttribute('href', url);

    var group = swatch.closest('[data-curated-swatches]');
    if (group) {
      group.querySelectorAll('.curated-card__swatch').forEach(function (s) {
        s.classList.toggle('is-active', s === swatch);
      });
    }
  }

  document.addEventListener('click', function (e) {
    var swatch = e.target.closest('.curated-card__swatch');
    if (!swatch) return;
    e.preventDefault();
    e.stopPropagation();
    selectSwatch(swatch);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var swatch = e.target.closest('.curated-card__swatch');
    if (!swatch) return;
    e.preventDefault();
    selectSwatch(swatch);
  });
})();
