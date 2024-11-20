import { Map } from "./map";

export interface GameMetrics {
  money: number;
  inhabitants: number;
  inhabitantsCapacity: number;
  happiness: number;
  workingPeople: number;
  workingCapacity: number;
  economicEfficiency: number; // Ratio between 0 and 1 representing economic efficiency
  rawIncome: number; // Max income without any modifiers, calculated from the number of offices
  attractiveness: number; // Ratio between 0 and 1 representing the attractiveness of the city
}

export interface MetricModifier {
  target: keyof GameMetrics;
  value: number | ((metrics: GameMetrics) => number);
  reason: string;
  operation: MetricOperation;
}

export interface MetricThreshold {
  condition: (metrics: GameMetrics, map: Map) => boolean;
  modifiers: MetricModifier[];
  description: string;
}

export type MetricOperation = "add" | "multiply" | "replace";
