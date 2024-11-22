import { EffectType } from "../store/gameStore";
import { BuildingType } from "../types/buildings";
import { BuildingInterface } from "../types/map";
import { BuildingConfig, BUILDINGS_CONFIG } from "../config/buildingsConfig";
import { MODELS } from "../config/models";
import { ModelConfig } from "../config/models";

type BuildingProps = {
  id: string;
  position: [number, number];
  size: number;
  rotation: number;
  buildingType: BuildingType;
  buildingCells: [number, number][];
  effects: Record<EffectType, number>;
};

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
  happiness: number = 0;

  // effectRadius: number;
  config: BuildingConfig;
  effects: Record<EffectType, number> = {
    FUN: 0,
  };
  constructor({
    id,
    position,
    size,
    rotation,
    buildingType,
    buildingCells,
    effects,
  }: BuildingProps) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.rotation = rotation;
    this.level = 0;
    this.buildingType = buildingType;
    this.buildingCells = buildingCells;
    this.effects = effects;
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
