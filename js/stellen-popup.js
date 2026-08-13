/* ==========================================================================
   Stellen-Popup — Eingangs-Banner "Facharzt / Fachärztin (m/w/d)"
   --------------------------------------------------------------------------
   Selbstgenügsames Modul: bringt sein eigenes CSS und Markup mit, damit es
   mit einer einzigen Script-Zeile auf jeder Seite eingebunden werden kann:

       <script src="js/stellen-popup.js" defer></script>

   Verhalten
   - erscheint direkt beim Aufruf der Seite und legt sich vor den Inhalt;
     der Hintergrund ist bis zum Schliessen nicht bedienbar
   - auf der Startseite wartet es, bis der Ladebildschirm durchgelaufen ist
   - pro Besuch (Browser-Sitzung) nur einmal — wer im Menue weiterklickt,
     bekommt es nicht erneut. Siehe CONFIG.frequenz.
   - schliessbar per X, "Weiter zur Website", Escape oder Klick daneben;
     Tastaturfokus bleibt bis dahin im Dialog gefangen
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    /* 'sitzung'  = einmal pro Besuch (empfohlen)
       'tag'      = einmal pro Kalendertag
       'immer'    = bei jedem Seitenaufruf (sehr aufdringlich)          */
    frequenz: 'sitzung',
    speicherSchluessel: 'hm_stellen_popup_2026_facharzt',
    ziel: 'stellenangebote.html',
    /* Verzoegerung nach dem Laden in Millisekunden */
    verzoegerung: 450
  };

  /* ---------- schon gesehen? ------------------------------------------- */
  function bereitsGesehen() {
    if (CONFIG.frequenz === 'immer') return false;
    try {
      if (CONFIG.frequenz === 'tag') {
        var tag = localStorage.getItem(CONFIG.speicherSchluessel);
        return tag === new Date().toISOString().slice(0, 10);
      }
      return sessionStorage.getItem(CONFIG.speicherSchluessel) === '1';
    } catch (e) {
      return false; /* Speicher gesperrt (Privatmodus) — dann eben anzeigen */
    }
  }

  function alsGesehenMerken() {
    try {
      if (CONFIG.frequenz === 'tag') {
        localStorage.setItem(CONFIG.speicherSchluessel, new Date().toISOString().slice(0, 10));
      } else if (CONFIG.frequenz === 'sitzung') {
        sessionStorage.setItem(CONFIG.speicherSchluessel, '1');
      }
    } catch (e) { /* egal */ }
  }

  if (bereitsGesehen()) return;

  /* Auf der Stellenseite selbst waere das Popup sinnlos */
  var pfad = location.pathname.split('/').pop();
  if (pfad === CONFIG.ziel) return;

  /* ---------- Styles ---------------------------------------------------- */
  var CSS = [
    '.jobpop{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;',
    'padding:24px 20px;background:rgba(28,21,12,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.16,1,.3,1),visibility .45s;}',
    '.jobpop.is-open{opacity:1;visibility:visible;}',

    '.jobpop__card{position:relative;width:100%;max-width:520px;max-height:calc(100vh - 48px);overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#FDF9F2;border-radius:26px;',
    'box-shadow:0 30px 80px rgba(20,15,8,.34);transform:translateY(22px) scale(.975);',
    'transition:transform .55s cubic-bezier(.16,1,.3,1);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'color:#3B3222;line-height:1.65;text-align:left;}',
    '.jobpop.is-open .jobpop__card{transform:none;}',

    /* Farbband oben — Markenverlauf */
    '.jobpop__band{height:6px;background:linear-gradient(90deg,#8B6F47 0%,#B89773 45%,#C9A57E 100%);}',

    '.jobpop__close{position:absolute;top:16px;right:16px;width:38px;height:38px;border:1px solid #E6DCC7;',
    'border-radius:50%;background:rgba(255,255,255,.9);color:#544833;font-size:22px;line-height:1;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,border-color .2s;}',
    '.jobpop__close:hover{background:#8B6F47;border-color:#8B6F47;color:#fff;}',

    '.jobpop__body{padding:30px 34px 32px;}',

    '.jobpop__pill{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;',
    'background:#F6EFE3;color:#8B6F47;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}',
    '.jobpop__pill svg{width:13px;height:13px;flex:none;}',

    '.jobpop__title{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(25px,4.4vw,32px);',
    'line-height:1.14;color:#251E13;margin:16px 0 0;}',
    '.jobpop__title em{font-style:italic;color:#8B6F47;}',

    '.jobpop__meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}',
    '.jobpop__meta span{background:#fff;border:1px solid #E6DCC7;border-radius:999px;padding:6px 13px;',
    'font-size:12.5px;color:#544833;}',

    '.jobpop__text{font-size:15.5px;color:#544833;margin-top:16px;}',

    '.jobpop__list{list-style:none;margin:16px 0 0;padding:0;}',
    '.jobpop__list li{position:relative;padding-left:26px;font-size:15px;color:#544833;margin-bottom:8px;}',
    '.jobpop__list li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:8px;',
    'border-left:2px solid #8B6F47;border-bottom:2px solid #8B6F47;transform:rotate(-45deg);}',

    '.jobpop__actions{display:flex;flex-direction:column;gap:12px;margin-top:26px;}',
    '.jobpop__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 26px;',
    'border-radius:999px;font-size:15.5px;font-weight:500;text-decoration:none;cursor:pointer;border:none;',
    'background:linear-gradient(135deg,#B89773 0%,#D4B896 60%,#A8835F 100%);color:#fff;',
    'box-shadow:0 8px 26px rgba(139,111,71,.28);transition:transform .2s,box-shadow .2s;}',
    '.jobpop__btn:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(139,111,71,.34);}',
    '.jobpop__skip{background:none;border:none;font-family:inherit;font-size:14.5px;color:#7B6D55;',
    'text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:4px;}',
    '.jobpop__skip:hover{color:#8B6F47;}',

    '.jobpop__note{margin-top:20px;padding-top:16px;border-top:1px solid #E6DCC7;font-size:13px;color:#7B6D55;}',
    '.jobpop__note a{color:#8B6F47;}',

    '@media (max-width:560px){.jobpop{padding:0;align-items:flex-end;}',
    '.jobpop__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.jobpop__body{padding:26px 22px 28px;}}',

    '@media (prefers-reduced-motion:reduce){.jobpop,.jobpop__card{transition:none;}',
    '.jobpop__card{transform:none;}.jobpop__btn:hover{transform:none;}}',

    'body.jobpop-open{overflow:hidden;}'
  ].join('');

  /* ---------- Markup ---------------------------------------------------- */
  var HTML =
    '<div class="jobpop" id="jobPop" role="dialog" aria-modal="true" aria-labelledby="jobPopTitle" hidden>' +
      '<div class="jobpop__card" role="document">' +
        '<div class="jobpop__band"></div>' +
        '<button type="button" class="jobpop__close" data-jobpop-close aria-label="Hinweis schließen">&times;</button>' +
        '<div class="jobpop__body">' +
          '<span class="jobpop__pill">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' +
            'Wir stellen ein' +
          '</span>' +
          '<h2 class="jobpop__title" id="jobPopTitle">Facharzt / Fachärztin<br><em>für Dermatologie (m/w/d)</em></h2>' +
          '<div class="jobpop__meta">' +
            '<span>Chemnitz</span><span>Voll- oder Teilzeit</span><span>zum nächstmöglichen Zeitpunkt</span>' +
          '</div>' +
          '<p class="jobpop__text">Unser familiengeführtes Dermatologisches Laserzentrum wächst. Wir suchen eine Kollegin oder einen Kollegen, die oder der Hautmedizin mit Zeit für den Menschen verbinden möchte.</p>' +
          '<ul class="jobpop__list">' +
            '<li>Geregelte Arbeitszeiten, kein Nacht- und Wochenenddienst</li>' +
            '<li>Breites Spektrum: Dermatologie, Lasermedizin und Ästhetik</li>' +
            '<li>Eingespieltes Team und moderne Premium-Lasertechnik</li>' +
          '</ul>' +
          '<div class="jobpop__actions">' +
            '<a class="jobpop__btn" href="' + CONFIG.ziel + '" data-jobpop-go>Stellenangebot ansehen</a>' +
            '<button type="button" class="jobpop__skip" data-jobpop-close>Weiter zur Website</button>' +
          '</div>' +
          '<p class="jobpop__note">Sie kennen jemanden, zu dem die Stelle passt? Wir freuen uns, wenn Sie die Anzeige weitergeben. Fragen vorab: <a href="tel:+493714029824">0371&nbsp;402&nbsp;98&nbsp;24</a></p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- Aufbau ---------------------------------------------------- */
  function aufbauen() {
    var style = document.createElement('style');
    style.setAttribute('data-jobpop', '');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    var halter = document.createElement('div');
    halter.innerHTML = HTML;
    var pop = halter.firstChild;
    document.body.appendChild(pop);

    var letzterFokus = null;

    function fokussierbare() {
      return pop.querySelectorAll('a[href], button:not([disabled])');
    }

    function oeffnen() {
      letzterFokus = document.activeElement;
      pop.hidden = false;
      /* Reflow erzwingen, damit die Einblend-Animation greift */
      void pop.offsetWidth;
      pop.classList.add('is-open');
      document.body.classList.add('jobpop-open');
      var erste = fokussierbare()[1] || fokussierbare()[0];
      if (erste) erste.focus();
      document.addEventListener('keydown', beiTaste, true);
      alsGesehenMerken();
    }

    function schliessen() {
      pop.classList.remove('is-open');
      document.body.classList.remove('jobpop-open');
      document.removeEventListener('keydown', beiTaste, true);
      window.setTimeout(function () { pop.hidden = true; }, 450);
      if (letzterFokus && letzterFokus.focus) letzterFokus.focus();
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

    pop.addEventListener('click', function (e) {
      if (e.target === pop) { schliessen(); return; }
      if (e.target.closest('[data-jobpop-close]')) { e.preventDefault(); schliessen(); }
    });

    /* Startseite: erst nach dem Ladebildschirm zeigen */
    var loader = document.getElementById('loadingScreen');
    var wartezeit = CONFIG.verzoegerung + (loader ? 2200 : 0);
    window.setTimeout(oeffnen, wartezeit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aufbauen);
  } else {
    aufbauen();
  }
})();
