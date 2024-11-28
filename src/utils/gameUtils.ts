import { GameStore, useGameStore } from "../store/gameStore";

export const saveGame = (gameStore: GameStore) => {
  const map = gameStore.getMap();
  const effects = gameStore.getEffectMaps();
  const metrics = gameStore.getMetrics();
  const roadGraph = gameStore.getRoadGraph();

  const serializedRoadGraph = Array.from(roadGraph.entries());

  localStorage.setItem(
    "game",
    JSON.stringify({
      map,
      effects,
      metrics,
      roadGraph: serializedRoadGraph,
    })
  );
};

export const resetGame = () => {
  const gameStore = useGameStore.getState();
  localStorage.removeItem("game");
  gameStore.reset();
};
