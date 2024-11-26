import { GameStore } from "../store/gameStore";

export const saveGame = (gameStore: GameStore) => {
  const map = gameStore.getMap();
  const effects = gameStore.getEffectMaps();
  const metrics = gameStore.getMetrics();

  console.log("Saving game to local storage");
  console.log({
    map,
    effects,
    metrics,
  });

  localStorage.setItem(
    "game",
    JSON.stringify({
      map,
      effects,
      metrics,
    })
  );
};
