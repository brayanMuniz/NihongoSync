import React from 'react';

// types
import { LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';

// components 
import DoughnutJLPTChart from './DoughnutJLPTChart';
import LeveltoJLPTTable from './LeveltoJLPTTable';
import WanikaniJLPTOverview from './WanikaniJLPTOverview';
import WanikaniLNMatch from './WanikaniLNMatch';


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
      <div className="w-10/12 p-4">
        <WanikaniLNMatch
          userWanikaniLevel={userWanikaniLevel}
          seasonData={seasonData}
          totalHoursWatched={totalHoursWatched}
        />
      </div>
      <div className="w-2/12 p-4">
        <WanikaniJLPTOverview userWanikaniLevel={userWanikaniLevel} />
        <DoughnutJLPTChart
          userWanikaniLevel={userWanikaniLevel}
          seasonData={seasonData}
          totalHoursWatched={totalHoursWatched}
        />
      </div>
    </div>
  );
}

export default Dashboard;



