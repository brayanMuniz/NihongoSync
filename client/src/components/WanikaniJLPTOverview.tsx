import React from 'react';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import { wanikaniJLPTData } from '../types/WanikaniJLPT';

interface OverviewProps {
  userWanikaniLevel: UserWanikaniLevel;
}

const WanikaniJLPTOverview: React.FC<OverviewProps> = ({ userWanikaniLevel }) => {
  const calculateTotalLessonsAndReviews = () => {
    return 0;
  };

  const calculateJLPTLevel = () => {
    const currentLevel: number = userWanikaniLevel.length + 1

    if (currentLevel === 0) return "N/A";

    const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];
    let closestLevel = "A";
    let closestDifference = Infinity;

    jlptLevels.forEach((jlptLevel) => {
      const percentages = wanikaniJLPTData[jlptLevel as keyof typeof wanikaniJLPTData];
      const currentPercentage = percentages[currentLevel - 1];

      if (currentPercentage !== null) {
        const difference = Math.abs(50 - currentPercentage);
        if (difference < closestDifference) {
          closestDifference = difference;
          closestLevel = jlptLevel;
        }
      }
    });

    return closestLevel;
  };

  const calculateDaysOnCurrentLevel = () => {
    return 0;
  };

  return (
    <div>
      <h2>Wanikani Level Overview</h2>
      <p>Total Lessons and Reviews Due Now: {calculateTotalLessonsAndReviews()}</p>
      <p>Approximate JLPT Level: {calculateJLPTLevel()}</p>
      <p>Days on Current Level: {calculateDaysOnCurrentLevel()}</p>
    </div>
  );
}

export default WanikaniJLPTOverview;


