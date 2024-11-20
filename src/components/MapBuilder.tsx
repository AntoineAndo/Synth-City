import { useState, useMemo } from "react";
import PreviewMap from "./Preview/PreviewMap";
import ClickHandler from "./ClickHandler";
import { useGameStore } from "../store/gameStore";
import PreviewBuilding from "./Preview/PreviewBuilding";
import { BUILDINGS_CONFIG } from "../config/buildingsConfig";
import { BuildingType } from "../types/buildings";

const MapBuilder = () => {
  const map = useGameStore((state) => state.map);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const selectedBuilding = useGameStore((state) => state.selectedBuilding);

  const [previewPath, setPreviewPath] = useState<{
    path: [number, number][];
    isValid: boolean | null;
  }>({
    path: [],
    isValid: null,
  });
  // const [effectCircle, setEffectCircle] = useState<[number, number][]>([]);
  const selectedTool = useGameStore((state) => state.selectedTool);
  const tools = useGameStore((state) => state.tools);

  const rotation = tools?.[selectedTool]?.rotation ?? 0;

  let buildingConfig = null;
  if (BUILDINGS_CONFIG[selectedTool as BuildingType]) {
    buildingConfig = BUILDINGS_CONFIG[selectedTool as BuildingType];
  }

  const effectCircle = {
    color: buildingConfig?.effect?.color,
    cells: useMemo(
      () =>
        getEffectCircle(
          hoveredCell,
          buildingConfig?.effect?.radius ?? 0,
          map.cells.length
        ),
      [hoveredCell]
    ),
  };

  const previewMapComponent = useMemo(
    () => (
      <PreviewMap
        map={map}
        previewPath={previewPath}
        effectCircle={effectCircle}
        selectedBuilding={selectedBuilding}
      />
    ),
    [previewPath, hoveredCell, effectCircle]
  );

  const previewBuildingComponent = useMemo(
    () =>
      previewPath.path.length > 0 ? (
        <PreviewBuilding previewPath={previewPath} />
      ) : null,
    [previewPath, rotation]
  );

  const clickHandlerComponent = useMemo(
    () => (
      <ClickHandler
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
        previewPath={previewPath}
        setPreviewPath={setPreviewPath}
      />
    ),
    [hoveredCell, previewPath]
  );

  return (
    <>
      {previewMapComponent}
      {previewBuildingComponent}
      {clickHandlerComponent}
    </>
  );
};

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

export default MapBuilder;
