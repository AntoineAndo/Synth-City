import { useGLTF } from "@react-three/drei";

// Define the model configuration type
export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  scale: [number, number, number];
  rotation?: [number, number, number];
  offset?: [number, number, number];
  nodeName: string; // The name of the node in the GLB file
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// Create a catalog of all available models
export const MODELS: { [key: string]: ModelConfig } = {
  HOUSE: {
    id: "HOUSE_1",
    name: "Small House",
    path: "/src/assets/models/homes/House_2.glb",
    scale: [0.001, 0.001, 0.001],
    offset: [-0.5, 0, -0.5],
    nodeName: "House_2",
    castShadow: true,
    receiveShadow: true,
  },
  OFFICE: {
    id: "APARTMENT_1",
    name: "Medium House",
    path: "/src/assets/models/homes/House_1.glb",
    scale: [0.00175, 0.00175, 0.00175],
    nodeName: "House1",
    castShadow: true,
    receiveShadow: true,
    rotation: [0, Math.PI / 2, 0],
  },
  HILL: {
    id: "HILL_1",
    name: "Hill",
    path: "/src/assets/models/HILL.glb",
    scale: [100, 100, 100],
    nodeName: "mesh_id35",
    offset: [0, -8, -17],
    rotation: [0, 0, 0],
    castShadow: false,
    receiveShadow: false,
  },
  ICE_CREAM: {
    id: "ICE_CREAM",
    name: "Ice Cream Shop",
    path: "/src/assets/models/homes/House_7.glb",
    scale: [0.001, 0.001, 0.001],
    nodeName: "House_7",
    offset: [-0.5, 0, -0.5],
    rotation: [0, Math.PI + Math.PI / 2, 0],
    castShadow: true,
    receiveShadow: true,
  },
  MUSHROOM: {
    id: "MUSHROOM",
    name: "Mushroom",
    path: "/src/assets/models/mushroom.glb",
    scale: [0.02, 0.02, 0.02],
    offset: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
    castShadow: true,
    receiveShadow: true,
    nodeName: "Root",
  },
};

// Preload all models
Object.values(MODELS).forEach((model) => {
  useGLTF.preload(model.path);
});
