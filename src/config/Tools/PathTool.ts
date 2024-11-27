import { GameStore, RoadNode } from "../../store/gameStore";
import { Tool } from "../../types/tools";
import { djikstra } from "../../utils/mapUtils";

export class PathTool implements Tool {
  // private cell: [number, number] | null = null;
  public gameStore: GameStore;
  public size = 1;
  public cell: [number, number] | null = null;

  constructor(gameStore: GameStore) {
    this.gameStore = gameStore;
  }

  static price = 1;

  name = "Path";
  color = "#2196F3";
  hoverColor = "#64B5F6";

  effectRadius = 0;

  public previousCell: [number, number] | null = null;

  onPointerDown = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerDownSecondary = (i: number, j: number) => {
    this.cell = [i, j];
  };

  onPointerUp = (i: number, j: number) => {
    if (!this.cell) return;

    if (!this.previousCell) return (this.previousCell = this.cell);

    const roadPath = this.gameStore.getRoadGraph();

    // const path = PathTool.findPath(roadPath, this.previousCell, this.cell);

    const path = djikstra(
      this.previousCell.join(","),
      this.cell.join(","),
      roadPath
    );
    // console.log("> Path", path);

    this.previousCell = null;
    this.cell = null;
    if (path.length > 0) {
      this.gameStore.setRoutePath(path);
    }
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

export const createPathToolConfig = (gameStore: GameStore): Tool => {
  return new PathTool(gameStore);
};
