function initPlayer(videoId, buttonId, src) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !src) {
    return;
  }
  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }
    video.src = src;
  }
  function startVideo() {
    if (button) {
      button.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }
  bindSource();
  if (button) {
    button.addEventListener('click', startVideo);
  }
  video.addEventListener('click', startVideo);
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
}
