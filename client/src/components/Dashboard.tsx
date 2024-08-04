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
import HorizontalBarChart from './HorizontalBarChart';
import TableWatched from './TableWatched';
import WanikaniReviews from './WanikaniReviews';
import Footer from './Footer';

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
    <div className="flex flex-col min-h-screen">

      <div className="flex flex-grow">
        <div className="w-7/12 p-4 h-full flex flex-col">

          <div className="flex items-center mx-auto">
            <h2 className="text-2xl font-semibold mr-4">{totalHoursWatched} Hours Immersed</h2>

            <label className="bg-gray-500 text-white px-2 py-1 rounded cursor-pointer">
              LN
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className='flex flex-col'>
            <ChartComponent userWanikaniLevel={userWanikaniLevel} seasonData={seasonData} totalHoursWatched={totalHoursWatched} />
          </div>

          <div className="flex">
            <div className="w-1/5 p-2">
              <DoughnutJLPTChart seasonData={seasonData} />
            </div>
            <div className="w-2/5 p-2">
              <HorizontalBarChart seasonData={seasonData} />
            </div>
            <div className="w-2/5 p-2">
              <TableWatched seasonData={seasonData} />
            </div>
          </div>
        </div>

        <div className="w-5/12 p-4 flex flex-col space-y-4 h-full">
          <WanikaniJLPTOverview userWanikaniLevel={userWanikaniLevel} totalHoursWatched={totalHoursWatched} refreshWKLevelData={refreshWKLevelData}
            handleFileUpload={handleFileUpload}
          />
          <WanikaniReviews wanikaniApiKey={wanikaniApiKey} />
        </div>
      </div>

      <Footer />

    </div>
  );

}

export default Dashboard;



