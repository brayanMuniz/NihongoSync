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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { getWaniKaniLevelFromLN, LNTvSeasonData } from '../types/learnNativelyLevel';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface ChartComponentProps {
  totalHoursWatched: number
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ userWanikaniLevel, seasonData, totalHoursWatched }) => {
  const wanikaniLevel = userWanikaniLevel.length;

  let hoursWatched = seasonData.map((season) => ({
    title: season["TV Season Title"],
    hours: Math.floor(parseInt(season["Total Minutes Watched"]) / 60),
    wanikaniLevel: getWaniKaniLevelFromLN(season['Difficulty Level']),
  }));

  hoursWatched = hoursWatched.filter(season => season.hours > 0);
  console.log(hoursWatched.length)


  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const labels = Array.from({ length: 60 - 5 + 1 }, (_, i) => i + 5);

  // Create a dataset for each season and fill data according to Wanikani levels
  const datasets = hoursWatched.map((season) => {
    const data = Array(labels.length).fill(0);
    const index = labels.indexOf(season.wanikaniLevel);
    if (index !== -1) {
      data[index] = season.hours;
    }

    const backgroundColor = getRandomColor() + 'B3';
    const borderColor = backgroundColor;

    return {
      label: season.title,
      data: data,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      borderWidth: 1,
      stack: 'combined',
    };
  });

  console.log(datasets)

  const chartData = {
    labels: labels,
    datasets: datasets
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {

      x: {
        type: 'category',
        grid: {
          display: true,
        },
        stacked: true,
        title: {
          display: true,
          text: 'Wanikani Level',
        },
      },

      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: true,
        },
        title: {
          display: true,
          text: 'Hours Watched',
        },
        min: 0,

      },
    },

    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: true,
        text: `Wanikani Level: ${wanikaniLevel}, Total Hours Watched: ${Math.floor(totalHoursWatched)}`,
      },

      tooltip: {
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const season = hoursWatched.find(season => season.title === dataset.label);
            return season ? `${season.title}: ${season.hours} hours` : '';
          },
        },
      },

    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default ChartComponent;

