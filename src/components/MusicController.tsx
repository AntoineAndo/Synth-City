import { useEffect } from "react";
import * as Tone from "tone";
import { useMusicStore } from "../store/musicStore";
import { useMusicSequencer } from "../hooks/useMusicSequencer";

export const MusicController = () => {
  const isPlaying = useMusicStore((state) => state.getIsPlaying());
  const { initSequencer, startSequencer, stopSequencer } = useMusicSequencer();

  useEffect(() => {
    initSequencer();
    // Cleanup on unmount
    return () => {
      Tone.Transport.stop();
      stopSequencer();
    };
  }, []);

  useEffect(() => {
    // Stop music on component mount
    if (isPlaying) {
      Tone.start();
      Tone.Transport.start();
      startSequencer();
    } else {
      Tone.Transport.stop();
      stopSequencer();
    }
  }, [isPlaying]);

  return null; // This is a logical component, no UI needed
};
