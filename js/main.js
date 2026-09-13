(function () {
  /* the curtain plays once per visit, never on a return within the session */
  var curtain = document.querySelector('.curtain');
  if (curtain) {
    var seen = false; try { seen = sessionStorage.getItem('curtain') === '1'; } catch (e) {}
    if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { curtain.classList.add('is-off'); }
    else { document.documentElement.classList.add('has-curtain'); try { sessionStorage.setItem('curtain', '1'); } catch (e) {} curtain.addEventListener('animationend', function (e) { if (e.animationName === 'curtain-lift') curtain.classList.add('is-off'); }); }
  }

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* every .ribbon becomes a drawn scroll: curved band, folded tails, text riding the curve */
  var n = 0;
  document.querySelectorAll('.ribbon').forEach(function (el) {
    var label = el.textContent.trim(); if (!label) return;
    var big = el.classList.contains('ribbon--btn');
    var cw = big ? 13 : 12.5, w = Math.max(140, Math.round(label.length * cw + (big ? 78 : 96))), h = 60, id = 'rb' + (n++);
    var L = 36, R = w - 36;
    var band = 'M' + L + ',13 Q' + (w / 2) + ',1 ' + R + ',13 L' + R + ',46 Q' + (w / 2) + ',34 ' + L + ',46 Z';
    var tailL = 'M' + L + ',21 L6,27 L15,39 L6,54 L' + L + ',54 Z';
    var tailR = 'M' + R + ',21 L' + (w - 6) + ',27 L' + (w - 15) + ',39 L' + (w - 6) + ',54 L' + R + ',54 Z';
    var foldL = 'M' + L + ',46 L' + L + ',54 L' + (L + 10) + ',50 Z', foldR = 'M' + R + ',46 L' + R + ',54 L' + (R - 10) + ',50 Z';
    var path = 'M' + (L + 6) + ',35 Q' + (w / 2) + ',23 ' + (R - 6) + ',35';
    el.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><path class="tail" d="' + tailL + '"/><path class="tail" d="' + tailR + '"/><path class="fold" d="' + foldL + '"/><path class="fold" d="' + foldR + '"/><path class="band" d="' + band + '"/><defs><path id="' + id + '" d="' + path + '"/></defs><text textLength="' + (R - L - 18) + '" lengthAdjust="spacingAndGlyphs"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">' + label.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</textPath></text></svg>';
    el.setAttribute('aria-label', label);
  });

  /* the numbers on the sheet count up once */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'); if (reduceMotion) { el.textContent = end; return; }
    var t0 = performance.now() + 500, dur = 1100;
    (function tick(t) { var p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(tick); })(t0);
  });

  /* case sheets unfold under each piece */
  document.querySelectorAll('.more--btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sheet = btn.nextElementSibling, open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open)); sheet.hidden = open;
      btn.innerHTML = open ? 'Read the case &darr;' : 'Fold it away &uarr;';
    });
  });

  /* copy the address */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy'), done = function () { btn.classList.add('is-done'); btn.textContent = 'Copied'; setTimeout(function () { btn.classList.remove('is-done'); btn.textContent = 'Copy the address'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
  });

  /* nav tightens once the spread is behind the reader */
  var nav = document.querySelector('.nav'), spreadEl = document.querySelector('.spread');
  if (nav && spreadEl) addEventListener('scroll', function () { nav.classList.toggle('is-tight', scrollY > spreadEl.offsetHeight * .6); }, { passive: true });

  /* nav marks the section in view */
  var links = {}; document.querySelectorAll('[data-nav]').forEach(function (a) { links[a.getAttribute('data-nav')] = a; });
  var secObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-on', k === e.target.id); }); } }); }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { secObs.observe(s); });

  /* split headings into letters */
  document.querySelectorAll('.split').forEach(function (el) {
    var t = el.textContent; el.textContent = '';
    t.split('').forEach(function (ch, i) { var sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.transitionDelay = (i * 35) + 'ms'; el.appendChild(sp); });
  });

  /* scenes enter when a third of them is on stage */
  var sceneObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); sceneObs.unobserve(e.target); } }); }, { threshold: .3 });
  document.querySelectorAll((matchMedia('(min-width: 1100px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : '.piece, ') + '.sec__lede, .close, .st').forEach(function (el) { sceneObs.observe(el); });

  /* the paper plane: follows the route as the reader scrolls, smoothed frame by frame, and wakes each scene as it passes */
  var route = document.querySelector('.flight__route'), trail = document.querySelector('.flight__trail'), plane = document.querySelector('.plane'), stage = document.querySelector('.showcase');
  var flying = route && plane && stage && matchMedia('(min-width: 1100px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (flying) {
    var pieces = Array.prototype.slice.call(stage.querySelectorAll('.piece')), total = route.getTotalLength(), cur = 0, target = 0, W = 0, H = 0, lastAngle = 0;
    function size() { var r = stage.getBoundingClientRect(); W = r.width; H = r.height; }
    size(); addEventListener('resize', size);
    function pt(t) { var q = route.getPointAtLength(t * total); return { x: q.x / 100 * W, y: q.y / 100 * H }; }
    function want() { var r = stage.getBoundingClientRect(); target = Math.min(1, Math.max(0, (innerHeight * .55 - r.top) / r.height)); }
    addEventListener('scroll', want, { passive: true }); want();
    (function frame(now) {
      cur += (target - cur) * .075;
      var a = pt(cur), bpt = pt(Math.min(1, cur + .004)), ang = Math.atan2(bpt.y - a.y, bpt.x - a.x) * 180 / Math.PI;
      var bank = Math.max(-18, Math.min(18, (ang - lastAngle) * 6)); lastAngle = ang;
      var bob = Math.sin(now / 520) * 3;
      plane.style.transform = 'translate(' + a.x.toFixed(1) + 'px,' + (a.y + bob).toFixed(1) + 'px) rotate(' + ang.toFixed(2) + 'deg) skewY(' + bank.toFixed(2) + 'deg)';
      trail.style.strokeDashoffset = (1 - cur).toFixed(4);
      plane.classList.toggle('is-flying', target > .002);
      pieces.forEach(function (pc, i) { if (cur >= (i / pieces.length) - .02) pc.classList.add('is-in'); });
      requestAnimationFrame(frame);
    })(performance.now());
  }

  /* pieces rise in as they arrive */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.tcard').forEach(function (el) { el.classList.add('rise'); obs.observe(el); });
  document.querySelectorAll('.pattern').forEach(function (el) { obs.observe(el); });
  var headObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); headObs.unobserve(e.target); } }); }, { threshold: .5 });
  document.querySelectorAll('.sec h2, .band h2').forEach(function (h) { headObs.observe(h); });

  /* the cream ground under main starts halfway down the first band */
  var mainEl = document.querySelector('main'), band = document.querySelector('main > .band');
  var seam = function () { if (band) mainEl.style.setProperty('--seam', Math.round(band.offsetTop + band.offsetHeight / 2) + 'px'); };
  seam(); addEventListener('resize', seam); addEventListener('load', seam);

  /* the evidence board: red string between the pins, drawn once the board is in view */
  var tbl = document.querySelector('.table');
  if (tbl) {
    var string = tbl.querySelector('.ev__string'), pins = [].slice.call(tbl.querySelectorAll('.ev__ph .ev__pin'));
    var strings = function () {
      var r = tbl.getBoundingClientRect(), w = r.width, h = r.height, d = '';
      var pts = pins.map(function (pin) { var b = pin.getBoundingClientRect(); return [(b.left + b.width / 2 - r.left) / w * 1000, (b.top + b.height / 2 - r.top) / h * 760]; });
      [[0, 1], [1, 2], [2, 3], [1, 4], [3, 4], [0, 5], [5, 4]].forEach(function (pr) { var a = pts[pr[0]], b = pts[pr[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 26; d += '<path d="M' + a[0] + ' ' + a[1] + ' Q' + mx + ' ' + my + ' ' + b[0] + ' ' + b[1] + '"/>'; });
      string.innerHTML = d;
    };
    var delay = document.documentElement.classList.contains('has-curtain') ? 3200 : 1100;
    setTimeout(function () { strings(); tbl.classList.add('is-in'); }, delay);
    addEventListener('resize', strings);
  }

  /* the envelope: tap it and it opens in one motion; post the sheet and it folds back inside, the flap shuts, the postmark lands */
  var mail = document.querySelector('.mail');
  if (mail) {
    var reply = mail.querySelector('.mail__reply'), section = mail.closest('.close');
    var d = new Date(), months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    mail.querySelector('[data-postdate]').textContent = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    var openMail = function () {
      if (mail.classList.contains('is-open')) return;
      mail.classList.add('is-open'); section.classList.add('is-open'); mail.removeAttribute('role'); mail.removeAttribute('tabindex');
      setTimeout(function () { mail.classList.add('is-lifted'); section.classList.add('is-lifted'); }, 1050);
      setTimeout(function () { mail.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 1400);
    };
    mail.addEventListener('click', function (e) { if (!e.target.closest('.mail__reply, .mail__letter')) openMail(); });
    mail.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMail(); } });
    /* posting the sheet: the note is saved to the portfolio's message table (insert-only key); a trigger DMs Sahil on Slack */
    var POST_URL = 'https://dlciivohmpfqlqbazrrc.supabase.co/rest/v1/portfolio_messages';
    var POST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsY2lpdm9obXBmcWxxYmF6cnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MzQzNTksImV4cCI6MjEwMjUxMDM1OX0.e5xgHMwYhqSfV3ePW1-IyvliTioSYc_1Xn89RhJU61g';
    reply.addEventListener('submit', function (e) {
      e.preventDefault();
      if (mail.classList.contains('is-sending')) return;
      var name = reply.name.value.trim(), email = reply.email.value.trim(), body = reply.body.value.trim();
      var send = reply.querySelector('.reply__send'); send.disabled = true; send.textContent = 'POSTING…';
      fetch(POST_URL, { method: 'POST', headers: { apikey: POST_KEY, Authorization: 'Bearer ' + POST_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ name: name, email: email, body: body, user_agent: navigator.userAgent.slice(0, 200) }) })
        .then(function (r) { if (!r.ok) throw new Error('post ' + r.status); seal(); })
        .catch(function () {
          /* the table is unreachable: fall back to the reader's own mail app so the note still leaves */
          send.disabled = false; send.textContent = 'POST IT →';
          location.href = 'mailto:sahilshah.apps@gmail.com?subject=' + encodeURIComponent('A note from ' + name) + '&body=' + encodeURIComponent('Dear Sahil,\n\n' + body + '\n\n' + name + '\n' + email);
        });
    });
    var seal = function () {
      mail.classList.remove('is-lifted'); section.classList.remove('is-lifted'); mail.classList.add('is-sending');
      setTimeout(function () { mail.classList.add('is-folding'); }, 900);
      setTimeout(function () { mail.classList.add('is-sent'); section.classList.add('is-sent'); }, 1600);
      setTimeout(function () { mail.classList.add('is-stamped'); }, 2350);
    };
  }

  /* ribbon buttons lean toward the pointer */
  if (matchMedia('(hover: hover)').matches) document.querySelectorAll('.ribbon--btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) { var r = btn.getBoundingClientRect(); btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 10 + 'px'); btn.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 8 + 'px'); });
    btn.addEventListener('mouseleave', function () { btn.style.removeProperty('--mx'); btn.style.removeProperty('--my'); });
  });
})();
