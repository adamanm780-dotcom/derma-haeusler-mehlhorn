/* ==========================================================================
   Termin-Dialog — "Ästhetische Anfragen bitte per E-Mail oder WhatsApp"
   --------------------------------------------------------------------------
   Selbstgenügsames Modul: bringt sein eigenes CSS und Markup mit und wird
   mit einer einzigen Script-Zeile eingebunden:

       <script src="js/termin-dialog.js" defer></script>

   Wofuer
   Der Online-Kalender (DocVisit) ist der Hautkrebsvorsorge vorbehalten.
   Jeder andere Termin-Knopf traegt das Attribut data-termin-dialog und
   oeffnet dieses Fenster statt des Kalenders.

       <a href="#contact" data-termin-dialog class="btn btn--primary">Termin vereinbaren</a>

   Das href bleibt bewusst ein echtes Ziel: ohne JavaScript landet man beim
   Kontaktbereich der Startseite statt im Leeren.

   Schliessbar per X, Escape oder Klick daneben; der Tastaturfokus bleibt
   bis dahin im Dialog gefangen.
   ========================================================================== */
(function () {
  'use strict';

  /* E-Mail aus Teilen zusammengesetzt, damit sie nicht als fertige Adresse
     im Quelltext steht */
  var MAIL_USER = 'termin';
  var MAIL_HOST = 'hautarzt-chemnitz.de';
  var MAIL = MAIL_USER + '@' + MAIL_HOST;

  /* WhatsApp: internationale Schreibweise ohne + und ohne Leerzeichen */
  var WA_NUMMER = '4915112457406';
  var WA_ANZEIGE = '+49 151 12457406';
  var WA_TEXT = 'Hallo, ich möchte gern einen Termin anfragen.';

  var KALENDER = 'https://www.docvisit.de/kalender/hautarzt-chemnitz/list';

  /* ---------- Styles ---------------------------------------------------- */
  var CSS = [
    '.termdlg{position:fixed;inset:0;z-index:12500;display:flex;align-items:center;justify-content:center;',
    'padding:24px 20px;background:rgba(28,21,12,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'opacity:0;visibility:hidden;transition:opacity .35s cubic-bezier(.16,1,.3,1),visibility .35s;}',
    '.termdlg.is-open{opacity:1;visibility:visible;}',

    '.termdlg__card{position:relative;width:100%;max-width:480px;max-height:calc(100vh - 48px);overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#FDF9F2;border-radius:26px;',
    'box-shadow:0 30px 80px rgba(20,15,8,.34);transform:translateY(18px) scale(.98);',
    'transition:transform .45s cubic-bezier(.16,1,.3,1);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'color:#3B3222;line-height:1.65;text-align:left;}',
    '.termdlg.is-open .termdlg__card{transform:none;}',

    '.termdlg__band{height:6px;border-radius:26px 26px 0 0;',
    'background:linear-gradient(90deg,#8B6F47 0%,#B89773 45%,#C9A57E 100%);}',

    '.termdlg__close{position:absolute;top:16px;right:16px;width:38px;height:38px;border:1px solid #E6DCC7;',
    'border-radius:50%;background:rgba(255,255,255,.92);color:#544833;font-size:22px;line-height:1;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,border-color .2s;}',
    '.termdlg__close:hover{background:#8B6F47;border-color:#8B6F47;color:#fff;}',

    '.termdlg__body{padding:30px 34px 32px;}',

    '.termdlg__pill{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;',
    'background:#F6EFE3;color:#8B6F47;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}',
    '.termdlg__pill svg{width:13px;height:13px;flex:none;}',

    '.termdlg__title{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(24px,4.4vw,30px);',
    'line-height:1.16;letter-spacing:-.01em;color:#251E13;margin:14px 0 0;}',
    '.termdlg__title em{font-style:italic;color:#8B6F47;}',

    '.termdlg__text{font-size:15.5px;color:#544833;margin-top:13px;}',
    '.termdlg__text strong{color:#3B3222;}',

    '.termdlg__actions{display:flex;flex-direction:column;gap:12px;margin-top:24px;}',
    '.termdlg__btn{display:flex;align-items:center;gap:13px;padding:14px 20px;border-radius:18px;',
    'text-decoration:none;border:1px solid #E6DCC7;background:#fff;color:#3B3222;cursor:pointer;',
    'font-family:inherit;text-align:left;transition:border-color .2s,box-shadow .2s,transform .2s;}',
    '.termdlg__btn:hover{border-color:#B89773;box-shadow:0 8px 24px rgba(139,111,71,.16);transform:translateY(-1px);}',
    '.termdlg__ico{width:42px;height:42px;flex:none;border-radius:50%;display:flex;align-items:center;',
    'justify-content:center;background:#F6EFE3;color:#8B6F47;}',
    '.termdlg__ico svg{width:20px;height:20px;}',
    '.termdlg__btn--wa .termdlg__ico{background:#E6F4EA;color:#1E8E4E;}',
    '.termdlg__label{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;',
    'font-weight:700;color:#8B6F47;}',
    '.termdlg__value{display:block;font-size:15.5px;color:#3B3222;word-break:break-word;}',

    '.termdlg__note{margin-top:20px;padding-top:16px;border-top:1px solid #E6DCC7;font-size:13px;color:#7B6D55;}',
    '.termdlg__note a{color:#8B6F47;}',

    '@media (max-width:560px){.termdlg{padding:0;align-items:flex-end;}',
    '.termdlg__card{max-width:none;border-radius:22px 22px 0 0;max-height:92vh;}',
    '.termdlg__band{border-radius:22px 22px 0 0;}',
    '.termdlg__body{padding:26px 22px 28px;}}',

    '@media (prefers-reduced-motion:reduce){.termdlg,.termdlg__card{transition:none;}',
    '.termdlg__card{transform:none;}.termdlg__btn:hover{transform:none;}}',

    'body.termdlg-open{overflow:hidden;}'
  ].join('');

  /* ---------- Markup ---------------------------------------------------- */
  var HTML =
    '<div class="termdlg" id="terminDialog" role="dialog" aria-modal="true" aria-labelledby="terminDialogTitel" hidden>' +
      '<div class="termdlg__card" role="document">' +
        '<div class="termdlg__band"></div>' +
        '<button type="button" class="termdlg__close" data-termdlg-close aria-label="Fenster schließen">&times;</button>' +
        '<div class="termdlg__body">' +
          '<span class="termdlg__pill">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
            'Ästhetische Anfragen' +
          '</span>' +
          '<h2 class="termdlg__title" id="terminDialogTitel">Schreiben Sie uns <em>einfach</em></h2>' +
          '<p class="termdlg__text">Schreiben Sie uns bei ästhetischen Anfragen bitte eine E-Mail oder eine WhatsApp-Terminanfrage – <strong>unsere Mitarbeiter antworten Ihnen innerhalb weniger Stunden!</strong></p>' +
          '<div class="termdlg__actions">' +
            '<a class="termdlg__btn" href="mailto:' + MAIL + '?subject=Terminanfrage">' +
              '<span class="termdlg__ico">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>' +
              '</span>' +
              '<span><span class="termdlg__label">E-Mail</span><span class="termdlg__value">' + MAIL + '</span></span>' +
            '</a>' +
            '<a class="termdlg__btn termdlg__btn--wa" target="_blank" rel="noopener"' +
              ' href="https://wa.me/' + WA_NUMMER + '?text=' + encodeURIComponent(WA_TEXT) + '">' +
              '<span class="termdlg__ico">' +
                '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.65-1.24-1.46-1.38-1.71-.15-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z"/></svg>' +
              '</span>' +
              '<span><span class="termdlg__label">WhatsApp</span><span class="termdlg__value">' + WA_ANZEIGE + '</span></span>' +
            '</a>' +
          '</div>' +
          '<p class="termdlg__note">Sie möchten zur <strong>Hautkrebsvorsorge</strong>? Diesen Termin buchen Sie direkt im ' +
            '<a href="' + KALENDER + '" target="_blank" rel="noopener">Online-Kalender</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- Aufbau ---------------------------------------------------- */
  var dlg = null;
  var letzterFokus = null;

  function aufbauen() {
    var style = document.createElement('style');
    style.setAttribute('data-termdlg', '');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    var halter = document.createElement('div');
    halter.innerHTML = HTML;
    dlg = halter.firstChild;
    document.body.appendChild(dlg);

    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { schliessen(); return; }
      if (e.target.closest('[data-termdlg-close]')) { e.preventDefault(); schliessen(); }
    });
  }

  function fokussierbare() {
    return dlg.querySelectorAll('a[href], button:not([disabled])');
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
    if (!dlg) aufbauen();
    letzterFokus = document.activeElement;
    dlg.hidden = false;
    void dlg.offsetWidth; /* Reflow erzwingen, damit die Einblendung greift */
    dlg.classList.add('is-open');
    document.body.classList.add('termdlg-open');
    var erste = fokussierbare()[1] || fokussierbare()[0];
    if (erste) erste.focus();
    document.addEventListener('keydown', beiTaste, true);
  }

  function schliessen() {
    dlg.classList.remove('is-open');
    document.body.classList.remove('termdlg-open');
    document.removeEventListener('keydown', beiTaste, true);
    window.setTimeout(function () { dlg.hidden = true; }, 350);
    if (letzterFokus && letzterFokus.focus) letzterFokus.focus();
  }

  /* Ein einziger Zuhoerer am Dokument — greift auch fuer Knoepfe, die erst
     spaeter ins Dokument kommen */
  document.addEventListener('click', function (e) {
    var ausloeser = e.target.closest('[data-termin-dialog]');
    if (!ausloeser) return;
    e.preventDefault();
    oeffnen();
  });
})();
