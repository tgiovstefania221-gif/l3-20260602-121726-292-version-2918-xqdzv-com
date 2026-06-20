(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function markBrokenImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("cover-fallback");
        img.removeAttribute("src");
        img.setAttribute("alt", img.getAttribute("alt") || "影片封面");
      });
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var prefix = form.getAttribute("data-prefix") || "";
        if (query) {
          window.location.href = prefix + "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupCardFilters() {
    var input = document.querySelector("[data-filter-input]");
    var sort = document.querySelector("[data-sort-select]");
    var type = document.querySelector("[data-type-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var noResults = document.querySelector("[data-no-results]");

    if (!input && !sort && !type) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "all";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = typeValue === "all" || cardType === typeValue;
        var show = matchesQuery && matchesType;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (sort) {
        var grid = document.querySelector("[data-card-grid]");
        var shownCards = cards.filter(function (card) {
          return card.style.display !== "none";
        });
        shownCards.sort(function (a, b) {
          if (sort.value === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (sort.value === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
        shownCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (noResults) {
        noResults.style.display = visible === 0 ? "block" : "none";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }

    apply();
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    var input = document.querySelector("[data-filter-input]");
    if (!page || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
      var title = document.querySelector("[data-search-title]");
      if (title) {
        title.textContent = "搜索：" + query;
      }
      input.dispatchEvent(new Event("input"));
    }
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function setupPlayers() {
    document.querySelectorAll("[data-video-player]").forEach(function (video) {
      var source = video.getAttribute("data-src");
      var shell = video.closest(".video-shell");
      var overlay = shell ? shell.querySelector(".play-overlay") : null;

      function start() {
        if (!source) {
          return;
        }

        if (overlay) {
          overlay.classList.add("hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        loadHlsLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        });
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  ready(function () {
    markBrokenImages();
    setupMobileMenu();
    setupSearchForms();
    setupSearchPage();
    setupCardFilters();
    setupPlayers();
  });
})();
