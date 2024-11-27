import { useEffect, useCallback, useRef, useMemo } from "react";
import * as Tone from "tone";
import { CellInfo, CellTypes, MapType } from "../types/map";
import { useGameStore } from "../store/gameStore";
import seedrandom from "seedrandom";
import { BuildingType } from "../types/buildings";
import { Building } from "../classes/Building";

interface SequencerConfig {
  bpm: number;
  subdivisions: number; // How many steps in the sequence
  key: string[]; // Available notes in the key
}

export const useMusicSequencer = () => {
  const map = useGameStore((state) => state.getMap());
  const buildings = map.buildings;

  const melodySynth = useRef<Tone.Synth | null>(null);
  const bassSynth = useRef<Tone.MonoSynth | null>(null);

  const melodySequence = useRef<Tone.Sequence | null>(null);
  const bassSequence = useRef<Tone.Sequence | null>(null);

  const reverb = useRef<Tone.Freeverb | null>(null);

  useEffect(() => {
    // Initialize Tone.js
    Tone.start();
    Tone.Transport.bpm.value = 120;

    const musicParams = analyzeCityLayout(map);

    console.log("musicParams", musicParams);

    // Create effects that we'll modulate
    const stereo = new Tone.StereoWidener(1).toDestination();
    reverb.current = new Tone.Freeverb(musicParams.reverb, 100).connect(stereo);
    const delay = new Tone.FeedbackDelay("8n", 0.1).connect(reverb.current);

    // const chorus = new Tone.Chorus(0.5, 20, 5).connect(delay);

    // Create different instruments
    melodySynth.current = new Tone.Synth({
      volume: 5,
    }).connect(delay);
    bassSynth.current = new Tone.MonoSynth({
      volume: 10,
    }).connect(delay);

    // Create sequences
    melodySequence.current = new Tone.Sequence((time, note) => {
      melodySynth?.current?.triggerAttackRelease(note, 0.1, time);
    }, houseSequence).start(0);

    bassSequence.current = new Tone.Sequence((time, note) => {
      bassSynth?.current?.triggerAttackRelease(note, 0.1, time);
    }, officeSequence).start(0);

    return () => {
      melodySynth.current?.dispose();
      bassSynth.current?.dispose();
      melodySequence.current?.dispose();
      bassSequence.current?.dispose();
      Tone.Transport.cancel();
      reverb.current?.dispose();
      delay.dispose();
    };
  }, []);

  useEffect(() => {
    const musicParams = analyzeCityLayout(map);
    reverb.current?.set({
      roomSize: musicParams.reverb,
    });
  }, [map]);

  const houses = useMemo(() => {
    return Object.values(buildings).filter(
      (building) => building.buildingType === "HOUSE"
    );
  }, [buildings]);

  const offices = useMemo(() => {
    return Object.values(buildings).filter(
      (building) => building.buildingType !== "HOUSE"
    );
  }, [buildings]);

  const houseSequence = useMemo(() => {
    return createSequence(houses, [3, 4], "house");
  }, [houses]);

  const officeSequence = useMemo(() => {
    return createSequence(offices, [2, 2], "office");
  }, [offices]);

  melodySequence.current = new Tone.Sequence((time, note) => {
    melodySynth?.current?.triggerAttackRelease(note, 0.1, time);
    // subdivisions are given as subarrays
  }, houseSequence).start(0);

  bassSequence.current = new Tone.Sequence((time, note) => {
    bassSynth?.current?.triggerAttackRelease(note, 0.1, time);
  }, officeSequence).start(0);

  const updateSequence = useCallback((map: MapType) => {
    // Analyze map to create musical parameters
    // const musicParams = analyzeCityLayout(map);
    // Create new sequence based on buildings
    // const sequence = new Tone.Sequence(
    //   (time, step) => {
    //     // Get all houses in the current "column" of the map
    //     // const housesInStep = getHousesInColumn(map, step);
    //     // // Convert house positions to notes
    //     // housesInStep.forEach((house) => {
    //     //   const note = convertPositionToNote(house.position);
    //     //   melodySynth.triggerAttackRelease(note, "8n", time);
    //     // });
    //     melodySynth?.current?.triggerAttackRelease("C3", 0.1, time);
    //   },
    //   Array.from({ length: 8 }, (_, i) => i),
    //   "8n"
    // );
  }, []);

  const analyzeCityLayout = (map: MapType) => {
    return {
      reverb: calculateReverbAmount(map),
    };
  };

  const startSequencer = () => {
    Tone.Transport.cancel();
    Tone.Transport.start();
    melodySequence.current?.start(0);
    bassSequence.current?.start(0);
  };

  const stopSequencer = () => {
    Tone.Transport.stop();
  };

  return {
    updateSequence,
    startSequencer,
    stopSequencer,
  };
};

const slotPriority = [0, 5, 2, 4, 1, 6, 3, 7];

function createSequence(
  buildings: Building[],
  octaveRange: [number, number],
  seedPrefix: string
) {
  // First, generate the notes for each building
  const notes = buildings.map((building) =>
    randomNote(
      octaveRange,
      `${seedPrefix}-${building.position[0]}-${building.position[1]}`
    )
  );

  // Create an empty sequence of fixed length
  const sequenceLength = 8;
  const sequence = Array(sequenceLength).fill(null);

  // If we have no buildings, return empty sequence
  if (notes.length === 0) return sequence;

  notes.forEach((note, index) => {
    sequence[slotPriority.indexOf(index)] = note;
  });

  return sequence;
}

function randomNote(octaveRange: [number, number], seed: any) {
  const rng = seedrandom(seed);

  // Pick a random note from the major scale of C
  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const randomIndex = Math.floor(rng() * scale.length);

  const octave =
    Math.floor(rng() * (octaveRange[1] - octaveRange[0] + 1)) + octaveRange[0];

  return scale[randomIndex] + octave;
}

function calculateReverbAmount(map: MapType) {
  const nbParks = map.cells.reduce((total, row) => {
    return (total += row.filter((cell) => cell.type.name === "park").length);
  }, 0);

  //   Function with a limit of 1
  //   https://www.desmos.com/calculator?lang=fr
  const reverb = 1 / (1 + Math.pow(1.05, -1 * (nbParks - 20)));
  return reverb;
}
