import { PreviewCell } from "./PreviewCell";
import { MapType } from "../../types/map";
import { EdgesGeometry, LineBasicMaterial, PlaneGeometry } from "three";
import { Building } from "../../classes/Building";
import { useGameStore } from "../../store/gameStore";
import { Html } from "@react-three/drei";

function PreviewMap({
  map,
  previewPath,
  effectCircle,
  selectedBuilding,
}: {
  map: MapType;
  previewPath: any;
  effectCircle: any;
  selectedBuilding: {
    cells: [number, number][];
    building: Building;
  } | null;
}) {
  const routePath = useGameStore((state) => state.routePath);

  const gridSize = 10;

  const selectedBuildingCells = selectedBuilding?.cells[0];
  const size = selectedBuilding?.building.size;

  const offset = size === 1 || !size ? 0 : size / 4;

  return (
    <group position={[0.5, 0.02, 0.5]} rotation={[0, 0, 0]}>
      {previewPath &&
        previewPath.path.map((cell: [number, number]) => (
          <PreviewCell
            key={`path-${cell?.[0]}-${cell?.[1]}`}
            x={cell?.[0] - gridSize / 2}
            z={cell?.[1] - gridSize / 2}
            color={map.cells[cell?.[0]][cell?.[1]].type.hoverColor}
          />
        ))}

      {selectedBuildingCells && size && (
        <group
          key={`preview-${selectedBuildingCells?.[0]}-${selectedBuildingCells?.[1]}`}
          position={[
            selectedBuildingCells?.[0] - gridSize / 2 + offset,
            0.01,
            selectedBuildingCells?.[1] - gridSize / 2 + offset,
          ]}
        >
          <Html>
            <div>
              <h3>{selectedBuilding.building.buildingType}</h3>
            </div>
          </Html>

          {/* Border/Outline */}
          <lineSegments
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={new EdgesGeometry(new PlaneGeometry(size, size))}
            material={new LineBasicMaterial({ color: "red", linewidth: 1 })}
          />
        </group>
      )}

      {effectCircle.cells.length > 0 &&
        effectCircle.cells.map((cell: [number, number]) => (
          <PreviewCell
            key={`effect-${cell?.[0]}-${cell?.[1]}`}
            x={cell?.[0] - gridSize / 2}
            z={cell?.[1] - gridSize / 2}
            color={effectCircle.color}
          />
        ))}

      {/* Route Path */}
      {routePath.length > 0 &&
        routePath.map((cell) => (
          <mesh
            key={`route-${cell?.[0]}-${cell?.[1]}`}
            position={[cell[0] - gridSize / 2, 0, cell[1] - gridSize / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {/* <boxGeometry args={[0.3, 0.01, 0.3]} /> */}
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        ))}
    </group>
  );
}

export default PreviewMap;
