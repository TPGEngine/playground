// src/components/VisualizationPanel.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWebRTC, useWebSocket } from "@/hooks";

interface VisualizationPanelProps {
  environmentName: string;
  generation: number;
  isActive: boolean;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  environmentName,
  generation,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { remoteStream } = useWebRTC();
  const { sendMessage } = useWebSocket();

  // When remoteStream is available, attach it to the video element.
  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleTestMessage = () => {
    // For testing purposes, send a test message over signaling.
    sendMessage({ type: "test", payload: "Hello from React TS" });
  };

  return (
    <div className="w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
      {!isActive ? (
        <motion.div
          className="text-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-gray-400 mb-4">Visualization Placeholder</div>
          <div className="text-sm text-gray-500">
            Start the evolution process to visualize the agent.
          </div>
        </motion.div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-lg font-medium mb-4">
            {environmentName} - Generation {generation}
          </div>
          {/* Video element where the remote media stream will render */}
          <video
            ref={videoRef}
            className="w-full h-full"
            autoPlay
            playsInline
            muted
          />
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleTestMessage}
          >
            Send Test Message
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualizationPanel;
