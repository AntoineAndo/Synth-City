import { GameStore } from "../../store/gameStore";
import { Tool } from "../../types/tools";

export class CursorTool implements Tool {
  // private cell: [number, number] | null = null;
  public gameStore: GameStore;
  public size = 1;
  public cell: [number, number] | null = null;

  constructor(gameStore: GameStore) {
    this.gameStore = gameStore;
  }

  static price = 1;

  name = "Cursor";
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

    const map = this.gameStore.getMap();
    const cell = map.cells[this.cell[0]][this.cell[1]];

    // Update the selected building
    let newSelectedBuilding = null;
    if (cell.buildingId) {
      const building = map.buildings[cell.buildingId];
      newSelectedBuilding = {
        cells: building.buildingCells,
        building,
      };
    }

    console.log("> Selected building", newSelectedBuilding);

    this.gameStore.setSelectedBuilding(newSelectedBuilding);

    this.cell = null;
  };

  onPointerUpSecondary = (i: number, j: number) => {
    if (!this.cell) return;
    this.cell = null;
  };

  onPointerOver = (i: number, j: number): [number, number][] | null => {
    return null;
  };

  handleKeyPress = (e: KeyboardEvent) => {};

  validate = (
    i: number,
    j: number,
    isDragging: boolean,
    preview: any
  ): boolean => {
    return true;
  };
}

export const createCursorToolConfig = (gameStore: GameStore): Tool => {
  return new CursorTool(gameStore);
};
