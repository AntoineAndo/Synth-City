import { EffectType } from "../store/gameStore";
import { BuildingType } from "../types/buildings";
import { Building } from "../classes/Building";
import { HousingBuilding } from "../classes/HousingBuilding";

export const BUILDINGS_CLASSES = {
  HOUSE: HousingBuilding,
  OFFICE: Building,
  ICE_CREAM: Building,
};

export type notePlacementType = "random" | "neat";

export interface BuildingConfig {
  price: number[];
  income: number[];
  inhabitantsCapacity: number[];
  fun: number[];
  workingCapacity: number[];
  size: number;
  effect?: {
    type: EffectType;
    radius: number;
    color: string;
  };
  notePlacement: notePlacementType;
}

export const BUILDINGS_CONFIG: Record<BuildingType, BuildingConfig> = {
  HOUSE: {
    price: [50, 100, 150],
    inhabitantsCapacity: [2, 4, 8],
    fun: [10, 8, 6],
    income: [0, 0, 0],
    workingCapacity: [0, 0, 0],
    size: 1,
    notePlacement: "neat",
  },
  OFFICE: {
    price: [500, 200, 300],
    inhabitantsCapacity: [0, 0, 0],
    fun: [0, 0, 0],
    income: [10, 20, 30],
    workingCapacity: [10, 10, 10],
    size: 2,
    notePlacement: "neat",
  },
  ICE_CREAM: {
    price: [200, 300, 400],
    inhabitantsCapacity: [0, 0, 0],
    fun: [10, 10, 10],
    income: [10, 20, 30],
    workingCapacity: [2, 3, 4],
    size: 1,
    effect: {
      type: "FUN",
      radius: 3,
      color: "blue",
    },
    notePlacement: "random",
  },
};
