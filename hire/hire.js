/* "Ask about this" picks the service in the form; the form opens the visitor's mail app with the note filled in.
   ?src= on the ad link (meta, google, linkedin...) rides along in the subject so every lead shows which ad brought it. */
(function () {
  var form = document.getElementById('quote-form');
  var src = new URLSearchParams(location.search).get('src') || 'direct';

  document.querySelectorAll('.card__ask').forEach(function (a) {
    a.addEventListener('click', function () { form.need.value = a.dataset.need; });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var subject = 'Quote request: ' + form.need.value + ' [' + src + ']';
    var body = form.body.value.trim() + '\n\n' + form.name.value.trim() + '\n' + form.contact.value.trim();
    location.href = 'mailto:sahilshah.apps@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    form.querySelector('.form__done').hidden = false;
  });
})();
