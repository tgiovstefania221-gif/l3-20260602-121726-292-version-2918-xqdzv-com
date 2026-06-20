(function () {
  var nav = document.querySelector('.top-nav');
  var toggle = document.querySelector('.menu-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  if (slides.length) {
    showSlide(0);
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('.empty-state');
  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && filterInput && !filterInput.value) {
      filterInput.value = q;
    }
  }
  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var cat = categorySelect ? categorySelect.value : '';
    var shown = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchTerm = !term || text.indexOf(term) >= 0;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchCat = !cat || card.getAttribute('data-category') === cat;
      var ok = matchTerm && matchYear && matchCat;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        shown += 1;
      }
    });
    if (empty) {
      empty.style.display = shown ? 'none' : 'block';
    }
  }
  readQuery();
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilter);
  }
  applyFilter();
})();
