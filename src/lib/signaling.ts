// src/utils/signaling.ts

export interface SignalingMessage {
  type: string;
  payload?: any;
  candidate?: RTCIceCandidateInit;
  sdp?: string;
}

class SignalingService {
  private url: string;
  private socket: WebSocket | null;
  private messageHandlers: Array<(message: SignalingMessage) => void>;

  constructor(url: string) {
    this.url = url;
    this.socket = null;
    this.messageHandlers = [];
  }

  public connect(): void {
    if (this.socket) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.info("WebSocket connection open");
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        console.info("Received message:", message);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.info("Connection closed");
      this.socket = null;
    };
  }

  public sendMessage(message: SignalingMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not open. Message not sent:", message);
    }
  }

  public addMessageHandler(handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(
    handler: (message: SignalingMessage) => void
  ): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create a singleton instance with the proper URL.
const signalingService = new SignalingService(
  "ws://localhost:8000/ws/signaling"
);
export default signalingService;
