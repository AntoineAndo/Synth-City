import { useState } from "react";
import { useGameStore } from "../../../store/gameStore";
import { toolbarConfig } from "../../../types/tools";
import styles from "./Toolbar.module.scss";
import { resetGame } from "../../../utils/gameUtils";
import * as Tone from "tone";
import { useMusicStore } from "../../../store/musicStore";

export const Toolbar = () => {
  const currentTool = useGameStore((state) => state.selectedTool);
  const setSelectedTool = useGameStore((state) => state.setSelectedTool);
  const isPlaying = useMusicStore((state) => state.getIsPlaying());
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);

  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      Tone.start();
      setIsPlaying(true);
    }
  };

  const onReset = () => {
    resetGame();
    setIsPlaying(false);
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
        <button className={styles.button} onClick={() => onReset()}>
          RESET
        </button>
      </li>
      <li>
        <button className={styles.button} onClick={() => togglePlayPause()}>
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
      </li>
    </ul>
  );
};
