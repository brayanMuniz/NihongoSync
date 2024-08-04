import { JLPTLevels, wanikaniJLPTData } from "./WanikaniJLPT";

export type UserWanikaniLevel = {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    created_at: string;
    level: number;
    unlocked_at: string;
    started_at: string;
    passed_at: string | null;
    completed_at: string | null;
    abandoned_at: string | null;
  };
}[];

const defaultWanikaniLevelData = {
  created_at: '',
  level: 0,
  unlocked_at: '',
  started_at: '',
  passed_at: null,
  completed_at: null,
  abandoned_at: null,
};


export const createDefaultWanikaniLevel = (): UserWanikaniLevel => {
  return [
    {
      id: -1,
      object: 'default',
      url: '',
      data_updated_at: '',
      data: { ...defaultWanikaniLevelData },
    },
  ];
};

export const calculateJLPTLevelHelper = (levelData: UserWanikaniLevel): JLPTLevels => {
  const currentLevel: number = levelData.length + 1;

  if (currentLevel === 0) return "N5";

  const jlptLevels: JLPTLevels[] = ["N5", "N4", "N3", "N2", "N1"];
  let closestLevel: JLPTLevels = "N5";
  let closestPercentage = 0;

  jlptLevels.forEach((jlptLevel) => {
    const percentages = wanikaniJLPTData[jlptLevel as keyof typeof wanikaniJLPTData];
    const currentPercentage = percentages[currentLevel - 1];

    if (currentPercentage !== null && currentPercentage !== undefined) {
      const difference = Math.abs(50 - currentPercentage);
      if (difference < Math.abs(50 - closestPercentage)) {
        closestPercentage = currentPercentage;
        closestLevel = jlptLevel;
      }
    }
  });

  return closestLevel
};

export function estimateWanikaniWatchLevel(currentLevel: number, hoursImmersed: number) {
  const levelThresholds = [
    { level: 1, minHours: 0 },
    { level: 2, minHours: 5 },
    { level: 3, minHours: 10 },
    { level: 4, minHours: 20 },
    { level: 5, minHours: 35 },
    { level: 10, minHours: 70 },
    { level: 15, minHours: 120 },
    { level: 20, minHours: 200 },
    { level: 25, minHours: 300 },
    { level: 30, minHours: 450 },
    { level: 35, minHours: 600 },
    { level: 40, minHours: 800 },
    { level: 45, minHours: 1000 },
    { level: 50, minHours: 1250 },
    { level: 55, minHours: 1500 },
    { level: 60, minHours: 2000 }
  ];

  let closestLevel = currentLevel;
  let minHoursForClosestLevel = 0;

  // Find the closest level below the current level
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (levelThresholds[i].level < currentLevel) {
      closestLevel = levelThresholds[i].level;
      minHoursForClosestLevel = levelThresholds[i].minHours;
      break;
    }
  }

  // Calculate the new total hours based on the closest level's min hours
  const totalHours = minHoursForClosestLevel + hoursImmersed;
  let estimatedLevel = closestLevel;

  // Find the estimated level based on the new total hours
  for (let i = 0; i < levelThresholds.length; i++) {
    if (totalHours >= levelThresholds[i].minHours) {
      estimatedLevel = levelThresholds[i].level;
    } else {
      break;
    }
  }

  return estimatedLevel;
}
