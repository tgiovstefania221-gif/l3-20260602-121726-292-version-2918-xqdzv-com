(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('hls-loader-error'));
      };
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-source');
    var overlay = shell.querySelector('.play-overlay');
    var toggle = shell.querySelector('.player-toggle');
    var mute = shell.querySelector('.player-mute');
    var fullscreen = shell.querySelector('.player-fullscreen');
    var loading = shell.querySelector('.player-loading');
    var error = shell.querySelector('.player-error');
    var ready = false;
    var hlsInstance = null;

    function setLoading(show) {
      if (loading) {
        loading.hidden = !show;
      }
    }

    function setError(message) {
      if (error) {
        error.textContent = message;
        error.hidden = !message;
      }
    }

    function attachSource() {
      if (ready) {
        return Promise.resolve();
      }
      setLoading(true);
      setError('');
      if (!source) {
        setLoading(false);
        setError('视频加载失败，请稍后重试');
        return Promise.reject(new Error('empty-source'));
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        setLoading(false);
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (!Hls || !Hls.isSupported()) {
          throw new Error('hls-not-supported');
        }
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setLoading(false);
            setError('视频加载失败，请稍后重试');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              ready = false;
            }
          }
        });
        ready = true;
      }).catch(function () {
        setLoading(false);
        setError('当前浏览器暂不支持此播放格式');
      });
    }

    function playOrPause() {
      attachSource().then(function () {
        if (video.paused) {
          var attempt = video.play();
          if (attempt && attempt.catch) {
            attempt.catch(function () {});
          }
        } else {
          video.pause();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', playOrPause);
    }
    if (toggle) {
      toggle.addEventListener('click', playOrPause);
    }
    video.addEventListener('click', playOrPause);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      if (toggle) {
        toggle.textContent = '暂停';
      }
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      if (toggle) {
        toggle.textContent = '播放';
      }
    });
    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        var target = video.requestFullscreen ? video : shell;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.movie-player').forEach(setupPlayer);
})();
