import { BUILDINGS_CONFIG } from "../../config/buildingsConfig";
import { BuildingType } from "../../types/buildings";
import Model3D from "../Model3D";
import { useGameStore } from "../../store/gameStore";
import { MODELS } from "../../config/models";

const PreviewBuilding = ({ previewPath }: { previewPath: any }) => {
  const map = useGameStore((state) => state.map);
  const selectedTool = useGameStore((state) => state.selectedTool);
  const rotation = useGameStore((state) => state.rotation);

  if (!BUILDINGS_CONFIG[selectedTool as BuildingType]) return null;

  const previewModelConfig = MODELS[selectedTool];

  const mapSize = map.cells.length;

  return (
    <>
      {previewModelConfig && (
        <Model3D
          modelConfig={previewModelConfig}
          position={[
            previewPath.path[0][0] - mapSize / 2 + 1,
            0,
            previewPath.path[0][1] - mapSize / 2 + 1,
          ]}
          isPreview={true}
          rotation={rotation}
          isValid={previewPath.isValid}
        />
      )}
    </>
  );
};

export default PreviewBuilding;
