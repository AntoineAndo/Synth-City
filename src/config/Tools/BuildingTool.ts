import { CellInfo, CellTypes } from "../../types/map";
import { Tool } from "../../types/tools";
import { EffectType, GameStore } from "../../store/gameStore";
import { BuildingType } from "../../types/buildings";
import { BUILDINGS_CLASSES, BUILDINGS_CONFIG } from "../buildingsConfig";
import { getEffectCircle } from "../../components/MapBuilder";
import { Building } from "../../classes/Building";

export class BuildingTool implements Tool {
  public cell: [number, number] | null = null;
  public gameStore: GameStore;
  public buildingType: BuildingType;
  public size: number;
  public effect?: {
    type: EffectType;
    radius: number;
  };

  constructor(gameStore: GameStore, buildingType: BuildingType) {
    this.gameStore = gameStore;
    this.buildingType = buildingType;
    this.size = BUILDINGS_CONFIG[this.buildingType].size;
    this.effect = BUILDINGS_CONFIG[this.buildingType]?.effect;
  }

  public rotation: number = 0;

  name = "House";
  // model: ModelConfig = MODELS.HOUSE;
  color = "#2196F3";
  hoverColor = "#64B5F6";
  invalidColor = "#FF7043";

  onPointerDown = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerUp = (
    i: number,
    j: number,
    previewPath?: [number, number][],
    effectPath?: [number, number][]
  ) => {
    if (!this.cell || !previewPath?.length) return;

    const buildingCells: [number, number][] = [];
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        buildingCells.push([i + x, j + z]);
      }
    }

    const effectMaps = this.gameStore.getEffectMaps();

    let effectValues: Record<EffectType, number> = {
      FUN: 0,
    };

    if (this.effect) {
      const effectMap = effectMaps[this.effect.type];
      if (effectMap) {
        // Get the effect circle
        const effectCells: [number, number][] = getEffectCircle(
          [i, j],
          this.effect.radius,
          this.gameStore.getMap().cells.length
        );

        // Patch the effect map with the effect circle
        effectCells.forEach(([i, j]) => {
          effectMap[i][j] = 1;
        });

        // update the effect map
        this.gameStore.setEffectMaps({
          ...this.gameStore.getEffectMaps(),
          [this.effect.type]: effectMap,
        });

        // Recompute the effects value for all the buildings
        // This is only necessary when an effect building is placed
        const newBuildings = BuildingTool.computeEffects(
          this.gameStore.getMap().buildings,
          this.effect!.type,
          effectMap
        );

        this.gameStore.setMap({
          ...this.gameStore.getMap(),
          buildings: newBuildings,
        });
      }
    }

    // CHeck if the building is in the effect zone
    buildingCells.forEach((cell) => {
      Object.keys(effectMaps).forEach((effectType) => {
        const effectMap = effectMaps[effectType as EffectType];
        if (effectMap && effectMap[cell[0]][cell[1]] === 1) {
          // Apply the effect of the building
          effectValues[effectType as EffectType] = 1;
        }
      });
    });

    // Place building
    this.placeBuilding([i, j], buildingCells, effectValues, previewPath);

    // Update metrics
    this.updateMetrics();

    this.cell = null;
  };

  onPointerOver = (i: number, j: number): [number, number][] => {
    const map = this.gameStore.map;

    const baseI = Math.floor(i);
    const baseJ = Math.floor(j);

    const previewCells: [number, number][] = [];
    for (let di = 0; di < this.size; di++) {
      for (let dj = 0; dj < this.size; dj++) {
        const newI = baseI + di;
        const newJ = baseJ + dj;
        if (
          newI >= 0 &&
          newI < map.cells.length &&
          newJ >= 0 &&
          newJ < map.cells[0].length
        ) {
          previewCells.push([newI, newJ]);
        }
      }
    }

    return previewCells;
  };

  onPointerDownSecondary = (i: number, j: number) => {};

  onPointerUpSecondary = (i: number, j: number) => {};

  validate = (i: number, j: number, isDragging: boolean, preview: any) => {
    const map = this.gameStore.getMap();
    const buildingConfig = BUILDINGS_CONFIG[this.buildingType];

    // Get all the unavailable points from the map (buildings and roads)
    const unavailablePoints = map.cells.flatMap((row, i) =>
      row
        .map((cell, j) =>
          cell.type.name === "building" || cell.type.name === "road"
            ? [i, j]
            : null
        )
        .filter((point) => point !== null)
    );

    // Check if the the preview path overlap with any unavailable points
    if (
      preview.some((previewPoint: [number, number]) =>
        unavailablePoints.some(
          (unavailablePoint) =>
            unavailablePoint[0] === previewPoint[0] &&
            unavailablePoint[1] === previewPoint[1]
        )
      )
    ) {
      return false;
    }

    // Check if we have enough money
    if (this.gameStore.getMetrics().money < buildingConfig.price[0]) {
      return false;
    }

    return true;
  };

  public placeBuilding = (
    cell: [number, number],
    buildingCells: [number, number][],
    effectValues: Record<EffectType, number>,
    previewPath?: [number, number][]
  ) => {
    const buildingId = Math.random().toString(36).substring(2, 15);

    const map = this.gameStore.getMap();

    // Change the type of the cells to building
    // And set the buildingId in the cells
    const cells: CellInfo[][] = map.cells.map((row, i) =>
      row.map((cell, j) =>
        previewPath?.some(([x, y]) => x === i && y === j)
          ? {
              ...cell,
              buildingId,
              type: CellTypes.BUILDING,
            }
          : cell
      )
    );
    map.cells = cells;

    const buildings = {
      ...map.buildings,
      [buildingId]: new BUILDINGS_CLASSES[this.buildingType]({
        id: buildingId,
        position: [cell[0], cell[1]],
        size: this.size,
        rotation: this.rotation,
        buildingType: this.buildingType,
        buildingCells,
        effects: effectValues,
      }),
    };

    this.gameStore.setMap({
      ...map,
      buildings,
    });
  };

  public updateMetrics = () => {
    const metrics = this.gameStore.getMetrics();

    const newMoney =
      metrics.money - BUILDINGS_CONFIG[this.buildingType].price[0];

    const newCapacity =
      metrics.inhabitantsCapacity +
      BUILDINGS_CONFIG[this.buildingType].inhabitantsCapacity[0];

    const newWorkingCapacity =
      metrics.workingCapacity +
      BUILDINGS_CONFIG[this.buildingType].workingCapacity[0];

    const newRawIncome =
      metrics.rawIncome + BUILDINGS_CONFIG[this.buildingType].income[0];

    this.gameStore.setMetrics({
      ...metrics,
      money: newMoney,
      inhabitantsCapacity: newCapacity,
      workingCapacity: newWorkingCapacity,
      rawIncome: newRawIncome,
    });
  };

  /**
   * Recompute all the effects
   * @param building
   */
  public static computeEffects = (
    buildings: Record<string, Building>,
    effectType: EffectType,
    effectMap: number[][]
  ): Record<string, Building> => {
    Object.values(buildings).forEach((building) => {
      const buildingCells: [number, number][] = [];
      for (let x = 0; x < building.size; x++) {
        for (let z = 0; z < building.size; z++) {
          buildingCells.push([
            building.position[0] + x,
            building.position[1] + z,
          ]);
        }
      }

      const effects = {
        FUN: 0,
      };

      buildingCells.forEach((cell) => {
        if (effectMap[cell[0]][cell[1]] === 1) {
          effects[effectType] = effectMap[cell[0]][cell[1]];
        }
      });

      building.effects = effects;
    });
    return buildings;
  };

  public handleKeyPress = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "r") {
      this.rotation = (this.rotation + Math.PI / 2) % (Math.PI * 2);
      this.gameStore.setRotation(this.rotation);
    }
  };
}
export const createBuildingToolConfig = (
  gameStore: GameStore,
  buildingType: BuildingType
): Tool => {
  return new BuildingTool(gameStore, buildingType);
};
