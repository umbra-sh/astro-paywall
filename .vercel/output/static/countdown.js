// Based on https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
function initializePromoClock(selector) {
  function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      total: t,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  var clock = document.querySelector(selector);
  if (!clock) {
    return;
  }

  var dataEpoch = clock.dataset.epoch;
  if (typeof dataEpoch === 'undefined') {
    console.error('data-epoch attribute is not defined on ' + selector);
    return;
  }

  var deadlineEpoch = Number(dataEpoch);
  var deadline = new Date(deadlineEpoch);
  var days = clock.querySelector('.days');
  var hours = clock.querySelector('.hours');
  var minutes = clock.querySelector('.minutes');
  var seconds = clock.querySelector('.seconds');

  function zeroPad(num) {
    return ('0' + num).slice(-2);
  }

  function updateClock() {
    var t = getTimeRemaining(deadline);

    if (days) days.textContent = String(t.days);
    if (hours) hours.textContent = zeroPad(t.hours);
    if (minutes) minutes.textContent = zeroPad(t.minutes);
    if (seconds) seconds.textContent = zeroPad(t.seconds);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}
