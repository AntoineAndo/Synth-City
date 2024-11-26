import { GameStore } from "../../store/gameStore";
import { CellInfo, CellType, CellTypes, Map } from "../../types/map";
import { Tool } from "../../types/tools";
import { drawRoadPath, updateCells } from "../../utils/mapUtils";

export class RoadTool implements Tool {
  // private cell: [number, number] | null = null;
  public gameStore: GameStore;
  public size = 1;
  public cell: [number, number] | null = null;

  constructor(gameStore: GameStore) {
    this.gameStore = gameStore;
  }

  static price = 1;

  name = "Road";
  color = "#2196F3";
  hoverColor = "#64B5F6";

  effectRadius = 0;

  onPointerDown = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerDownSecondary = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerUp = (i: number, j: number) => {
    if (!this.cell) return;

    // Use Manhattan path instead of diagonal line
    const roadPoints = drawRoadPath(this.cell[0], this.cell[1], i, j);

    const map = this.gameStore.getMap();

    // Update cell types for all points in the path
    const { cells: newCellTypes, ignored } = updateCells(map, roadPoints, {
      name: "road",
      color: "orange",
      hoverColor: "red",
    });

    const newMap: Map = {
      cells: newCellTypes,
      buildings: {
        ...map.buildings,
      },
    };

    // Calculate the new money
    const roadPrice = (roadPoints.length - ignored) * RoadTool.price;
    const metrics = this.gameStore.getMetrics();
    const newMoney = metrics.money - roadPrice;

    this.gameStore.setMap(newMap);

    this.gameStore.setMetrics({
      ...metrics,
      money: newMoney,
    });

    this.cell = null;
  };

  onPointerUpSecondary = (i: number, j: number) => {
    if (!this.cell) return;

    // Use Manhattan path instead of diagonal line
    const roadPoints = drawRoadPath(this.cell[0], this.cell[1], i, j);

    const map = this.gameStore.getMap();

    // Update cell types for all points in the path
    const { cells: newCellTypes } = updateCells(
      map,
      roadPoints,
      CellTypes.ROAD
    );
    this.gameStore.setMap({
      ...map,
      cells: newCellTypes,
    });

    this.cell = null;
  };

  onPointerOver = (i: number, j: number): [number, number][] | null => {
    if (!this.cell) return null;

    return drawRoadPath(this.cell[0], this.cell[1], i, j);
  };

  handleKeyPress = (e: KeyboardEvent) => {};

  validate = (
    i: number,
    j: number,
    isDragging: boolean,
    preview: any
  ): boolean => {
    if (!isDragging) return true;

    const map = this.gameStore.getMap();

    const price = preview.length * RoadTool.price;

    if (this.gameStore.getMetrics().money < price) {
      return false;
    }

    const unavailablePoints = map.cells.flatMap((row, i) =>
      row
        .map((cell, j) => (cell.type.name === "building" ? [i, j] : null))
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

    return true;
  };
}

export const createRoadToolConfig = (gameStore: GameStore): Tool => {
  return new RoadTool(gameStore);
};
