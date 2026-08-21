/* ==========================================================================
   MFA-Popup — Eingangs-Banner "Wir suchen MFA!"
   --------------------------------------------------------------------------
   Selbstgenügsames Modul: bringt sein eigenes CSS und Markup mit, damit es
   mit einer einzigen Script-Zeile auf jeder Seite eingebunden werden kann:

       <script src="js/mfa-popup.js" defer></script>

   Verhalten
   - erscheint direkt beim Aufruf der Seite und legt sich vor den Inhalt;
     der Hintergrund ist bis zum Schliessen nicht bedienbar
   - auf der Startseite wartet es, bis der Ladebildschirm durchgelaufen ist
   - pro Besuch (Browser-Sitzung) nur einmal — wer im Menue weiterklickt,
     bekommt es nicht erneut. Siehe CONFIG.frequenz.
   - schliessbar per X, "Weiter zur Website", Escape oder Klick daneben;
     Tastaturfokus bleibt bis dahin im Dialog gefangen

   Bewusst enthaelt dieses Banner KEINE E-Mail-Adresse. Der Knopf fuehrt auf
   die Seite "Stellenangebote", dort stehen die Kontaktwege. Grund: das
   frueher hier eingebundene Banner nannte die aerztliche Kontaktadresse,
   woraufhin Patientinnen und Patienten sie fuer Terminanfragen genutzt
   haben. Diese Adresse gehoert deshalb nicht in ein allgemeines Popup.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    /* 'sitzung'  = einmal pro Besuch (empfohlen)
       'tag'      = einmal pro Kalendertag
       'immer'    = bei jedem Seitenaufruf (sehr aufdringlich)          */
    frequenz: 'sitzung',
    speicherSchluessel: 'hm_mfa_popup_2026',
    /* Seite, auf der die Anzeige steht — dort erscheint das Banner nicht */
    zielSeite: 'stellenangebote.html',
    ziel: 'stellenangebote.html#mfa',
    /* Eigenes Foto statt der eingebauten Illustration: einfach den Pfad
       eintragen, z. B. 'team-mfa.webp'. Leer lassen = Illustration.      */
    bild: '',
    bildAlt: 'Zwei medizinische Fachangestellte in unserer Praxis',
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
  if (pfad === CONFIG.zielSeite) return;

  /* ---------- Styles ---------------------------------------------------- */
  var CSS = [
    '.mfapop{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;',
    'padding:24px 20px;background:rgba(28,21,12,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.16,1,.3,1),visibility .45s;}',
    '.mfapop.is-open{opacity:1;visibility:visible;}',

    '.mfapop__card{position:relative;width:100%;max-width:520px;max-height:calc(100vh - 48px);overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#FDF9F2;border-radius:26px;',
    'box-shadow:0 30px 80px rgba(20,15,8,.34);transform:translateY(22px) scale(.975);',
    'transition:transform .55s cubic-bezier(.16,1,.3,1);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'color:#3B3222;line-height:1.65;text-align:left;}',
    '.mfapop.is-open .mfapop__card{transform:none;}',

    /* Bildkopf */
    '.mfapop__figure{position:relative;margin:0;background:#F6EFE3;}',
    '.mfapop__figure img,.mfapop__figure svg{display:block;width:100%;height:auto;}',
    '.mfapop__figure img{aspect-ratio:600/320;object-fit:cover;object-position:50% 30%;}',
    /* Farbband unter dem Bild — Markenverlauf */
    '.mfapop__band{height:6px;background:linear-gradient(90deg,#8B6F47 0%,#B89773 45%,#C9A57E 100%);}',

    '.mfapop__close{position:absolute;top:16px;right:16px;width:38px;height:38px;border:1px solid #E6DCC7;',
    'border-radius:50%;background:rgba(255,255,255,.92);color:#544833;font-size:22px;line-height:1;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,border-color .2s;}',
    '.mfapop__close:hover{background:#8B6F47;border-color:#8B6F47;color:#fff;}',

    '.mfapop__body{padding:28px 34px 32px;}',

    '.mfapop__pill{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;',
    'background:#F6EFE3;color:#8B6F47;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}',
    '.mfapop__pill svg{width:13px;height:13px;flex:none;}',

    '.mfapop__title{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(29px,5.2vw,37px);',
    'line-height:1.1;letter-spacing:-.01em;color:#251E13;margin:13px 0 0;}',
    '.mfapop__title em{font-style:italic;color:#8B6F47;}',

    '.mfapop__text{font-size:15.5px;color:#544833;margin-top:12px;}',

    '.mfapop__meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;}',
    '.mfapop__meta span{background:#fff;border:1px solid #E6DCC7;border-radius:999px;padding:6px 13px;',
    'font-size:12.5px;color:#544833;}',

    '.mfapop__actions{display:flex;flex-direction:column;gap:12px;margin-top:24px;}',
    '.mfapop__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 26px;',
    'border-radius:999px;font-size:15.5px;font-weight:500;text-decoration:none;cursor:pointer;border:none;',
    'background:linear-gradient(135deg,#B89773 0%,#D4B896 60%,#A8835F 100%);color:#fff;',
    'box-shadow:0 8px 26px rgba(139,111,71,.28);transition:transform .2s,box-shadow .2s;}',
    '.mfapop__btn:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(139,111,71,.34);}',
    '.mfapop__btn svg{width:17px;height:17px;flex:none;}',
    '.mfapop__skip{background:none;border:none;font-family:inherit;font-size:14.5px;color:#7B6D55;',
    'text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:4px;}',
    '.mfapop__skip:hover{color:#8B6F47;}',

    '.mfapop__note{margin-top:18px;padding-top:15px;border-top:1px solid #E6DCC7;font-size:13px;color:#7B6D55;}',

    '@media (max-width:560px){.mfapop{padding:0;align-items:flex-end;}',
    '.mfapop__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.mfapop__figure{border-radius:22px 22px 0 0;overflow:hidden;}',
    '.mfapop__figure svg,.mfapop__figure img{height:190px;}',
    '.mfapop__body{padding:22px 22px 26px;}}',
    '@media (max-width:560px) and (min-height:780px){.mfapop__figure svg,',
    '.mfapop__figure img{height:230px;}}',
    /* sehr flache Schirme: Bild weiter kuerzen, damit der Knopf im Blick bleibt */
    '@media (max-height:700px){.mfapop__figure svg,.mfapop__figure img{height:140px;}',
    '.mfapop__body{padding:20px 22px 24px;}.mfapop__text{font-size:15px;}}',

    '@media (prefers-reduced-motion:reduce){.mfapop,.mfapop__card{transition:none;}',
    '.mfapop__card{transform:none;}.mfapop__btn:hover{transform:none;}}',

    'body.mfapop-open{overflow:hidden;}'
  ].join('');

  /* ---------- Bildkopf --------------------------------------------------
     Ohne eigenes Foto zeichnet das Modul eine ruhige Illustration: eine
     Kollegin und ein Kollege in Praxiskleidung, in den Farben der Website.
     Bewusst ohne ausgearbeitete Gesichter — so entsteht nicht der Eindruck,
     es handle sich um bestimmte Personen aus dem Team.                    */
  var ILLUSTRATION =
    '<svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustration: eine medizinische Fachangestellte und ein medizinischer Fachangestellter in der Praxis" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="mfapopBg" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F9F3E9"/><stop offset="1" stop-color="#E7D8C1"/>' +
        '</linearGradient>' +
        '<linearGradient id="mfapopKittel" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1EBDD"/>' +
        '</linearGradient>' +
        '<linearGradient id="mfapopKittelB" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F6F0E3"/><stop offset="1" stop-color="#E4DAC5"/>' +
        '</linearGradient>' +
      '</defs>' +

      /* Raum: Wand, Bogen, Boden */
      '<rect width="600" height="320" fill="url(#mfapopBg)"/>' +
      '<path d="M170 320V172a130 130 0 0 1 260 0v148z" fill="#FFFFFF" opacity=".5"/>' +
      '<path d="M170 320V172a130 130 0 0 1 260 0v148z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>' +
      '<path d="M0 268h600v52H0z" fill="#8B6F47" opacity=".08"/>' +
      '<path d="M0 268h600" stroke="#8B6F47" stroke-width="2" opacity=".16"/>' +

      '<g transform="translate(300 320) scale(1.1) translate(-300 -320)">' +

      /* Kollege — hinten rechts */
      '<g>' +
        '<path d="M306 320c0-66 30-100 90-100s90 34 90 100z" fill="url(#mfapopKittelB)"/>' +
        '<path d="M306 320c0-66 30-100 90-100s90 34 90 100z" fill="none" stroke="#C6B79A" stroke-width="2.5"/>' +
        '<path d="M342 240c14-12 32-19 54-19s40 7 54 19" fill="none" stroke="#D5C8AC" stroke-width="2"/>' +
        '<rect x="382" y="186" width="28" height="42" rx="13" fill="#DCB994"/>' +
        '<circle cx="396" cy="160" r="38" fill="#E7C7A4"/>' +
        '<path d="M358 156a38 38 0 0 1 76 0c0-17-14-26-38-26s-38 9-38 26z" fill="#2F2620"/>' +
        '<circle cx="385" cy="162" r="3" fill="#2F2620"/><circle cx="407" cy="162" r="3" fill="#2F2620"/>' +
        '<path d="M388 175q8 6 16 0" fill="none" stroke="#2F2620" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M377 224l19 24 19-24 9 5-28 36-28-36z" fill="#DBD1B9"/>' +
        /* Stethoskop */
        '<path d="M378 228c-5 28 6 50 18 50s23-22 18-50" fill="none" stroke="#8B6F47" stroke-width="4.5" stroke-linecap="round"/>' +
        '<circle cx="414" cy="280" r="7.5" fill="#8B6F47"/>' +
      '</g>' +

      /* Kollegin — vorn links */
      '<g>' +
        '<path d="M128 320c0-70 32-106 100-106s100 36 100 106z" fill="url(#mfapopKittel)"/>' +
        '<path d="M128 320c0-70 32-106 100-106s100 36 100 106z" fill="none" stroke="#C6B79A" stroke-width="2.5"/>' +
        '<path d="M166 236c16-13 37-20 62-20s46 7 62 20" fill="none" stroke="#DFD3B8" stroke-width="2"/>' +
        '<rect x="213" y="178" width="30" height="44" rx="14" fill="#DCB994"/>' +
        /* Haare: ruhiger Bob, hinter dem Gesicht liegend */
        '<path d="M178 190c0-16-2-34-2-50 0-30 22-52 52-52s52 22 52 52c0 16-2 34-2 50 0 9-14 9-14 0 0-15 1-31 1-43 0-23-15-36-37-36s-37 13-37 36c0 12 1 28 1 43 0 9-14 9-14 0z" fill="#4A3A2A"/>' +
        '<circle cx="228" cy="150" r="40" fill="#EFD3B6"/>' +
        /* Ansatz ueber der Stirn — etwas breiter als der Kopf, damit kein Spalt entsteht */
        '<path d="M184 152c0-34 19-52 44-52s44 18 44 52c-4-23-19-35-44-35s-40 12-44 35z" fill="#4A3A2A"/>' +
        '<circle cx="216" cy="152" r="3.2" fill="#3B2E22"/><circle cx="240" cy="152" r="3.2" fill="#3B2E22"/>' +
        '<path d="M220 166q8 7 16 0" fill="none" stroke="#3B2E22" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M208 219l20 26 20-26 10 6-30 39-30-39z" fill="#E7DFCB"/>' +
        /* Namensschild mit Kreuz */
        '<rect x="250" y="258" width="44" height="28" rx="6" fill="#FFFFFF" stroke="#C6B79A" stroke-width="2.5"/>' +
        '<path d="M259 267h5v-5h6v5h5v6h-5v5h-6v-5h-5z" fill="#B89773"/>' +
        '<path d="M278 268h9M278 276h9" stroke="#D5C8AC" stroke-width="2.5" stroke-linecap="round"/>' +
      '</g>' +

      '</g>' +
    '</svg>';

  function bildkopf() {
    if (CONFIG.bild) {
      return '<img src="' + CONFIG.bild + '" alt="' + CONFIG.bildAlt + '" loading="lazy" decoding="async">';
    }
    return ILLUSTRATION;
  }

  /* ---------- Markup ---------------------------------------------------- */
  var HTML =
    '<div class="mfapop" id="mfaPop" role="dialog" aria-modal="true" aria-labelledby="mfaPopTitle" hidden>' +
      '<div class="mfapop__card" role="document">' +
        '<figure class="mfapop__figure">' + bildkopf() + '</figure>' +
        '<div class="mfapop__band"></div>' +
        '<button type="button" class="mfapop__close" data-mfapop-close aria-label="Hinweis schließen">&times;</button>' +
        '<div class="mfapop__body">' +
          '<span class="mfapop__pill">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' +
            'Wir stellen ein' +
          '</span>' +
          '<h2 class="mfapop__title" id="mfaPopTitle">Wir suchen <em>MFA!</em></h2>' +
          '<p class="mfapop__text">Medizinische Fachangestellte (m/w/d) für unser Team im Dermatologischen Laserzentrum Häusler-Mehlhorn in Chemnitz – ob mit langer Berufserfahrung oder frisch aus der Ausbildung.</p>' +
          '<div class="mfapop__meta">' +
            '<span>Chemnitz</span><span>Voll- oder Teilzeit</span><span>Kollegiales Team</span>' +
          '</div>' +
          '<div class="mfapop__actions">' +
            '<a class="mfapop__btn" href="' + CONFIG.ziel + '" data-mfapop-go>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
              'Schreibt uns einfach' +
            '</a>' +
            '<button type="button" class="mfapop__skip" data-mfapop-close>Weiter zur Website</button>' +
          '</div>' +
          '<p class="mfapop__note">Alle Angaben zur Stelle stehen unter „Stellenangebote“. Sie kennen jemanden, zu dem sie passt? Geben Sie die Anzeige gern weiter.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- Aufbau ---------------------------------------------------- */
  function aufbauen() {
    var style = document.createElement('style');
    style.setAttribute('data-mfapop', '');
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
      document.body.classList.add('mfapop-open');
      var erste = fokussierbare()[1] || fokussierbare()[0];
      if (erste) erste.focus();
      document.addEventListener('keydown', beiTaste, true);
      alsGesehenMerken();
    }

    function schliessen() {
      pop.classList.remove('is-open');
      document.body.classList.remove('mfapop-open');
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
      if (e.target.closest('[data-mfapop-close]')) { e.preventDefault(); schliessen(); }
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
