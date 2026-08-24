// Lightweight, zero-dependency STOMP client for Chrome Extensions
class StompClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.subCounter = 0;
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }

  connect(onConnect, onError) {
    if (onConnect) this.onConnectCallbacks.push(onConnect);

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      // Send STOMP CONNECT frame
      const connectFrame = "CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\n\n\x00";
      this.ws.send(connectFrame);
    };

    this.ws.onmessage = (event) => {
      const data = event.data;

      if (data.startsWith("CONNECTED")) {
        this.connected = true;
        console.log("🟢 [STOMP] Connected to Spring Boot WebSocket at", this.url);

        // Send all pending subscriptions
        for (const [topic] of this.subscriptions.entries()) {
          const subId = `sub-${this.subCounter++}`;
          const subFrame = `SUBSCRIBE\nid:${subId}\ndestination:${topic}\n\n\x00`;
          this.ws.send(subFrame);
          console.log(`📡 [STOMP] Subscribed to ${topic}`);
        }

        this.onConnectCallbacks.forEach(cb => cb());
      } else if (data.startsWith("MESSAGE")) {
        // Extract headers and JSON body
        const headerEnd = data.indexOf("\n\n");
        if (headerEnd !== -1) {
          const headerSection = data.substring(0, headerEnd);
          const bodyWithNull = data.substring(headerEnd + 2);
          const body = bodyWithNull.replace(/\x00$/, "").trim();

          let destination = "";
          const lines = headerSection.split("\n");
          for (const line of lines) {
            if (line.startsWith("destination:")) {
              destination = line.substring("destination:".length).trim();
            }
          }

          try {
            const json = JSON.parse(body);
            if (this.subscriptions.has(destination)) {
              this.subscriptions.get(destination)(json);
            }
          } catch (e) {
            console.error("Failed to parse STOMP message body:", e);
          }
        }
      }
    };

    this.ws.onerror = (err) => {
      console.error("🔴 [STOMP] WebSocket Error:", err);
      if (onError) onError(err);
    };

    this.ws.onclose = () => {
      this.connected = false;
      console.log("⚪ [STOMP] WebSocket Disconnected. Reconnecting in 3s...");
      this.onDisconnectCallbacks.forEach(cb => cb());
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(topic, callback) {
    this.subscriptions.set(topic, callback);
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subId = `sub-${this.subCounter++}`;
      const subFrame = `SUBSCRIBE\nid:${subId}\ndestination:${topic}\n\n\x00`;
      this.ws.send(subFrame);
      console.log(`📡 [STOMP] Subscribed to ${topic}`);
    }
  }

  unsubscribe(topic) {
    this.subscriptions.delete(topic);
  }

  send(destination, payload) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ [STOMP] Cannot send message, WebSocket not connected");
      return;
    }
    const body = JSON.stringify(payload);
    const sendFrame = `SEND\ndestination:${destination}\ncontent-type:application/json\n\n${body}\x00`;
    this.ws.send(sendFrame);
  }
}
