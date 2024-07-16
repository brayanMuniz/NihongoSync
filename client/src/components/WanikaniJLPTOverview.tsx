import React from 'react';
import { calculateJLPTLevelHelper, UserWanikaniLevel } from '../types/UserWanikaniLevel';
import LeveltoJLPTTable from './LeveltoJLPTTable';

interface OverviewProps {
  userWanikaniLevel: UserWanikaniLevel;
}

const WanikaniJLPTOverview: React.FC<OverviewProps> = ({ userWanikaniLevel }) => {
  const calculateTotalLessonsAndReviews = () => {
    return 0;
  };

  const calculateJLPTLevel = () => {
    return calculateJLPTLevelHelper(userWanikaniLevel)
  };

  const calculateDaysOnCurrentLevel = () => {
    let daysOnCurrentLevel: number = 0;

    if (userWanikaniLevel.length > 0) {
      const currentLevelData = userWanikaniLevel[userWanikaniLevel.length - 1].data;
      const unlockedAt = new Date(currentLevelData.unlocked_at);
      const today = new Date();

      // Calculate the difference in time (in milliseconds)
      const diffTime = Math.abs(today.getTime() - unlockedAt.getTime());

      // Convert the time difference to days
      daysOnCurrentLevel = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return daysOnCurrentLevel;
  };

  return (
    <div>
      <h2>Wanikani Level Overview</h2>
      <p>Total Lessons and Reviews Due Now: {calculateTotalLessonsAndReviews()}</p>
      <p>Approximate JLPT Level: {calculateJLPTLevel()}</p>
      <p>Days on Current Level: {calculateDaysOnCurrentLevel()}</p>
      <LeveltoJLPTTable userWanikaniLevel={userWanikaniLevel} />
    </div>
  );
}

export default WanikaniJLPTOverview;


