import { TextureCollection } from "../assets/textures";
import { Cell, CellType, Map } from "../types/map";
import * as THREE from "three";

export type PointerType = "primary" | "secondary";

type Props = {
  i: number;
  j: number;
  cell: Cell;
  map: Map;
  gridSize: number;
  textures: TextureCollection;
};

export const MapCell = ({ i, j, cell, gridSize, map, textures }: Props) => {
  const getColor = () => {
    return cell.type.color;
  };

  const adjacency = {
    above: map.cells[i][j - 1]?.type?.name === "road",
    below: map.cells[i][j + 1]?.type?.name === "road",
    left: map.cells[i - 1]?.[j]?.type?.name === "road",
    right: map.cells[i + 1]?.[j]?.type?.name === "road",
  };

  const { texture, rotation } = getTextureAndRotation(
    cell.type,
    adjacency,
    textures
  );

  return (
    <>
      <mesh
        position={[i - gridSize / 2, cell.height / 2, j - gridSize / 2]}
        rotation={[Math.PI / 2, 0, rotation]}
        receiveShadow
      >
        <boxGeometry args={[0.95, 0.95, cell.height]} />
        {cell.type.name === "road" ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial
            color={getColor()}
            roughness={1}
            metalness={0}
          />
        )}
      </mesh>
    </>
  );
};

function getTextureAndRotation(
  type: CellType,
  adjacency: any,
  textures: TextureCollection
) {
  let texture: THREE.Texture = textures.ROAD.STRAIGHT;
  let rotation: number = 0;

  const adjacencyCount = Object.values(adjacency).filter(Boolean).length;

  if (type.name === "road") {
    // Dead end
    if (adjacencyCount === 1) {
      texture = textures.ROAD.END;
      if (adjacency.above) {
        rotation = Math.PI;
      } else if (adjacency.left) {
        rotation = Math.PI / 2;
      } else if (adjacency.right) {
        rotation = -Math.PI / 2;
      } else if (adjacency.below) {
        rotation = 0;
      }
    } else if (adjacencyCount === 2) {
      if (adjacency.above && adjacency.below) {
        // Straight vertical
        texture = textures.ROAD.STRAIGHT;
        rotation = 0;
      } else if (adjacency.left && adjacency.right) {
        // Straight horizontal
        texture = textures.ROAD.STRAIGHT;
        rotation = Math.PI / 2;
      } else if (adjacency.above && adjacency.left) {
        //Corner Top to left
        texture = textures.ROAD.CORNER;
        rotation = Math.PI / 2;
      } else if (adjacency.above && adjacency.right) {
        //Corner top to right
        texture = textures.ROAD.CORNER;
        rotation = Math.PI;
      } else if (adjacency.below && adjacency.left) {
        //Corner bottom to left
        texture = textures.ROAD.CORNER;
        rotation = 0;
      } else if (adjacency.below && adjacency.right) {
        //Corner bottom to right
        texture = textures.ROAD.CORNER;
        rotation = -Math.PI / 2;
      }
    } else if (adjacencyCount === 3) {
      // ThreeWay
      texture = textures.ROAD.THREE_WAY;

      if (!adjacency.above) {
        rotation = -Math.PI / 2;
      } else if (!adjacency.left) {
        rotation = Math.PI;
      } else if (!adjacency.right) {
        rotation = 0;
      } else if (!adjacency.below) {
        rotation = Math.PI / 2;
      }
    } else if (adjacencyCount === 4) {
      //Intersection
      texture = textures.ROAD.INTERSECTION;
    }
  }

  return { texture, rotation };
}
