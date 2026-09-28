/* ==========================================================================
   Stellen-Popup — Eingangs-Banner "Wir stellen ein"
   --------------------------------------------------------------------------
   Beide offenen Stellen in EINEM Popup (Kundenwunsch 28.09.2026):
     1. Facharzt / Fachärztin für Dermatologie (m/w/d) — oben, Hauptstelle
     2. Medizinische Fachangestellte (MFA, m/w/d)     — darunter, kompakt

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

   E-Mail-Adresse
   Die aerztliche Bewerbungsadresse steht NICHT sichtbar im Banner und auch
   nicht im Markup. Sie wird erst nach Klick auf "Direkt bewerben" per JS
   zusammengesetzt und eingeblendet — zusammen mit dem Hinweis, dass sie nur
   fuer Bewerbungen gedacht ist. Grund: frueher stand sie offen im Banner,
   und Patientinnen und Patienten haben sie fuer Terminanfragen genutzt.
   Die MFA-Stelle nennt ebenfalls keine Adresse; der Knopf fuehrt auf die
   Seite "Stellenangebote".

   Bild der MFA-Stelle
   Selbst gezeichnete Vektor-Illustration (kein Foto, keine KI), siehe
   treatments/BILDNACHWEIS.md. Eigenes Foto statt Illustration: in CONFIG
   mfaBild eintragen, z. B. 'team-mfa.webp'.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    /* 'sitzung'  = einmal pro Besuch (empfohlen)
       'tag'      = einmal pro Kalendertag
       'immer'    = bei jedem Seitenaufruf (sehr aufdringlich)          */
    frequenz: 'sitzung',
    speicherSchluessel: 'hm_stellen_popup_2026_team',
    /* Seite, auf der die Anzeigen stehen — dort erscheint das Banner nicht */
    zielSeite: 'stellenangebote.html',
    zielFacharzt: 'stellenangebote.html#facharzt',
    zielMfa: 'stellenangebote.html#mfa',
    /* Bewerbungsadresse in Teilen (Spam-Schutz), Betreff fuer mailto */
    mailNutzer: 'arzt',
    mailDomain: 'hautarzt-chemnitz.de',
    betreff: 'Bewerbung als Fachärztin / Facharzt für Dermatologie',
    /* Foto statt Illustration bei der MFA-Stelle (leer = Illustration) */
    mfaBild: '',
    mfaBildAlt: 'Medizinische Fachangestellte in unserer Praxis',
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
    '.jobpop{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;',
    'padding:24px 20px;background:rgba(28,21,12,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.16,1,.3,1),visibility .45s;}',
    '.jobpop.is-open{opacity:1;visibility:visible;}',
    '.jobpop [hidden]{display:none !important;}',

    '.jobpop__card{position:relative;width:100%;max-width:560px;max-height:calc(100vh - 48px);overflow-y:auto;',
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

    '.jobpop__body{padding:30px 34px 30px;}',

    '.jobpop__pill{display:inline-flex;align-items:center;gap:7px;margin:0;padding:6px 14px;border-radius:999px;',
    'background:#F6EFE3;color:#8B6F47;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}',
    '.jobpop__pill svg{width:13px;height:13px;flex:none;}',

    /* --- Stelle 1: Facharzt ------------------------------------------- */
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

    '.jobpop__list{list-style:none;margin:14px 0 0;padding:0;}',
    '.jobpop__list li{position:relative;padding-left:26px;font-size:15px;color:#544833;margin-bottom:8px;}',
    '.jobpop__list li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:8px;',
    'border-left:2px solid #8B6F47;border-bottom:2px solid #8B6F47;transform:rotate(-45deg);}',

    '.jobpop__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;}',
    '.jobpop__actions > .jobpop__btn{flex:1 1 200px;}',
    '.jobpop__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;',
    'border-radius:999px;font-family:inherit;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;border:none;',
    'background:linear-gradient(135deg,#B89773 0%,#D4B896 60%,#A8835F 100%);color:#fff;',
    'box-shadow:0 8px 26px rgba(139,111,71,.28);transition:transform .2s,box-shadow .2s,background .2s;}',
    '.jobpop__btn:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(139,111,71,.34);}',
    '.jobpop__btn svg{width:17px;height:17px;flex:none;}',
    '.jobpop__btn--ghost{background:#fff;color:#8B6F47;border:1px solid #D9C9AC;box-shadow:none;}',
    '.jobpop__btn--ghost:hover{background:#F6EFE3;box-shadow:none;}',

    /* "Direkt bewerben" — Adresse erst nach Klick */
    '.jobpop__apply{order:-1;flex:1 1 100%;margin:0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #E6DCC7;',
    'box-shadow:0 10px 30px rgba(139,111,71,.10);animation:jobpopIn .45s cubic-bezier(.16,1,.3,1);}',
    '.jobpop__apply:focus{outline:none;}',
    '.jobpop__apply-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8B6F47;margin:0;}',
    '.jobpop__apply-mail{display:block;margin-top:6px;font-family:Fraunces,Georgia,serif;font-size:clamp(19px,4.6vw,22px);',
    'line-height:1.25;color:#251E13;text-decoration:none;word-break:break-all;}',
    '.jobpop__apply-mail:hover{color:#8B6F47;text-decoration:underline;text-underline-offset:4px;}',
    '.jobpop__apply-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}',
    '.jobpop__apply-row .jobpop__btn{flex:1 1 170px;padding:12px 18px;}',
    '.jobpop__apply-hint{margin:14px 0 0;font-size:12.5px;line-height:1.55;color:#7B6D55;}',
    '@keyframes jobpopIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',

    /* --- Stelle 2: MFA — kompakte Karte ------------------------------- */
    '.jobpop__also{display:flex;align-items:center;gap:14px;margin:28px 0 14px;font-size:11px;font-weight:700;',
    'letter-spacing:.16em;text-transform:uppercase;color:#8B6F47;}',
    '.jobpop__also::before,.jobpop__also::after{content:"";flex:1;height:1px;background:#E6DCC7;}',

    '.jobpop__mfa{display:flex;gap:18px;align-items:center;padding:16px;border-radius:20px;',
    'background:#F6EFE3;border:1px solid rgba(139,111,71,.18);}',
    '.jobpop__mfa-art{flex:none;width:112px;height:112px;border-radius:14px;overflow:hidden;background:#EFE4D2;}',
    '.jobpop__mfa-art svg,.jobpop__mfa-art img{display:block;width:100%;height:100%;object-fit:cover;}',
    '.jobpop__mfa-body{min-width:0;}',
    '.jobpop__subtitle{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:21px;line-height:1.2;color:#251E13;margin:0;}',
    '.jobpop__subtitle em{font-style:italic;color:#8B6F47;}',
    '.jobpop__mfa-text{font-size:14px;line-height:1.5;color:#544833;margin:6px 0 0;}',
    '.jobpop__mfa-link{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:14.5px;font-weight:600;',
    'color:#8B6F47;text-decoration:none;border-bottom:1px solid rgba(139,111,71,.35);padding-bottom:1px;',
    'transition:border-color .2s,gap .2s;}',
    '.jobpop__mfa-link:hover{border-color:#8B6F47;gap:9px;}',

    /* --- Schluss -------------------------------------------------------- */
    '.jobpop__skip{display:block;margin:22px auto 0;background:none;border:none;font-family:inherit;font-size:14.5px;',
    'color:#7B6D55;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:4px;}',
    '.jobpop__skip:hover{color:#8B6F47;}',
    '.jobpop__note{margin-top:18px;padding-top:15px;border-top:1px solid #E6DCC7;font-size:13px;color:#7B6D55;}',

    '@media (max-width:560px){.jobpop{padding:0;align-items:flex-end;}',
    '.jobpop__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.jobpop__body{padding:26px 22px 26px;}',
    '.jobpop__mfa{gap:14px;padding:14px;}',
    '.jobpop__mfa-art{width:84px;height:84px;border-radius:12px;}',
    '.jobpop__subtitle{font-size:19px;}}',

    '@media (prefers-reduced-motion:reduce){.jobpop,.jobpop__card{transition:none;}',
    '.jobpop__card{transform:none;}.jobpop__btn:hover{transform:none;}.jobpop__apply{animation:none;}}',

    'body.jobpop-open{overflow:hidden;}'
  ].join('');

  /* ---------- Illustration der MFA-Stelle -------------------------------
     Eine Kollegin und ein Kollege in Praxiskleidung, in den Farben der
     Website. Bewusst ohne ausgearbeitete Gesichter — so entsteht nicht der
     Eindruck, es handle sich um bestimmte Personen aus dem Team.        */
  var ILLUSTRATION =
    '<svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustration: eine medizinische Fachangestellte und ein medizinischer Fachangestellter in der Praxis" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="jobpopBg" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F9F3E9"/><stop offset="1" stop-color="#E7D8C1"/>' +
        '</linearGradient>' +
        '<linearGradient id="jobpopKittel" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1EBDD"/>' +
        '</linearGradient>' +
        '<linearGradient id="jobpopKittelB" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F6F0E3"/><stop offset="1" stop-color="#E4DAC5"/>' +
        '</linearGradient>' +
      '</defs>' +

      /* Raum: Wand, Bogen, Boden */
      '<rect width="600" height="320" fill="url(#jobpopBg)"/>' +
      '<path d="M170 320V172a130 130 0 0 1 260 0v148z" fill="#FFFFFF" opacity=".5"/>' +
      '<path d="M170 320V172a130 130 0 0 1 260 0v148z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>' +
      '<path d="M0 268h600v52H0z" fill="#8B6F47" opacity=".08"/>' +
      '<path d="M0 268h600" stroke="#8B6F47" stroke-width="2" opacity=".16"/>' +

      '<g transform="translate(300 320) scale(1.1) translate(-300 -320)">' +

      /* Kollege — hinten rechts */
      '<g>' +
        '<path d="M306 320c0-66 30-100 90-100s90 34 90 100z" fill="url(#jobpopKittelB)"/>' +
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
        '<path d="M128 320c0-70 32-106 100-106s100 36 100 106z" fill="url(#jobpopKittel)"/>' +
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

  function mfaBild() {
    if (CONFIG.mfaBild) {
      return '<img src="' + CONFIG.mfaBild + '" alt="' + CONFIG.mfaBildAlt + '" loading="lazy" decoding="async">';
    }
    return ILLUSTRATION;
  }

  /* ---------- Markup ---------------------------------------------------- */
  var HTML =
    '<div class="jobpop" id="jobPop" role="dialog" aria-modal="true" aria-labelledby="jobPopLabel jobPopTitle" hidden>' +
      '<div class="jobpop__card" role="document">' +
        '<div class="jobpop__band"></div>' +
        '<button type="button" class="jobpop__close" data-jobpop-close aria-label="Hinweis schließen">&times;</button>' +
        '<div class="jobpop__body">' +
          '<p class="jobpop__pill" id="jobPopLabel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>' +
            'Wir stellen ein' +
          '</p>' +

          /* Stelle 1: Facharzt / Fachaerztin */
          '<h2 class="jobpop__title" id="jobPopTitle">Facharzt / Fachärztin<br><em>für Dermatologie (m/w/d)</em></h2>' +
          '<p class="jobpop__highlight">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' +
            'Sehr attraktive umsatzabhängige Boni' +
          '</p>' +
          '<div class="jobpop__meta">' +
            '<span>Chemnitz</span><span>Voll- oder Teilzeit</span><span>3 – 6 Tage / Woche</span>' +
          '</div>' +
          '<p class="jobpop__text">Zur Verstärkung unserer Praxis – in jedem Stadium des Facharztstatus, ob Einsteiger oder Pro.</p>' +
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
            '<a class="jobpop__btn jobpop__btn--ghost" href="' + CONFIG.zielFacharzt + '">Stellenangebot ansehen</a>' +
            /* wird erst beim Klick auf "Direkt bewerben" befuellt */
            '<div class="jobpop__apply" id="jobPopApply" hidden></div>' +
          '</div>' +

          /* Stelle 2: MFA */
          '<p class="jobpop__also">Außerdem gesucht</p>' +
          '<div class="jobpop__mfa">' +
            '<div class="jobpop__mfa-art">' + mfaBild() + '</div>' +
            '<div class="jobpop__mfa-body">' +
              '<h3 class="jobpop__subtitle">Medizinische Fachangestellte <em>(MFA, m/w/d)</em></h3>' +
              '<p class="jobpop__mfa-text">Voll- oder Teilzeit – ob mit langer Berufserfahrung oder frisch aus der Ausbildung.</p>' +
              '<a class="jobpop__mfa-link" href="' + CONFIG.zielMfa + '">Schreibt uns einfach <span aria-hidden="true">→</span></a>' +
            '</div>' +
          '</div>' +

          '<button type="button" class="jobpop__skip" data-jobpop-close>Weiter zur Website</button>' +
          '<p class="jobpop__note">Sie kennen jemanden, zu dem eine der Stellen passt? Wir freuen uns, wenn Sie die Anzeige weitergeben.</p>' +
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
