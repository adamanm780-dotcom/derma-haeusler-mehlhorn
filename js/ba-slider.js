/* ==========================================================================
   Vorher-Nachher-Slider fuer die Unterseiten
   --------------------------------------------------------------------------
   Gleiche Funktion wie auf der Startseite (dort inline im Seitenskript),
   hier als eigene Datei, damit jede Behandlungsseite sie einbinden kann:

       <script src="js/ba-slider.js" defer></script>

   Markup wie auf der Startseite (Element mit data-ba-slider, darin
   .ba-slider__after-wrap, .ba-slider__divider, .ba-slider__handle),
   Styles in styles/treatment.css. Zusaetzlich per Tastatur bedienbar
   (Pfeiltasten, Pos1/Ende).
   ========================================================================== */
(function () {
  'use strict';

  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-ba-slider]').forEach(function (slider) {
    var after = slider.querySelector('.ba-slider__after-wrap');
    var divider = slider.querySelector('.ba-slider__divider');
    var handle = slider.querySelector('.ba-slider__handle');
    var dragging = false;
    var pos = 50;

    slider.setAttribute('role', 'slider');
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    if (!slider.hasAttribute('aria-label')) slider.setAttribute('aria-label', 'Vorher-Nachher-Vergleich');

    function setPos(pct) {
      pos = Math.max(0, Math.min(100, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pos + '%)';
      divider.style.left = pos + '%';
      handle.style.left = pos + '%';
      slider.setAttribute('aria-valuenow', Math.round(pos));
    }

    function pctFromEvent(e) {
      var rect = slider.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    }

    function start(e) {
      dragging = true;
      slider.style.cursor = 'grabbing';
      setPos(pctFromEvent(e));
      e.preventDefault();
    }
    function move(e) { if (dragging) setPos(pctFromEvent(e)); }
    function end() { if (!dragging) return; dragging = false; slider.style.cursor = 'ew-resize'; }

    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    slider.addEventListener('keydown', function (e) {
      var schritt = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPos(pos - schritt); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPos(pos + schritt); e.preventDefault(); }
      else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(100); e.preventDefault(); }
    });

    setPos(50);

    /* Dezenter Hinweis: beim ersten Sichtkontakt kurz hin- und herziehen */
    if (ruhig || !('IntersectionObserver' in window)) return;
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          io.disconnect();
          [50, 30, 65, 50].forEach(function (p, i) {
            setTimeout(function () { if (!dragging) setPos(p); }, 600 + i * 350);
          });
        }
      });
    }, { threshold: 0.4 });
    io.observe(slider);
  });
})();
