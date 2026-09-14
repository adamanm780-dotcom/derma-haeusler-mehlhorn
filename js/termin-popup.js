/* ==========================================================================
   Termin-Popup — Hinweis fuer Terminanfragen
   --------------------------------------------------------------------------
   Selbstgenuegsames Modul: bringt sein eigenes CSS und Markup mit, damit es
   mit einer einzigen Script-Zeile auf jeder Seite eingebunden werden kann:

       <script src="js/termin-popup.js" defer></script>

   Hintergrund
   Der Online-Kalender (DocVisit) ist ausschliesslich fuer das Hautscreening
   gedacht. Alle uebrigen Terminwuensche — vor allem die aesthetischen
   Behandlungen — laufen ueber E-Mail oder WhatsApp, damit vorab geklaert
   werden kann, wie viel Zeit eingeplant werden muss.

   Verhalten
   - jeder Knopf mit dem Attribut data-termin-anfrage oeffnet diesen Dialog
     statt den Kalender zu oeffnen
   - ohne JavaScript bleibt der Knopf ein gewoehnlicher mailto-Link, die
     Anfrage kommt also in jedem Fall an
   - schliessbar per X, Escape oder Klick daneben; der Tastaturfokus bleibt
     bis dahin im Dialog gefangen
   - der Dialog wird erst beim ersten Oeffnen gebaut
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    email: 'termin@hautarzt-chemnitz.de',
    betreff: 'Terminanfrage',
    /* WhatsApp-Nummer fuer wa.me: Landesvorwahl ohne + und ohne Leerzeichen */
    whatsappNummer: '4915112457406',
    whatsappAnzeige: '+49 151 12457406',
    whatsappText: 'Guten Tag, ich moechte gern einen Termin vereinbaren.',
    /* Online-Kalender — bewusst nur fuer das Hautscreening */
    kalender: 'https://www.docvisit.de/kalender/hautarzt-chemnitz/list'
  };

  /* ---------- Styles ---------------------------------------------------- */
  var CSS = [
    '.tpop{position:fixed;inset:0;z-index:12500;display:flex;align-items:center;justify-content:center;',
    'padding:24px 20px;background:rgba(28,21,12,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'opacity:0;visibility:hidden;transition:opacity .4s cubic-bezier(.16,1,.3,1),visibility .4s;}',
    '.tpop.is-open{opacity:1;visibility:visible;}',
    /* Das Attribut hidden braucht hier eine eigene Regel, sonst gewinnt display:flex */
    '.tpop[hidden]{display:none;}',

    '.tpop__card{position:relative;width:100%;max-width:500px;max-height:calc(100vh - 48px);overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#FDF9F2;border-radius:26px;',
    'box-shadow:0 30px 80px rgba(20,15,8,.34);transform:translateY(22px) scale(.975);',
    'transition:transform .5s cubic-bezier(.16,1,.3,1);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'color:#3B3222;line-height:1.65;text-align:left;}',
    '.tpop.is-open .tpop__card{transform:none;}',

    /* Farbband als Kopf — Markenverlauf */
    '.tpop__band{height:6px;border-radius:26px 26px 0 0;',
    'background:linear-gradient(90deg,#8B6F47 0%,#B89773 45%,#C9A57E 100%);}',

    '.tpop__close{position:absolute;top:16px;right:16px;width:38px;height:38px;border:1px solid #E6DCC7;',
    'border-radius:50%;background:rgba(255,255,255,.92);color:#544833;font-size:22px;line-height:1;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,border-color .2s;}',
    '.tpop__close:hover{background:#8B6F47;border-color:#8B6F47;color:#fff;}',

    '.tpop__body{padding:30px 34px 32px;}',

    '.tpop__pill{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;',
    'background:#F6EFE3;color:#8B6F47;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}',
    '.tpop__pill svg{width:13px;height:13px;flex:none;}',

    '.tpop__title{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(27px,4.8vw,34px);',
    'line-height:1.15;letter-spacing:-.01em;color:#251E13;margin:13px 0 0;}',
    '.tpop__title em{font-style:italic;color:#8B6F47;}',

    '.tpop__text{font-size:16px;color:#544833;margin-top:13px;}',
    '.tpop__text strong{color:#3B3222;font-weight:600;}',

    '.tpop__actions{display:flex;flex-direction:column;gap:11px;margin-top:24px;}',
    '.tpop__btn{display:flex;align-items:center;gap:13px;padding:14px 20px;border-radius:18px;',
    'text-decoration:none;border:1px solid #E6DCC7;background:#fff;color:#3B3222;',
    'transition:transform .2s,box-shadow .2s,border-color .2s;}',
    '.tpop__btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(139,111,71,.18);border-color:#C9A57E;}',
    '.tpop__btn-icon{width:42px;height:42px;border-radius:50%;flex:none;display:flex;align-items:center;',
    'justify-content:center;color:#fff;}',
    '.tpop__btn-icon svg{width:20px;height:20px;}',
    '.tpop__btn--mail .tpop__btn-icon{background:linear-gradient(135deg,#B89773 0%,#A8835F 100%);}',
    '.tpop__btn--whatsapp .tpop__btn-icon{background:#25D366;}',
    '.tpop__btn-label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;',
    'font-weight:700;color:#8B6F47;}',
    '.tpop__btn-value{display:block;font-size:16px;color:#251E13;word-break:break-word;}',

    '.tpop__note{margin-top:20px;padding-top:16px;border-top:1px solid #E6DCC7;font-size:13.5px;color:#7B6D55;}',
    '.tpop__note a{color:#8B6F47;text-decoration:underline;text-underline-offset:3px;}',

    '@media (max-width:560px){.tpop{padding:0;align-items:flex-end;}',
    '.tpop__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.tpop__band{border-radius:22px 22px 0 0;}',
    '.tpop__body{padding:26px 22px 28px;}}',

    '@media (prefers-reduced-motion:reduce){.tpop,.tpop__card{transition:none;}',
    '.tpop__card{transform:none;}.tpop__btn:hover{transform:none;}}',

    'body.tpop-open{overflow:hidden;}'
  ].join('');

  /* ---------- Markup ---------------------------------------------------- */
  var MAILTO = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(CONFIG.betreff);
  var WHATSAPP = 'https://wa.me/' + CONFIG.whatsappNummer +
                 '?text=' + encodeURIComponent(CONFIG.whatsappText);

  var HTML =
    '<div class="tpop" id="terminPop" role="dialog" aria-modal="true" aria-labelledby="terminPopTitle" hidden>' +
      '<div class="tpop__card" role="document">' +
        '<div class="tpop__band"></div>' +
        '<button type="button" class="tpop__close" data-tpop-close aria-label="Hinweis schlie&szlig;en">&times;</button>' +
        '<div class="tpop__body">' +
          '<span class="tpop__pill">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
            'Terminanfrage' +
          '</span>' +
          '<h2 class="tpop__title" id="terminPopTitle">Wir melden uns <em>zeitnah</em></h2>' +
          '<p class="tpop__text">Schreiben Sie uns bei &auml;sthetischen Anfragen bitte eine E-Mail oder eine ' +
            'WhatsApp-Terminanfrage &ndash; <strong>unsere Mitarbeiter antworten Ihnen innerhalb weniger Stunden!</strong></p>' +
          '<div class="tpop__actions">' +
            '<a class="tpop__btn tpop__btn--mail" href="' + MAILTO + '">' +
              '<span class="tpop__btn-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>' +
              '</span>' +
              '<span><span class="tpop__btn-label">E-Mail</span>' +
              '<span class="tpop__btn-value">' + CONFIG.email + '</span></span>' +
            '</a>' +
            '<a class="tpop__btn tpop__btn--whatsapp" href="' + WHATSAPP + '" target="_blank" rel="noopener">' +
              '<span class="tpop__btn-icon">' +
                '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z"/>' +
                '<path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.1 22l5.34-1.38a9.83 9.83 0 0 0 4.6 1.15h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 19 4.87 9.78 9.78 0 0 0 12.04 2zm0 1.8a8.03 8.03 0 0 1 5.7 2.36 7.99 7.99 0 0 1 2.36 5.7c0 4.45-3.62 8.06-8.06 8.06a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.02 8.02 0 0 1-1.23-4.28c0-4.45 3.62-8.06 8.07-8.06z"/></svg>' +
              '</span>' +
              '<span><span class="tpop__btn-label">WhatsApp</span>' +
              '<span class="tpop__btn-value">' + CONFIG.whatsappAnzeige + '</span></span>' +
            '</a>' +
          '</div>' +
          '<p class="tpop__note">Sie m&ouml;chten zur Hautkrebsvorsorge? Den Termin f&uuml;r das Hautscreening ' +
            'buchen Sie direkt im <a href="' + CONFIG.kalender + '" target="_blank" rel="noopener">Online-Kalender</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- Aufbau (erst beim ersten Oeffnen) -------------------------- */
  var pop = null;
  var letzterFokus = null;

  function bauen() {
    var style = document.createElement('style');
    style.setAttribute('data-tpop', '');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    var halter = document.createElement('div');
    halter.innerHTML = HTML;
    pop = halter.firstChild;
    document.body.appendChild(pop);

    pop.addEventListener('click', function (e) {
      if (e.target === pop) { schliessen(); return; }
      if (e.target.closest('[data-tpop-close]')) { e.preventDefault(); schliessen(); }
    });
  }

  function fokussierbare() {
    return pop.querySelectorAll('a[href], button:not([disabled])');
  }

  function beiTaste(e) {
    if (e.key === 'Escape') { e.preventDefault(); schliessen(); return; }
    if (e.key !== 'Tab') return;
    var el = fokussierbare();
    if (!el.length) return;
    var erste = el[0], letzte = el[el.length - 1];
    if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
    else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
  }

  function oeffnen() {
    if (!pop) bauen();
    letzterFokus = document.activeElement;
    pop.hidden = false;
    /* Reflow erzwingen, damit die Einblend-Animation greift */
    void pop.offsetWidth;
    pop.classList.add('is-open');
    document.body.classList.add('tpop-open');
    var erste = fokussierbare()[1] || fokussierbare()[0];
    if (erste) erste.focus();
    document.addEventListener('keydown', beiTaste, true);
  }

  function schliessen() {
    pop.classList.remove('is-open');
    document.body.classList.remove('tpop-open');
    document.removeEventListener('keydown', beiTaste, true);
    window.setTimeout(function () { pop.hidden = true; }, 400);
    if (letzterFokus && letzterFokus.focus) letzterFokus.focus();
  }

  /* ---------- Ausloeser --------------------------------------------------
     Ein einziger Zuhoerer am Dokument: so greift er auch fuer Knoepfe, die
     erst spaeter in die Seite kommen.                                     */
  document.addEventListener('click', function (e) {
    var ausloeser = e.target.closest ? e.target.closest('[data-termin-anfrage]') : null;
    if (!ausloeser) return;
    /* Wer den Link bewusst in einem neuen Tab oeffnet, bekommt den
       mailto-Link — dort mischen wir uns nicht ein. */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    oeffnen();
  });

  /* Fuer andere Skripte erreichbar, etwa aus einem eigenen onclick heraus */
  window.terminAnfrageOeffnen = oeffnen;
})();
