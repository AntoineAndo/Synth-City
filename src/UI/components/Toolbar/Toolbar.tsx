import { useEffect, useState } from "react";
import { GameStore, useGameStore } from "../../../store/gameStore";
import { toolbarConfig } from "../../../types/tools";
import styles from "./Toolbar.module.scss";
import { resetGame } from "../../../utils/gameUtils";
import * as Tone from "tone";

export const Toolbar = () => {
  const currentTool = useGameStore((state) => state.selectedTool);
  const setSelectedTool = useGameStore((state) => state.setSelectedTool);
  const gameStore = useGameStore();

  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  useEffect(() => {
    gameStore.setIsPlaying(false);
  }, []);

  const togglePlayPause = () => {
    if (gameStore.getIsPlaying()) {
      Tone.Transport.stop();
    } else {
      Tone.start();
      Tone.Transport.start();
    }
    gameStore.setIsPlaying(!gameStore.getIsPlaying());
  };

  const onReset = (gameStore: GameStore) => {
    resetGame(gameStore);
    Tone.Transport.stop();
    gameStore.setIsPlaying(false);
  };

  return (
    <ul className={styles.toolbar}>
      {toolbarConfig.map((category: any) => {
        return (
          <li
            id={category.id}
            key={category.id}
            className="toolbar-category"
            onMouseEnter={() => setHoveredTool(category.id)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            {!category.children ? (
              <button
                onClick={() => setSelectedTool(category.toolName)}
                className={`${styles.button} ${
                  currentTool === category.toolName ? styles.active : ""
                }`}
              >
                {category.label}
              </button>
            ) : (
              <span className={styles.categoryLabel}>{category.label}</span>
            )}

            {category.children && hoveredTool === category.id && (
              <ul className="toolbar-category-children">
                {category.children.map((child: any) => {
                  return (
                    <li key={child.id}>
                      <button
                        onClick={() => setSelectedTool(child.toolName)}
                        className={`${styles.button} ${
                          currentTool === child.toolName ? styles.active : ""
                        }`}
                      >
                        {child.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
      <li>
        <button className={styles.button} onClick={() => onReset(gameStore)}>
          RESET
        </button>
      </li>
      <li>
        <button className={styles.button} onClick={() => togglePlayPause()}>
          {gameStore.getIsPlaying() ? "PAUSE" : "PLAY"}
        </button>
      </li>
    </ul>
  );
};
