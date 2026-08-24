console.log("🎵 SyncMeh: Content script active.");

// Unique ID for this specific browser tab
const tabSessionId = "tab_" + Math.random().toString(36).substring(2, 9);
let isRemoteAction = false;
let currentPlayer = null;

function setRemoteActionLock(durationMs = 600) {
  isRemoteAction = true;
  setTimeout(() => {
    isRemoteAction = false;
  }, durationMs);
}

function getTrackInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");

  const titleEl = document.querySelector(".title.style-scope.ytmusic-player-bar");
  const artistEl = document.querySelector(".byline.style-scope.ytmusic-player-bar complex-string");

  return {
    videoId: videoId || "",
    title: titleEl ? titleEl.textContent.trim() : "Unknown Title",
    artist: artistEl ? artistEl.textContent.trim() : "Unknown Artist"
  };
}

// Send local action to background script
function sendActionToBackground(action) {
  if (isRemoteAction) return;

  const track = getTrackInfo();
  const payload = {
    action: action,
    timestamp: currentPlayer ? currentPlayer.currentTime : 0,
    videoId: track.videoId,
    title: track.title,
    artist: track.artist,
    senderTabId: tabSessionId
  };

  console.log(`📤 [OUTGOING -> Server] Action: ${action} at ${payload.timestamp.toFixed(2)}s | Track: "${track.title}"`);
  chrome.runtime.sendMessage({
    type: "BROADCAST_ACTION",
    payload: payload
  }).catch(() => {});
}

// Handle remote action received from server
function handleRemoteAction(msg) {
  // If this message was sent by this tab, ignore it
  if (msg.senderTabId === tabSessionId) {
    return;
  }

  console.log(`📥 [INCOMING Remote Action] ${msg.action} at ${msg.timestamp.toFixed(2)}s (from ${msg.senderTabId})`);

  // 1. Check if the song has changed (different videoId)
  const currentTrack = getTrackInfo();
  if (msg.videoId && msg.videoId !== "" && msg.videoId !== currentTrack.videoId) {
    console.log(`🎵 [SyncMeh] Loading new song from peer: ${msg.videoId}`);
    setRemoteActionLock(2000);
    window.location.href = `https://music.youtube.com/watch?v=${msg.videoId}`;
    return;
  }

  if (!currentPlayer) return;

  // 2. Play Action
  if (msg.action === "PLAY") {
    setRemoteActionLock(600);
    // Align timestamp if difference is > 0.8 seconds
    if (Math.abs(currentPlayer.currentTime - msg.timestamp) > 0.8) {
      currentPlayer.currentTime = msg.timestamp;
    }
    currentPlayer.play().catch(e => console.warn("Autoplay blocked by browser:", e));
  }
  // 3. Pause Action
  else if (msg.action === "PAUSE") {
    setRemoteActionLock(600);
    currentPlayer.pause();
    currentPlayer.currentTime = msg.timestamp;
  }
  // 4. Seek Action
  else if (msg.action === "SEEK") {
    setRemoteActionLock(600);
    currentPlayer.currentTime = msg.timestamp;
  }
}

// Listen for messages from background.js and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "REMOTE_ACTION") {
    handleRemoteAction(request.payload);
  } else if (request.type === "GET_TRACK_INFO") {
    sendResponse(getTrackInfo());
  }
  return true;
});

function hookPlayer() {
  const video = document.querySelector("video");

  if (!video) {
    setTimeout(hookPlayer, 500);
    return;
  }

  currentPlayer = video;
  console.log("🎯 SyncMeh: Found YouTube Music video player! Tab ID:", tabSessionId);

  // 1. Detect Local Play
  video.addEventListener("play", () => {
    if (isRemoteAction) return;
    sendActionToBackground("PLAY");
  });

  // 2. Detect Local Pause
  video.addEventListener("pause", () => {
    if (isRemoteAction) return;
    sendActionToBackground("PAUSE");
  });

  // 3. Detect Local Seek
  video.addEventListener("seeked", () => {
    if (isRemoteAction) return;
    sendActionToBackground("SEEK");
  });
}

// Global debug helpers
window.syncMeh = {
  tabSessionId: tabSessionId,
  joinRoom: function(roomId) {
    chrome.runtime.sendMessage({ type: "JOIN_ROOM", roomId: roomId });
  },
  getStatus: function(cb) {
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, cb);
  },
  remotePlay: function() {
    if (currentPlayer) {
      setRemoteActionLock();
      currentPlayer.play();
    }
  },
  remotePause: function() {
    if (currentPlayer) {
      setRemoteActionLock();
      currentPlayer.pause();
    }
  },
  remoteSeek: function(seconds) {
    if (currentPlayer) {
      setRemoteActionLock();
      currentPlayer.currentTime = seconds;
    }
  },
  getTrack: getTrackInfo
};

hookPlayer();
