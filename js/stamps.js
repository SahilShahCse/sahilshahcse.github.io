(function () {
  /* stamps are pressed into the album one after another as the section arrives */
  var st = document.querySelector('.st'); if (!st) return;
  st.querySelectorAll('.st__stamp').forEach(function (el, i) { el.style.setProperty('--in', (i * .07) + 's'); });
})();
