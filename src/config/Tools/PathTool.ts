import { GameStore, RoadNode } from "../../store/gameStore";
import { Tool } from "../../types/tools";

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

    const map = this.gameStore.getMap();
    const roadPath = this.gameStore.getRoadGraph();

    const path = PathTool.findPath(roadPath, this.previousCell, this.cell);

    console.log("> Path", path);

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

  static findPath = (
    roadPath: Map<string, RoadNode>,
    start: [number, number],
    end: [number, number]
  ): [number, number][] => {
    console.log("> start", start);
    console.log("> end", end);

    const startKey = `${start[0]},${start[1]}`;
    const endKey = `${end[0]},${end[1]}`;
    const visited = new Set<string>();
    const queue = [[startKey]];
    const path = [];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (!currentPath) continue;
      const currentNodeKey = currentPath[currentPath.length - 1];
      const currentNode = roadPath.get(currentNodeKey);

      if (!currentNode) continue;

      if (currentNodeKey === endKey) {
        path.push(currentNode.position);
        break;
      }

      if (visited.has(currentNodeKey)) continue;
      visited.add(currentNodeKey);

      currentNode.neighbors.forEach((neighbor) => {
        const neighborKey = `${neighbor.node[0]},${neighbor.node[1]}`;
        const newPath = [...currentPath, neighborKey];
        queue.push(newPath);
      });
    }

    return path.reverse();
  };
}

export const createPathToolConfig = (gameStore: GameStore): Tool => {
  return new PathTool(gameStore);
};
