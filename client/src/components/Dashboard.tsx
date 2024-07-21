import React from 'react';

// types
import { LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import ChartComponent from './ChartComponent';

// components 
import DoughnutJLPTChart from './DoughnutJLPTChart';
import WanikaniJLPTOverview from './WanikaniJLPTOverview';

interface Props {
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[]
}

const Dashboard: React.FC<Props> = ({ userWanikaniLevel, seasonData }) => {
  const totalHoursWatched = seasonData.reduce((total, season) => {
    const hours = parseInt(season["Total Minutes Watched"]) / 60;
    return total + (isNaN(hours) ? 0 : hours); // Ensure no NaN values
  }, 0);

  return (
    <div className="flex">

      <div className="w-8/12 p-4">
        <ChartComponent userWanikaniLevel={userWanikaniLevel} seasonData={seasonData}
        />
      </div>

      <div className="w-4/12 p-4 flex flex-col space-y-4">
        <WanikaniJLPTOverview userWanikaniLevel={userWanikaniLevel} totalHoursWatched={totalHoursWatched} />
        <DoughnutJLPTChart
          seasonData={seasonData}
          className="w-1/2 h-1/2"
        />
      </div>

    </div>
  );
}

export default Dashboard;



