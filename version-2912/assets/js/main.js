
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroTitle = document.querySelector('[data-hero-title]');
  var heroDesc = document.querySelector('[data-hero-desc]');
  var heroLink = document.querySelector('[data-hero-link]');
  var heroTags = document.querySelector('[data-hero-tags]');
  var current = 0;

  function activateSlide(index) {
    if (!slides.length) {
      return;
    }

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    var slide = slides[index];

    if (heroTitle) {
      heroTitle.textContent = slide.getAttribute('data-title') || '';
    }

    if (heroDesc) {
      heroDesc.textContent = slide.getAttribute('data-desc') || '';
    }

    if (heroLink) {
      heroLink.setAttribute('href', slide.getAttribute('data-link') || '#');
    }

    if (heroTags) {
      heroTags.innerHTML = '';
      var tags = (slide.getAttribute('data-tags') || '').split('|').filter(Boolean);
      tags.forEach(function (tag) {
        var item = document.createElement('span');
        item.textContent = tag;
        heroTags.appendChild(item);
      });
    }
  }

  if (slides.length) {
    activateSlide(0);
    window.setInterval(function () {
      current = (current + 1) % slides.length;
      activateSlide(current);
    }, 5200);
  }

  var input = document.querySelector('.search-input');
  var year = document.querySelector('.year-filter');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var yearValue = year ? year.value : '';

    items.forEach(function (item) {
      var text = [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-year') || '',
        item.getAttribute('data-genre') || '',
        item.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
      var matchYear = !yearValue || item.getAttribute('data-year') === yearValue;
      item.style.display = matchKeyword && matchYear ? '' : 'none';
    });
  }

  if (input) {
    input.addEventListener('input', applyFilters);
  }

  if (year) {
    year.addEventListener('change', applyFilters);
  }
})();
