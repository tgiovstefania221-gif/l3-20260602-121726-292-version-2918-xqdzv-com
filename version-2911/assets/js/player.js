(function () {
  function prepareVideo(video, streamUrl) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else {
      video.src = streamUrl;
    }

    video.setAttribute('data-ready', '1');
  }

  window.setupMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);

    if (!video || !overlay || !button || !options.streamUrl) {
      return;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      prepareVideo(video, options.streamUrl);
      overlay.classList.add('hidden');
      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    }

    button.addEventListener('click', start);
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        start();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
  };
})();
