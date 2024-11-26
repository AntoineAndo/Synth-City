import { Building } from "../classes/Building";
import { BuildingConfig } from "../config/buildingsConfig";
import { ModelConfig } from "../config/models";
import { EffectType } from "../store/gameStore";

export enum EnumCellTypes {
  GRASS = "GRASS",
  ROAD = "ROAD",
  BUILDING = "BUILDING",
  PARK = "PARK",
}

export type CellType = {
  name: string;
  color: string;
  hoverColor: string;
};

export const CellTypes: Record<EnumCellTypes, CellType> = {
  GRASS: {
    name: "grass",
    color: "lightgreen",
    hoverColor: "green",
  },
  ROAD: {
    name: "road",
    color: "orange",
    hoverColor: "red",
  },
  BUILDING: {
    name: "building",
    color: "lightgreen",
    hoverColor: "purple",
  },
  PARK: {
    name: "park",
    color: "green",
    hoverColor: "red",
  },
};

export type CellInfo = {
  type: CellType;
  height: number;
  buildingId?: string;
  renderInfo?: {
    environment?: {
      items: any[];
    };
  };
};

export interface BuildingInterface {
  id: string;
  model: ModelConfig;
  position: [number, number];
  size: number;
  padding: number;
  level: number;
  rotation: number;
  config: BuildingConfig;
  inhabitants: number;
  workers: number;
  happiness: number;
  effects: Record<EffectType, number>;
}

export type MapType = {
  cells: CellInfo[][];
  buildings: MapBuilding;
};

export type MapBuilding = Record<string, Building>;
