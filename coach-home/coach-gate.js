(function () {
  var PASSWORD = 'NinjaCoach';
  var STORAGE_KEY = 'coachHomeUnlocked';

  function isUnlocked() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function setUnlocked() {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {}
  }

  function lock() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {}
    window.location.reload();
  }

  function showProtectedContent() {
    document.documentElement.classList.remove('coach-gate-pending');
    document.body.classList.remove('coach-gate-locked');
    var gate = document.querySelector('.coach-gate-screen');
    if (gate) gate.remove();
    addLockLink();
  }

  function addLockLink() {
    var nav = document.querySelector('.coach-local-nav-inner');
    if (!nav || nav.querySelector('[data-coach-lock]')) return;

    var lockLink = document.createElement('button');
    lockLink.type = 'button';
    lockLink.className = 'coach-lock-link';
    lockLink.setAttribute('data-coach-lock', 'true');
    lockLink.textContent = 'Lock Coach Home';
    lockLink.addEventListener('click', lock);
    nav.appendChild(lockLink);
  }

  function renderGate() {
    document.body.classList.add('coach-gate-locked');

    var gate = document.createElement('section');
    gate.className = 'coach-gate-screen';
    gate.innerHTML = [
      '<div class="coach-gate-card">',
      '<p class="coach-eyebrow">Staff Access</p>',
      '<h1>The E5 Coach Home</h1>',
      '<p>Staff access only. Enter the coach password to continue.</p>',
      '<form class="coach-gate-form">',
      '<label for="coachGatePassword">Password</label>',
      '<input id="coachGatePassword" name="password" type="password" autocomplete="current-password" placeholder="Password">',
      '<button type="submit">Enter Coach Home</button>',
      '<p class="coach-gate-error" role="alert"></p>',
      '</form>',
      '</div>'
    ].join('');

    document.body.prepend(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var error = gate.querySelector('.coach-gate-error');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (input.value === PASSWORD) {
        setUnlocked();
        showProtectedContent();
      } else {
        error.textContent = 'Incorrect password. Try again.';
        input.value = '';
        input.focus();
      }
    });

    setTimeout(function () {
      input.focus();
    }, 0);
  }

  function init() {
    if (isUnlocked()) {
      showProtectedContent();
    } else {
      renderGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
