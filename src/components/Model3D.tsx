import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { ModelConfig } from "../config/models";
import { Object3D, Object3DEventMap } from "three";

const Model3D = ({
  position,
  modelConfig,
  rotation = 0,
  isPreview = false,
  isValid = true,
}: {
  position: [number, number, number];
  modelConfig: ModelConfig;
  rotation: number;
  isPreview?: boolean;
  isValid?: boolean;
}) => {
  const { nodes } = useGLTF(modelConfig.path);

  const model = useMemo(() => {
    const clonedScene = nodes[modelConfig.nodeName].clone();
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        if (isPreview) {
          child.material.transparent = true;
          child.material.opacity = 0.5;

          if (isValid === false) {
            child.material.color.set("red");
          }
        } else {
          child.castShadow = modelConfig.castShadow;
          child.receiveShadow = modelConfig.receiveShadow;
          child.material.metalness = 0.2;
        }
      }
    });
    return <primitive object={clonedScene} />;
  }, [nodes, modelConfig.nodeName, isPreview, rotation, isValid]);

  let offsetX = 0;
  let offsetZ = 0;

  if (rotation == 0) {
    offsetX = modelConfig.offset?.[0] ?? 0;
    offsetZ = modelConfig.offset?.[2] ?? 0;
  } else if (rotation == Math.PI) {
    offsetX = modelConfig.offset?.[0] ?? 0;
    offsetZ = modelConfig.offset?.[2] ?? 0;
  } else if (rotation == Math.PI / 2) {
    offsetX = modelConfig.offset?.[2] ?? 0;
    offsetZ = modelConfig.offset?.[0] ?? 0;
  } else if (rotation == Math.PI + Math.PI / 2) {
    offsetX = modelConfig.offset?.[2] ?? 0;
    offsetZ = modelConfig.offset?.[0] ?? 0;
  }

  return (
    <group
      position={[
        position[0] + offsetX,
        position[1] + (modelConfig?.offset?.[1] ?? 0),
        position[2] + offsetZ,
      ]}
      scale={modelConfig.scale}
      rotation={[
        modelConfig.rotation?.[0] ?? 0,
        (modelConfig.rotation?.[1] ?? 0) + rotation,
        modelConfig.rotation?.[2] ?? 0,
      ]}
    >
      {model}
    </group>
  );
};

export default Model3D;
