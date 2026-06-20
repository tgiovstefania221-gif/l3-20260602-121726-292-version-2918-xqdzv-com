import { Hls } from './hls.esm.js';

function setStatus(shell, message) {
    var status = shell.querySelector('.player-status');
    if (status) {
        status.textContent = message;
    }
}

function initializePlayer(video) {
    var source = video.dataset.src;
    var shell = video.closest('.player-shell');
    var startButton = shell ? shell.querySelector('.player-start') : null;

    if (!source || !shell) {
        return;
    }

    try {
        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus(shell, '播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(shell, '播放加载失败，请稍后再试');
                }
            });
            video._hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus(shell, '播放源已就绪');
        } else {
            setStatus(shell, '当前浏览器不支持 HLS 播放');
        }
    } catch (error) {
        setStatus(shell, '播放器初始化失败');
    }

    function playVideo() {
        if (!video.src && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus(shell, '请再次点击播放按钮开始播放');
            });
        }
    }

    if (startButton) {
        startButton.addEventListener('click', function () {
            playVideo();
        });
    }

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
        setStatus(shell, '正在播放');
    });

    video.addEventListener('pause', function () {
        if (startButton) {
            startButton.classList.remove('is-hidden');
        }
        setStatus(shell, '已暂停');
    });

    video.addEventListener('ended', function () {
        if (startButton) {
            startButton.classList.remove('is-hidden');
        }
        setStatus(shell, '播放结束');
    });

    video.addEventListener('error', function () {
        setStatus(shell, '播放加载失败，请稍后再试');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.video-player').forEach(initializePlayer);
});
