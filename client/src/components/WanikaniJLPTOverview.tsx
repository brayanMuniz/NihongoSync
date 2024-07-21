import React from 'react';
import { calculateJLPTLevelHelper, UserWanikaniLevel } from '../types/UserWanikaniLevel';
import LeveltoJLPTTable from './LeveltoJLPTTable';

interface OverviewProps {
  totalHoursWatched: number
  userWanikaniLevel: UserWanikaniLevel;
}

const WanikaniJLPTOverview: React.FC<OverviewProps> = ({ userWanikaniLevel, totalHoursWatched }) => {
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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Wanikani Level: {userWanikaniLevel.length}, Total Hours Watched: {totalHoursWatched} </h2>

      <div className="text-lg flex space-x-4 items-center justify-center">
        <p>~JLPT Level: {calculateJLPTLevel()}</p>
        <p>Days on Current Level: {calculateDaysOnCurrentLevel()}</p>
      </div>

      <LeveltoJLPTTable userWanikaniLevel={userWanikaniLevel} />
    </div>
  );

}

export default WanikaniJLPTOverview;


