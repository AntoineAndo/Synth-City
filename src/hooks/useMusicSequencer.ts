import { useEffect, useCallback, useRef, useMemo } from "react";
import * as Tone from "tone";
import { MapType } from "../types/map";
import { useGameStore } from "../store/gameStore";
import { createSequence } from "../utils/musicUtils";

export const useMusicSequencer = () => {
  const map = useGameStore((state) => state.getMap());
  const buildings = Object.values(map.buildings);

  const synths = useRef<(Tone.MonoSynth | Tone.Synth)[]>([]);
  const sequences = useRef<Tone.Sequence[]>([]);

  //   const melodySynth = useRef<Tone.Synth | null>(null);
  //   const bassSynth = useRef<Tone.MonoSynth | null>(null);

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
    synths.current.forEach((synth) => {
      synth.dispose();
    });

    // Dispose all effects
    stereo.current?.dispose();
    reverb.current?.dispose();
    delay.current?.dispose();

    // Reset refs
    melodySequence.current = null;
    bassSequence.current = null;
    synths.current = [];
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
    delay.current = new Tone.FeedbackDelay("8n", 0.4).connect(reverb.current);

    synths.current = musicParams.synths.map((synth) => {
      return new synth.type({
        volume: synth.volume,
      }).connect(delay.current!);
    });

    synths.current.map((synth, index) => {
      new Tone.Sequence((time, note) => {
        synth.triggerAttackRelease(
          note,
          musicParams.synths[index].noteLength,
          time
        );
      }, musicParams.synths[index].sequence).start(0);
    });
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
        synths: [
          {
            volume: 10,
            type: Tone.Synth,
            sequence: houseSequence,
            noteLength: 0.5,
          },
          {
            volume: 1,
            type: Tone.MonoSynth,
            sequence: officeSequence,
            noteLength: 0.2,
          },
        ],
      };
    },
    [map]
  );

  const startSequencer = () => {
    Tone.Transport.start();
    Tone.start();

    sequences.current.forEach((sequence) => {
      sequence.start(0);
    });

    // melodySequence.current?.start(0);
    // bassSequence.current?.start(0);
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
