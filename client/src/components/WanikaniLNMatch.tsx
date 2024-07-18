import React from 'react';
import { LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import ChartComponent from './ChartComponent';
import DoughnutJLPTChart from './DoughnutJLPTChart';


interface Props {
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[]
}

const WanikaniLNMatch: React.FC<Props> = ({ userWanikaniLevel, seasonData }) => {
  const totalHoursWatched = seasonData.reduce((total, season) => {
    const hours = parseInt(season["Total Minutes Watched"]) / 60;
    return total + (isNaN(hours) ? 0 : hours); // Ensure no NaN values
  }, 0);

  return (
    <div>
      <ChartComponent userWanikaniLevel={userWanikaniLevel} seasonData={seasonData} totalHoursWatched={totalHoursWatched} />

      <DoughnutJLPTChart userWanikaniLevel={userWanikaniLevel} seasonData={seasonData} totalHoursWatched={totalHoursWatched} />

    </div>

  );
}

export default WanikaniLNMatch;



