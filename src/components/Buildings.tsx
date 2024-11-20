import { useGameStore } from "../store/gameStore";
import Model3D from "./Model3D";
import { Building } from "../config/Buildings/Building";

const Buildings = () => {
  const map = useGameStore((state) => state.map);
  const buildings: Building[] = Object.values(map.buildings);
  const mapSize = map.cells.length;

  return (
    <>
      {buildings.map((building: Building) => {
        return (
          <Model3D
            key={building.id}
            modelConfig={building.model}
            position={[
              building.position[0] - mapSize / 2 + 1,
              0,
              building.position[1] - mapSize / 2 + 1,
            ]}
            rotation={building.rotation || 0}
          />
        );
      })}
    </>
  );
};

export default Buildings;
