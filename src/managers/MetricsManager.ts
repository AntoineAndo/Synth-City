import { Building } from "../config/Buildings/Building";
import { Map } from "../types/map";
import { GameMetrics, MetricThreshold } from "../types/metrics";

export const MetricsWeight = {
  happiness: {
    employment: 0.5,
    fun: 0.5,
  },
};

export class MetricsManager {
  private static houseMetrics: any[] = [
    {
      condition: (building: Building, metrics: GameMetrics) =>
        building.inhabitants <
        building.config.inhabitantsCapacity[building.level],
      action: (building: Building, metrics: GameMetrics) => {
        building.inhabitants += 1;
      },
      description: "House metrics",
    },
  ];

  private static thresholds: MetricThreshold[] = [
    {
      // UnworkingPeople
      // Decrease happiness based on unemployment rate
      condition: (metrics) =>
        metrics.inhabitants > metrics.workingPeople &&
        metrics.inhabitants == metrics.inhabitantsCapacity,
      modifiers: [
        {
          target: "happiness",
          value: (metrics) => {
            const unemploymentRate =
              (metrics.inhabitants - metrics.workingPeople) /
              metrics.inhabitants;
            // Convert to a percentage and make it negative
            // Multiply by 20 to make the effect stronger (adjust this multiplier as needed)
            return 100 * (1 - unemploymentRate);
          },
          reason: "Unemployment affecting happiness",
          operation: "replace",
        },
      ],
      description: "Unemployment impact on happiness",
    },
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
    // {
    //   // Population growth
    //   // If the number of actual inhabitants is less than the capacity of the city
    //   // Increase the number of inhabitants
    //   condition: (metrics) => metrics.inhabitants < metrics.inhabitantsCapacity,
    //   modifiers: [
    //     {
    //       target: "inhabitants",
    //       value: 1,
    //       reason: "New inhabitants",
    //       operation: "add",
    //     },
    //   ],
    //   description: "Population growth",
    // },
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
    metrics: GameMetrics
  ): Record<string, Building> {
    Object.values(buildings).forEach((building) => {
      this.houseMetrics.forEach((metric) => {
        if (metric.condition(building, metrics)) {
          metric.action(building, metrics);
        }
      });
    });

    return buildings;
  }

  static updateMetrics(currentMetrics: GameMetrics, map: Map): GameMetrics {
    let newMetrics = { ...currentMetrics };

    // Apply thresholds one by one, updating metrics after each
    for (const threshold of this.thresholds) {
      if (threshold.condition(newMetrics, map)) {
        threshold.modifiers.forEach((modifier) => {
          const value =
            typeof modifier.value === "function"
              ? modifier.value(newMetrics)
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
