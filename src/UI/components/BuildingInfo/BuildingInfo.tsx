import { useGameStore } from "../../../store/gameStore";
import { Building } from "../../../config/Buildings/Building";

type Props = {};

function BuildingInfo({}: Props) {
  const selectedBuilding = useGameStore((state) => state.selectedBuilding);

  if (!selectedBuilding) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {Object.keys(selectedBuilding?.building).map((key: string) => {
        return (
          <span>
            {key}: {String(selectedBuilding.building[key as keyof Building])}
          </span>
        );
      })}
    </div>
  );
}

export default BuildingInfo;
