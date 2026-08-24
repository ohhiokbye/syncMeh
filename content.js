console.log("🎵 SyncMeh: Content script active.");

let isRemoteAction = false;
let currentPlayer = null;

function getTrackInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");

  // YouTube Music header selectors for title and artist
  const titleEl = document.querySelector(".title.style-scope.ytmusic-player-bar");
  const artistEl = document.querySelector(".byline.style-scope.ytmusic-player-bar complex-string");

  return {
    videoId: videoId || "unknown",
    title: titleEl ? titleEl.textContent.trim() : "Unknown Title",
    artist: artistEl ? artistEl.textContent.trim() : "Unknown Artist"
  };
}

function hookPlayer() {
  const video = document.querySelector("video");

  if (!video) {
    setTimeout(hookPlayer, 500);
    return;
  }

  currentPlayer = video;
  console.log("🎯 SyncMeh: Found YouTube Music video player!", video);

  // 1. Detect Play
  video.addEventListener("play", () => {
    if (isRemoteAction) {
      isRemoteAction = false;
      return;
    }
    const track = getTrackInfo();
    console.log(`▶️ [OUTGOING] PLAY event at ${video.currentTime.toFixed(2)}s | Track: "${track.title}" by ${track.artist}`);
  });

  // 2. Detect Pause
  video.addEventListener("pause", () => {
    if (isRemoteAction) {
      isRemoteAction = false;
      return;
    }
    console.log(`⏸️ [OUTGOING] PAUSE event at ${video.currentTime.toFixed(2)}s`);
  });

  // 3. Detect Seek
  video.addEventListener("seeked", () => {
    if (isRemoteAction) {
      isRemoteAction = false;
      return;
    }
    console.log(`⏩ [OUTGOING] SEEKED to ${video.currentTime.toFixed(2)}s`);
  });
}

// Global test methods to simulate remote commands from the server
window.syncMeh = {
  remotePlay: function() {
    if (!currentPlayer) return;
    console.log("📥 [INCOMING REMOTE] Executing remote play");
    isRemoteAction = true;
    currentPlayer.play();
  },
  remotePause: function() {
    if (!currentPlayer) return;
    console.log("📥 [INCOMING REMOTE] Executing remote pause");
    isRemoteAction = true;
    currentPlayer.pause();
  },
  remoteSeek: function(seconds) {
    if (!currentPlayer) return;
    console.log(`📥 [INCOMING REMOTE] Executing remote seek to ${seconds}s`);
    isRemoteAction = true;
    currentPlayer.currentTime = seconds;
  },
  getTrack: getTrackInfo
};

hookPlayer();
