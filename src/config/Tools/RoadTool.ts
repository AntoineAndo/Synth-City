import { GameStore, RoadNode } from "../../store/gameStore";
import { CellTypes, MapType } from "../../types/map";
import { Tool } from "../../types/tools";
import { saveGame } from "../../utils/gameUtils";
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

    const newMap: MapType = {
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

    // Generate road graph
    const roadGraph = generateRoadGraph(newMap);

    this.gameStore.setRoadGraph(roadGraph);

    // Save the game
    saveGame(this.gameStore);

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

const generateRoadGraph = (map: MapType): Map<string, RoadNode> => {
  const roadGraph = new Map<string, RoadNode>();
  const positionToKey = (pos: [number, number]): string =>
    `${pos[0]},${pos[1]}`;

  map.cells.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.type.name === "road") {
        const key = positionToKey([i, j]);
        roadGraph.set(key, {
          position: [i, j],
          neighbors: [],
        });
      }
    });
  });

  // Second pass: connect neighboring road cells
  roadGraph.forEach((node) => {
    const [i, j] = node.position;

    // Check all 4 directions (you can add diagonals if needed)
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    directions.forEach(([di, dj]) => {
      const newI = i + di;
      const newJ = j + dj;

      // Check if neighbor exists and is a road
      if (map.cells[newI]?.[newJ]?.type.name === "road") {
        node.neighbors.push({
          node: [newI, newJ],
          distance: 1, // You can modify this based on your needs
        });
      }
    });
  });

  return roadGraph;
};

export const createRoadToolConfig = (gameStore: GameStore): Tool => {
  return new RoadTool(gameStore);
};
