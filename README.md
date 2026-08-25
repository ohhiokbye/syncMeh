# SyncMeh 🎵

> **Listen to YouTube Music in real-time with friends.**

SyncMeh is a lightweight Chrome Extension and Java Spring Boot WebSocket backend that synchronizes YouTube Music playback (Play, Pause, Seek, and Song Navigation) across multiple devices with sub-100ms latency.

---

## ✨ Features

- **⚡ Real-Time Playback Sync**: Instant synchronization for **Play**, **Pause**, and **Seek** actions.
- **🔄 Auto Song Switching**: When a peer changes the song, everyone in the room automatically navigates to the same track.
- **🚪 Room-Based Sessions**: Create or join custom rooms (e.g., `chill-beats`) or generate random room IDs.
- **🛡️ Smart Echo Prevention & Drift Lock**: Prevents infinite trigger loops and auto-corrects buffering drift (>0.8s).
- **🎨 Minimalist Dark UI**: Sleek, distraction-free control panel embedded directly in the extension popup.
- **🌐 Cloud-Ready**: Connects over secure WebSockets (`wss://`) deployed 24/7 on the cloud.

---

## 🛠️ Tech Stack

- **Extension (Frontend)**: Chrome Extension Manifest V3, Vanilla JavaScript, HTML5 Media API, Custom STOMP/WebSocket Client.
- **Server (Backend)**: Java 17, Spring Boot, Spring WebSocket (STOMP Message Broker), Docker.

---

## 🚀 Quick Start for Users

1. **Download the Extension**:
   - Go to [Releases](https://github.com/ohhiokbye/syncMeh/releases) and download `SyncMeh-extension.zip`.
   - Unzip the downloaded file.
2. **Install in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Toggle **Developer mode** (top-right corner).
   - Click **Load unpacked** and select the unzipped folder containing `manifest.json`.
3. **Start Syncing**:
   - Open [music.youtube.com](https://music.youtube.com).
   - Click the **SyncMeh** icon in your browser toolbar.
   - Enter a shared room code with your friend and click **Join Session**.
   - Enjoy music together in perfect sync!

---

## 💻 Developer Setup (Running Locally)

### 1. Run the Spring Boot Server
```bash
cd server
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080` with WebSocket endpoint `ws://localhost:8080/ws-sync`.

### 2. Load Extension for Development
1. Open `chrome://extensions/` and enable **Developer mode**.
2. Click **Load unpacked** and select the `extension/` directory.
3. To switch between local and production server, update the WebSocket URL in `extension/background.js`:
   ```javascript
   // Local:
   const stompClient = new StompClient("ws://localhost:8080/ws-sync");
   // Production:
   const stompClient = new StompClient("wss://syncmeh.onrender.com/ws-sync");
   ```

---

## 📄 License
MIT License. Feel free to use and contribute!
