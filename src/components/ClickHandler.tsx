import { useEffect, useCallback, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { PointerType } from "./MapCell";
import { throttle } from "lodash";
import { ThreeEvent } from "@react-three/fiber";

type Props = {
  hoveredCell: [number, number] | null;
  setHoveredCell: (cell: [number, number] | null) => void;
  previewPath: {
    path: [number, number][];
    isValid: boolean | null;
  };
  setPreviewPath: (path: {
    path: [number, number][];
    isValid: boolean | null;
  }) => void;
};

function ClickHandler({
  hoveredCell,
  setHoveredCell,
  previewPath,
  setPreviewPath,
}: Props) {
  const selectedTool = useGameStore((state) => state.selectedTool);
  const setSelectedTool = useGameStore((state) => state.setSelectedTool);
  const map = useGameStore((state) => state.map);
  const tools = useGameStore((state) => state.tools);

  const [isDragging, setIsDragging] = useState(false);

  const unsetPreviewPath = () => {
    setPreviewPath({
      path: [],
      isValid: null,
    });
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && tools[selectedTool]) {
        tools[selectedTool].handleKeyPress(e);
      } else if (e.key.toLowerCase() === "escape") {
        // set selected tool to cursor
        setSelectedTool("CURSOR");
      }
    },
    [tools, selectedTool]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const toolPointerDown = useCallback(
    (pointerType: PointerType) => {
      setIsDragging(true);
      if (!hoveredCell || !tools[selectedTool]) return;

      if (pointerType === "primary") {
        tools[selectedTool].onPointerDown?.(hoveredCell[0], hoveredCell[1]);
      } else {
        tools[selectedTool].onPointerDownSecondary?.(
          hoveredCell[0],
          hoveredCell[1]
        );
      }
    },
    [hoveredCell, tools, selectedTool]
  );

  const toolPointerUp = useCallback(
    (pointerType: PointerType) => {
      if (!hoveredCell || !tools[selectedTool]) return;

      setIsDragging(false);
      if (previewPath.isValid === false) {
        unsetPreviewPath();
        return;
      }
      unsetPreviewPath();

      if (pointerType === "primary") {
        tools[selectedTool].onPointerUp?.(
          hoveredCell[0],
          hoveredCell[1],
          previewPath.path
        );
      } else {
        tools[selectedTool].onPointerUpSecondary?.(
          hoveredCell[0],
          hoveredCell[1]
        );
      }
    },
    [hoveredCell, tools, selectedTool, previewPath.path]
  );

  const handlePointerOut = useCallback(() => {
    setIsDragging(false);
    unsetPreviewPath();
    setHoveredCell(null);
  }, []);

  const handlePointerMove = useCallback(
    throttle((e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!tools[selectedTool]) return;

      const halfSize = 5;
      if (Math.abs(e.point.x) > halfSize || Math.abs(e.point.z) > halfSize) {
        handlePointerOut();
        return;
      }

      let preview: [number, number][] = [];
      const zoneSize = tools[selectedTool]?.size;

      const x = e.point.x + map.cells.length / 2;
      const z = e.point.z + map.cells.length / 2;

      const trueX1 = x - zoneSize / 2;
      const trueZ1 = z - zoneSize / 2;
      const trueX2 = x + zoneSize / 2;
      const trueZ2 = z + zoneSize / 2;

      const offsetX1 = Math.floor(trueX1) === Math.round(trueX1) ? 0 : 1;
      const offsetZ1 = Math.floor(trueZ1) === Math.round(trueZ1) ? 0 : 1;
      const offsetX2 = Math.ceil(trueX1) === Math.round(trueX1) ? 0 : -1;
      const offsetZ2 = Math.ceil(trueZ1) === Math.round(trueZ1) ? 0 : -1;

      const snappedX1 = Math.floor(trueX1) + offsetX1;
      const snappedZ1 = Math.floor(trueZ1) + offsetZ1;
      const snappedX2 = Math.floor(trueX2) + offsetX2;
      const snappedZ2 = Math.floor(trueZ2) + offsetZ2;

      let x1 = snappedX1,
        x2 = snappedX2,
        z1 = snappedZ1,
        z2 = snappedZ2;

      // Clamp to map boundaries
      if (snappedX1 < 0) {
        x1 = 0;
        x2 = zoneSize - 1;
      } else if (snappedX2 > map.cells.length - 1) {
        x1 = map.cells.length - zoneSize;
        x2 = map.cells.length - 1;
      }

      if (snappedZ1 < 0) {
        z1 = 0;
        z2 = zoneSize - 1;
      } else if (snappedZ2 > map.cells.length - 1) {
        z1 = map.cells.length - zoneSize;
        z2 = map.cells.length - 1;
      }

      for (let i = x1; i <= x2; i++) {
        for (let j = z1; j <= z2; j++) {
          preview.push([i, j]);
        }
      }

      if (isDragging) {
        preview = tools[selectedTool].onPointerOver?.(x1, z1) ?? [];
      }

      const isValid = tools[selectedTool].validate?.(
        x1,
        z1,
        isDragging,
        preview
      );

      if (x1 !== hoveredCell?.[0] || z1 !== hoveredCell?.[1]) {
        setPreviewPath({
          path: preview,
          isValid: isValid,
        });
        setHoveredCell([x1, z1]);
      }
    }, 1),
    [tools, selectedTool, map.cells.length, isDragging, hoveredCell]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onPointerDown={(e) => {
        toolPointerDown(e.button === 0 ? "primary" : "secondary");
      }}
      onPointerUp={(e) => {
        toolPointerUp(e.button === 0 ? "primary" : "secondary");
      }}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerMove}
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

export default ClickHandler;
