import React, { useEffect, useState } from 'react';
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
  userWanikaniLevel: UserWanikaniLevel;
  seasonData: LNTvSeasonData[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ userWanikaniLevel, seasonData }) => {
  const [chartLabels, setChartLabels] = useState<number[]>([])
  const [chartDataSets, setChartDataSets] = useState<any[]>([])
  const [hoveredData, setHoveredData] = useState<LNTvSeasonData | null>(null);

  useEffect(() => {
    if (hoveredData) {
      console.log(hoveredData)
    }
  }, [hoveredData]);

  useEffect(() => {
    let hoursWatched = seasonData.map((season) => ({
      title: season["TV Season Title"],
      hours: Math.floor(parseInt(season["Total Minutes Watched"]) / 60),
      wanikaniLevel: getWaniKaniLevelFromLN(season['Difficulty Level']),
      hoverData: season
    }));

    hoursWatched = hoursWatched.filter(season => season.hours > 0);

    // Find min and max Wanikani levels and set as labels
    const minLevel = Math.min(...hoursWatched.map(season => season.wanikaniLevel));
    const maxLevel = Math.max(...hoursWatched.map(season => season.wanikaniLevel));
    const labels = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => i + minLevel);


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
        extraData: season.hoverData
      };
    });

    setChartLabels(labels);
    setChartDataSets(datasets);
  }, [userWanikaniLevel, seasonData])

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const chartData = {
    labels: chartLabels,
    datasets: chartDataSets
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
        display: false,
      },

      tooltip: {
        enabled: false
      },

    },

    onHover: (_, chartElement) => {
      if (chartElement.length > 0) {
        const index = chartElement[0].datasetIndex;
        const dataset = chartData.datasets[index];
        const season = dataset.extraData; // Access extra data here
        // If not null and not the previous hover
        if (season && (hoveredData === null || hoveredData !== season)) {
          setHoveredData(season);
        }
      }
    }

  };
  return (
    <div className="flex">
      <div className="w-10/12 p-2">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="w-2/12 p-5">
        {hoveredData ? (
          <div>
            <h3>{hoveredData['Series Title']}</h3>
            <h3>LN: {hoveredData['Series ID']}</h3>
            <h3>seasonID: {hoveredData['TV Season ID']}</h3>

            <h3>tmbd: {hoveredData['TMDB ID']}</h3>
            <h3>season # {hoveredData['Series Order']}</h3>
          </div>
        ) : (
          <p>Hover over a bar to see details</p>
        )}
      </div>
    </div>
  );
};

export default ChartComponent;

