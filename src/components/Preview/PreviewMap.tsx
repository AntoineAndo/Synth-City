import { PreviewCell } from "./PreviewCell";
import { Map } from "../../types/map";
import { EdgesGeometry, LineBasicMaterial, PlaneGeometry } from "three";
import { Building } from "../../classes/Building";

function PreviewMap({
  map,
  previewPath,
  effectCircle,
  selectedBuilding,
}: {
  map: Map;
  previewPath: any;
  effectCircle: any;
  selectedBuilding: {
    cells: [number, number][];
    building: Building;
  } | null;
}) {
  const gridSize = 10;

  // if (!hoveredCell) return null;
  // if (!previewPath) return null;

  // console.log(effectCircle);

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

      {selectedBuilding &&
        selectedBuilding.cells.length > 0 &&
        selectedBuilding.cells.map((cell) => (
          <group key={`preview-${cell?.[0]}-${cell?.[1]}`}>
            {/* Main Mesh */}

            {/* Border/Outline */}
            <lineSegments
              rotation={[-Math.PI / 2, 0, 0]}
              position={[cell[0] - gridSize / 2, 0.01, cell[1] - gridSize / 2]}
              geometry={new EdgesGeometry(new PlaneGeometry(1, 1))}
              material={new LineBasicMaterial({ color: "red", linewidth: 1 })}
            />
          </group>
        ))}

      {effectCircle.cells.length > 0 &&
        effectCircle.cells.map((cell: [number, number]) => (
          <PreviewCell
            key={`effect-${cell?.[0]}-${cell?.[1]}`}
            x={cell?.[0] - gridSize / 2}
            z={cell?.[1] - gridSize / 2}
            color={effectCircle.color}
          />
        ))}
    </group>
  );
}

export default PreviewMap;
