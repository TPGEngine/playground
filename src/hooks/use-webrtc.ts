// src/hooks/useWebRTC.ts
import { useState, useEffect, useCallback } from "react";
import signalingService, { SignalingMessage } from "@/lib/signaling";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const configuration: RTCConfiguration = {
  iceServers,
  iceTransportPolicy: "all",
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
  iceCandidatePoolSize: 0,
};

export default function useWebRTC() {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Create and configure a new RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    console.log("Creating new RTCPeerConnection with config:", configuration);
    const peer = new RTCPeerConnection(configuration);

    // When a local ICE candidate is generated, send it over the signaling channel.
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
        signalingService.sendMessage({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
        });
      } else {
        console.log("All local ICE candidates have been sent");
      }
    };

    // Log connection state changes
    peer.onconnectionstatechange = () => {
      console.log("Connection state changed:", peer.connectionState);

      // Handle connection failures
      if (peer.connectionState === "failed") {
        console.log("Connection failed, attempting to reconnect...");
        setIsReconnecting(true);
        peer.close();
        setPc(null);
        setRemoteStream(null);
        // Create a new connection after a short delay
        setTimeout(() => {
          console.log("Creating new connection after failure...");
          const newPeer = createPeerConnection();
          setPc(newPeer);
          setIsReconnecting(false);
        }, 2000);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.iceConnectionState);
    };

    // When a remote track is received, add it to our remote stream.
    peer.ontrack = (event) => {
      console.log("ontrack event fired:", event);
      console.log("Track kind:", event.track.kind);
      console.log("Streams received:", event.streams);

      if (event.streams && event.streams[0]) {
        console.log("Setting remote stream from event.streams[0]");
        const stream = event.streams[0];
        console.log("Stream object:", stream);
        console.log("Stream tracks:", stream.getTracks());
        setRemoteStream(stream);
      } else {
        console.log(
          "No streams array in track event, creating new MediaStream"
        );
        const stream = new MediaStream();
        stream.addTrack(event.track);
        console.log("Created new stream with track:", stream);
        console.log("Stream tracks after adding:", stream.getTracks());
        setRemoteStream(stream);
      }
    };

    return peer;
  }, []);

  // Initialize peer connection
  useEffect(() => {
    const peer = createPeerConnection();
    setPc(peer);

    return () => {
      console.log("Cleaning up RTCPeerConnection");
      peer.close();
    };
  }, [createPeerConnection]);

  // Listen to incoming signaling messages.
  useEffect(() => {
    const messageHandler = async (message: SignalingMessage) => {
      if (!pc) {
        console.warn("Received signaling message but pc is null:", message);
        return;
      }

      if (message.type === "offer" && message.sdp) {
        try {
          console.log("Received offer:", message);
          const remoteDesc = new RTCSessionDescription({
            type: message.type as RTCSdpType,
            sdp: message.sdp,
          });
          console.log("Setting remote description (offer)");
          await pc.setRemoteDescription(remoteDesc);
          console.log("Creating answer");
          const answer = await pc.createAnswer();
          console.log("Setting local description (answer)");
          await pc.setLocalDescription(answer);
          signalingService.sendMessage({
            type: "answer",
            sdp: pc.localDescription?.sdp,
          });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      } else if (message.type === "answer" && message.sdp) {
        try {
          console.log("Received answer:", message);
          const remoteDesc = new RTCSessionDescription({
            type: message.type as RTCSdpType,
            sdp: message.sdp,
          });
          console.log("Setting remote description (answer)");
          await pc.setRemoteDescription(remoteDesc);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      } else if (message.type === "ice-candidate" && message.candidate) {
        try {
          let candidateInit: RTCIceCandidateInit;
          if (typeof message.candidate === "string") {
            candidateInit = {
              candidate: message.candidate,
              sdpMid: message.sdpMid || "video0",
              sdpMLineIndex:
                message.sdpMLineIndex !== undefined ? message.sdpMLineIndex : 0,
            };
          } else {
            candidateInit = message.candidate;
          }
          console.log("Adding ICE candidate:", candidateInit);
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
          console.log("ICE candidate added successfully");
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    signalingService.addMessageHandler(messageHandler);
    return () => {
      signalingService.removeMessageHandler(messageHandler);
    };
  }, [pc]);

  return { remoteStream, pc, isReconnecting };
}
