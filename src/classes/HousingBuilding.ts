import { BUILDINGS_CONFIG } from "../config/buildingsConfig";
import { Building, BuildingProps } from "./Building";

export class HousingBuilding extends Building {
  inhabitants: number = 0;
  happiness: number = 0;

  constructor({
    id,
    position,
    size,
    rotation,
    buildingType,
    buildingCells,
    effects,
  }: BuildingProps) {
    super({
      id,
      position,
      size,
      rotation,
      buildingType,
      buildingCells,
      effects,
    });

    this.inhabitants = BUILDINGS_CONFIG[buildingType].inhabitantsCapacity[0];
    this.happiness = 0;
  }
}
