import { BuildingType } from "../../types/buildings";
import { BuildingInterface } from "../../types/map";
import { BuildingConfig, BUILDINGS_CONFIG } from "../buildingsConfig";
import { MODELS } from "../models";
import { ModelConfig } from "../models";

export class Building implements BuildingInterface {
  id: string;
  position: [number, number];
  size: number;
  padding: number = 0.1;
  level: number;
  model: ModelConfig;
  rotation: number = 0;
  buildingType: BuildingType;
  buildingCells: [number, number][] = [];

  inhabitants: number = 0;
  workers: number = 0;

  // effectRadius: number;
  config: BuildingConfig;

  constructor({
    id,
    position,
    size,
    rotation,
    buildingType,
    buildingCells,
  }: BuildingProps) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.rotation = rotation;
    this.level = 0;
    this.buildingType = buildingType;
    this.buildingCells = buildingCells;

    // this.effectRadius = BUILDINGS_CONFIG[buildingType].effect?.radius ?? 0;
    this.config = BUILDINGS_CONFIG[buildingType];

    this.model = getModelNameForBuildingType(buildingType);
  }

  upgrade() {
    this.level++;
  }
}

export function getModelNameForBuildingType(
  buildingType: BuildingType
): ModelConfig {
  return MODELS[buildingType];
}

type BuildingProps = {
  id: string;
  position: [number, number];
  size: number;
  rotation: number;
  buildingType: BuildingType;
  buildingCells: [number, number][];
};
