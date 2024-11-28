import seedrandom from "seedrandom";
import { Building } from "../classes/Building";
import { MapType } from "../types/map";

export function generateSeed(s: (string | number)[]): string {
  return s.join("-");
}

export type Scale = "minor" | "major";

const scaleConfig: Record<Scale, string[]> = {
  minor: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  major: ["C", "D", "E", "F", "G", "A", "B"],
};

export function randomNote(
  {
    octaveRange,
    scale = "major",
  }: {
    octaveRange: [number, number];
    scale?: Scale;
  },
  seed: string
) {
  const rng = seedrandom(seed);

  const randomIndex = Math.floor(rng() * scale.length);

  const octave =
    Math.floor(rng() * (octaveRange[1] - octaveRange[0] + 1)) + octaveRange[0];

  return scaleConfig[scale][randomIndex] + octave;
}

const slotPriority = [0, 5, 2, 4, 1, 6, 3, 7];

export function createSequence(
  buildings: Building[],
  octaveRange: [number, number],
  seedPrefix: string
) {
  const scale = "major";

  // Create an empty sequence of fixed length
  const sequenceLength = 8;
  const sequence = Array(sequenceLength).fill(null);
  const emptyIndexes = Array.from({ length: 8 }, (_, index) => index);

  // First, generate the notes for each building
  // Sort the buildings by their notePlacement priority
  // First we place the "neat" buildings, then the "random" ones
  buildings
    .sort((a, b) => (a.config.notePlacement === "neat" ? -1 : 1))
    .forEach((building, index) => {
      const seed = generateSeed([
        seedPrefix,
        building.position[0],
        building.position[1],
        building.rotation,
      ]);
      const note = randomNote({ octaveRange, scale }, seed);
      const rng = seedrandom(seed);

      // If the placement is "Neat", we place the note so that they spread out evenly
      if (building.config.notePlacement === "neat") {
        sequence[slotPriority.indexOf(index)] = note;
        // Remove the index from the empty indexes
        emptyIndexes.splice(slotPriority.indexOf(index), 1);
      } else {
        // If the placement is "Random", we place the note randomly in one of the empty slots
        const randomIndex = Math.floor(rng() * (emptyIndexes.length - 1));
        sequence[emptyIndexes[randomIndex]] = note;
        // Remove the index from the empty indexes
        emptyIndexes.splice(randomIndex, 1);
      }
    });

  return sequence;
}

export function calculateReverbAmount(map: MapType) {}

export function analyzeCityLayout(map: MapType) {
  return {
    reverb: calculateReverbAmount(map),
  };
}
