import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { ModelConfig } from "../config/models";

const Model3D = ({
  position,
  modelConfig,
  rotation = 0,
  scale = 1,
  isPreview = false,
  isValid = true,
}: {
  position: [number, number, number];
  modelConfig: ModelConfig;
  rotation?: number;
  scale?: number;
  isPreview?: boolean;
  isValid?: boolean;
}) => {
  const { nodes } = useGLTF(modelConfig.path);

  const model = useMemo(() => {
    const clonedScene = nodes[modelConfig.nodeName].clone();
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.metalness = 0.2;
        if (isPreview) {
          child.material.transparent = true;
          child.material.opacity = 0.4;

          if (isValid === false) {
            child.material.color.set("red");
          } else {
            child.material.color.set("#00ff00");
          }
        } else {
          child.castShadow = modelConfig.castShadow;
          child.receiveShadow = modelConfig.receiveShadow;
        }
      }
    });
    return <primitive object={clonedScene} />;
  }, [nodes, modelConfig.nodeName, isPreview, rotation, isValid]);

  let offsetX = 0;
  let offsetZ = 0;

  let rotationX = modelConfig.rotation?.[0] ?? 0;
  let rotationY = modelConfig.rotation?.[1] ?? 0;
  let rotationZ = modelConfig.rotation?.[2] ?? 0;

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
      // Separate rotation
      // So that the rotation of the models defined in the config is properly handled
      rotation={[0, rotation, 0]}
    >
      <group
        scale={
          modelConfig.scale.map((s) => s * scale) as [number, number, number]
        }
        rotation={[rotationX, rotationY, rotationZ]}
      >
        {model}
      </group>
    </group>
  );
};

export default Model3D;
