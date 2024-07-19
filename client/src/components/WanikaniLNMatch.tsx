import React from 'react';
import { LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import ChartComponent from './ChartComponent';


interface Props {
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[]
  totalHoursWatched: number
}

const WanikaniLNMatch: React.FC<Props> = ({ userWanikaniLevel, seasonData, totalHoursWatched }) => {
  return (
    <div>
      <ChartComponent userWanikaniLevel={userWanikaniLevel} seasonData={seasonData} totalHoursWatched={totalHoursWatched} />
    </div>

  );
}

export default WanikaniLNMatch;



