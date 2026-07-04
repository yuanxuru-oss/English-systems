import { icon } from "./icons.js";

/**
 * Hand-drawn audio player with real <audio> playback.
 * Supports volume control and falls back to simulated mode when no audio source.
 */
export function createAudioPlayer(options = {}) {
  const {
    duration = 120,
    label = "🎧 对话音频",
    audioSrc = null,
    onEnded,
  } = options;

  const hasAudio = !!audioSrc;
  let isPlaying = false;
  let currentTime = 0;
  let volume = 0.8;
  let intervalId = null;
  let _onEnded = onEnded;

  // Hidden native audio element
  const nativeAudio = hasAudio ? document.createElement("audio") : null;
  if (nativeAudio) {
    nativeAudio.src = audioSrc;
    nativeAudio.volume = volume;
    nativeAudio.preload = "auto";
  }

  const container = document.createElement("div");
  container.className = "audio-player";

  container.innerHTML = `
    <div class="audio-player-inner">
      <div class="audio-player-controls">
        <button class="audio-btn audio-btn-play" data-audio-action="play" title="播放">
          ${icon("play")}
        </button>
        <button class="audio-btn audio-btn-replay" data-audio-action="replay" title="重播">
          ${icon("replay")}
        </button>
      </div>
      <div class="audio-player-track">
        <div class="audio-progress-bar" data-audio-progress-bar>
          <div class="audio-progress-fill" data-audio-progress-fill style="width:0%"></div>
          <div class="audio-progress-thumb" data-audio-progress-thumb style="left:0%"></div>
        </div>
        <div class="audio-player-info">
          <span class="audio-label">${label}</span>
          <span class="audio-time" data-audio-time-current>0:00</span>
          <span class="audio-time-sep">/</span>
          <span class="audio-time" data-audio-time-total>${hasAudio ? "--:--" : formatTime(duration)}</span>
        </div>
      </div>
      <div class="audio-volume-control">
        <span class="audio-volume-icon" data-audio-mute-btn title="静音">🔊</span>
        <div class="audio-volume-slider" data-audio-volume-slider>
          <div class="audio-volume-fill" data-audio-volume-fill style="width:80%"></div>
          <div class="audio-volume-thumb" data-audio-volume-thumb style="left:80%"></div>
        </div>
      </div>
    </div>
  `;

  const playBtn = container.querySelector('[data-audio-action="play"]');
  const replayBtn = container.querySelector('[data-audio-action="replay"]');
  const progressBar = container.querySelector("[data-audio-progress-bar]");
  const progressFill = container.querySelector("[data-audio-progress-fill]");
  const progressThumb = container.querySelector("[data-audio-progress-thumb]");
  const timeCurrent = container.querySelector("[data-audio-time-current]");
  const timeTotal = container.querySelector("[data-audio-time-total]");
  const volumeSlider = container.querySelector("[data-audio-volume-slider]");
  const volumeFill = container.querySelector("[data-audio-volume-fill]");
  const volumeThumb = container.querySelector("[data-audio-volume-thumb]");
  const muteBtn = container.querySelector("[data-audio-mute-btn]");
  let prevVolume = volume;
  let isMuted = false;

  function updateUI() {
    const total = getDuration();
    const pct = total > 0 ? Math.min((currentTime / total) * 100, 100) : 0;
    progressFill.style.width = `${pct}%`;
    progressThumb.style.left = `${pct}%`;
    timeCurrent.textContent = formatTime(currentTime);
    if (hasAudio && nativeAudio && !isNaN(nativeAudio.duration)) {
      timeTotal.textContent = formatTime(nativeAudio.duration);
    }

    if (isPlaying) {
      playBtn.innerHTML = icon("pause");
      playBtn.setAttribute("title", "暂停");
    } else {
      playBtn.innerHTML = icon("play");
      playBtn.setAttribute("title", "播放");
    }
  }

  function updateVolumeUI() {
    const pct = isMuted ? 0 : volume * 100;
    volumeFill.style.width = `${pct}%`;
    volumeThumb.style.left = `${pct}%`;
    muteBtn.textContent = isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊";
  }

  function getDuration() {
    if (hasAudio && nativeAudio && !isNaN(nativeAudio.duration)) {
      return nativeAudio.duration;
    }
    return duration;
  }

  // --- Playback logic ---
  function startPlayback() {
    if (isPlaying) return;
    isPlaying = true;
    updateUI();

    if (hasAudio && nativeAudio) {
      nativeAudio.play().catch(() => {
        // Autoplay blocked — fall back to simulated
        startSimulated();
      });
    } else {
      startSimulated();
    }
  }

  function startSimulated() {
    intervalId = setInterval(() => {
      currentTime += 0.5;
      const total = getDuration();
      if (currentTime >= total) {
        currentTime = total;
        pausePlayback();
        _onEnded?.();
      }
      updateUI();
    }, 500);
  }

  function pausePlayback() {
    isPlaying = false;
    if (nativeAudio && hasAudio) nativeAudio.pause();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    updateUI();
  }

  function resetPlayback() {
    pausePlayback();
    currentTime = 0;
    if (nativeAudio && hasAudio) nativeAudio.currentTime = 0;
    updateUI();
  }

  function seekTo(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const total = getDuration();
    currentTime = pct * total;
    if (nativeAudio && hasAudio) nativeAudio.currentTime = currentTime;
    updateUI();
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (nativeAudio && hasAudio) nativeAudio.volume = volume;
    if (volume > 0) isMuted = false;
    updateVolumeUI();
  }

  function toggleMute() {
    if (isMuted || volume === 0) {
      isMuted = false;
      volume = prevVolume || 0.8;
    } else {
      prevVolume = volume;
      isMuted = true;
    }
    if (nativeAudio && hasAudio) nativeAudio.volume = isMuted ? 0 : volume;
    updateVolumeUI();
  }

  function seekVolume(e) {
    const rect = volumeSlider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setVolume(pct);
  }

  // --- Event listeners ---
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      if (currentTime >= getDuration()) currentTime = 0;
      startPlayback();
    }
  });

  replayBtn.addEventListener("click", resetPlayback);

  let isDragging = false;
  progressBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    seekTo(e);
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) seekTo(e);
  });
  document.addEventListener("mouseup", () => { isDragging = false; });

  // Native audio events
  if (nativeAudio) {
    nativeAudio.addEventListener("timeupdate", () => {
      if (hasAudio) {
        currentTime = nativeAudio.currentTime;
        updateUI();
      }
    });
    nativeAudio.addEventListener("ended", () => {
      isPlaying = false;
      updateUI();
      _onEnded?.();
    });
    nativeAudio.addEventListener("loadedmetadata", () => {
      timeTotal.textContent = formatTime(nativeAudio.duration);
      updateUI();
    });
    nativeAudio.addEventListener("play", () => {
      isPlaying = true;
      updateUI();
    });
    nativeAudio.addEventListener("pause", () => {
      isPlaying = false;
      updateUI();
    });
  }

  // Volume slider
  let volDragging = false;
  volumeSlider.addEventListener("mousedown", (e) => {
    volDragging = true;
    seekVolume(e);
  });
  document.addEventListener("mousemove", (e) => {
    if (volDragging) seekVolume(e);
  });
  document.addEventListener("mouseup", () => { volDragging = false; });
  muteBtn.addEventListener("click", toggleMute);

  // --- Public API ---
  container.play = startPlayback;
  container.pause = pausePlayback;
  container.reset = resetPlayback;
  container.getCurrentTime = () => currentTime;
  container.getDuration = getDuration;
  container.isPlaying = () => isPlaying;
  container.setVolume = setVolume;
  container.setOnEnded = (fn) => { _onEnded = fn; };
  container.setAudioSource = (src) => {
    // Not supported after creation — reload page
  };

  container._cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    if (nativeAudio) {
      nativeAudio.pause();
      nativeAudio.src = "";
      nativeAudio.load();
    }
  };

  updateUI();
  updateVolumeUI();
  return container;
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
