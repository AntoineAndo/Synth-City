function Light() {
  return (
    <>
      <directionalLight
        position={[3, 7, 10]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      <ambientLight intensity={0.5} />
    </>
  );
}

export default Light;
