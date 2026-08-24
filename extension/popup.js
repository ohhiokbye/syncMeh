// Popup UI Controller for SyncMeh

document.addEventListener("DOMContentLoaded", () => {
  const statusPill = document.getElementById("statusPill");
  const statusLabel = document.getElementById("statusLabel");
  const trackTitle = document.getElementById("trackTitle");
  const trackArtist = document.getElementById("trackArtist");
  const roomInput = document.getElementById("roomInput");
  const joinBtn = document.getElementById("joinBtn");
  const randomBtn = document.getElementById("randomBtn");
  const copyBtn = document.getElementById("copyBtn");
  const copyIcon = document.getElementById("copyIcon");
  const checkIcon = document.getElementById("checkIcon");
  const currentRoomText = document.getElementById("currentRoomText");

  function updateStatus(isConnected) {
    if (isConnected) {
      statusPill.className = "status-pill status-connected";
      statusLabel.textContent = "Live";
    } else {
      statusPill.className = "status-pill status-disconnected";
      statusLabel.textContent = "Offline";
    }
  }

  function setRoom(roomId) {
    roomInput.value = roomId;
    currentRoomText.textContent = roomId;
    chrome.storage.local.set({ lastRoomId: roomId });
  }

  // 1. Fetch current status from background worker
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
    if (response) {
      updateStatus(response.connected);
      if (response.roomId) {
        setRoom(response.roomId);
      }
    }
  });

  // 2. Fetch track info from active YouTube Music tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.includes("music.youtube.com")) {
      chrome.tabs.sendMessage(activeTab.id, { type: "GET_TRACK_INFO" }, (track) => {
        if (chrome.runtime.lastError || !track) {
          trackTitle.textContent = "Listening to YouTube Music";
          trackArtist.textContent = "Ready to synchronize";
          return;
        }
        if (track.title && track.title !== "Unknown Title") {
          trackTitle.textContent = track.title;
          trackArtist.textContent = track.artist || "YouTube Music";
        } else {
          trackTitle.textContent = "No track playing";
          trackArtist.textContent = "Select a song to start";
        }
      });
    } else {
      trackTitle.textContent = "YouTube Music not active";
      trackArtist.textContent = "Open music.youtube.com tab";
    }
  });

  // 3. Join Room Action
  joinBtn.addEventListener("click", () => {
    const rawVal = roomInput.value.trim();
    if (!rawVal) return;

    // Sanitize room name
    const sanitized = rawVal.replace(/[^a-zA-Z0-9_-]/g, "");
    setRoom(sanitized);

    chrome.runtime.sendMessage({ type: "JOIN_ROOM", roomId: sanitized }, (res) => {
      // Temporary visual button feedback
      const originalText = joinBtn.querySelector("span").textContent;
      joinBtn.querySelector("span").textContent = "Connected ✓";
      setTimeout(() => {
        joinBtn.querySelector("span").textContent = originalText;
      }, 1200);
    });
  });

  // 4. Generate Random Room Action
  randomBtn.addEventListener("click", () => {
    const randomCode = "sync-" + Math.floor(100 + Math.random() * 900);
    setRoom(randomCode);
    chrome.runtime.sendMessage({ type: "JOIN_ROOM", roomId: randomCode });
  });

  // 5. Copy Room Action
  copyBtn.addEventListener("click", () => {
    const code = roomInput.value.trim() || currentRoomText.textContent;
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");
      setTimeout(() => {
        copyIcon.classList.remove("hidden");
        checkIcon.classList.add("hidden");
      }, 1500);
    });
  });

  // Allow pressing Enter in the input field
  roomInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      joinBtn.click();
    }
  });
});
