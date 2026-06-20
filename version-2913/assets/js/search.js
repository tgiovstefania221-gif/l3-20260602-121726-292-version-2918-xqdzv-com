(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var status = document.getElementById('searchStatus');

  if (!input || !results || !status || !window.MovieSearchIndex) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  function imageHtml(item) {
    return '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" class="poster-image" loading="lazy" onerror="this.classList.add(\'image-hidden\')">';
  }

  function card(item) {
    return '<article class="movie-card">' +
      '<a class="poster-frame" href="./' + item.file + '">' +
      '<span class="poster-fallback">▶</span>' + imageHtml(item) +
      '<span class="poster-shade"></span><span class="play-badge">▶</span><span class="score-badge">★ ' + item.score + '</span></a>' +
      '<div class="card-body"><h3><a href="./' + item.file + '">' + item.title + '</a></h3>' +
      '<p class="card-desc">' + item.desc + '</p>' +
      '<div class="tag-row"><span>' + item.category + '</span><span>' + item.type + '</span><span>' + item.year + '</span></div>' +
      '<div class="card-meta"><span>' + item.region + '</span><span>' + item.genre + '</span></div></div></article>';
  }

  function runSearch() {
    var q = input.value.trim().toLowerCase();
    var pool = window.MovieSearchIndex;
    var matched = !q ? pool.slice(0, 30) : pool.filter(function (item) {
      return item.search.indexOf(q) !== -1;
    }).slice(0, 60);
    status.textContent = q ? '搜索结果' : '热门推荐';
    results.innerHTML = matched.map(card).join('');
  }

  input.addEventListener('input', runSearch);
  runSearch();
})();
