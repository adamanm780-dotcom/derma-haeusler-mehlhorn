/* ==========================================================================
   Seitensuche — Lupe in der Kopfleiste + Suchfeld im Menü
   --------------------------------------------------------------------------
   Selbstgenuegsames Modul: bringt sein eigenes CSS und Markup mit und wird
   mit einer einzigen Script-Zeile eingebunden:

       <script src="js/site-search.js" defer></script>

   Verhalten
   - haengt eine Lupe in die Kopfleiste (Startseite und Unterseiten) und ein
     Suchfeld oben ins aufgeklappte Menue; beides oeffnet denselben Dialog
   - ohne Eingabe zeigt der Dialog alle Kategorien; ein Klick auf eine
     Kategorie listet deren Seiten
   - gesucht wird in Titel, Kategorie, Beschreibung und Stichwoertern jeder
     Seite und — sobald nachgeladen — im kompletten Seitentext
   - Gross-/Kleinschreibung, Umlaute (ä/ae) und kleine Tippfehler werden
     toleriert ("tatoo", "botoks", "Hautkrebsvorsoge" finden ihre Seite)
   - Tastatur: "/" oder Strg/Cmd+K oeffnet, Pfeiltasten waehlen, Enter
     oeffnet, Escape schliesst
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Inhalte ---------------------------------------------------
     Jede Seite mit Kategorie und Stichwoertern, nach denen Patientinnen
     typischerweise suchen (auch Laienbegriffe). Neue Seite? Hier eintragen.
     Der volle Seitentext wird beim ersten Oeffnen zusaetzlich nachgeladen. */
  var START = 'index.html';

  var KATEGORIEN = [
    'Hautmedizin', 'Sprechstunden', 'Laser & Haut', 'Ästhetik',
    'Pflege & Analyse', 'Ratgeber', 'Praxis', 'Karriere', 'Service'
  ];

  var SEITEN = [
    { url: 'hautkrebsvorsorge-chemnitz.html', titel: 'Hautkrebsvorsorge', kat: 'Hautmedizin',
      text: 'Screening & Auflichtmikroskopie',
      kw: 'Hautkrebs Screening Hautkrebsscreening Vorsorge Früherkennung Melanom schwarzer Hautkrebs weißer Hautkrebs Basaliom Leberfleck Muttermal Kontrolle Dermatoskopie Auflichtmikroskopie Krankenkasse' },
    { url: 'muttermal-entfernen-chemnitz.html', titel: 'Muttermal entfernen', kat: 'Hautmedizin',
      text: 'Mit histologischer Untersuchung',
      kw: 'Muttermal Leberfleck Naevus Pigmentmal Mal entfernen wegmachen Histologie feingeweblich' },
    { url: 'ambulante-hautoperationen-chemnitz.html', titel: 'Ambulante Hautoperationen', kat: 'Hautmedizin',
      text: 'Gut- & bösartige Hauttumore',
      kw: 'Operation OP Hautoperation Tumor Hauttumor Basaliom Zyste Lipom Fettgeschwulst Hautveränderung entfernen örtliche Betäubung Narkose Naht Fäden' },
    { url: 'allergietest-chemnitz.html', titel: 'Allergietest', kat: 'Hautmedizin',
      text: 'Pricktest & Epikutantest',
      kw: 'Allergie Allergietest Pricktest Epikutantest Heuschnupfen Pollen Hausstaub Kontaktallergie Nickel Duftstoffe Juckreiz Ausschlag' },
    { url: 'schuppenflechte-neurodermitis-chemnitz.html', titel: 'Schuppenflechte & Neurodermitis', kat: 'Sprechstunden',
      text: 'Bis zur Systemtherapie',
      kw: 'Schuppenflechte Psoriasis Neurodermitis atopische Dermatitis Ekzem trockene Haut Juckreiz Biologika Systemtherapie Basispflege' },
    { url: 'akne-behandlung-chemnitz.html', titel: 'Akne', kat: 'Sprechstunden',
      text: 'Fachärztlich behandelt',
      kw: 'Akne Pickel Mitesser unreine Haut Pubertät Aknenarben Isotretinoin Rosazea' },
    { url: 'hyperhidrose-behandlung-chemnitz.html', titel: 'Hyperhidrose / Schwitzen', kat: 'Sprechstunden',
      text: 'Übermäßiges Schwitzen',
      kw: 'Hyperhidrose Schwitzen Schweiß Achselschweiß Achseln starkes Schwitzen Botox Botulinumtoxin' },
    { url: 'kinderdermatologie-chemnitz.html', titel: 'Kinderdermatologie', kat: 'Sprechstunden',
      text: 'Kinder & Jugendliche',
      kw: 'Kinder Kind Baby Säugling Jugendliche Kinderhautarzt Neurodermitis Warzen Ekzem' },
    { url: 'hautarztverfahren-chemnitz.html', titel: 'Hautarztverfahren (BG) & Gutachten', kat: 'Sprechstunden',
      text: 'Berufsdermatologie & Gutachten',
      kw: 'Hautarztverfahren BG Berufsgenossenschaft Beruf Arbeit Berufskrankheit Handekzem Hautarztbericht Gutachten' },
    { url: 'laser-pigmentflecken-chemnitz.html', titel: 'Pigmentflecken lasern', kat: 'Laser & Haut',
      text: 'Gleichmäßiger Teint',
      kw: 'Pigmentflecken Altersflecken Sonnenflecken Flecken Laser lasern Teint Hyperpigmentierung' },
    { url: 'dauerhafte-haarentfernung-chemnitz.html', titel: 'Dauerhafte Haarentfernung', kat: 'Laser & Haut',
      text: 'Premium Diodenlaser',
      kw: 'Haarentfernung Haare Laser Diodenlaser Enthaarung Achseln Bikinizone Beine Damenbart Rücken rasieren' },
    { url: 'laser-tattooentfernung-chemnitz.html', titel: 'Tattooentfernung', kat: 'Laser & Haut',
      text: 'Modernste Lasertechnik',
      kw: 'Tattoo Tattooentfernung Tätowierung entfernen Laser Cover-Up Permanent Make-up' },
    { url: 'besenreiser-entfernen-chemnitz.html', titel: 'Besenreiser entfernen', kat: 'Laser & Haut',
      text: 'Schonende Lasertherapie',
      kw: 'Besenreiser Äderchen Adern Venen Beine Laser Gefäße Couperose rote Äderchen' },
    { url: 'botox-faltenbehandlung-chemnitz.html', titel: 'Botox / Faltenbehandlung', kat: 'Ästhetik',
      text: 'Mimische Fältchen',
      kw: 'Botox Botulinumtoxin Falten Faltenbehandlung Zornesfalte Stirnfalten Krähenfüße Anti-Aging' },
    { url: 'hyaluron-filler-chemnitz.html', titel: 'Hyaluron / Filler', kat: 'Ästhetik',
      text: 'Volumen & Konturen',
      kw: 'Hyaluron Hyaluronsäure Filler Lippen Lippenunterspritzung Wangen Jawline Kinn Volumen Konturen Falten unterspritzen' },
    { url: 'aesthetische-operationen-chemnitz.html', titel: 'Ästhetische Operationen', kat: 'Ästhetik',
      text: 'Individuell geplant',
      kw: 'Ästhetische Operation Schönheitsoperation Dermatochirurgie Xanthelasmen Narben Narbenkorrektur Hautveränderung' },
    { url: START + '#treatments', titel: 'Hautanalyse', kat: 'Pflege & Analyse',
      text: 'Diagnostik & Beratung',
      kw: 'Hautanalyse Hauttyp Diagnostik Beratung Hautbild' },
    { url: 'hydrafacial-chemnitz.html', titel: 'Medical Skincare – Hydrafacial®', kat: 'Pflege & Analyse',
      text: 'Tiefenreinigung & Wirkstoff-Infusion',
      kw: 'Hydrafacial Hydra Facial Skincare Gesichtsbehandlung Gesichtsreinigung Kosmetik Peeling Tiefenreinigung LED Lichttherapie Lymphdrainage Booster' },
    { url: 'ratgeber-botox-chemnitz.html', titel: 'Botox: Ablauf, Kosten & Wirkung', kat: 'Ratgeber',
      text: 'Ablauf, Kosten, Wirkungsdauer',
      kw: 'Botox Kosten Preis Preise Ablauf Wirkung Wirkungsdauer Schmerzen Ausfallzeit Ratgeber' },
    { url: 'ratgeber-haarentfernung-chemnitz.html', titel: 'Haarentfernung: Ablauf & Kosten', kat: 'Ratgeber',
      text: 'Sitzungen, Kosten, Körperzonen',
      kw: 'Haarentfernung Kosten Preis Preise Sitzungen Ablauf Schmerzen Körperzonen Ratgeber Laser' },
    { url: START + '#philosophy', titel: 'Über uns', kat: 'Praxis',
      text: 'Das Team & unsere Philosophie',
      kw: 'Über uns Team Ärztin Ärzte Hautärztin Hautarzt Dermatologin Philosophie Häusler Mehlhorn' },
    { url: START + '#praxis', titel: 'Unsere Praxis', kat: 'Praxis',
      text: 'Chemnitz, Leipziger Straße',
      kw: 'Praxis Räume Gebäude Leipziger Straße Chemnitz' },
    { url: START + '#technology', titel: 'Technologie', kat: 'Praxis',
      text: 'Premium Lasersysteme',
      kw: 'Technologie Technik Geräte Lasersysteme Laser' },
    { url: START + '#results', titel: 'Vorher-Nachher-Ergebnisse', kat: 'Praxis',
      text: 'Ergebnisse unserer Behandlungen',
      kw: 'Vorher Nachher Ergebnisse Bilder Fotos Resultate' },
    { url: START + '#testimonials', titel: 'Patientinnenstimmen', kat: 'Praxis',
      text: 'Echte Erfahrungen',
      kw: 'Bewertungen Erfahrungen Patientenstimmen Rezensionen Meinungen' },
    { url: START + '#process', titel: 'Ihr Weg zu uns', kat: 'Praxis',
      text: 'So läuft eine Behandlung ab',
      kw: 'Ablauf Behandlung erster Termin Erstgespräch Beratung' },
    { url: START + '#faq', titel: 'FAQ – Häufige Fragen', kat: 'Praxis',
      text: 'Antworten auf häufige Fragen',
      kw: 'FAQ Fragen häufige Fragen Antworten Hilfe' },
    { url: 'stellenangebote.html', titel: 'Stellenangebote', kat: 'Karriere',
      text: 'MFA & Facharzt / Fachärztin Dermatologie',
      kw: 'Stellenangebote Jobs Job Karriere Stelle Bewerbung bewerben MFA medizinische Fachangestellte Arzthelferin Facharzt Fachärztin Arbeit Teilzeit Vollzeit' },
    { url: 'mailto:termin@hautarzt-chemnitz.de?subject=Terminanfrage', termin: true, titel: 'Termin anfragen', kat: 'Service',
      text: 'Persönlich & unverbindlich',
      kw: 'Termin Terminanfrage Termin vereinbaren buchen Beratungstermin E-Mail Kontakt' },
    { url: START + '#contact', titel: 'Kontakt, Anfahrt & Öffnungszeiten', kat: 'Service',
      text: '09113 Chemnitz',
      kw: 'Kontakt Anfahrt Adresse Öffnungszeiten Telefon Parken Parkplatz Anreise Weg Sprechzeiten' },
    { url: 'impressum.html', titel: 'Impressum', kat: 'Service', text: 'Anbieterkennzeichnung', kw: 'Impressum Anbieter' },
    { url: 'datenschutz.html', titel: 'Datenschutz', kat: 'Service', text: 'Datenschutzerklärung', kw: 'Datenschutz DSGVO Cookies' }
  ];

  /* ---------- Textaufbereitung ------------------------------------------ */
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function woerter(s) {
    return norm(s).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Wortmengen je Feld mit Gewicht; der Volltext kommt spaeter dazu */
  var GEWICHT = { titel: 3, kat: 2, kw: 2, text: 1.5, voll: 1 };
  SEITEN.forEach(function (s) {
    s.felder = {
      titel: woerter(s.titel), kat: woerter(s.kat),
      kw: woerter(s.kw), text: woerter(s.text), voll: []
    };
    s.volltext = '';
  });

  /* ---------- Unscharfer Vergleich --------------------------------------
     Damerau-Levenshtein (eingeschraenkt) fuer ganze Woerter und die
     "beste Teilzeichenkette" fuer zusammengesetzte Woerter wie
     Hautkrebsvorsorge, damit auch "krebs" oder "vorsoge" treffen.       */
  function distanz(a, b, max) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    var vv = [], v = [], cur = [], i, j;
    for (j = 0; j <= lb; j++) v[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i];
      var zeilenMin = i;
      for (j = 1; j <= lb; j++) {
        var k = a[i - 1] === b[j - 1] ? 0 : 1;
        var d = Math.min(v[j] + 1, cur[j - 1] + 1, v[j - 1] + k);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, vv[j - 2] + 1);
        cur[j] = d;
        if (d < zeilenMin) zeilenMin = d;
      }
      if (zeilenMin > max) return max + 1;
      vv = v; v = cur;
    }
    return v[lb];
  }
  function teilDistanz(muster, text) {
    /* kleinster Abstand von muster zu irgendeinem Teilstueck von text */
    var m = muster.length, n = text.length, prev = [], cur, i, j, best;
    for (j = 0; j <= n; j++) prev[j] = 0;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        var k = muster[i - 1] === text[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + k);
      }
      prev = cur;
    }
    best = m;
    for (j = 0; j <= n; j++) if (prev[j] < best) best = prev[j];
    return best;
  }
  function erlaubt(len) { return len < 4 ? 0 : len < 6 ? 1 : 2; }

  var cache = {};
  function wortPunkte(t, w) {
    var key = t + '|' + w;
    if (key in cache) return cache[key];
    var p = 0;
    if (w === t) p = 1;
    else if (w.indexOf(t) === 0) p = 0.9;
    else if (t.length >= 3 && w.indexOf(t) > 0) p = 0.75;
    else {
      var max = erlaubt(t.length);
      if (max) {
        var d = distanz(t, w, max);
        if (d <= max) p = 0.7 - 0.1 * d;
        else if (t.length >= 5 && w.length > t.length) {
          d = teilDistanz(t, w);
          if (d <= max) p = 0.6 - 0.1 * d;
        }
      }
    }
    cache[key] = p;
    return p;
  }

  /* Liefert Punktzahl und das beste gefundene Wort je Suchbegriff.
     Im langen Seitentext zaehlen Tippfehler-Treffer nur, wenn es sonst
     gar nichts gibt (locker = true) — sonst wird die Liste zu unruhig. */
  function bewerte(seite, begriffe, locker) {
    var summe = 0, treffer = 0, worte = [], unscharf = false;
    begriffe.forEach(function (t) {
      var best = 0, bestWort = '';
      Object.keys(GEWICHT).forEach(function (f) {
        var liste = seite.felder[f];
        for (var i = 0; i < liste.length; i++) {
          var roh = wortPunkte(t, liste[i]);
          if (f === 'voll' && roh < 0.75 && !locker) continue;
          var p = roh * GEWICHT[f];
          if (p > best) { best = p; bestWort = liste[i]; }
        }
      });
      if (best > 0) {
        treffer++; summe += best; worte.push(bestWort);
        if (wortPunkte(t, bestWort) < 0.75) unscharf = true;
      }
    });
    return { punkte: summe, alle: treffer === begriffe.length, treffer: treffer,
             worte: worte, unscharf: unscharf };
  }

  function suche(q) {
    var begriffe = woerter(q);
    if (!begriffe.length) return [];
    function lauf(locker) {
      return SEITEN.map(function (s) {
        var r = bewerte(s, begriffe, locker); r.seite = s; return r;
      }).filter(function (r) { return r.treffer > 0; });
    }
    var ergebnisse = lauf(false);
    if (!ergebnisse.length) ergebnisse = lauf(true);
    /* Wenn moeglich nur Seiten, die alle Begriffe enthalten */
    var alle = ergebnisse.filter(function (r) { return r.alle; });
    if (alle.length) ergebnisse = alle;
    /* Gibt es exakte Treffer, fallen reine Tippfehler-Treffer weg
       ("nickel" soll nicht auch "Pickel" finden) */
    var sauber = ergebnisse.filter(function (r) { return !r.unscharf; });
    if (sauber.length) ergebnisse = sauber;
    return ergebnisse.sort(function (a, b) { return b.punkte - a.punkte; }).slice(0, 12);
  }

  /* ---------- Volltext nachladen --------------------------------------- */
  var geladen = false;
  function volltextLaden(fertig) {
    if (geladen || !window.fetch || !window.DOMParser) return;
    geladen = true;
    var urls = {};
    SEITEN.forEach(function (s) {
      if (!s.termin) urls[s.url.split('#')[0]] = true;
    });
    var offen = Object.keys(urls).length;
    Object.keys(urls).forEach(function (u) {
      fetch(u, { credentials: 'same-origin' }).then(function (r) {
        return r.ok ? r.text() : '';
      }).then(function (html) {
        if (!html) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        Array.prototype.forEach.call(doc.querySelectorAll('script,style,noscript,svg,nav,header,footer,.nav__mobile-menu,.site-menu'), function (el) {
          el.parentNode.removeChild(el);
        });
        SEITEN.forEach(function (s) {
          var teile = s.url.split('#');
          if (s.termin || teile[0] !== u) return;
          var wurzel = teile[1] ? doc.getElementById(teile[1]) : (doc.querySelector('main') || doc.body);
          if (!wurzel) return;
          var t = (wurzel.textContent || '').replace(/\s+/g, ' ').trim();
          s.volltext = t;
          var gesehen = {};
          s.felder.voll = woerter(t).filter(function (w) {
            if (w.length < 3 || gesehen[w]) return false;
            return (gesehen[w] = true);
          });
        });
      }).catch(function () {}).then(function () {
        if (--offen === 0 && fertig) fertig();
      });
    });
  }

  /* Textausschnitt rund um das erste Trefferwort */
  function ausschnitt(text, ziel) {
    if (!text || !ziel.length) return '';
    var re = /[A-Za-zÀ-ÿ0-9]+/g, m, teile = [];
    while ((m = re.exec(text))) teile.push({ w: m[0], i: m.index });
    for (var k = 0; k < teile.length; k++) {
      if (ziel.indexOf(norm(teile[k].w)) !== -1) {
        var von = teile[Math.max(0, k - 8)].i;
        var bisT = teile[Math.min(teile.length - 1, k + 12)];
        var bis = bisT.i + bisT.w.length;
        var vor = esc(text.slice(von, teile[k].i));
        var wort = '<mark>' + esc(teile[k].w) + '</mark>';
        var nach = esc(text.slice(teile[k].i + teile[k].w.length, bis));
        return (von > 0 ? '… ' : '') + vor + wort + nach + (bis < text.length ? ' …' : '');
      }
    }
    return '';
  }
  function markiere(text, ziel) {
    return String(text).split(/(\s+)/).map(function (teil) {
      var n = woerter(teil);
      var hit = n.some(function (w) { return ziel.indexOf(w) !== -1; });
      return hit ? '<mark>' + esc(teil) + '</mark>' : esc(teil);
    }).join('');
  }

  /* ---------- Styles ---------------------------------------------------- */
  var CSS = [
    /* Lupe in der Kopfleiste */
    '.ssuche-btn{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;flex-shrink:0;',
    'border:1px solid #E6DCC7;border-radius:999px;background:rgba(255,255,255,.6);color:#3B3222;cursor:pointer;',
    'transition:background .2s,border-color .2s,color .2s;}',
    '.ssuche-btn:hover{background:#F6EFE3;border-color:#B89773;color:#8B6F47;}',
    '.ssuche-btn svg{width:19px;height:19px;}',
    '.site-header .ssuche-btn{border-radius:10px;background:#fff;}',
    /* Unterseiten: auf schmalen Handys wird es in der Kopfleiste eng */
    '@media (max-width:480px){.site-header .container{padding:0 16px;}.site-header .header-cta{gap:6px;}',
    '.site-header .ssuche-btn,.site-header .nav-toggle{width:40px;height:40px;}',
    '.site-header .header-offers{padding:9px 11px;font-size:12px;}',
    '.site-header .brand{gap:8px;}.site-header .brand img{width:28px;height:28px;}',
    '.site-header .brand-name{font-size:14px;}}',
    '@media (max-width:360px){.site-header .brand-name{display:none;}}',
    /* Startseite: Desktop-Lupe in der Linkleiste, Mobil-Lupe neben dem Menuesymbol */
    '.ssuche-btn--mobil{display:none;margin-left:auto;margin-right:6px;}',
    '@media (max-width:768px){.ssuche-btn--mobil{display:inline-flex;}}',

    /* Suchfeld oben im Menue */
    '.ssuche-feld{display:flex;align-items:center;gap:12px;width:100%;max-width:520px;margin:0 auto 8px;padding:14px 18px;',
    'border:1px solid #E6DCC7;border-radius:999px;background:#fff;color:#7B6D55;cursor:text;text-align:left;',
    'font:400 16px/1.3 "Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.05);flex-shrink:0;}',
    '.ssuche-feld:hover{border-color:#B89773;}',
    '.ssuche-feld svg{width:18px;height:18px;flex-shrink:0;color:#8B6F47;}',
    '.site-menu .ssuche-feld{max-width:none;margin:4px 0 14px;border-radius:12px;}',

    /* Dialog */
    '.ssuche{position:fixed;inset:0;z-index:12000;display:flex;align-items:flex-start;justify-content:center;',
    'padding:72px 20px 24px;background:rgba(28,21,12,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    /* Nur Deckkraft animieren: unsichtbare (visibility) Felder liessen sich
       nicht sofort fokussieren, und ohne Fokus oeffnet keine Tastatur */
    'opacity:0;transition:opacity .3s cubic-bezier(.16,1,.3,1);',
    'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#3B3222;}',
    '.ssuche.is-open{opacity:1;}',
    '.ssuche[hidden]{display:none;}',
    '.ssuche__card{position:relative;width:100%;max-width:640px;max-height:calc(100vh - 96px);display:flex;flex-direction:column;',
    'background:#FDF9F2;border-radius:22px;box-shadow:0 30px 80px rgba(20,15,8,.34);overflow:hidden;',
    'transform:translateY(-12px);transition:transform .4s cubic-bezier(.16,1,.3,1);}',
    '.ssuche.is-open .ssuche__card{transform:none;}',
    '.ssuche__kopf{display:flex;align-items:center;gap:10px;padding:14px 14px 14px 20px;border-bottom:1px solid #E6DCC7;background:#fff;}',
    '.ssuche__kopf>svg{width:20px;height:20px;color:#8B6F47;flex-shrink:0;}',
    '.ssuche__eingabe{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#251E13;',
    'font:400 18px/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;padding:8px 0;-webkit-appearance:none;appearance:none;}',
    '.ssuche__eingabe::placeholder{color:#A69780;}',
    '.ssuche__eingabe::-webkit-search-cancel-button{display:none;}',
    '.ssuche__leeren,.ssuche__zu{flex-shrink:0;border:0;background:transparent;cursor:pointer;color:#7B6D55;',
    'font:500 13px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;border-radius:8px;}',
    '.ssuche__leeren{padding:8px;}',
    '.ssuche__leeren[hidden]{display:none;}',
    '.ssuche__zu{width:40px;height:40px;font-size:26px;font-weight:300;}',
    '.ssuche__leeren:hover,.ssuche__zu:hover{background:#F6EFE3;color:#251E13;}',
    '.ssuche__liste{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:10px 10px 14px;}',
    '.ssuche__titel{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#8B6F47;font-weight:600;margin:12px 12px 8px;}',
    '.ssuche__hinweis{margin:6px 12px 4px;font-size:14px;color:#7B6D55;}',
    '.ssuche__hinweis button{border:0;background:none;padding:0;color:#8B6F47;font:inherit;font-weight:600;text-decoration:underline;cursor:pointer;}',
    '.ssuche__chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 6px;}',
    '.ssuche__chip{border:1px solid #E6DCC7;background:#fff;border-radius:999px;padding:9px 15px;cursor:pointer;',
    'font:500 14px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#3B3222;transition:background .2s,border-color .2s;}',
    '.ssuche__chip:hover,.ssuche__chip.is-aktiv{background:#F6EFE3;border-color:#B89773;color:#8B6F47;}',
    '.ssuche__chip small{color:#A69780;font-weight:400;margin-left:4px;}',
    '.ssuche__treffer{display:block;padding:12px 14px;border-radius:14px;text-decoration:none;color:inherit;}',
    '.ssuche__treffer:hover,.ssuche__treffer.is-aktiv{background:#F6EFE3;}',
    '.ssuche__zeile{display:flex;align-items:baseline;justify-content:space-between;gap:12px;}',
    '.ssuche__name{font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:460;color:#251E13;}',
    '.ssuche__kat{flex-shrink:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8B6F47;',
    'background:#F6EFE3;border-radius:999px;padding:4px 9px;}',
    '.ssuche__treffer.is-aktiv .ssuche__kat,.ssuche__treffer:hover .ssuche__kat{background:#fff;}',
    '.ssuche__text{display:block;margin-top:3px;font-size:14px;line-height:1.5;color:#544833;}',
    '.ssuche mark{background:#EBDDC8;color:inherit;border-radius:3px;padding:0 2px;}',
    '.ssuche__leer{padding:22px 12px;text-align:center;color:#7B6D55;font-size:15px;line-height:1.6;}',
    '.ssuche__leer a{color:#8B6F47;font-weight:600;}',
    '@media (max-width:600px){.ssuche{padding:0;align-items:stretch;}',
    '.ssuche__card{max-width:none;max-height:none;height:100%;border-radius:0;}',
    '.ssuche__eingabe{font-size:17px;}}',
    '@media (prefers-reduced-motion:reduce){.ssuche,.ssuche__card{transition:none;}}'
  ].join('');

  var LUPE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var PLATZHALTER = 'Behandlung, Beschwerde oder Stichwort …';

  /* ---------- Dialog ---------------------------------------------------- */
  var pop, eingabe, liste, leeren, zuletzt, aktiv = -1, kategorie = null;

  function bauen() {
    if (pop) return;
    pop = document.createElement('div');
    pop.className = 'ssuche';
    pop.hidden = true;
    pop.innerHTML =
      '<div class="ssuche__card" role="dialog" aria-modal="true" aria-label="Seite durchsuchen">' +
        '<div class="ssuche__kopf">' + LUPE +
          '<input class="ssuche__eingabe" type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" ' +
            'autocapitalize="off" spellcheck="false" placeholder="' + PLATZHALTER + '" aria-label="Suchbegriff" ' +
            'role="combobox" aria-expanded="true" aria-controls="ssucheListe" aria-autocomplete="list">' +
          '<button class="ssuche__leeren" type="button" hidden>Leeren</button>' +
          '<button class="ssuche__zu" type="button" aria-label="Suche schließen">&times;</button>' +
        '</div>' +
        '<div class="ssuche__liste" id="ssucheListe" role="listbox" aria-label="Suchergebnisse"></div>' +
      '</div>';
    document.body.appendChild(pop);
    eingabe = pop.querySelector('.ssuche__eingabe');
    liste = pop.querySelector('.ssuche__liste');
    leeren = pop.querySelector('.ssuche__leeren');

    eingabe.addEventListener('input', function () { kategorie = null; zeichnen(); });
    eingabe.addEventListener('keydown', tasten);
    leeren.addEventListener('click', function () { eingabe.value = ''; kategorie = null; zeichnen(); eingabe.focus(); });
    pop.querySelector('.ssuche__zu').addEventListener('click', schliessen);
    pop.addEventListener('click', function (e) {
      if (e.target === pop) return schliessen();
      var chip = e.target.closest('[data-kat]');
      if (chip) {
        kategorie = kategorie === chip.getAttribute('data-kat') ? null : chip.getAttribute('data-kat');
        eingabe.value = '';
        zeichnen();
        return;
      }
      var vorschlag = e.target.closest('[data-vorschlag]');
      if (vorschlag) {
        eingabe.value = vorschlag.getAttribute('data-vorschlag');
        zeichnen(); eingabe.focus();
        return;
      }
      var link = e.target.closest('.ssuche__treffer');
      if (link) springen(link, e);
    });
  }

  function linkZu(s) {
    var teile = s.url.split('#');
    /* Auf der Startseite selbst reicht der Anker */
    if (teile[1] && aufStartseite() && teile[0] === START) return '#' + teile[1];
    return s.url;
  }
  function aufStartseite() {
    return !!document.getElementById('mobileMenu');
  }

  function trefferHtml(s, i, worte) {
    /* Steht der Treffer nicht im sichtbaren Titel/Untertitel, zeigt ein
       Ausschnitt aus dem Seitentext, wo das Stichwort vorkommt */
    var text = worte.length ? markiere(s.text, worte) : esc(s.text);
    if (worte.length && (markiere(s.titel, worte) + text).indexOf('<mark>') === -1) {
      text = ausschnitt(s.volltext, worte) || text;
    }
    return '<a class="ssuche__treffer" role="option" id="ssucheT' + i + '" href="' + esc(linkZu(s)) + '"' +
      (s.termin ? ' data-termin-anfrage' : '') + '>' +
      '<span class="ssuche__zeile"><span class="ssuche__name">' + (worte.length ? markiere(s.titel, worte) : esc(s.titel)) + '</span>' +
      '<span class="ssuche__kat">' + esc(s.kat) + '</span></span>' +
      '<span class="ssuche__text">' + text + '</span></a>';
  }

  function chipsHtml() {
    return '<div class="ssuche__titel">Nach Kategorie stöbern</div><div class="ssuche__chips">' +
      KATEGORIEN.map(function (k) {
        var n = SEITEN.filter(function (s) { return s.kat === k; }).length;
        return '<button type="button" class="ssuche__chip' + (kategorie === k ? ' is-aktiv' : '') +
          '" data-kat="' + esc(k) + '" aria-pressed="' + (kategorie === k) + '">' + esc(k) + '<small>' + n + '</small></button>';
      }).join('') + '</div>';
  }

  /* "Meinten Sie …": die unscharf getroffenen Woerter als Vorschlag */
  function vorschlag(q, r) {
    var begriffe = woerter(q);
    if (!r.unscharf || r.worte.length !== begriffe.length) return '';
    var neu = r.worte.join(' ');
    if (neu === begriffe.join(' ')) return '';
    /* Originalschreibweise aus Titel/Stichwoertern holen */
    var quelle = r.seite.titel + ' ' + r.seite.kw + ' ' + r.seite.kat + ' ' + r.seite.text + ' ' + r.seite.volltext;
    var original = r.worte.map(function (w) {
      var m = quelle.match(/[A-Za-zÀ-ÿ0-9]+/g) || [];
      for (var i = 0; i < m.length; i++) if (norm(m[i]) === w) return m[i];
      return w;
    }).join(' ');
    return '<p class="ssuche__hinweis">Ergebnisse für <button type="button" data-vorschlag="' + esc(original) + '">' + esc(original) + '</button></p>';
  }

  function zeichnen() {
    var q = eingabe.value.trim();
    leeren.hidden = !q;
    aktiv = -1;
    var html = '';
    if (!q) {
      html = chipsHtml();
      if (kategorie) {
        html += '<div class="ssuche__titel">' + esc(kategorie) + '</div>' +
          SEITEN.filter(function (s) { return s.kat === kategorie; }).map(function (s, i) { return trefferHtml(s, i, []); }).join('');
      } else {
        html += '<p class="ssuche__hinweis">Tippen Sie z.&nbsp;B. „Pickel“, „Leberfleck“, „Laser“ oder „Kosten“ – kleine Tippfehler sind kein Problem.</p>';
      }
    } else {
      var r = suche(q);
      if (!r.length) {
        html = '<div class="ssuche__leer">Zu „' + esc(q) + '“ haben wir leider nichts gefunden.<br>' +
          'Schreiben Sie uns gern: <a href="mailto:termin@hautarzt-chemnitz.de?subject=Frage">termin@hautarzt-chemnitz.de</a></div>' + chipsHtml();
      } else {
        html = vorschlag(q, r[0]) +
          '<div class="ssuche__titel">' + r.length + ' Treffer</div>' +
          r.map(function (x, i) { return trefferHtml(x.seite, i, x.worte); }).join('');
      }
    }
    liste.innerHTML = html;
    eingabe.removeAttribute('aria-activedescendant');
  }

  function eintraege() { return liste.querySelectorAll('.ssuche__treffer'); }
  function markieren(n) {
    var e = eintraege();
    if (!e.length) return;
    if (aktiv >= 0 && e[aktiv]) e[aktiv].classList.remove('is-aktiv');
    aktiv = (n + e.length) % e.length;
    e[aktiv].classList.add('is-aktiv');
    e[aktiv].scrollIntoView({ block: 'nearest' });
    eingabe.setAttribute('aria-activedescendant', e[aktiv].id);
  }

  function tasten(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); markieren(aktiv + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); markieren(aktiv - 1); }
    else if (e.key === 'Enter') {
      var t = eintraege()[aktiv >= 0 ? aktiv : 0];
      if (t) { e.preventDefault(); t.click(); }
    }
  }

  function menueSchliessen() {
    if (typeof window.closeMobileMenu === 'function') {
      var mm = document.getElementById('mobileMenu');
      if (mm && mm.classList.contains('open')) window.closeMobileMenu();
    }
    var sm = document.getElementById('siteMenu');
    if (sm && sm.classList.contains('open')) {
      var zu = sm.querySelector('.site-menu__close');
      if (zu) zu.click();
    }
  }

  function springen(link, e) {
    var href = link.getAttribute('href');
    if (link.hasAttribute('data-termin-anfrage')) { schliessen(); return; }
    schliessen();
    if (href.charAt(0) === '#') {
      var ziel = document.querySelector(href);
      if (!ziel) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(ziel, { offset: -80, duration: 1.1 });
      else ziel.scrollIntoView({ behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', href);
    }
  }

  function oeffnen(text) {
    bauen();
    zuletzt = document.activeElement;
    menueSchliessen();
    pop.hidden = false;
    eingabe.value = text || '';
    kategorie = null;
    zeichnen();
    /* Fokus synchron setzen, damit Mobilgeraete die Tastatur oeffnen */
    eingabe.focus();
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { pop.classList.add('is-open'); });
    document.addEventListener('keydown', escape, true);
    volltextLaden(function () { if (pop.classList.contains('is-open')) zeichnenBehalten(); });
  }
  function zeichnenBehalten() {
    /* Nach dem Nachladen neu zeichnen, ohne Auswahl/Kategorie zu verlieren */
    if (eingabe.value.trim()) zeichnen();
  }

  function schliessen() {
    if (!pop || pop.hidden) return;
    pop.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', escape, true);
    setTimeout(function () { if (!pop.classList.contains('is-open')) pop.hidden = true; }, 300);
    if (zuletzt && zuletzt.focus && document.body.contains(zuletzt)) {
      try { zuletzt.focus({ preventScroll: true }); } catch (x) {}
    }
  }

  function escape(e) {
    if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); schliessen(); }
    else if (e.key === 'Tab') {
      /* Fokus im Dialog halten */
      var f = pop.querySelectorAll('input,button,a[href]');
      var erst = f[0], letzt = f[f.length - 1];
      if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }
      else if (!e.shiftKey && document.activeElement === letzt) { e.preventDefault(); erst.focus(); }
    }
  }

  /* ---------- Einstiege einbauen --------------------------------------- */
  function knopf(klasse) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ssuche-btn' + (klasse ? ' ' + klasse : '');
    b.setAttribute('aria-label', 'Seite durchsuchen');
    b.setAttribute('title', 'Suchen');
    b.innerHTML = LUPE;
    b.addEventListener('click', function () { oeffnen(); });
    return b;
  }
  function feld() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ssuche-feld';
    b.innerHTML = LUPE + '<span>Suchen: ' + PLATZHALTER.replace(' …', '') + '</span>';
    b.addEventListener('click', function () { oeffnen(); });
    return b;
  }

  function einbauen() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    /* Startseite */
    var links = document.querySelector('.nav__links');
    var cta = links && links.querySelector('.nav__cta');
    if (links) links.insertBefore(knopf(), cta || null);
    var toggle = document.getElementById('mobileToggle');
    if (toggle) toggle.parentNode.insertBefore(knopf('ssuche-btn--mobil'), toggle);
    var mm = document.getElementById('mobileMenu');
    if (mm) mm.insertBefore(feld(), mm.firstChild);

    /* Unterseiten */
    var navToggle = document.querySelector('.header-cta .nav-toggle');
    if (navToggle) navToggle.parentNode.insertBefore(knopf(), navToggle);
    var inner = document.querySelector('#siteMenu .site-menu__inner');
    if (inner) {
      var home = inner.querySelector('.site-menu__home');
      inner.insertBefore(feld(), home ? home.nextSibling : inner.firstChild);
    }

    document.addEventListener('keydown', function (e) {
      if (pop && !pop.hidden) return;
      var t = e.target, tippt = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); oeffnen(); }
      else if (e.key === '/' && !tippt && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); oeffnen(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', einbauen);
  else einbauen();

  /* Fuer Tests und andere Skripte */
  window.seitenSuche = { oeffnen: oeffnen, suche: suche };
})();
