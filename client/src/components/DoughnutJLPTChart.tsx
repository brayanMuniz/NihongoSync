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
  seasonData: LNTvSeasonData[];
  className?: string
}

const DoughnutJLPTChart: React.FC<ChartComponentProps> = ({ seasonData, className }) => {
  const jlptLevelCounters: { [key in JLPTLevels]: number } = {
    N5: 0,
    N4: 0,
    N3: 0,
    N2: 0,
    N1: 0,
  };

  // Classify each show to its JLPT level using its difficulty rating and increment the JLPT counter
  seasonData.forEach((season) => {
    const difficultyLevel = season['Difficulty Level']
    const hours = parseInt(season["Total Minutes Watched"]) / 60;

    if (!isNaN(Number(difficultyLevel)) && !isNaN(hours)) {
      const jlptLevel = getJLPTLevelFromLN(Number(difficultyLevel));
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
        display: false,
      },
    },
  };

  return <div className={className}><Doughnut data={chartData} options={chartOptions} /></div>;
};

export default DoughnutJLPTChart;

