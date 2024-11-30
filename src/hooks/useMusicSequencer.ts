import { useEffect, useCallback, useRef, useMemo } from "react";
import * as Tone from "tone";
import { MapType } from "../types/map";
import { useGameStore } from "../store/gameStore";
import { createSequence } from "../utils/musicUtils";

export const useMusicSequencer = () => {
  const map = useGameStore((state) => state.getMap());
  const buildings = Object.values(map.buildings);

  const synths = useRef<(Tone.MonoSynth | Tone.Synth | Tone.NoiseSynth)[]>([]);
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
    delay.current = new Tone.FeedbackDelay("8n", 0.2).connect(reverb.current);

    synths.current = musicParams.synths.map((synth) => {
      const newSynth = new synth.type(synth.options);

      if (synth.effects.length > 0) {
        // Connect last effect to reverb
        synth.effects[synth.effects.length - 1] = synth.effects[
          synth.effects.length - 1
        ].connect(reverb.current!);

        for (let i = 1; i < synth.effects?.length; i++) {
          synth.effects[i - 1] = synth.effects[i - 1].connect(synth.effects[i]);
        }

        // Connect first effect to synth
        newSynth.connect(synth.effects[0]);
      }

      return newSynth;
    });

    synths.current.map((synth, index) => {
      new Tone.Sequence((time, note) => {
        if (synth instanceof Tone.NoiseSynth) {
          if (note)
            synth.triggerAttackRelease(
              musicParams.synths[index].noteLength,
              time,
              100
            );
        } else {
          synth.triggerAttackRelease(
            note,
            musicParams.synths[index].noteLength,
            time
          );
        }
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
            type: Tone.Synth,
            sequence: houseSequence,
            noteLength: 0.5,
            options: {
              volume: 10,
            },
            effects: [],
          },
          {
            type: Tone.MonoSynth,
            sequence: officeSequence,
            noteLength: 0.2,
            options: {
              volume: 1,
            },
            effects: [],
          },
          {
            type: Tone.NoiseSynth,
            sequence: [
              "C2",
              undefined,
              undefined,
              undefined,
              "C2",
              undefined,
              undefined,
              undefined,
              "C2",
              undefined,
              undefined,
              undefined,
              "C2",
              undefined,
              undefined,
              undefined,
            ],
            noteLength: 0.2,
            options: {
              volume: 1,
              envelope: {
                attack: 0.0,
                decay: 0.03,
                sustain: 0,
                release: 1,
              },
            },
            effects: [new Tone.Filter(200, "lowpass")],
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
