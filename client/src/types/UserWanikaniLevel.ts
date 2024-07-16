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

