import { Building } from "../classes/Building";
import { EffectType, GameStore } from "../store/gameStore";
import { BuildingType } from "./buildings";

export interface Tool {
  name: string;
  color: string;
  hoverColor: string;
  rotation?: number;

  size: number;
  cell: [number, number] | null;
  gameStore: GameStore;
  buildingType?: BuildingType;

  effect?: {
    type: EffectType;
    radius: number;
  };

  onPointerDown: (i: number, j: number) => void;
  onPointerUp: (i: number, j: number, previewPath?: [number, number][]) => void;
  onPointerDownSecondary: (i: number, j: number) => void;
  onPointerUpSecondary: (i: number, j: number) => void;
  onPointerOver: (i: number, j: number) => [number, number][] | null;
  validate: (
    i: number,
    j: number,
    isDragging: boolean,
    preview: any
  ) => boolean;
  handleKeyPress: (e: KeyboardEvent) => void;
}

export const TOOLS = {
  CURSOR: "CURSOR",
  ROAD: "ROAD",
  HOUSE: "HOUSE",
  OFFICE: "OFFICE",
  ICE_CREAM: "ICE_CREAM",
  PARK: "PARK",
} as const;

export type ToolType = (typeof TOOLS)[keyof typeof TOOLS];

export interface ToolbarItem {
  id: string;
  label: string;
  toolName?: ToolType;
  children?: ToolbarItem[];
  [key: string]: any;
}

export const toolbarConfig: ToolbarItem[] = [
  {
    id: "cursor",
    label: "Cursor",
    toolName: TOOLS.CURSOR,
  },
  {
    id: "road",
    label: "Road",
    toolName: TOOLS.ROAD,
  },
  {
    id: "buildings",
    label: "Buildings",
    children: [
      {
        id: "house",
        label: "House",
        toolName: TOOLS.HOUSE,
        buildingClass: Building,
      },
      {
        id: "office",
        label: "Office",
        toolName: TOOLS.OFFICE,
        buildingClass: Building,
      },
      {
        id: "ice_cream",
        label: "Ice Cream",
        toolName: TOOLS.ICE_CREAM,
        buildingClass: Building,
      },
      {
        id: "park",
        label: "Park",
        toolName: TOOLS.PARK,
      },
    ],
  },
];
