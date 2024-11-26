import { GameStore } from "../../store/gameStore";
import { CellTypes } from "../../types/map";
import { Tool } from "../../types/tools";
import { drawSquarePath, updateCells } from "../../utils/mapUtils";

export class ParkTool implements Tool {
  public gameStore: GameStore;
  public size = 1;
  public cell: [number, number] | null = null;

  constructor(gameStore: GameStore) {
    this.gameStore = gameStore;
  }

  static price = 1;

  name = "Park";
  color = "green";
  hoverColor = "red";

  effectRadius = 0;

  onPointerDown = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerDownSecondary = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerUp = (i: number, j: number) => {
    if (!this.cell) return;

    const points = drawSquarePath(this.cell[0], this.cell[1], i, j);

    const map = this.gameStore.getMap();

    const { cells: newCellTypes, ignored } = updateCells(
      map,
      points,
      CellTypes.PARK
    );

    this.gameStore.setMap({
      ...map,
      cells: newCellTypes,
    });

    this.cell = null;
  };

  onPointerUpSecondary = (i: number, j: number) => {
    if (!this.cell) return;
    this.cell = null;
  };

  onPointerOver = (i: number, j: number): [number, number][] | null => {
    if (!this.cell) return null;

    return drawSquarePath(this.cell[0], this.cell[1], i, j);
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

export const createParkToolConfig = (gameStore: GameStore): Tool => {
  return new ParkTool(gameStore);
};
