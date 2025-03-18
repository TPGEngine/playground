// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from "react";
import signalingService, { SignalingMessage } from "@/lib/signaling";

interface UseWebSocketReturn {
  messages: SignalingMessage[];
  sendMessage: (msg: SignalingMessage) => void;
}

const useWebSocket = (): UseWebSocketReturn => {
  const [messages, setMessages] = useState<SignalingMessage[]>([]);

  useEffect(() => {
    // Ensure the socket is connected when the hook is used.
    signalingService.connect();

    const handler = (message: SignalingMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    signalingService.addMessageHandler(handler);

    // Cleanup: remove the handler when the component unmounts.
    return () => {
      signalingService.removeMessageHandler(handler);
    };
  }, []);

  const sendMessage = useCallback((msg: SignalingMessage) => {
    signalingService.sendMessage(msg);
  }, []);

  return { messages, sendMessage };
};

export default useWebSocket;
