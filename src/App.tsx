import { Canvas } from "@react-three/fiber";
import "./App.css";
import MapBuilder from "./components/MapBuilder";
import { OrbitControls } from "@react-three/drei";
import UI from "./UI/Layout";
import GameLoop from "./components/GameLoop";
import { Suspense } from "react";
import Buildings from "./components/Buildings";
import Light from "./components/Light";
import { MODELS } from "./config/models";
import Model3D from "./components/Model3D";
import Map from "./components/Map";
import { MusicController } from "./components/MusicController";

function App() {
  return (
    <div className="app" style={{ width: "100%", height: "100%" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MusicController />
        <Canvas
          orthographic
          camera={{
            position: [25, 25, 25],
            zoom: 65,
            near: 0.1,
            far: 2000,
            top: window.innerHeight / 2,
            bottom: -window.innerHeight / 2,
            left: -window.innerWidth / 2,
            right: window.innerWidth / 2,
          }}
          shadows
        >
          <GameLoop />
          <UI />

          <Light />
          <Map />
          <Buildings />

          <MapBuilder />
          <Model3D
            modelConfig={MODELS["HILL"]}
            position={[0, 0, 0]}
            rotation={0}
          />

          <OrbitControls
            enableRotate={false} // Disable rotation
            enableZoom={true} // Allow zooming (optional)
            enablePan={false} // Allow panning (optional)
            minZoom={20} // Set minimum zoom (optional)
            maxZoom={100} // Set maximum zoom (optional)
            maxPolarAngle={Math.PI / 2.8}
            minPolarAngle={Math.PI / 2.8}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;
