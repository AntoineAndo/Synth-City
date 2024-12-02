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

  const musicParams = useRef<{
    reverb: number;
    synths: any[];
  } | null>(null);

  const cleanup = useCallback(() => {
    // Dispose all sequences
    melodySequence.current?.dispose();
    bassSequence.current?.dispose();

    musicParams.current?.synths.forEach((synth) => {
      synth.synth.dispose();
      synth.effects.forEach((effect: any) => {
        effect.dispose();
      });
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
    musicParams.current = analyzeCityLayout(map);

    console.log(musicParams.current);

    // Create effects that we'll modulate
    stereo.current = new Tone.StereoWidener(0.3).toDestination();
    reverb.current = new Tone.Freeverb(
      musicParams.current!.reverb,
      100
    ).connect(stereo.current);
    // delay.current = new Tone.FeedbackDelay("8n", 0.2).connect(reverb.current);

    synths.current = musicParams.current!.synths.map(({ synth, effects }) => {
      //   const newSynth = new synth.type(synth.options);

      if (effects.length > 0) {
        // Connect last effect to reverb
        effects[effects.length - 1] = effects[effects.length - 1].connect(
          reverb.current!
        );

        for (let i = 1; i < effects?.length; i++) {
          effects[i - 1] = effects[i - 1].connect(effects[i]);
        }

        // Connect first effect to synth
        synth.connect(effects[0]);
      } else {
        synth.connect(reverb.current!);
      }

      return synth;
    });

    synths.current.map((synth, index) => {
      new Tone.Sequence((time, note) => {
        musicParams.current!.synths[index].playNote(synth, {
          note,
          length: musicParams.current!.synths[index].noteLength,
          time,
        });
      }, musicParams.current!.synths[index].sequence).start(0);
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
            synth: new Tone.Synth({
              volume: 10,
            }),
            sequence: houseSequence,
            noteLength: 0.5,
            effects: [new Tone.FeedbackDelay("8n.", 0.6)],
            playNote: (
              synth: Tone.Synth,
              {
                note,
                length,
                time,
              }: { note: string; length: number; time: number }
            ) => {
              synth.triggerAttackRelease(note, length, time);
            },
          },
          {
            synth: new Tone.MonoSynth({
              volume: 1,
            }),
            sequence: officeSequence,
            noteLength: 0.2,
            effects: [],
            playNote: (
              synth: Tone.MonoSynth,
              {
                note,
                length,
                time,
              }: { note: string; length: number; time: number }
            ) => {
              synth.triggerAttackRelease(note, length, time);
            },
          },
          {
            synth: new Tone.NoiseSynth({
              volume: 1,
              envelope: {
                attack: 0.0,
                decay: 0.03,
                sustain: 0,
                release: 0,
              },
            }),
            playNote: (
              synth: Tone.NoiseSynth,
              {
                note,
                length,
                time,
              }: { note: string; length: number; time: number }
            ) => {
              synth.triggerAttackRelease(length, time, 50);
            },
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
            effects: [new Tone.Filter(100, "lowpass")],
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
