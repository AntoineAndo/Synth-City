import { useEffect, useCallback, useRef, useMemo } from "react";
import * as Tone from "tone";
import { MapType } from "../types/map";
import { useGameStore } from "../store/gameStore";
import { createSequence } from "../utils/musicUtils";

export const useMusicSequencer = () => {
  const map = useGameStore((state) => state.getMap());
  const buildings = Object.values(map.buildings);

  const melodySynth = useRef<Tone.Synth | null>(null);
  const bassSynth = useRef<Tone.MonoSynth | null>(null);

  const melodySequence = useRef<Tone.Sequence | null>(null);
  const bassSequence = useRef<Tone.Sequence | null>(null);

  const stereo = useRef<Tone.StereoWidener | null>(null);
  const reverb = useRef<Tone.Freeverb | null>(null);
  const delay = useRef<Tone.FeedbackDelay | null>(null);

  const cleanup = useCallback(() => {
    // Dispose all sequences
    melodySequence.current?.dispose();
    bassSequence.current?.dispose();

    // Dispose all synths
    melodySynth.current?.dispose();
    bassSynth.current?.dispose();

    // Dispose all effects
    stereo.current?.dispose();
    reverb.current?.dispose();
    delay.current?.dispose();

    // Reset refs
    melodySequence.current = null;
    bassSequence.current = null;
    melodySynth.current = null;
    bassSynth.current = null;
    stereo.current = null;
    reverb.current = null;
    delay.current = null;

    // Stop and reset transport
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const initSequencer = useCallback(() => {
    // Clean up any existing instances first
    cleanup();

    Tone.Transport.bpm.value = 100;
    const musicParams = analyzeCityLayout(map);

    // Create effects that we'll modulate
    stereo.current = new Tone.StereoWidener(1).toDestination();
    reverb.current = new Tone.Freeverb(musicParams.reverb, 100).connect(
      stereo.current
    );
    delay.current = new Tone.FeedbackDelay("8n", 0.5).connect(reverb.current);

    // Create different instruments
    melodySynth.current = new Tone.Synth({
      volume: 10,
    }).connect(delay.current);
    bassSynth.current = new Tone.MonoSynth({
      volume: 1,
    }).connect(reverb.current);

    console.log("houseSequence", houseSequence);
    console.log("officeSequence", officeSequence);

    melodySequence.current?.dispose();
    // Create sequences
    melodySequence.current = new Tone.Sequence((time, note) => {
      melodySynth?.current?.triggerAttackRelease(note, 0.5, time);
    }, houseSequence).start(0);

    bassSequence.current?.dispose();
    bassSequence.current = new Tone.Sequence((time, note) => {
      bassSynth?.current?.triggerAttackRelease(note, 0.3, time);
    }, officeSequence).start(0);
  }, [map, cleanup]);

  useEffect(() => {
    initSequencer();
  }, [initSequencer]);

  const houses = useMemo(() => {
    return buildings.filter((building) => building.buildingType === "HOUSE");
  }, [buildings]);

  const offices = useMemo(() => {
    return buildings.filter((building) => building.buildingType !== "HOUSE");
  }, [buildings]);

  const houseSequence = useMemo(() => {
    return createSequence(houses, [3, 4], "house");
  }, [houses]);

  const officeSequence = useMemo(() => {
    return createSequence(offices, [2, 2], "office");
  }, [offices]);

  const updateSequence = useCallback((map: MapType) => {}, []);

  const analyzeCityLayout = useCallback(
    (map: MapType) => {
      return {
        reverb: calculateReverbAmount(map),
      };
    },
    [map]
  );

  const startSequencer = () => {
    Tone.Transport.start();
    Tone.start();

    melodySequence.current?.start(0);
    bassSequence.current?.start(0);
  };

  const stopSequencer = () => {
    Tone.Transport.stop();
  };

  return {
    initSequencer,
    updateSequence,
    startSequencer,
    stopSequencer,
  };
};

function calculateReverbAmount(map: MapType) {
  const nbParks = map.cells.reduce((total, row) => {
    return (total += row.filter((cell) => cell.type.name === "park").length);
  }, 0);

  //   Function with a limit of 1
  //   https://www.desmos.com/calculator?lang=fr
  const reverb = 1 / (1 + Math.pow(1.05, -1 * (nbParks - 20)));
  return reverb;
}
