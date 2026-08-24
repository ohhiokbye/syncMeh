// Background Service Worker for SyncMeh
importScripts("stompClient.js");

console.log("🛠️ [SyncMeh Background] Service Worker initialized.");

let currentRoomId = "room123";

// Connect to Spring Boot WebSocket from the background service worker
const stompClient = new StompClient("ws://localhost:8080/ws-sync");

function forwardToTabs(message) {
  chrome.tabs.query({ url: "https://music.youtube.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "REMOTE_ACTION",
        payload: message
      }).catch(() => {
        // Tab might be inactive or reloading
      });
    });
  });
}

function handleIncomingMessage(msg) {
  console.log(`📥 [Background -> Tabs] Received from server: ${msg.action} at ${msg.timestamp}s from ${msg.senderTabId || msg.senderId}`);
  // Forward to all YouTube Music tabs (each tab will filter out its own tabSessionId)
  forwardToTabs(msg);
}

function joinRoom(roomId) {
  if (currentRoomId) {
    stompClient.unsubscribe(`/topic/room/${currentRoomId}`);
  }
  currentRoomId = roomId;
  console.log(`🚪 [Background] Joined room: ${roomId}`);
  stompClient.subscribe(`/topic/room/${roomId}`, handleIncomingMessage);
}

// Connect and subscribe
stompClient.connect(() => {
  joinRoom(currentRoomId);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "BROADCAST_ACTION") {
    const payload = {
      ...request.payload,
      roomId: currentRoomId
    };
    console.log(`📤 [Background -> Spring Boot] Sending ${payload.action} in [${currentRoomId}] (from tab: ${payload.senderTabId})`);
    stompClient.send(`/app/sync/${currentRoomId}`, payload);
    sendResponse({ success: true });
  } else if (request.type === "JOIN_ROOM") {
    joinRoom(request.roomId);
    sendResponse({ success: true, roomId: currentRoomId });
  } else if (request.type === "GET_STATUS") {
    sendResponse({
      connected: stompClient.connected,
      roomId: currentRoomId
    });
  }
  return true;
});
