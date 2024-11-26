import { create } from "zustand";
import { Tool, ToolType } from "../types/tools";
import { CellInfo, CellTypes, MapType } from "../types/map";
import { createRoadToolConfig } from "../config/Tools/RoadTool";
import { createBuildingToolConfig } from "../config/Tools/BuildingTool";
import { TextureCollection } from "../assets/textures";
import { GameMetrics } from "../types/metrics";
import { createCursorToolConfig } from "../config/Tools/CursorTool";
import { Building } from "../classes/Building";
import { createParkToolConfig } from "../config/Tools/ParkTool";
import { createPathToolConfig } from "../config/Tools/PathTool";

export interface RoadNode {
  position: [number, number];
  neighbors: Array<{
    node: [number, number];
    distance: number;
  }>;
}
export type EffectType = "FUN";

export type EffectMaps = Partial<{
  [key in EffectType]: number[][];
}>;

export interface GameStore {
  map: MapType;
  setMap: (map: MapType) => void;
  getMap: () => MapType;
  tools: Record<string, Tool>;
  selectedTool: string;
  setSelectedTool: (tool: ToolType) => void;
  textures: TextureCollection;
  setTextures: (textures: TextureCollection) => void;
  getTextures: () => TextureCollection;
  metrics: GameMetrics;
  setMetrics: (metrics: GameMetrics) => void;
  getMetrics: () => GameMetrics;
  effectMaps: EffectMaps;
  setEffectMaps: (effectMaps: EffectMaps) => void;
  getEffectMaps: () => EffectMaps;
  rotation: number;
  setRotation: (rotation: number) => void;
  selectedBuilding: {
    cells: [number, number][];
    building: Building;
  } | null;
  setSelectedBuilding: (
    building: {
      cells: [number, number][];
      building: Building;
    } | null
  ) => void;
  reset: () => void;
  roadGraph: Map<string, RoadNode>;
  setRoadGraph: (roadGraph: Map<string, RoadNode>) => void;
  getRoadGraph: () => Map<string, RoadNode>;
}

export const useGameStore = create<GameStore>((set, get) => {
  // Create initial map first
  let initialMap = generateInitialConfig(10);
  let initialEffectMaps = getInitialEffectMaps();
  let initialMetrics = generateInitialMetrics();

  const initialState = {
    map: initialMap,
    setMap: (newMap: MapType) => {
      set({ map: newMap });
    },
    getMap: () => get().map,
    selectedTool: "ROAD",
    setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),
    tools: {} as Record<string, Tool>,
    textures: {} as TextureCollection,
    setTextures: (textures: TextureCollection) => set({ textures }),
    getTextures: () => get().textures,
    metrics: initialMetrics,
    setMetrics: (newMetrics: GameMetrics) => set({ metrics: newMetrics }),
    getMetrics: () => get().metrics,
    effectMaps: initialEffectMaps,
    setEffectMaps: (newEffectMaps: EffectMaps) =>
      set({ effectMaps: newEffectMaps }),
    getEffectMaps: () => get().effectMaps,
    rotation: 0,
    setRotation: (rotation: number) => set({ rotation }),
    selectedBuilding: null,
    setSelectedBuilding: (
      building: {
        cells: [number, number][];
        building: Building;
      } | null
    ) => set({ selectedBuilding: building }),
    reset: () => set(initialState),
    roadGraph: new Map<string, RoadNode>(),
    setRoadGraph: (roadGraph: Map<string, RoadNode>) => set({ roadGraph }),
    getRoadGraph: () => get().roadGraph,
  };

  const state = {
    ...initialState,
  };

  const localGame = localStorage.getItem("game");

  if (localGame) {
    console.log("Loading game from local storage");
    state.map = JSON.parse(localGame).map;
    state.effectMaps = JSON.parse(localGame).effects;
    state.metrics = JSON.parse(localGame)?.metrics;
  }

  // Create store object first so we can pass it to tools
  const store: GameStore = state;

  // Initialize tools with the store
  store.tools = {
    CURSOR: createCursorToolConfig(store),
    ROAD: createRoadToolConfig(store),
    HOUSE: createBuildingToolConfig(store, "HOUSE"),
    OFFICE: createBuildingToolConfig(store, "OFFICE"),
    ICE_CREAM: createBuildingToolConfig(store, "ICE_CREAM"),
    PARK: createParkToolConfig(store),
    PATH: createPathToolConfig(store),
  };

  store.reset = () => {
    store.setMap(generateInitialConfig(10));
    store.setMetrics(generateInitialMetrics());
    store.setEffectMaps(getInitialEffectMaps());
  };

  return store;
});

function getInitialEffectMaps(): EffectMaps {
  return {
    FUN: generateInitialEffectMap(10),
  };
}

function generateInitialConfig(gridSize: number): MapType {
  return {
    cells: generateEmptyGrid(gridSize),
    buildings: {},
  };
}

function generateEmptyGrid(gridSize: number): CellInfo[][] {
  return Array.from({ length: gridSize }, () => {
    return Array.from({ length: gridSize }, () => ({
      type: CellTypes.GRASS,
      height: 0,
    }));
  });
}

function generateInitialEffectMap(gridSize: number): number[][] {
  return Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );
}

function generateInitialMetrics(): GameMetrics {
  return {
    money: 1000,
    inhabitants: 0,
    inhabitantsCapacity: 0,
    happiness: 100,
    workingPeople: 0,
    workingCapacity: 0,
    economicEfficiency: 1,
    rawIncome: 0,
    attractiveness: 1,
  };
}
