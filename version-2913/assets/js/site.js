(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
  var current = 0;
  var timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('is-active', tabIndex === current);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    timer = window.setInterval(function () {
      showHero(current + 1);
    }, 6200);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = Number(tab.getAttribute('data-hero-target'));
      window.clearInterval(timer);
      showHero(target);
      startHero();
    });
  });

  startHero();
})();
