// Motion and flow layer for jamaulford.com
(function () {
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isHome = body.classList.contains('home');

  // Split each headline into lines that slide up one after another
  document.querySelectorAll('main h1').forEach(function (h1) {
    var parts = h1.innerHTML.split(/<br\s*\/?>/i);
    h1.innerHTML = parts.map(function (p, i) {
      return '<span class="line"><span style="--i:' + i + '">' + p.trim() + '</span></span>';
    }).join('');
  });

  // Home: group rows into a tile grid and add the scroll cue
  if (isHome) {
    document.querySelectorAll('main section').forEach(function (sec) {
      var rows = sec.querySelectorAll(':scope > .row');
      if (!rows.length) return;
      var grid = document.createElement('div');
      grid.className = 'tiles';
      rows[0].before(grid);
      rows.forEach(function (r) { grid.appendChild(r); });
    });
    var hero = document.querySelector('.hero');
    if (hero) {
      var cue = document.createElement('a');
      cue.href = '#what'; cue.className = 'scroll-cue'; cue.setAttribute('aria-label', 'Scroll down');
      hero.appendChild(cue);
      var first = document.querySelector('main section');
      if (first) first.id = 'what';
    }
  }

  // Endless ticker in the footer on every page
  var footer = document.querySelector('main > footer');
  if (footer) {
    var phrase = ['Find the bottleneck', 'Fix it with AI', 'Diagnose first', 'Systems scale'];
    var run = phrase.map(function (t) { return '<span>' + t + ' ✦</span>'; }).join('');
    var ticker = document.createElement('div');
    ticker.className = 'ticker'; ticker.setAttribute('aria-hidden', 'true');
    ticker.innerHTML = '<div class="track">' + run + run + run + run + '</div>';
    footer.appendChild(ticker);
  }

  // Fade content up as it scrolls into view
  var targets = document.querySelectorAll(
    'main section h2, main section > p, main section > ul, main section li, main .row, main > p, main > .cta, main .note'
  );
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) {
      // stagger siblings so groups ripple in
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.tagName === el.tagName; });
      var idx = Math.min(sibs.indexOf(el), 6);
      el.style.setProperty('--d', (idx * 0.09) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Scroll effects: spinning logo sticker, header backdrop, hero parallax
  var header = document.querySelector('header.site');
  var logo = header && header.querySelector('img');
  var heroEl = document.querySelector('body.home .hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (!reduce) {
      if (logo) logo.style.transform = 'rotate(' + (y * 0.12).toFixed(1) + 'deg)';
      if (heroEl) heroEl.style.setProperty('--parallax', (y * 0.35).toFixed(0) + 'px');
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Hero dots follow the mouse a little
  if (heroEl && !reduce && window.matchMedia('(pointer: fine)').matches) {
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var x = 50 + ((e.clientX - r.left) / r.width - 0.5) * 30;
      var yy = 45 + ((e.clientY - r.top) / r.height - 0.5) * 30;
      heroEl.style.setProperty('--mx', x.toFixed(1) + '%');
      heroEl.style.setProperty('--my', yy.toFixed(1) + '%');
    });
  }

  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('ready'); }); });
})();
