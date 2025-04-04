// src/components/VisualizationPanel.tsx
import React, { useEffect, useRef, useState } from "react";
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
  isActive: propIsActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { remoteStream, pc, isReconnecting } = useWebRTC();
  const { sendMessage } = useWebSocket();
  const [connectionState, setConnectionState] = useState<string>("new");

  // Derive active state from connection status and stream availability
  const isActive = connectionState === "connected" && !!remoteStream?.active;

  // Monitor connection state
  useEffect(() => {
    if (!pc) return;

    const handleConnectionChange = () => {
      console.log("Connection state changed to:", pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    pc.addEventListener("connectionstatechange", handleConnectionChange);
    // Set initial state
    setConnectionState(pc.connectionState);

    return () => {
      pc.removeEventListener("connectionstatechange", handleConnectionChange);
    };
  }, [pc]);

  // When remoteStream is available, attach it to the video element.
  useEffect(() => {
    console.log("remoteStream changed:", remoteStream);
    console.log("videoRef current:", videoRef.current);

    const attachStream = async () => {
      if (remoteStream && videoRef.current) {
        console.log("Attaching stream to video element");
        console.log("Stream tracks:", remoteStream.getTracks());
        console.log("Video element readyState:", videoRef.current.readyState);

        try {
          // Reset video element
          videoRef.current.srcObject = null;

          // Attach new stream
          videoRef.current.srcObject = remoteStream;
          console.log("srcObject assigned successfully");

          // Ensure video tracks are enabled
          remoteStream.getVideoTracks().forEach((track) => {
            track.enabled = true;
            console.log("Video track enabled:", track.label, track.enabled);
          });

          try {
            await videoRef.current.play();
            console.log("Video playback started successfully");
          } catch (playError) {
            console.error("Error playing video:", playError);
            if (playError.name === "NotAllowedError") {
              console.log(
                "Autoplay was prevented. Video is muted, retrying play..."
              );
              try {
                await videoRef.current.play();
                console.log("Second play attempt successful");
              } catch (retryError) {
                console.error("Second play attempt failed:", retryError);
              }
            }
          }
        } catch (error) {
          console.error("Error setting srcObject:", error);
        }
      } else {
        console.log("Cannot attach stream:", {
          hasRemoteStream: !!remoteStream,
          hasVideoRef: !!videoRef.current,
          streamActive: remoteStream?.active,
          streamTracks: remoteStream?.getTracks().length,
        });
      }
    };

    attachStream();
  }, [remoteStream]);

  // Add video element event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleLoadedMetadata = () => {
        console.log("Video loadedmetadata event fired");
        console.log("Video dimensions:", {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
        });
      };

      const handleCanPlay = () => {
        console.log("Video canplay event fired");
      };

      const handlePlaying = () => {
        console.log("Video playing event fired");
      };

      const handleError = () => {
        const error = videoElement.error;
        console.error("Video error:", error);
        console.error("Error details:", {
          code: error?.code,
          message: error?.message,
        });
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("playing", handlePlaying);
      videoElement.addEventListener("error", handleError);

      return () => {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("playing", handlePlaying);
        videoElement.removeEventListener("error", handleError);
      };
    }
  }, []);

  const handleTestMessage = () => {
    // For testing purposes, send a test message over signaling.
    sendMessage({ type: "test", payload: "Hello from React TS" });
  };

  return (
    <div className="w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-lg font-medium mb-4">
          {environmentName} - Generation {generation}
        </div>
        <div className="text-sm mb-2">
          Connection State:{" "}
          <span
            className={`font-medium ${
              connectionState === "connected"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {connectionState}
          </span>
          {isReconnecting && (
            <span className="ml-2 text-blue-500">(Reconnecting...)</span>
          )}
        </div>
        {/* Video element is always rendered but may be hidden by CSS when inactive */}
        <video
          ref={videoRef}
          className={`w-full h-full bg-black ${!isActive ? "opacity-50" : ""}`}
          autoPlay
          playsInline
          muted
          controls
        />
        {!isActive && (
          <motion.div
            className="absolute text-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-400 mb-4">
              Waiting for video stream...
            </div>
            <div className="text-sm text-gray-500">
              {isReconnecting
                ? "Reconnecting..."
                : "Establishing connection..."}
            </div>
          </motion.div>
        )}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleTestMessage}
        >
          Send Test Message
        </button>
      </div>
    </div>
  );
};

export default VisualizationPanel;
