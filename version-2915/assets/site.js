(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.getElementById("navToggle");
    var mobileNav = document.getElementById("mobileNav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var filterPage = document.querySelector("[data-filter-page]");
    if (filterPage) {
      var filters = Array.prototype.slice.call(filterPage.querySelectorAll(".js-filter"));
      var cards = Array.prototype.slice.call(filterPage.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      var queryInput = filterPage.querySelector(".js-filter[data-filter='query']");

      if (queryInput && queryValue) {
        queryInput.value = queryValue;
      }

      var apply = function () {
        var query = normalize(queryInput ? queryInput.value : "");
        var typeSelect = filterPage.querySelector(".js-filter[data-filter='type']");
        var yearSelect = filterPage.querySelector(".js-filter[data-filter='year']");
        var type = typeSelect ? typeSelect.value : "全部";
        var year = yearSelect ? yearSelect.value : "全部";

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okType = type === "全部" || card.getAttribute("data-type") === type;
          var okYear = year === "全部" || card.getAttribute("data-year") === year;
          card.classList.toggle("is-hidden", !(okQuery && okType && okYear));
        });
      };

      filters.forEach(function (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      apply();
    }
  });
})();
