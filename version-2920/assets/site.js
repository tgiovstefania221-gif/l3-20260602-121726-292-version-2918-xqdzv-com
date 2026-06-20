(function () {
    'use strict';

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function debounce(fn, wait) {
        var timeout = null;
        return function () {
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                fn.apply(null, args);
            }, wait);
        };
    }

    function initMobileNav() {
        var button = $('#mobileMenuButton');
        var nav = $('#mobileNav');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.hidden = !nav.hidden;
            button.textContent = nav.hidden ? '☰' : '×';
        });
    }

    function initHeroCarousel() {
        var slides = $all('[data-hero-slide]');
        var dots = $all('[data-hero-dot]');
        var prev = $('[data-hero-prev]');
        var next = $('[data-hero-next]');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                play();
            });
        });

        show(0);
        play();
    }

    function renderSearchResults(items, panel) {
        if (!items.length) {
            panel.innerHTML = '<p class="search-empty">没有找到匹配影片，请尝试更换关键词。</p>';
            panel.hidden = false;
            return;
        }

        panel.innerHTML = items.slice(0, 12).map(function (item) {
            return [
                '<a class="search-result" href="' + item.url + '">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy">',
                '<span>',
                '<strong>' + escapeHtml(item.title) + '</strong>',
                '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span>',
                '</span>',
                '</a>'
            ].join('');
        }).join('');
        panel.hidden = false;
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function searchMovies(keyword) {
        var query = String(keyword || '').trim().toLowerCase();
        var index = window.SEARCH_INDEX || [];

        if (!query) {
            return [];
        }

        return index.filter(function (item) {
            var haystack = [
                item.title,
                item.oneLine,
                item.genre,
                item.tags,
                item.year,
                item.region,
                item.type
            ].join(' ').toLowerCase();

            return haystack.indexOf(query) !== -1;
        });
    }

    function initGlobalSearch() {
        var input = $('#globalSearch');
        var panel = $('#globalSearchPanel');
        var homeInput = $('#homeSearchMirror');
        var homeButton = $('#homeSearchButton');

        if (!panel) {
            return;
        }

        function runSearch(value) {
            var results = searchMovies(value);
            renderSearchResults(results, panel);
        }

        if (input) {
            input.addEventListener('input', debounce(function () {
                var value = input.value.trim();
                if (!value) {
                    panel.hidden = true;
                    panel.innerHTML = '';
                    return;
                }
                runSearch(value);
            }, 120));

            input.addEventListener('focus', function () {
                if (input.value.trim()) {
                    runSearch(input.value);
                }
            });
        }

        if (homeInput) {
            homeInput.addEventListener('input', debounce(function () {
                var value = homeInput.value.trim();
                if (input) {
                    input.value = value;
                }
                if (!value) {
                    panel.hidden = true;
                    panel.innerHTML = '';
                    return;
                }
                runSearch(value);
            }, 120));
        }

        if (homeButton && homeInput) {
            homeButton.addEventListener('click', function () {
                runSearch(homeInput.value);
            });
        }

        document.addEventListener('click', function (event) {
            var isSearch = event.target.closest('.global-search') || event.target.closest('.large-search') || event.target.closest('.search-panel');
            if (!isSearch) {
                panel.hidden = true;
            }
        });
    }

    function initLocalFilters() {
        var cards = $all('.js-movie-card');
        var keyword = $('#pageKeyword');
        var year = $('#yearFilter');
        var type = $('#typeFilter');
        var genre = $('#genreFilter');
        var count = $('#filterCount');

        if (!cards.length || !keyword || !year || !type) {
            return;
        }

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                if (!value) {
                    return;
                }
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function uniqueValues(name) {
            var values = cards.map(function (card) {
                return card.dataset[name] || '';
            }).filter(Boolean);
            return Array.from(new Set(values)).sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-CN');
            });
        }

        fillSelect(year, uniqueValues('year'));
        fillSelect(type, uniqueValues('type'));
        fillSelect(genre, uniqueValues('genre'));

        function applyFilters() {
            var query = keyword.value.trim().toLowerCase();
            var selectedYear = year.value;
            var selectedType = type.value;
            var selectedGenre = genre ? genre.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year
                ].join(' ').toLowerCase();
                var match = true;

                if (query && haystack.indexOf(query) === -1) {
                    match = false;
                }
                if (selectedYear && card.dataset.year !== selectedYear) {
                    match = false;
                }
                if (selectedType && card.dataset.type !== selectedType) {
                    match = false;
                }
                if (selectedGenre && card.dataset.genre !== selectedGenre) {
                    match = false;
                }

                card.classList.toggle('is-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' / ' + cards.length;
            }
        }

        [keyword, year, type, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function initPlayers() {
        $all('[data-player]').forEach(function (shell) {
            var video = $('video', shell);
            var button = $('.play-now', shell);
            var overlay = $('.player-overlay', shell);
            var error = $('.player-error', shell);
            var src = shell.dataset.src;
            var hlsInstance = null;

            if (!video || !button || !src) {
                return;
            }

            function startPlayer() {
                if (shell.dataset.started === 'true') {
                    video.play().catch(function () {});
                    return;
                }

                shell.dataset.started = 'true';
                shell.classList.add('started');
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(showError);
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(showError);
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                } else {
                    showError();
                }
            }

            function showError() {
                if (error) {
                    error.hidden = false;
                }
                if (overlay) {
                    overlay.style.opacity = '1';
                    overlay.style.visibility = 'visible';
                }
            }

            button.addEventListener('click', startPlayer);
            shell.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                if (!shell.classList.contains('started')) {
                    startPlayer();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHeroCarousel();
        initGlobalSearch();
        initLocalFilters();
        initPlayers();
    });
}());
