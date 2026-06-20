(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function goSearch(value) {
        var q = (value || '').trim();
        var root = location.pathname.indexOf('/movies/') !== -1 || location.pathname.indexOf('/categories/') !== -1 ? '../' : './';
        location.href = root + 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    }

    ready(function() {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function() {
                mobileNav.classList.toggle('open');
            });
        }

        var globalInput = document.querySelector('[data-global-search]');
        var globalButton = document.querySelector('[data-global-search-button]');
        if (globalInput) {
            globalInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    goSearch(globalInput.value);
                }
            });
        }
        if (globalButton && globalInput) {
            globalButton.addEventListener('click', function() {
                goSearch(globalInput.value);
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length) {
            var current = 0;
            var show = function(index) {
                current = index;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            };
            dots.forEach(function(dot, i) {
                dot.addEventListener('click', function() {
                    show(i);
                });
            });
            setInterval(function() {
                show((current + 1) % slides.length);
            }, 6200);
        }

        var searchInput = document.querySelector('[data-search-input]');
        var categoryFilter = document.querySelector('[data-category-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        if (searchInput && cards.length) {
            var params = new URLSearchParams(location.search);
            var q = params.get('q') || '';
            searchInput.value = q;
            var apply = function() {
                var text = searchInput.value.trim().toLowerCase();
                var category = categoryFilter ? categoryFilter.value : '';
                var year = yearFilter ? yearFilter.value : '';
                cards.forEach(function(card) {
                    var pool = (card.getAttribute('data-keywords') || '').toLowerCase();
                    var okText = !text || pool.indexOf(text) !== -1;
                    var okCategory = !category || card.getAttribute('data-category') === category;
                    var okYear = !year || card.getAttribute('data-year') === year;
                    card.classList.toggle('hidden', !(okText && okCategory && okYear));
                });
            };
            searchInput.addEventListener('input', apply);
            if (categoryFilter) {
                categoryFilter.addEventListener('change', apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }
            apply();
        }
    });
})();

function setupPlayer(videoId, playId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !streamUrl) {
        return;
    }

    var prepared = false;
    var hlsInstance = null;

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        prepare();
        if (cover) {
            cover.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function() {
        if (cover) {
            cover.classList.add('hidden');
        }
    });
}
