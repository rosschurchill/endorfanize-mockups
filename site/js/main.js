// Mobile menu toggle and the enquiry form, which opens a pre-filled email
// until a proper booking system replaces it.
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var form = document.querySelector('form.enquiry');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var type = data.get('type') || 'Event';
    var date = data.get('date') || 'date to be decided';
    var lines = [
      'Name: ' + (data.get('name') || ''),
      'Email or phone: ' + (data.get('contact') || ''),
      'Event: ' + type,
      'Date: ' + date,
      'Venue or town: ' + (data.get('venue') || ''),
      '',
      data.get('message') || ''
    ];
    var subject = 'Booking enquiry: ' + type + ', ' + date;
    window.location.href = 'mailto:' + form.dataset.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  });
});
