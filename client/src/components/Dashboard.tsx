import axios from 'axios';
import Papa from 'papaparse';
import React, { useState } from 'react';

// types
import { LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import ChartComponent from './ChartComponent';

// components 
import DoughnutJLPTChart from './DoughnutJLPTChart';
import WanikaniJLPTOverview from './WanikaniJLPTOverview';

interface Props {
  initialUserWanikaniLevel: UserWanikaniLevel;
  initialSeasonData: LNTvSeasonData[]
  wanikaniApiKey: string
}

const Dashboard: React.FC<Props> = ({ initialUserWanikaniLevel, initialSeasonData, wanikaniApiKey }) => {
  const [userWanikaniLevel, setUserWanikaniLevel] = useState<UserWanikaniLevel>(initialUserWanikaniLevel);
  const [seasonData, setSeasonData] = useState<LNTvSeasonData[]>(initialSeasonData)

  const totalHoursWatched = Math.floor(seasonData.reduce((total, season) => {
    const hours = parseInt(season["Total Minutes Watched"]) / 60;
    return total + (isNaN(hours) ? 0 : hours); // Ensure no NaN values
  }, 0))


  const refreshWKLevelData = async () => {
    try {
      let wanikaniLevelsUrl: string = "https://api.wanikani.com/v2/level_progressions"
      const response = await axios.get(wanikaniLevelsUrl, {
        headers: {
          Authorization: `Bearer ${wanikaniApiKey}`
        }
      });

      if (response.status === 200) {
        const responseData = response.data.data;
        console.log(responseData)
        localStorage.setItem("userWanikaniLevelData", JSON.stringify(responseData));
        setUserWanikaniLevel(responseData)
      } else {
        return
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<LNTvSeasonData>(file, {
        complete: (results) => {
          setSeasonData(results.data);
          localStorage.setItem("seasonData", JSON.stringify(results.data));
        },
        header: true,
      });
    }
  };

  return (

    <div className="flex min-h-screen">

      <div className="w-8/12 p-4 h-full">
        <ChartComponent userWanikaniLevel={userWanikaniLevel} seasonData={seasonData}
        />
      </div>

      <div className="w-4/12 p-4 flex flex-col space-y-4 h-full">
        <WanikaniJLPTOverview userWanikaniLevel={userWanikaniLevel} totalHoursWatched={totalHoursWatched} refreshWKLevelData={refreshWKLevelData}
          handleFileUpload={handleFileUpload}

        />
        <DoughnutJLPTChart
          seasonData={seasonData}
        />
      </div>

    </div>

  );
}

export default Dashboard;



