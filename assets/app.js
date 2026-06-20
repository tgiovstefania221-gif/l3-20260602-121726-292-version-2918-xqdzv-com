(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileMenu() {
    var toggle = $("[data-menu-toggle]");
    var panel = $("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $$("[data-hero-slide]", hero);
    var bgs = $$("[data-hero-bg]", hero);
    var dots = $$("[data-hero-dot]", hero);
    var poster = $("[data-hero-poster]", hero);
    var stackTitle = $("[data-hero-stack-title]", hero);
    var stackText = $("[data-hero-stack-text]", hero);
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      bgs.forEach(function (bg, i) {
        bg.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      var active = slides[index];
      if (poster && active) {
        poster.src = active.getAttribute("data-image") || poster.src;
        poster.alt = active.getAttribute("data-title") || poster.alt;
      }
      if (stackTitle && active) {
        stackTitle.textContent = active.getAttribute("data-title") || "";
      }
      if (stackText && active) {
        stackText.textContent = active.getAttribute("data-line") || "";
      }
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var panels = $$("[data-filter-panel]");
    panels.forEach(function (panel) {
      var input = $("[data-filter-input]", panel);
      var buttons = $$("[data-filter]", panel);
      var scopeSelector = panel.getAttribute("data-filter-scope");
      var scope = scopeSelector ? $(scopeSelector) : document;
      var cards = scope ? $$("[data-card]", scope) : [];
      var active = "all";

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchText = !term || text.indexOf(term) !== -1;
          var matchFilter = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
          card.classList.toggle("hidden-card", !(matchText && matchFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          active = button.getAttribute("data-filter") || "all";
          apply();
        });
      });
    });
  }

  function cardHTML(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"" + escapeHTML(item.url) + "\" aria-label=\"" + escapeHTML(item.title) + "\">" +
      "<img src=\"" + escapeHTML(item.image) + "\" alt=\"" + escapeHTML(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-score\">" + escapeHTML(item.rating) + "</span>" +
      "<span class=\"poster-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
      "<div class=\"movie-meta-row\"><span>" + escapeHTML(item.year) + "</span><span>" + escapeHTML(item.region) + "</span><span>" + escapeHTML(item.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHTML(item.url) + "\">" + escapeHTML(item.title) + "</a></h3>" +
      "<p>" + escapeHTML(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var page = $("[data-search-page]");
    if (!page || !window.searchIndex) {
      return;
    }
    var form = $("[data-search-form]", page);
    var input = $("[data-search-input]", page);
    var results = $("[data-search-results]", page);
    var empty = $("[data-empty]", page);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var term = input.value.trim().toLowerCase();
      var list = window.searchIndex.filter(function (item) {
        if (!term) {
          return true;
        }
        return item.search.toLowerCase().indexOf(term) !== -1;
      }).slice(0, 240);
      results.innerHTML = list.map(cardHTML).join("");
      empty.classList.toggle("active", list.length === 0);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      window.history.replaceState(null, "", url);
      render();
    });

    input.addEventListener("input", render);
    render();
  }

  function initPlayer(source) {
    var box = $("[data-video-box]");
    if (!box) {
      return;
    }
    var video = $("video", box);
    var button = $("[data-player-start]", box);
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      box.classList.add("is-playing");
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    box.addEventListener("click", function (event) {
      if (!attached && (event.target === box || event.target === video)) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
