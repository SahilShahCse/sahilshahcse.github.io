(function () {
  /* the poster wall: drag to scroll each strip, the screen leans away from the pointer, the focus switch blurs the scenes while the wall is on stage */
  var wall = document.querySelector('.work'); if (!wall) return;
  wall.querySelectorAll('.PosterWall-module__53wmDG__strip').forEach(function (strip) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft; strip.setPointerCapture(e.pointerId); });
    strip.addEventListener('pointermove', function (e) {
      if (down) { var dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = startLeft - dx; }
      var card = e.target.closest ? e.target.closest('.PosterWall-module__53wmDG__cCard') : null;
      if (card) { var r = card.getBoundingClientRect(); card.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * 2); card.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * 2); }
    });
    var up = function () { down = false; };
    strip.addEventListener('pointerup', up); strip.addEventListener('pointercancel', up);
    strip.addEventListener('pointerleave', function () { strip.querySelectorAll('.PosterWall-module__53wmDG__cCard').forEach(function (c) { c.style.removeProperty('--px'); c.style.removeProperty('--py'); }); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });
  var bar = wall.querySelector('.PosterWall-module__53wmDG__focusBar'), sw = wall.querySelector('.PosterWall-module__53wmDG__modeSwitch');
  if (sw) {
    var sides = sw.querySelectorAll('.PosterWall-module__53wmDG__modeSide');
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); sw.toggleAttribute('data-ui-focus', on); wall.toggleAttribute('data-focus', on);
      sides[0].toggleAttribute('data-active', !on); sides[1].toggleAttribute('data-active', on);
    });
    var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { bar.toggleAttribute('data-on', e.isIntersecting); }); }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });
    obs.observe(wall);
  }
})();
