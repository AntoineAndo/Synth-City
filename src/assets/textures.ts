import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

// Define texture paths
export const TEXTURE_PATHS = {
  ROAD: {
    STRAIGHT: "/src/assets/textures/roads/path/straight.png",
    CORNER: "/src/assets/textures/roads/path/corner.png",
    INTERSECTION: "/src/assets/textures/roads/path/intersection.png",
    END: "/src/assets/textures/roads/path/end.png",
    THREE_WAY: "/src/assets/textures/roads/path/threeway.png",
  },
} as TextureConfig;

type TextureConfig = {
  [key: string]: {
    [key: string]: string;
  };
};

// Create a type for the texture collection
export type TextureCollection = {
  [K in keyof typeof TEXTURE_PATHS]: {
    [P in keyof (typeof TEXTURE_PATHS)[K]]: THREE.Texture;
  };
};

// Hook to load all textures at once
export function useTextures() {
  const textures = useLoader(
    TextureLoader,
    Object.values(TEXTURE_PATHS).flatMap((category) => Object.values(category)),
    (loader) => {
      loader.crossOrigin = "anonymous";
    }
  );

  // Configure all textures right after loading
  textures.forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
    texture.premultiplyAlpha = true;
    texture.flipY = false;
  });

  // Reconstruct the texture hierarchy
  let textureIndex = 0;
  const textureCollection = Object.keys(TEXTURE_PATHS).reduce(
    (acc, category: string) => {
      acc[category] = Object.keys(
        TEXTURE_PATHS[category as keyof typeof TEXTURE_PATHS]
      ).reduce((categoryAcc, key: string) => {
        categoryAcc[key] = textures[textureIndex++];
        return categoryAcc;
      }, {} as { [P in keyof (typeof TEXTURE_PATHS)[typeof category]]: THREE.Texture });
      return acc;
    },
    {} as TextureCollection
  );

  return textureCollection;
}
