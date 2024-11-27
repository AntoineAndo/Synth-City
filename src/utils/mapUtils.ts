import { MODELS } from "../config/models";
import { RoadNode } from "../store/gameStore";
import { CellInfo } from "../types/map";
import { CellType } from "../types/map";
import { MapType } from "../types/map";

export function updateCells(
  map: MapType,
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

const adjacencyList = {
  A: {
    neighbors: ["B", "C"],
  },
  B: {
    neighbors: ["A", "C", "D"],
  },
  C: {
    neighbors: ["A", "B"],
  },
  D: {
    neighbors: ["B", "E"],
  },
  E: {
    neighbors: ["D"],
  },
};

export function djikstra(
  start: string,
  end: string,
  adj: Map<string, RoadNode>
): [number, number][] {
  // Initialize distances
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited: Set<string> = new Set();

  // Initialize all nodes with infinity distance except start
  for (const nodeId of adj.keys()) {
    distances[nodeId] = nodeId === start ? 0 : Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }

  while (unvisited.size > 0) {
    // Get unvisited node with minimum distance
    const current = getNextNode(distances, unvisited);

    if (current === null || distances[current] === Infinity) {
      break; // No reachable nodes left
    }

    if (current === end) {
      break; // Found the destination
    }

    unvisited.delete(current);

    // Check all neighbors of current node
    adj.get(current)?.neighbors.forEach((neighbor) => {
      const neighborId = neighbor.node.join(",");

      if (!unvisited.has(neighborId)) return;

      const distance = distances[current] + 1; // +1 because unweighted
      if (distance < distances[neighborId]) {
        distances[neighborId] = distance;
        previous[neighborId] = current;
      }
    });
  }

  // Reconstruct path
  const path = [];
  let current: string | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path.map((node) => node.split(",").map(Number)) as [number, number][];
}

function getNextNode(
  distances: Record<string, number>,
  unvisited: Set<string>
) {
  let minDistance = Infinity;
  let minNode = null;

  for (const node of unvisited) {
    if (distances[node] < minDistance) {
      minDistance = distances[node];
      minNode = node;
    }
  }

  return minNode;
}

export function getEffectCircle(
  center: [number, number] | null,
  radius: number,
  gridSize: number
) {
  if (!center) return [];
  const [x, y] = center;
  const circle: [number, number][] = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      // Check if point is within radius using distance formula
      if (Math.sqrt(i * i + j * j) <= radius) {
        const newX = x + i;
        const newY = y + j;
        // Only add if within grid bounds
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          circle.push([newX, newY]);
        }
      }
    }
  }
  return circle;
}
