(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    activeSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });

    heroDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeSlide);
    });
  }

  function startHero() {
    if (heroSlides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);

      if (heroTimer) {
        window.clearInterval(heroTimer);
        startHero();
      }
    });
  });

  showSlide(0);
  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.global-search-input'));

  function renderSearch(input) {
    var form = input.closest('.nav-search');
    var panel = form ? form.querySelector('.search-panel') : null;
    var keyword = input.value.trim().toLowerCase();
    var data = window.SEARCH_MOVIES || [];

    if (!panel) {
      return;
    }

    if (!keyword) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }

    var matches = data.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.tags].join(' ').toLowerCase();
      return text.indexOf(keyword) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      panel.innerHTML = '<div class="search-result-item"><div></div><div><strong>未找到匹配影片</strong><span>换一个片名或类型试试</span></div></div>';
      panel.classList.add('open');
      return;
    }

    panel.innerHTML = matches.map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.href + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy">',
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
    panel.classList.add('open');
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input);
    });

    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch(input);
      });
    }
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.nav-search')) {
      document.querySelectorAll('.search-panel').forEach(function (panel) {
        panel.classList.remove('open');
      });
    }
  });

  var filterRoot = document.querySelector('[data-filterable="true"]');
  if (filterRoot) {
    var filterInput = document.querySelector('.local-filter-input');
    var regionSelect = document.querySelector('.region-filter');
    var typeSelect = document.querySelector('.type-filter');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.js-filter-card'));

    function applyLocalFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var regionOk = !region || card.getAttribute('data-region') === region;
        var typeOk = !type || card.getAttribute('data-type') === type;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !(regionOk && typeOk && keywordOk));
      });
    }

    [filterInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyLocalFilter);
        control.addEventListener('change', applyLocalFilter);
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
