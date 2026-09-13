(function () {
  /* the map's terrain and names surface once the panel is a third on stage */
  var jm = document.querySelector('.jm'); if (!jm) return;
  var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { jm.classList.add('is-in'); obs.disconnect(); } }); }, { threshold: .25 });
  obs.observe(jm);
})();
