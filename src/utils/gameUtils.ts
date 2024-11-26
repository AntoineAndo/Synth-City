import { GameStore, useGameStore } from "../store/gameStore";

export const saveGame = (gameStore: GameStore) => {
  const map = gameStore.getMap();
  const effects = gameStore.getEffectMaps();
  const metrics = gameStore.getMetrics();

  localStorage.setItem(
    "game",
    JSON.stringify({
      map,
      effects,
      metrics,
    })
  );
};

export const resetGame = (gameStore: GameStore) => {
  localStorage.removeItem("game");
  gameStore.reset();
};
