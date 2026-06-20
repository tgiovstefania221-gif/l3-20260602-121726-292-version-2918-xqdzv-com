(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function numberFrom(value) {
        var parsed = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = button.classList.toggle('is-open');
            menu.classList.toggle('is-open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initCatalogFilters() {
        var grid = document.querySelector('[data-catalog-grid]');
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var keyword = document.querySelector('[data-filter="keyword"]');
        var year = document.querySelector('[data-filter="year"]');
        var region = document.querySelector('[data-filter="region"]');
        var type = document.querySelector('[data-filter="type"]');
        var sort = document.querySelector('[data-sort]');
        var count = document.querySelector('[data-count]');
        var empty = document.querySelector('[data-empty-state]');
        var reset = document.querySelector('.reset-filter');

        function readFilters() {
            return {
                keyword: normalize(keyword && keyword.value),
                year: year ? year.value : 'all',
                region: region ? region.value : 'all',
                type: type ? type.value : 'all'
            };
        }

        function matches(card, filters) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.category,
                card.textContent
            ].join(' '));

            if (filters.keyword && haystack.indexOf(filters.keyword) === -1) {
                return false;
            }
            if (filters.year !== 'all' && card.dataset.year !== filters.year) {
                return false;
            }
            if (filters.region !== 'all' && card.dataset.region !== filters.region) {
                return false;
            }
            if (filters.type !== 'all' && card.dataset.type !== filters.type) {
                return false;
            }
            return true;
        }

        function applySort(visibleCards) {
            var mode = sort ? sort.value : 'default';
            var sorted = visibleCards.slice();
            if (mode === 'rating') {
                sorted.sort(function (a, b) {
                    return numberFrom(b.querySelector('.rating') && b.querySelector('.rating').textContent) -
                        numberFrom(a.querySelector('.rating') && a.querySelector('.rating').textContent);
                });
            } else if (mode === 'views') {
                sorted.sort(function (a, b) {
                    return numberFrom(b.querySelector('.cover-meta') && b.querySelector('.cover-meta').textContent) -
                        numberFrom(a.querySelector('.cover-meta') && a.querySelector('.cover-meta').textContent);
                });
            } else if (mode === 'year') {
                sorted.sort(function (a, b) {
                    return numberFrom(b.dataset.year) - numberFrom(a.dataset.year);
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function update() {
            var filters = readFilters();
            var visibleCards = [];
            cards.forEach(function (card) {
                var isVisible = matches(card, filters);
                card.hidden = !isVisible;
                if (isVisible) {
                    visibleCards.push(card);
                }
            });
            applySort(visibleCards);
            if (count) {
                count.textContent = String(visibleCards.length);
            }
            if (empty) {
                empty.classList.toggle('is-visible', visibleCards.length === 0);
            }
        }

        [keyword, year, region, type, sort].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', update);
            control.addEventListener('change', update);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                [year, region, type].forEach(function (select) {
                    if (select) {
                        select.value = 'all';
                    }
                });
                if (sort) {
                    sort.value = 'default';
                }
                update();
            });
        }

        update();
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">' +
            '    <div class="movie-cover">' +
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '        <div class="cover-shade"></div>' +
            '        <span class="cover-badge">' + escapeHtml(movie.category) + '</span>' +
            '        <span class="play-bubble"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>' +
            '        <div class="cover-meta"><span>' + escapeHtml(movie.views) + '</span><span>' + escapeHtml(movie.duration) + '</span></div>' +
            '    </div>' +
            '    <div class="movie-card-body">' +
            '        <h3>' + escapeHtml(movie.title) + '</h3>' +
            '        <p>' + escapeHtml(movie.description) + '</p>' +
            '        <div class="card-meta-row"><span class="rating">★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
            '        <div class="tag-row">' + tags + '</div>' +
            '    </div>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initSearchPage() {
        var data = window.MOVIE_SEARCH_DATA;
        var results = document.getElementById('search-results');
        if (!Array.isArray(data) || !results) {
            return;
        }

        var input = document.getElementById('search-input');
        var year = document.getElementById('search-year');
        var region = document.getElementById('search-region');
        var type = document.getElementById('search-type');
        var sort = document.getElementById('search-sort');
        var form = document.getElementById('search-panel');
        var count = document.getElementById('search-count');
        var empty = document.getElementById('search-empty');
        var params = new URLSearchParams(window.location.search);

        fillSelect(year, Array.from(new Set(data.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse());
        fillSelect(region, Array.from(new Set(data.map(function (movie) { return movie.region; }).filter(Boolean))).sort());
        fillSelect(type, Array.from(new Set(data.map(function (movie) { return movie.type; }).filter(Boolean))).sort());

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function matches(movie, keyword) {
            var haystack = normalize([
                movie.title,
                movie.description,
                movie.category,
                movie.genre,
                movie.region,
                movie.type,
                movie.year,
                (movie.tags || []).join(' ')
            ].join(' '));
            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }
            if (year && year.value !== 'all' && movie.year !== year.value) {
                return false;
            }
            if (region && region.value !== 'all' && movie.region !== region.value) {
                return false;
            }
            if (type && type.value !== 'all' && movie.type !== type.value) {
                return false;
            }
            return true;
        }

        function render() {
            var keyword = normalize(input && input.value);
            var filtered = data.filter(function (movie) {
                return matches(movie, keyword);
            });

            if (sort && sort.value === 'rating') {
                filtered.sort(function (a, b) { return numberFrom(b.rating) - numberFrom(a.rating); });
            } else if (sort && sort.value === 'views') {
                filtered.sort(function (a, b) { return numberFrom(b.views) - numberFrom(a.views); });
            } else if (sort && sort.value === 'year') {
                filtered.sort(function (a, b) { return numberFrom(b.year) - numberFrom(a.year); });
            }

            var limited = filtered.slice(0, 240);
            results.innerHTML = limited.map(createSearchCard).join('');
            if (count) {
                count.textContent = String(filtered.length);
            }
            if (empty) {
                var hasQuery = keyword || (year && year.value !== 'all') || (region && region.value !== 'all') || (type && type.value !== 'all');
                empty.textContent = hasQuery && filtered.length === 0 ? '没有找到符合条件的影片。' : '请输入关键词或选择筛选条件。';
                empty.classList.toggle('is-visible', filtered.length === 0);
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }
        [input, year, region, type, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        render();
    }

    ready(function () {
        initMobileMenu();
        initCatalogFilters();
        initSearchPage();
    });
}());
