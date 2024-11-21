import { Html } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { Metrics } from "./components/Metrics/Metrics";
import BuildingInfo from "./components/BuildingInfo/BuildingInfo";

function UI() {
  const selectedBuilding = useGameStore((state) => state.selectedBuilding);

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px",
      }}
    >
      <div style={{ pointerEvents: "none", display: "flex", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Metrics />
          {selectedBuilding && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h3>Selected building</h3>
              <BuildingInfo />
            </div>
          )}
        </div>
        <Toolbar />
      </div>
    </Html>
  );
}

export default UI;
