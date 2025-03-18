// src/hooks/useWebRTC.ts
import { useState, useEffect } from "react";
import signalingService, { SignalingMessage } from "@/lib/signaling";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

export default function useWebRTC() {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Create RTCPeerConnection with the ICE servers.
    const peer = new RTCPeerConnection({ iceServers });

    // When a local ICE candidate is generated, send it over the signaling channel.
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Local ICE candidate:", event.candidate);
        signalingService.sendMessage({
          type: "ice",
          // Convert candidate to RTCIceCandidateInit before sending.
          candidate: event.candidate.toJSON(),
        });
      } else {
        console.log("All local ICE candidates have been sent");
      }
    };

    // When a remote track is received, add it to our remote stream.
    peer.ontrack = (event) => {
      console.log("Remote track received");
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        // Create a new stream and add the track.
        const stream = new MediaStream();
        stream.addTrack(event.track);
        setRemoteStream(stream);
      }
    };

    // Optional: trigger negotiation if you require the browser to initiate.
    // (If your backend sends an offer, this may not be needed.)
    peer.onnegotiationneeded = async () => {
      try {
        console.log("Negotiation needed event triggered");
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        // Build the message using a proper RTCSessionDescriptionInit object.
        signalingService.sendMessage({
          type: "offer",
          sdp: peer.localDescription?.sdp,
        });
      } catch (error) {
        console.error("Error during negotiation:", error);
      }
    };

    setPc(peer);

    return () => {
      peer.close();
    };
  }, []);

  // Listen to incoming signaling messages.
  useEffect(() => {
    const messageHandler = async (message: SignalingMessage) => {
      if (!pc) return;

      console.log("useWebRTC received message:", message);

      if (message.type === "offer" && message.sdp) {
        try {
          // Create a valid RTCSessionDescriptionInit object by casting type accordingly.
          const remoteDesc = new RTCSessionDescription({
            type: message.type as RTCSdpType, // 'offer'
            sdp: message.sdp,
          });
          await pc.setRemoteDescription(remoteDesc);
          const answer = await pc.createAnswer();
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
          const remoteDesc = new RTCSessionDescription({
            type: message.type as RTCSdpType, // 'answer'
            sdp: message.sdp,
          });
          await pc.setRemoteDescription(remoteDesc);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      } else if (message.type === "ice" && message.candidate) {
        try {
          // Ensure that the candidate conforms to RTCIceCandidateInit.
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
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

  return { remoteStream, pc };
}
