/*
 * Genovese Materiale Elettrico — builder delle newsletter per Shopify Messaging («Code your own»).
 *
 * Funzione pura: dati → HTML. La usano l'editor (editor-newsletter.html) e il generatore
 * delle campagne (es. 05-marketing/black-week-2026/newsletter/tools/genera.mjs), così le mail
 * preparate a mano e quelle generate hanno la stessa struttura.
 *
 * Prezzi dei prodotti, tre modi (campo `prices`):
 *  - 'live'  : Liquid `all_products[handle]`, letto da Shopify al momento dell'invio. In Black Week
 *              mostra da solo i prezzi scritti dal motore SM Promo; se il prodotto non è più
 *              disponibile la scheda sparisce. I valori scritti nell'editor restano come riserva.
 *  - 'fixed' : prezzi scritti nell'HTML, come nell'editor.
 *  - 'none'  : nessun prezzo (teaser).
 *
 * build(d, { preview: true }) restituisce l'HTML senza Liquid, per l'anteprima nel browser.
 */
(function (root) {
  'use strict';

  var C = {
    navy: '#0b1134', accent: '#ffa000', sale: '#c8191f', surface: '#f3f5f9', white: '#ffffff',
    line: '#e2e3e8', text: '#484d67', subtle: '#686b81', onNavy: '#c9cbd6'
  };
  var HEAD = "Poppins,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  var BODY = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  var SITE = 'https://www.genovesematerialeelettrico.com';
  var FILES = 'https://cdn.shopify.com/s/files/1/0788/7716/3848/files/';

  // Variabili di Shopify Messaging. Se la prova Liquid dice nomi diversi, si cambiano solo qui.
  var MS = {
    unsubscribe: '{{ unsubscribe_url }}',
    openTracking: '{{ open_tracking_block }}'
  };

  var DEFAULTS = {
    preheader: 'Applique, sospensioni e strip LED scelte per te: guarda le novità della settimana.',
    topbar: 'Spedizione in 24/48 ore · Paga in 3 rate con Klarna',
    nav: 'Sospensioni | ' + SITE + '/collections/sospensioni-per-interno\nApplique | ' + SITE + '/collections/applique-per-interno\nEsterno | ' + SITE + '/collections/illuminazione-per-esterno\nFolletto e Bimby | ' + SITE + '/collections/folletto-e-bimby-rigenerati',
    banner: { src: '', href: SITE, alt: '' },
    eyebrow: 'Novità',
    title: 'La luce giusta per ogni stanza',
    text: 'Dalla cucina al giardino: abbiamo scelto per te **applique, sospensioni e proiettori** tra i più apprezzati dai nostri clienti.\n\nTutti disponibili, con spedizione in 24/48 ore.',
    cta: { label: 'Scopri le sospensioni', href: SITE + '/collections/sospensioni-per-interno' },
    reparti: {
      title: 'Scegli il reparto',
      list: 'Sospensioni | ' + SITE + '/collections/sospensioni-per-interno\nPlafoniere | ' + SITE + '/collections/plafoniere-per-interno\nApplique | ' + SITE + '/collections/applique-per-interno\nFaretti e binari | ' + SITE + '/collections/illuminazione-su-binario\nEsterno | ' + SITE + '/collections/illuminazione-per-esterno\nLampadine LED | ' + SITE + '/collections/lampadine-led'
    },
    productsTitle: 'I più scelti',
    productCta: 'Vedi prodotto',
    prices: 'live',
    cardBadge: '',
    products: [
      { handle: 'sospensione-led-bacchette-in-alluminio-bianco-nero-con-diffusore-opale-56w-6560lm-3000-4000-k-shanghai-s8', name: 'Sospensione LED a ventaglio Shanghai S8, 56W', vendor: 'Luce Ambiente Design', price: '350,00', oldPrice: '380,00', href: SITE + '/products/sospensione-led-bacchette-in-alluminio-bianco-nero-con-diffusore-opale-56w-6560lm-3000-4000-k-shanghai-s8', img: FILES + 'Senzatitolo_85c10ba3-dc0a-4d51-942a-55967b7f285c.png?v=1711448600', cta: '' },
      { handle: 'applique-led-in-alluminio-bianco-nero-silver-oro-orientabile-e-regolabile-18w-1820lm-3200-k-book-ap', name: 'Applique LED Book orientabile e regolabile, 18W', vendor: 'Luce Ambiente Design', price: '58,00', oldPrice: '92,00', href: SITE + '/products/applique-led-in-alluminio-bianco-nero-silver-oro-orientabile-e-regolabile-18w-1820lm-3200-k-book-ap', img: FILES + '0081592_applique-faro-led-orientabile-per-interni-book-design-moderno-fan-europe.webp?v=1711558067', cta: '' },
      { handle: 'applique-per-esterno-ip54-in-alluminio-bianco-antracite-o-corten-led-integrato-con-regolazione-luce-3000-4000-k-16w-1800-lumen-weiss', name: 'Applique da esterno LED Weiss 16W, IP54', vendor: 'Intec', price: '63,00', oldPrice: '85,10', href: SITE + '/products/applique-per-esterno-ip54-in-alluminio-bianco-antracite-o-corten-led-integrato-con-regolazione-luce-3000-4000-k-16w-1800-lumen-weiss', img: FILES + 'Senzatitolo2_6607399d-6301-4f65-b0d5-dbec47179d61.png?v=1702294766', cta: '' },
      { handle: 'plafoniera-orientabile-330-con-struttura-in-alluminio-bianco-o-nero-opaco-lampadagu10-non-inclusa-collezione-genesis', name: 'Plafoniera orientabile Genesis, attacco GU10', vendor: 'Luce Ambiente Design', price: '31,60', oldPrice: '35,00', href: SITE + '/products/plafoniera-orientabile-330-con-struttura-in-alluminio-bianco-o-nero-opaco-lampadagu10-non-inclusa-collezione-genesis', img: FILES + 'Senzatitolo2_36eb8c44-aabf-41bc-861c-266d151d1f51.png?v=1700652406', cta: '' }
    ],
    outro: { title: '', text: '', label: '', href: '' },
    vantaggi: true,
    brand: {
      logo: FILES + 'GENOVESE_6_1.png',
      logoWidth: 200,
      site: SITE,
      phone: '+39 331 294 9026',
      whatsapp: 'https://api.whatsapp.com/send/?phone=393312949026',
      email: 'info@genovesematerialeelettrico.com',
      legal: 'Genovese Materiale Elettrico · Via Palmiro Togliatti, 70 · 84083 Castel San Giorgio (SA) · P.IVA 05847980652',
      social: 'Facebook | https://www.facebook.com/genovesematerialeelettrico/\nInstagram | https://www.instagram.com/genovese_materiale_elettrico/',
      footerLinks: 'Spedizioni | ' + SITE + '/pages/spedizioni\nResi e rimborsi | ' + SITE + '/pages/politica-di-rimborso\nPagamenti | ' + SITE + '/pages/informative-sui-pagamenti\nContattaci | ' + SITE + '/pages/contact',
      footerNote: 'Ricevi questa email perché sei iscritto alla newsletter di Genovese Materiale Elettrico.'
    }
  };

  var VANTAGGI = [
    ['Spedizione', 'in 24/48 ore'],
    ['Paga in 3 rate', 'con Klarna'],
    ['Reso', 'entro 14 giorni'],
    ['Assistenza', 'su WhatsApp']
  ];

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function has(v) { return v != null && String(v).trim() !== ''; }
  function link(v) { return has(v) ? esc(String(v).trim()) : '#'; }
  function font(fam, size, lh, weight, color) {
    return 'font-family:' + fam + ';font-size:' + size + 'px;line-height:' + lh + 'px;font-weight:' + weight + ';color:' + color + ';';
  }
  function spacer(h) {
    return '<tr><td style="height:' + h + 'px;font-size:1px;line-height:1px;mso-line-height-rule:exactly;">&nbsp;</td></tr>';
  }

  // "58" / "58,9" / "1.250,00" / "58.90" -> "€58,00" (formato del negozio); testo libero resta com'è
  function toNumber(v) {
    var s = String(v == null ? '' : v).trim().replace(/[€\s]/g, '');
    if (!/^\d[\d.,]*$/.test(s)) return NaN;
    if (s.indexOf(',') > -1) return parseFloat(s.replace(/\./g, '').replace(',', '.'));
    if (/^\d+\.\d{1,2}$/.test(s)) return parseFloat(s);
    return parseFloat(s.replace(/\./g, ''));
  }
  function fmtPrice(v) {
    var n = toNumber(v);
    if (isNaN(n)) return String(v == null ? '' : v).trim();
    var parts = n.toFixed(2).split('.');
    return '€' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
  }
  function discount(price, old) {
    var p = toNumber(price), o = toNumber(old);
    if (isNaN(p) || isNaN(o) || o <= p) return 0;
    return Math.floor((o - p) * 100 / o);
  }

  // Foto prodotto dal CDN di Shopify: quadrata 600×600 su bianco, in JPG (Outlook non legge WebP).
  function productImage(src) {
    var s = String(src || '').trim();
    if (!/^https:\/\/cdn\.shopify\.com\//.test(s) || /[?&]width=/.test(s)) return s;
    return s + (s.indexOf('?') > -1 ? '&' : '?') + 'width=600&height=600&pad_color=ffffff&format=jpg';
  }

  function paragraphs(v, style) {
    return esc(v).trim().split(/\n\s*\n/).filter(function (p) { return p.trim(); }).map(function (p, i) {
      p = p.trim()
        .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:' + C.navy + ';">$1</strong>')
        .replace(/\n/g, '<br>');
      return '<p style="margin:' + (i ? 12 : 14) + 'px 0 0;' + style + '">' + p + '</p>';
    }).join('\n');
  }
  function parseLines(text) {
    return String(text || '').split('\n').map(function (line) {
      var i = line.indexOf('|');
      return i < 0 ? null : { label: line.slice(0, i).trim(), url: line.slice(i + 1).trim() };
    }).filter(function (l) { return l && l.label; });
  }

  // Pulsante del sito: arancione, testo navy, raggio 6 px. Outlook desktop: angoli squadrati.
  function button(label, url, o) {
    o = o || {};
    var bg = o.dark ? C.navy : C.accent, fg = o.dark ? C.white : C.navy;
    var py = o.py || 14, px = o.px == null ? 28 : o.px, size = o.size || 15;
    var a = 'display:' + (o.block ? 'block' : 'inline-block') + ';padding:' + py + 'px ' + px + 'px;' +
      font(HEAD, size, size + 4, 600, fg) + 'text-decoration:none;border-radius:6px;';
    return '<table role="presentation" ' + (o.block ? 'width="100%"' : 'align="center"') +
      ' cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>' +
      '<td align="center" bgcolor="' + bg + '" style="border-radius:6px;background:' + bg + ';mso-padding-alt:' + py + 'px ' + px + 'px;">' +
      '<a href="' + link(url) + '" target="_blank" style="' + a + '">' + esc(label) + '</a>' +
      '</td></tr></table>';
  }

  // Targhetta: come gm-promo-targhetta del tema (navy con testo arancione).
  function tag(text, size) {
    return '<span style="display:inline-block;padding:5px 10px;border-radius:4px;background:' + C.navy + ';' +
      font(HEAD, size || 12, (size || 12) + 2, 600, C.accent) + 'letter-spacing:0.04em;text-transform:uppercase;">' + esc(text) + '</span>';
  }

  /* ---------- Prezzo ---------- */
  function priceStatic(price, old) {
    if (!has(price)) return '';
    var off = discount(price, old);
    if (!off) return '<p style="margin:0;' + font(HEAD, 18, 24, 700, C.navy) + '">' + esc(fmtPrice(price)) + '</p>';
    return '<p style="margin:0;' + font(HEAD, 18, 24, 700, C.sale) + '">' + esc(fmtPrice(price)) +
      '&nbsp;<span style="display:inline-block;vertical-align:2px;padding:1px 6px;border-radius:4px;background:' + C.sale + ';' + font(HEAD, 12, 16, 600, C.white) + '">−' + off + '%</span></p>' +
      '<p style="margin:2px 0 0;' + font(HEAD, 14, 18, 600, C.subtle) + 'text-decoration:line-through;">' + esc(fmtPrice(old)) + '</p>';
  }
  function priceLive(p) {
    var h = String(p.handle).replace(/'/g, '');
    var red = font(HEAD, 18, 24, 700, C.sale), blue = font(HEAD, 18, 24, 700, C.navy);
    return [
      '{%- assign gm_p = all_products[\'' + h + '\'] -%}',
      '{%- assign gm_v = gm_p.selected_or_first_available_variant -%}',
      '{%- if gm_v -%}{%- assign gm_pr = gm_v.price -%}{%- assign gm_cp = gm_v.compare_at_price -%}{%- else -%}{%- assign gm_pr = gm_p.price -%}{%- assign gm_cp = gm_p.compare_at_price -%}{%- endif -%}',
      '{%- if gm_pr -%}',
      '{%- if gm_cp > gm_pr -%}',
      '<p style="margin:0;' + red + '">{{ gm_pr | money }}&nbsp;<span style="display:inline-block;vertical-align:2px;padding:1px 6px;border-radius:4px;background:' + C.sale + ';' + font(HEAD, 12, 16, 600, C.white) + '">−{{ gm_cp | minus: gm_pr | times: 100 | divided_by: gm_cp | floor }}%</span></p>',
      '<p style="margin:2px 0 0;' + font(HEAD, 14, 18, 600, C.subtle) + 'text-decoration:line-through;">{{ gm_cp | money }}</p>',
      '{%- else -%}',
      '<p style="margin:0;' + blue + '">{{ gm_pr | money }}</p>',
      '{%- endif -%}',
      '{%- else -%}',
      priceStatic(p.price, p.oldPrice),
      '{%- endif -%}'
    ].join('\n');
  }

  /* ---------- Scheda prodotto (2 per riga, come le card del sito) ---------- */
  function card(p, i, d, o) {
    var name = has(p.name) ? p.name.trim() : 'Nome prodotto';
    var cta = has(p.cta) ? p.cta : (has(d.productCta) ? d.productCta : 'Vedi prodotto');
    var mode = d.prices || 'live';
    var live = mode === 'live' && !o.preview && has(p.handle);
    var img = has(p.img)
      ? '<a href="' + link(p.href) + '" target="_blank" style="text-decoration:none;"><img src="' + esc(productImage(p.img)) + '" width="236" alt="' + esc(name) + '" style="display:block;width:100%;max-width:236px;height:auto;border:0;outline:none;border-radius:10px;background:' + C.white + ';' + font(BODY, 12, 16, 400, C.subtle) + '"></a>'
      : '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td align="center" height="236" bgcolor="' + C.surface + '" style="height:236px;border-radius:10px;background:' + C.surface + ';' + font(BODY, 12, 16, 400, C.subtle) + '">Immagine</td></tr></table>';
    var price = mode === 'none' ? '' : (live ? priceLive(p) : priceStatic(p.price, p.oldPrice));
    var rows = [];
    if (has(d.cardBadge)) rows.push('<tr><td style="padding:0 0 10px;">' + tag(d.cardBadge, 11) + '</td></tr>');
    rows.push('<tr><td>' + img + '</td></tr>');
    if (has(p.vendor)) rows.push('<tr><td class="gm-vendor" style="padding:12px 0 0;' + font(BODY, 11, 14, 600, C.subtle) + 'letter-spacing:0.06em;text-transform:uppercase;">' + esc(p.vendor) + '</td></tr>');
    rows.push('<tr><td valign="top" style="padding:' + (has(p.vendor) ? 4 : 12) + 'px 0 0;height:60px;' + font(BODY, 14, 20, 500, C.navy) + '"><a href="' + link(p.href) + '" target="_blank" style="color:' + C.navy + ';text-decoration:none;">' + esc(name) + '</a></td></tr>');
    if (price) rows.push('<tr><td style="padding:10px 0 0;height:44px;" valign="top">\n' + price + '\n</td></tr>');
    rows.push('<tr><td style="padding:14px 0 0;">' + button(cta, p.href, { block: true, size: 14, py: 11, px: 0 }) + '</td></tr>');

    var out = [
      '<!-- ▼ PRODOTTO ' + (i + 1) + (has(p.handle) ? ' · ' + esc(p.handle) : '') + ' ▼ -->',
      '<!--[if mso]><td width="282" valign="top" style="width:282px;"><![endif]-->',
      '<div class="gm-card" style="display:inline-block;width:100%;max-width:282px;vertical-align:top;">',
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="gm-card-pad" style="padding:0 7px 14px;text-align:left;">',
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border:1px solid ' + C.line + ';border-radius:14px;background:' + C.white + ';"><tr><td class="gm-card-in" style="padding:12px;">',
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">',
      rows.join('\n'),
      '</table>',
      '</td></tr></table>',
      '</td></tr></table>',
      '</div>',
      '<!--[if mso]></td><![endif]-->',
      '<!-- ▲ PRODOTTO ' + (i + 1) + ' ▲ -->'
    ].join('\n');
    // Dal vivo: se al momento dell'invio il prodotto non è disponibile, la scheda non compare.
    if (live) {
      out = '{%- assign gm_p = all_products[\'' + String(p.handle).replace(/'/g, '') + '\'] -%}\n' +
        '{%- unless gm_p.id and gm_p.available == false -%}\n' + out + '\n{%- endunless -%}';
    }
    return out;
  }

  function grid(list, d, o) {
    var out = ['<div style="font-size:0;line-height:0;text-align:center;">',
      '<!--[if mso]><table role="presentation" width="564" align="center" cellpadding="0" cellspacing="0" border="0"><tr><![endif]-->'];
    list.forEach(function (p, i) {
      if (i > 0 && i % 2 === 0) out.push('<!-- nuova riga Outlook (ogni 2 prodotti) --><!--[if mso]></tr><tr><![endif]-->');
      out.push(card(p, i, d, o));
    });
    out.push('<!--[if mso]></tr></table><![endif]-->', '</div>');
    return out.join('\n');
  }

  /* ---------- Riquadri reparto (3 per riga, 2 sul telefono) ---------- */
  function tiles(list) {
    var out = ['<div style="font-size:0;line-height:0;text-align:center;">',
      '<!--[if mso]><table role="presentation" width="564" align="center" cellpadding="0" cellspacing="0" border="0"><tr><![endif]-->'];
    list.forEach(function (l, i) {
      if (i > 0 && i % 3 === 0) out.push('<!--[if mso]></tr><tr><![endif]-->');
      out.push(
        '<!--[if mso]><td width="188" valign="top" style="width:188px;"><![endif]-->',
        '<div class="gm-tile" style="display:inline-block;width:100%;max-width:188px;vertical-align:top;">',
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 5px 10px;">',
        '<a href="' + link(l.url) + '" target="_blank" style="display:block;padding:16px 14px;border-radius:14px;background:' + C.surface + ';text-decoration:none;text-align:left;' + font(HEAD, 14, 18, 600, C.navy) + '">' +
          esc(l.label) + '<span style="color:' + C.accent + ';">&nbsp;&rarr;</span></a>',
        '</td></tr></table>',
        '</div>',
        '<!--[if mso]></td><![endif]-->'
      );
    });
    out.push('<!--[if mso]></tr></table><![endif]-->', '</div>');
    return out.join('\n');
  }

  function sectionTitle(text, top) {
    return '<tr><td class="gm-px" style="padding:' + (top == null ? 40 : top) + 'px 36px 20px;text-align:left;">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" height="3" bgcolor="' + C.accent + '" style="width:32px;height:3px;background:' + C.accent + ';font-size:1px;line-height:1px;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>' +
      '<h2 style="margin:12px 0 0;' + font(HEAD, 21, 28, 600, C.navy) + 'letter-spacing:-0.01em;">' + esc(text) + '</h2></td></tr>';
  }

  function buildEmail(d, o) {
    d = d || {};
    o = o || {};
    var b = d.brand || {};
    var banner = d.banner || {};
    var cta = d.cta || {};
    var outro = d.outro || {};
    var reparti = d.reparti || {};
    var products = (d.products || []).filter(function (p) { return p && (has(p.name) || has(p.img) || has(p.href)); });
    var rows = headerRows(d, true);

    // ✏️ BANNER (a tutta larghezza)
    if (has(banner.src)) {
      var bimg = '<img src="' + esc(banner.src.trim()) + '" width="600" alt="' + esc(banner.alt) + '" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;background:' + C.navy + ';' + font(BODY, 14, 20, 400, C.white) + '">';
      rows.push('<!-- ✏️ BANNER -->',
        '<tr><td bgcolor="' + C.navy + '" style="background:' + C.navy + ';">' +
        (has(banner.href) ? '<a href="' + link(banner.href) + '" target="_blank" style="text-decoration:none;">' + bimg + '</a>' : bimg) +
        '</td></tr>');
    }

    // ✏️ TITOLO + TESTO + PULSANTE
    var intro = [];
    if (has(d.eyebrow)) intro.push('<p style="margin:0 0 14px;">' + tag(d.eyebrow, 12) + '</p>');
    if (has(d.title)) intro.push('<h1 class="gm-h1" style="margin:0;' + font(HEAD, 30, 36, 700, C.navy) + 'letter-spacing:-0.01em;">' + esc(d.title) + '</h1>');
    if (has(d.text)) intro.push(paragraphs(d.text, font(BODY, 16, 25, 400, C.text)));
    if (has(cta.label)) intro.push('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:24px;">' + button(cta.label, cta.href) + '</td></tr></table>');
    if (intro.length) {
      rows.push('<!-- ✏️ TITOLO E TESTO -->',
        '<tr><td class="gm-px" style="padding:34px 36px 4px;text-align:left;">\n' + intro.join('\n') + '\n</td></tr>');
    }

    // ✏️ REPARTI
    var rep = parseLines(reparti.list);
    if (rep.length) {
      rows.push('<!-- ✏️ REPARTI -->');
      if (has(reparti.title)) rows.push(sectionTitle(reparti.title, 34));
      else rows.push(spacer(28));
      rows.push('<tr><td class="gm-pad" style="padding:0 13px;">\n' + tiles(rep) + '\n</td></tr>');
    }

    // ✏️ PRODOTTI
    if (products.length) {
      rows.push('<!-- ✏️ PRODOTTI: ogni scheda va da «▼ PRODOTTO n ▼» a «▲ PRODOTTO n ▲» -->');
      if (has(d.productsTitle)) rows.push(sectionTitle(d.productsTitle, rep.length ? 24 : 40));
      else rows.push(spacer(28));
      rows.push('<tr><td class="gm-pad" style="padding:0 11px 6px;">\n' + grid(products, d, o) + '\n</td></tr>');
    }

    // ✏️ CHIUSURA
    var end = [];
    if (has(outro.title)) end.push('<h2 style="margin:0;' + font(HEAD, 21, 28, 600, C.navy) + '">' + esc(outro.title) + '</h2>');
    if (has(outro.text)) end.push(paragraphs(outro.text, font(BODY, 15, 24, 400, C.text)));
    if (has(outro.label)) end.push('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:20px;">' + button(outro.label, outro.href, { dark: true }) + '</td></tr></table>');
    if (end.length) {
      rows.push('<!-- ✏️ CHIUSURA -->',
        '<tr><td class="gm-px" style="padding:22px 36px 6px;text-align:left;">\n' + end.join('\n') + '\n</td></tr>');
    }

    rows.push.apply(rows, footerRows(d, o, true));

    var preheader = has(d.preheader)
      ? '<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:' + C.surface + ';">' + esc(d.preheader) + new Array(60).join('&#847;&zwnj;&nbsp;') + '</div>'
      : '';

    return [
      '<!DOCTYPE html>',
      '<html lang="it" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">',
      '<head>',
      '<!--',
      '  NEWSLETTER GENOVESE MATERIALE ELETTRICO · Shopify Messaging › Code your own',
      '  Le parti modificabili sono segnate con ✏️. Ogni prodotto va da «▼ PRODOTTO n ▼» a «▲ PRODOTTO n ▲».',
      '  I prezzi nei tag Liquid (all_products) li legge Shopify al momento dell\'invio: non toccarli.',
      '  Più comodo: modificare con l\'editor newsletter e incollare qui il codice generato.',
      '-->',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
      '<meta name="x-apple-disable-message-reformatting">',
      '<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">',
      '<meta name="color-scheme" content="light">',
      '<meta name="supported-color-schemes" content="light">',
      '<title>' + esc(has(d.title) ? d.title : 'Genovese Materiale Elettrico') + '</title>',
      '<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->',
      '<!--[if mso]><style>body,table,td,p,a,span,h1,h2{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">',
      '<style>',
      '  :root { color-scheme: light; supported-color-schemes: light; }',
      '  body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }',
      '  table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }',
      '  img { -ms-interpolation-mode: bicubic; }',
      '  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }',
      '  @media screen and (max-width: 620px) {',
      '    .gm-wrap { width: 100% !important; }',
      '    .gm-px { padding-left: 20px !important; padding-right: 20px !important; }',
      '    .gm-pad { padding-left: 8px !important; padding-right: 8px !important; }',
      '    .gm-card { max-width: 50% !important; }',
      '    .gm-card-pad { padding: 0 4px 8px !important; }',
      '    .gm-card-in { padding: 8px !important; }',
      '    .gm-tile { max-width: 50% !important; }',
      '    .gm-vant { max-width: 50% !important; }',
      '    .gm-h1 { font-size: 25px !important; line-height: 31px !important; }',
      '    .gm-vendor { font-size: 10px !important; letter-spacing: 0 !important; }',
      '    .gm-nav { font-size: 12px !important; }',
      '  }',
      '</style>',
      '</head>',
      '<body id="body" style="margin:0;padding:0;width:100%;background:' + C.surface + ';">',
      '<!-- ✏️ PREHEADER (testo di anteprima nella casella) -->',
      preheader,
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + C.surface + '" style="background:' + C.surface + ';">',
      '<tr><td align="center" style="padding:16px 8px 32px;">',
      '<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->',
      '<table role="presentation" class="gm-wrap" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="' + C.white + '" style="width:100%;max-width:600px;border-collapse:separate;background:' + C.white + ';border-radius:14px;">',
      rows.join('\n'),
      '</table>',
      '<!--[if mso]></td></tr></table><![endif]-->',
      '</td></tr>',
      '</table>',
      o.preview ? '' : MS.openTracking,
      '</body>',
      '</html>'
    ].join('\n');
  }

  // Barra arancione e testata navy col logo. `round`: angoli arrotondati in alto (mail intera).
  function headerRows(d, round) {
    var b = d.brand || {};
    var logoW = Math.max(100, Math.min(260, parseInt(b.logoWidth, 10) || 200));
    var rows = [];
    // ✏️ BARRA ANNUNCIO (arancione)
    if (has(d.topbar)) {
      rows.push('<!-- ✏️ BARRA ANNUNCIO -->',
        '<tr><td align="center" bgcolor="' + C.accent + '" class="gm-px" style="padding:10px 24px;' + (round ? 'border-radius:14px 14px 0 0;' : '') + 'background:' + C.accent + ';' + font(HEAD, 13, 18, 600, C.navy) + '">' + esc(d.topbar) + '</td></tr>');
    }
    // TESTATA (navy, logo e reparti)
    var navLinks = parseLines(d.nav).map(function (l) {
      return '<a href="' + link(l.url) + '" target="_blank" style="color:' + C.white + ';text-decoration:none;">' + esc(l.label) + '</a>';
    }).join(' &nbsp;<span style="color:' + C.accent + ';">·</span>&nbsp; ');
    rows.push('<!-- TESTATA -->',
      '<tr><td align="center" bgcolor="' + C.navy + '" style="padding:22px 24px ' + (navLinks ? 16 : 22) + 'px;background:' + C.navy + ';' + (round && !has(d.topbar) ? 'border-radius:14px 14px 0 0;' : '') + '">' +
      '<a href="' + link(b.site) + '" target="_blank" style="text-decoration:none;">' +
      (has(b.logo)
        ? '<img src="' + esc(b.logo.trim()) + '" width="' + logoW + '" alt="Genovese materiale elettrico" style="display:block;width:' + logoW + 'px;max-width:' + logoW + 'px;height:auto;border:0;outline:none;' + font(HEAD, 22, 28, 700, C.white) + '">'
        : '<span style="' + font(HEAD, 24, 30, 700, C.white) + '">GENOVESE</span>') +
      '</a>' +
      (navLinks ? '<p class="gm-nav" style="margin:14px 0 0;' + font(BODY, 13, 18, 500, C.white) + '">' + navLinks + '</p>' : '') +
      '</td></tr>');
    return rows;
  }

  // Barra vantaggi e piè di pagina navy. o.noUnsubscribe: senza disiscrizione (sezione per le
  // automazioni, dove la mette il piè di pagina di Messaging).
  function footerRows(d, o, round) {
    var b = d.brand || {};
    var unsubscribe = o.preview ? '#' : MS.unsubscribe;
    var rows = [];
    // VANTAGGI
    if (d.vantaggi !== false) {
      var cells = VANTAGGI.map(function (v) {
        return '<!--[if mso]><td width="141" valign="top" style="width:141px;"><![endif]-->' +
          '<div class="gm-vant" style="display:inline-block;width:100%;max-width:141px;vertical-align:top;">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:8px 6px;text-align:center;">' +
          '<p style="margin:0;' + font(HEAD, 14, 18, 600, C.navy) + '"><span style="color:' + C.accent + ';">&#10003;</span>&nbsp;' + esc(v[0]) + '</p>' +
          '<p style="margin:2px 0 0;' + font(BODY, 13, 18, 400, C.text) + '">' + esc(v[1]) + '</p>' +
          '</td></tr></table></div><!--[if mso]></td><![endif]-->';
      }).join('\n');
      rows.push('<!-- VANTAGGI -->',
        '<tr><td class="gm-pad" style="padding:30px 18px 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-radius:14px;background:' + C.surface + ';"><tr><td style="padding:14px 0;">' +
        '<div style="font-size:0;line-height:0;text-align:center;"><!--[if mso]><table role="presentation" width="564" align="center" cellpadding="0" cellspacing="0" border="0"><tr><![endif]-->\n' +
        cells + '\n<!--[if mso]></tr></table><![endif]--></div></td></tr></table></td></tr>');
    }
    rows.push(spacer(30));

    // PIÈ DI PAGINA (navy)
    var dot = ' &nbsp;<span style="color:' + C.accent + ';">·</span>&nbsp; ';
    var contact = [];
    if (has(b.phone)) contact.push('<a href="tel:' + esc(String(b.phone).replace(/\s/g, '')) + '" style="color:' + C.white + ';text-decoration:none;">' + esc(b.phone) + '</a>');
    if (has(b.whatsapp)) contact.push('<a href="' + link(b.whatsapp) + '" target="_blank" style="color:' + C.white + ';text-decoration:none;">WhatsApp</a>');
    if (has(b.email)) contact.push('<a href="mailto:' + esc(b.email.trim()) + '" style="color:' + C.white + ';text-decoration:none;">' + esc(b.email) + '</a>');
    var social = parseLines(b.social).map(function (l) {
      return '<a href="' + link(l.url) + '" target="_blank" style="color:' + C.accent + ';text-decoration:none;font-weight:600;">' + esc(l.label) + '</a>';
    }).join(dot);
    var links = parseLines(b.footerLinks).map(function (l) {
      return '<a href="' + link(l.url) + '" target="_blank" style="color:' + C.onNavy + ';text-decoration:underline;">' + esc(l.label) + '</a>';
    }).join('&nbsp;&nbsp; ');
    var foot = [];
    if (contact.length) foot.push('<p style="margin:0;' + font(BODY, 14, 22, 500, C.white) + '">' + contact.join(dot) + '</p>');
    if (social) foot.push('<p style="margin:12px 0 0;' + font(BODY, 13, 20, 400, C.white) + '">' + social + '</p>');
    if (links) foot.push('<p style="margin:16px 0 0;' + font(BODY, 12, 20, 400, C.onNavy) + '">' + links + '</p>');
    if (has(b.legal)) foot.push('<p style="margin:16px 0 0;' + font(BODY, 11, 17, 400, C.onNavy) + '">' + esc(b.legal) + '</p>');
    foot.push('<p style="margin:10px 0 0;' + font(BODY, 11, 17, 400, C.onNavy) + '">' + (has(b.footerNote) ? esc(b.footerNote) : '') +
      (o.noUnsubscribe ? '' : (has(b.footerNote) ? '<br>' : '') + '<a href="' + unsubscribe + '" target="_blank" style="color:' + C.white + ';text-decoration:underline;">Annulla l\'iscrizione</a>') + '</p>');
    rows.push('<!-- PIÈ DI PAGINA -->',
      '<tr><td align="center" bgcolor="' + C.navy + '" class="gm-px" style="padding:28px 36px 30px;' + (round ? 'border-radius:0 0 14px 14px;' : '') + 'background:' + C.navy + ';text-align:center;">\n' + foot.join('\n') + '\n</td></tr>');
    return rows;
  }

  // Sezioni Liquid personalizzate per le automazioni di Messaging (max 50 KB ciascuna):
  // testata (barra e logo) e piè di pagina (vantaggi e contatti, senza disiscrizione).
  function buildSections(d) {
    d = d || DEFAULTS;
    function wrap(rows) {
      return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">\n' + rows.join('\n') + '\n</table>';
    }
    return {
      testata: wrap(headerRows(d, false)),
      piede: wrap(footerRows(d, { noUnsubscribe: true }, false))
    };
  }

  var api = {
    build: buildEmail, sections: buildSections, defaults: DEFAULTS, fmtPrice: fmtPrice, discount: discount,
    productImage: productImage, toNumber: toNumber, site: SITE, files: FILES, messaging: MS
  };
  root.GM_EMAIL = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
