/* ==========================================================================
   Stellen-Popup — Eingangs-Banner "Facharzt / Fachärztin (m/w/d)"
   --------------------------------------------------------------------------
   Selbstgenügsames Modul: bringt sein eigenes CSS und Markup mit, damit es
   mit einer einzigen Script-Zeile auf jeder Seite eingebunden werden kann:

       <script src="js/stellen-popup.js" defer></script>
       <script src="js/mfa-popup.js" defer></script>

   Reihenfolge
   Dieses Popup ist das ERSTE beim Aufruf der Website. Das MFA-Popup
   (js/mfa-popup.js) wartet, bis es geschlossen wurde, und erscheint erst
   danach. Deshalb muss diese Datei VOR mfa-popup.js eingebunden sein.

   Verhalten
   - erscheint direkt beim Aufruf der Seite und legt sich vor den Inhalt;
     der Hintergrund ist bis zum Schliessen nicht bedienbar
   - auf der Startseite wartet es, bis der Ladebildschirm durchgelaufen ist
   - pro Besuch (Browser-Sitzung) nur einmal — wer im Menue weiterklickt,
     bekommt es nicht erneut. Siehe CONFIG.frequenz.
   - schliessbar per X, "Weiter zur Website", Escape oder Klick daneben;
     Tastaturfokus bleibt bis dahin im Dialog gefangen

   E-Mail-Adresse
   Die aerztliche Bewerbungsadresse steht NICHT sichtbar im Banner und auch
   nicht im Markup. Sie wird erst nach Klick auf "Direkt bewerben" per JS
   zusammengesetzt und eingeblendet — zusammen mit dem Hinweis, dass sie nur
   fuer Bewerbungen gedacht ist. Grund: frueher stand sie offen im Banner,
   und Patientinnen und Patienten haben sie fuer Terminanfragen genutzt.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    /* 'sitzung'  = einmal pro Besuch (empfohlen)
       'tag'      = einmal pro Kalendertag
       'immer'    = bei jedem Seitenaufruf (sehr aufdringlich)          */
    frequenz: 'sitzung',
    speicherSchluessel: 'hm_stellen_popup_2026_facharzt',
    /* Seite, auf der die Anzeige steht — dort erscheint das Banner nicht */
    zielSeite: 'stellenangebote.html',
    ziel: 'stellenangebote.html#facharzt',
    /* Bewerbungsadresse in Teilen (Spam-Schutz), Betreff fuer mailto */
    mailNutzer: 'arzt',
    mailDomain: 'hautarzt-chemnitz.de',
    betreff: 'Bewerbung als Fachärztin / Facharzt für Dermatologie',
    /* Verzoegerung nach dem Laden in Millisekunden */
    verzoegerung: 450
  };

  /* Ereignis fuer nachfolgende Popups (MFA) */
  var EVENT_ZU = 'hm:stellenpopup-zu';

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
  if (pfad === CONFIG.zielSeite) return;

  /* Ab hier steht fest: das Popup kommt. Das MFA-Popup richtet sich danach. */
  window.hmStellenPopup = { offen: true, event: EVENT_ZU };

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

    /* Kernargument direkt unter der Ueberschrift */
    '.jobpop__highlight{display:flex;align-items:center;gap:11px;margin-top:16px;padding:13px 17px;',
    'border-radius:15px;background:#F6EFE3;border:1px solid rgba(139,111,71,.28);',
    'font-size:15.5px;font-weight:500;color:#8B6F47;line-height:1.4;}',
    '.jobpop__highlight svg{width:19px;height:19px;flex:none;}',

    '.jobpop__text{font-size:15.5px;color:#544833;margin-top:16px;}',

    '.jobpop__list{list-style:none;margin:16px 0 0;padding:0;}',
    '.jobpop__list li{position:relative;padding-left:26px;font-size:15px;color:#544833;margin-bottom:8px;}',
    '.jobpop__list li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:8px;',
    'border-left:2px solid #8B6F47;border-bottom:2px solid #8B6F47;transform:rotate(-45deg);}',

    '.jobpop__actions{display:flex;flex-direction:column;gap:12px;margin-top:26px;}',
    '.jobpop__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 26px;',
    'border-radius:999px;font-family:inherit;font-size:15.5px;font-weight:500;text-decoration:none;cursor:pointer;border:none;',
    'background:linear-gradient(135deg,#B89773 0%,#D4B896 60%,#A8835F 100%);color:#fff;',
    'box-shadow:0 8px 26px rgba(139,111,71,.28);transition:transform .2s,box-shadow .2s;}',
    '.jobpop__btn:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(139,111,71,.34);}',
    '.jobpop__btn svg{width:17px;height:17px;flex:none;}',
    '.jobpop__btn--ghost{background:#fff;color:#8B6F47;border:1px solid #D9C9AC;box-shadow:none;}',
    '.jobpop__btn--ghost:hover{background:#F6EFE3;box-shadow:none;}',
    '.jobpop__skip{background:none;border:none;font-family:inherit;font-size:14.5px;color:#7B6D55;',
    'text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:4px;}',
    '.jobpop__skip:hover{color:#8B6F47;}',

    /* "Direkt bewerben" — Adresse erst nach Klick */
    '.jobpop__apply{margin:0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #E6DCC7;',
    'box-shadow:0 10px 30px rgba(139,111,71,.10);animation:jobpopIn .45s cubic-bezier(.16,1,.3,1);}',
    '.jobpop [hidden]{display:none !important;}',
    '.jobpop__apply:focus{outline:none;}',
    '.jobpop__apply-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8B6F47;margin:0;}',
    '.jobpop__apply-mail{display:block;margin-top:6px;font-family:Fraunces,Georgia,serif;font-size:clamp(19px,4.6vw,22px);',
    'line-height:1.25;color:#251E13;text-decoration:none;word-break:break-all;}',
    '.jobpop__apply-mail:hover{color:#8B6F47;text-decoration:underline;text-underline-offset:4px;}',
    '.jobpop__apply-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}',
    '.jobpop__apply-row .jobpop__btn{flex:1 1 180px;padding:13px 20px;font-size:15px;}',
    '.jobpop__apply-hint{margin:14px 0 0;font-size:12.5px;line-height:1.55;color:#7B6D55;}',
    '@keyframes jobpopIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',

    '.jobpop__note{margin-top:20px;padding-top:16px;border-top:1px solid #E6DCC7;font-size:13px;color:#7B6D55;}',

    '@media (max-width:560px){.jobpop{padding:0;align-items:flex-end;}',
    '.jobpop__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.jobpop__body{padding:26px 22px 28px;}}',

    '@media (prefers-reduced-motion:reduce){.jobpop,.jobpop__card{transition:none;}',
    '.jobpop__card{transform:none;}.jobpop__btn:hover{transform:none;}.jobpop__apply{animation:none;}}',

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
          '<p class="jobpop__highlight">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' +
            'Sehr attraktive umsatzabhängige Boni' +
          '</p>' +
          '<div class="jobpop__meta">' +
            '<span>Chemnitz</span><span>Voll- oder Teilzeit</span><span>3 – 6 Tage / Woche</span>' +
          '</div>' +
          '<p class="jobpop__text">Wir suchen zur Verstärkung unserer Praxis mit sechs ärztlichen Kolleginnen und Kollegen eine Fachärztin oder einen Facharzt – in jedem Stadium des Facharztstatus, ob Einsteiger oder Pro.</p>' +
          '<ul class="jobpop__list">' +
            '<li>Das gesamte Spektrum der modernen Dermatologie</li>' +
            '<li>Kollegiales Team aus sechs Kolleginnen und Kollegen (FÄ und ÄiW)</li>' +
            '<li>Freie Wahl: 3 bis 6 Tage pro Woche</li>' +
          '</ul>' +
          '<div class="jobpop__actions">' +
            '<button type="button" class="jobpop__btn" data-jobpop-apply aria-expanded="false" aria-controls="jobPopApply">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>' +
              'Direkt bewerben' +
            '</button>' +
            /* wird erst beim Klick auf "Direkt bewerben" befuellt */
            '<div class="jobpop__apply" id="jobPopApply" hidden></div>' +
            '<a class="jobpop__btn jobpop__btn--ghost" href="' + CONFIG.ziel + '">Stellenangebot ansehen</a>' +
            '<button type="button" class="jobpop__skip" data-jobpop-close>Weiter zur Website</button>' +
          '</div>' +
          '<p class="jobpop__note">Sie kennen jemanden, zu dem die Stelle passt? Wir freuen uns, wenn Sie die Anzeige weitergeben.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- Bewerbungsfeld ------------------------------------------- */
  function bewerbungEinblenden(pop, knopf) {
    var feld = pop.querySelector('#jobPopApply');
    if (!feld.hidden) return;

    var adresse = CONFIG.mailNutzer + '@' + CONFIG.mailDomain;
    var mailto = 'mailto:' + adresse + '?subject=' + encodeURIComponent(CONFIG.betreff);

    feld.innerHTML =
      '<p class="jobpop__apply-label">Ihre Bewerbung bitte an</p>' +
      '<a class="jobpop__apply-mail" href="' + mailto + '">' + adresse + '</a>' +
      '<div class="jobpop__apply-row">' +
        '<a class="jobpop__btn" href="' + mailto + '">E-Mail schreiben</a>' +
        '<button type="button" class="jobpop__btn jobpop__btn--ghost" data-jobpop-copy>Adresse kopieren</button>' +
      '</div>' +
      '<p class="jobpop__apply-hint">Diese Adresse ist ausschließlich für Bewerbungen. Terminwünsche erreichen uns bitte über „Termin anfragen“.</p>';

    feld.hidden = false;
    knopf.hidden = true;
    knopf.setAttribute('aria-expanded', 'true');

    var kopieren = feld.querySelector('[data-jobpop-copy]');
    kopieren.addEventListener('click', function () {
      function fertig() {
        kopieren.textContent = 'Kopiert ✓';
        window.setTimeout(function () { kopieren.textContent = 'Adresse kopieren'; }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(adresse).then(fertig, function () {});
      }
    });

    /* Fokus auf das Feld selbst (nicht auf den Link) — Screenreader lesen
       die Adresse vor, ohne dass ein Fokusrahmen um die Adresse erscheint */
    feld.setAttribute('tabindex', '-1');
    feld.focus({ preventScroll: true });
    if (feld.scrollIntoView) feld.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

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
      return pop.querySelectorAll('a[href], button:not([disabled]):not([hidden])');
    }

    function oeffnen() {
      letzterFokus = document.activeElement;
      pop.hidden = false;
      /* Reflow erzwingen, damit die Einblend-Animation greift */
      void pop.offsetWidth;
      pop.classList.add('is-open');
      document.body.classList.add('jobpop-open');
      var erste = pop.querySelector('[data-jobpop-apply]');
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
      window.hmStellenPopup.offen = false;
      try { document.dispatchEvent(new CustomEvent(EVENT_ZU)); } catch (e) { /* sehr alte Browser */ }
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
      if (e.target.closest('[data-jobpop-close]')) { e.preventDefault(); schliessen(); return; }
      var bewerben = e.target.closest('[data-jobpop-apply]');
      if (bewerben) { e.preventDefault(); bewerbungEinblenden(pop, bewerben); }
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
