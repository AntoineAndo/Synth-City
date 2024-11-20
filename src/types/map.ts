import { Building } from "../config/Buildings/Building";
import { BuildingConfig } from "../config/buildingsConfig";
import { ModelConfig } from "../config/models";

export const CellTypes = {
  GRASS: {
    name: "grass" as const,
    color: "lightgreen" as const,
    hoverColor: "green" as const,
  },
  ROAD: {
    name: "road" as const,
    color: "orange" as const,
    hoverColor: "red" as const,
  },
  BUILDING: {
    name: "building" as const,
    color: "lightgreen" as const,
    hoverColor: "purple" as const,
  },
} as const;

export type CellType = (typeof CellTypes)[keyof typeof CellTypes];

export type Cell = {
  type: CellType;
  height: number;
  buildingId?: string;
};

export interface BuildingInterface {
  id: string;
  model: ModelConfig;
  position: [number, number];
  size: number;
  padding: number;
  level: number;
  rotation: number;
  // effectRadius: number;
  config: BuildingConfig;
  inhabitants: number;
  workers: number;
}

export type Map = {
  cells: Cell[][];
  buildings: Record<string, Building>;
};

export interface BuildingConstructor {
  new (...args: any[]): BuildingInterface; // Constructor signature
  income: number[]; // Static property
}
