import { useEffect } from "react";
import { useTextures } from "../assets/textures";
import { useGameStore } from "../store/gameStore";
import { MapCell } from "./MapCell";

function Map() {
  const textures = useTextures();

  useEffect(() => {
    useGameStore.setState({ textures });
  }, [textures]);

  const map = useGameStore((state) => state.map);

  const gridSize = 10;

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0.5, 0, 0.5]}>
        {Array.from({ length: gridSize }).map((_, i) =>
          Array.from({ length: gridSize }).map((_, j) => (
            <MapCell
              key={`${i}-${j}`}
              i={i}
              j={j}
              map={map}
              cell={map.cells[i][j]}
              gridSize={gridSize}
              textures={textures}
            />
          ))
        )}
      </mesh>
    </group>
  );
}

export default Map;
