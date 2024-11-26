import { Building } from "../classes/Building";
import { EffectMaps } from "../store/gameStore";
import { MapType } from "../types/map";
import {
  BuildingMetricThreshold,
  GameMetrics,
  MetricThreshold,
} from "../types/metrics";

export const MetricsWeight = {
  happiness: {
    employment: 0.5,
    fun: 0.5,
  },
};

export class MetricsManager {
  private static houseMetrics: BuildingMetricThreshold[] = [
    {
      condition: (building, metrics) =>
        building.inhabitants <
        building.config.inhabitantsCapacity[building.level],
      action: (building: Building, metrics: GameMetrics) => {
        building.inhabitants += 1;
      },
      description: "House metrics",
    },
    {
      condition: (building, _, __, ___) => {
        return building.buildingType === "HOUSE";
      },
      action: (building: Building, _: GameMetrics) => {
        let baseValue = 100;
        let newValue = baseValue;
        if (building?.effects?.FUN < 0.5) {
          newValue = baseValue / 2;
        }
        building.happiness = newValue * building.inhabitants;
      },
      description: "Happiness from fun",
    },
  ];

  private static thresholds: MetricThreshold[] = [
    {
      // Not enough workers
      // If the number of employed people is less than the number of offices
      // Decrease economic efficiency
      condition: (metrics) =>
        metrics.workingPeople <= metrics.workingCapacity &&
        metrics.workingCapacity > 0,
      modifiers: [
        {
          target: "economicEfficiency",
          value: (metrics) => metrics.workingPeople / metrics.workingCapacity,
          reason: "Not enough workers",
          operation: "replace",
        },
      ],
      description: "Not enough workers",
    },
    {
      condition: (metrics) => metrics.happiness < 50,
      modifiers: [
        {
          target: "inhabitants",
          value: -1,
          reason: "People leaving due to unhappiness",
          operation: "add",
        },
      ],
      description: "Low happiness causing population decline",
    },
    {
      // Recruitment
      // If the number of inhabitants is more than the number of employed people
      // Increase the number of employed people
      condition: (metrics) =>
        metrics.inhabitants > metrics.workingPeople &&
        metrics.workingPeople < metrics.workingCapacity,
      modifiers: [
        {
          target: "workingPeople",
          value: 1,
          reason: "New hirings",
          operation: "add",
        },
      ],
      description: "Recruitment",
    },
    {
      condition: (metrics) => metrics.workingCapacity > 0,
      modifiers: [
        {
          target: "money",
          value: (metrics) => metrics.rawIncome * metrics.economicEfficiency,
          reason: "Income from offices",
          operation: "add",
        },
      ],
      description: "Income from offices",
    },
  ];

  static updateBuildings(
    buildings: Record<string, Building>,
    metrics: GameMetrics,
    map: MapType,
    effectMaps: EffectMaps
  ): Record<string, Building> {
    Object.values(buildings).forEach((building) => {
      this.houseMetrics.forEach((metric) => {
        if (metric.condition(building, metrics, map, effectMaps)) {
          metric.action(building, metrics);
        }
      });
    });

    return buildings;
  }

  static updateMetrics(currentMetrics: GameMetrics, map: MapType): GameMetrics {
    let newMetrics = { ...currentMetrics };

    // Apply thresholds one by one, updating metrics after each
    for (const threshold of this.thresholds) {
      if (threshold.condition(newMetrics)) {
        threshold.modifiers.forEach((modifier) => {
          const value =
            typeof modifier.value === "function"
              ? modifier.value(newMetrics, Object.values(map.buildings))
              : modifier.value;

          switch (modifier.operation) {
            case "add":
              newMetrics[modifier.target] += value;
              break;
            case "multiply":
              newMetrics[modifier.target] *= value;
              break;
            case "replace":
              newMetrics[modifier.target] = value;
              break;
          }

          // Ensure metrics stay within valid ranges after each modification
          newMetrics.inhabitants = Math.max(
            0,
            Math.min(newMetrics.inhabitantsCapacity, newMetrics.inhabitants)
          );
          newMetrics.happiness = Math.max(
            0,
            Math.min(100, newMetrics.happiness)
          );
          newMetrics.workingPeople = Math.max(
            0,
            Math.min(newMetrics.inhabitants, newMetrics.workingPeople)
          );
        });
      }
    }

    return newMetrics;
  }
}
