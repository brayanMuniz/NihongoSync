import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ArcElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { LNTvSeasonData, getJLPTLevelFromLN } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import { JLPTLevels } from '../types/WanikaniJLPT';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  annotationPlugin
);

interface ChartComponentProps {
  totalHoursWatched: number
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[];
}

const DoughnutJLPTChart: React.FC<ChartComponentProps> = ({ seasonData, totalHoursWatched }) => {
  const jlptLevelCounters: { [key in JLPTLevels]: number } = {
    N5: 0,
    N4: 0,
    N3: 0,
    N2: 0,
    N1: 0,
  };

  // Classify each show to its JLPT level using its difficulty rating and increment the JLPT counter
  seasonData.forEach((season) => {
    const difficultyLevel = parseInt(season["Difficulty Level"]);
    const hours = parseInt(season["Total Minutes Watched"]) / 60;

    if (!isNaN(difficultyLevel) && !isNaN(hours)) {
      const jlptLevel = getJLPTLevelFromLN(difficultyLevel);
      if (jlptLevel) {
        jlptLevelCounters[jlptLevel] += hours;
      }
    }
  });

  const chartData = {
    labels: Object.keys(jlptLevelCounters),
    datasets: [
      {
        label: 'Hours Watched',
        data: Object.values(jlptLevelCounters),
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Total Hours Watched: ${totalHoursWatched.toFixed(2)}`,
      },
    },
  };

  return <Doughnut data={chartData} options={chartOptions} />;
};

export default DoughnutJLPTChart;

