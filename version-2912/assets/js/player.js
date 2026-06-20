
function initPlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var cover = document.querySelector('.play-cover');
  var button = document.querySelector('.play-button');

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var started = video.play();

    if (started && typeof started.catch === 'function') {
      started.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
}
