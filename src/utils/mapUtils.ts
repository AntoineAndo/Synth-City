import { MODELS } from "../config/models";
import { CellInfo } from "../types/map";
import { CellType } from "../types/map";
import { Map } from "../types/map";

export function updateCells(
  map: Map,
  cells: [number, number][],
  cellType: CellType
): {
  cells: CellInfo[][];
  ignored: number;
} {
  let ignored = 0;
  const newCellTypes = [...map.cells];
  cells.forEach(([x, y]) => {
    if (newCellTypes[x][y].type.name === "road") {
      ignored++;
      return;
    }

    // Preserve the buildingId when changing cell type
    const buildingId = newCellTypes[x][y].buildingId;
    newCellTypes[x][y] = {
      ...newCellTypes[x][y],
      type: cellType,
      buildingId, // Keep the building reference
      renderInfo: generateRenderInfo(cellType.name), //The seed allows us to keep the same park when regenerating the map
    };
  });

  return {
    cells: newCellTypes,
    ignored,
  };
}

function generateRenderInfo(cellType: string) {
  if (cellType === "park") {
    const mushroomCount = Math.floor(Math.random() * (3 - 1 + 1)) + 1;

    const mushrooms = Array.from({ length: mushroomCount }).map(() => {
      const xOffset = Math.random() - 0.5;
      const zOffset = Math.random() - 0.5;

      return {
        type: "mushroom",
        modelConfig: MODELS.MUSHROOM,
        position: [xOffset, 0, zOffset],
        scale: Math.random() * (0.95 - 0.5) + 0.5,
        rotation: Math.random() * (2 * Math.PI),
      };
    });

    return {
      environment: {
        items: mushrooms,
      },
    };
  }
  return {};
}

// Helper function to draw an L-shaped path between two points
export const drawRoadPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): [number, number][] => {
  const points: [number, number][] = [];

  // Calculate distances
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  // Start at the beginning
  let currentX = x1;
  let currentY = y1;

  if (dx >= dy) {
    // Move horizontally first (longer distance)
    while (currentX !== x2) {
      points.push([currentX, currentY]);
      currentX += x1 < x2 ? 1 : -1;
    }
    // Then vertically
    while (currentY !== y2) {
      points.push([currentX, currentY]);
      currentY += y1 < y2 ? 1 : -1;
    }
  } else {
    // Move vertically first (longer distance)
    while (currentY !== y2) {
      points.push([currentX, currentY]);
      currentY += y1 < y2 ? 1 : -1;
    }
    // Then horizontally
    while (currentX !== x2) {
      points.push([currentX, currentY]);
      currentX += x1 < x2 ? 1 : -1;
    }
  }

  // Add the final point
  points.push([x2, y2]);

  return points;
};

export const drawSquarePath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): [number, number][] => {
  const points: [number, number][] = [];
  const xDir = x1 < x2 ? 1 : -1;
  const yDir = y1 < y2 ? 1 : -1;
  Array.from({ length: Math.abs(x2 - x1) + 1 }).forEach((_, i) => {
    // points.push([x1 + i, y1]);
    Array.from({ length: Math.abs(y2 - y1) + 1 }).forEach((_, j) => {
      points.push([x1 + i * xDir, y1 + j * yDir]);
    });
  });

  return points;
};
