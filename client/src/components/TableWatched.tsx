import React from 'react';
import { LNTvSeasonData, getJLPTLevelFromLN } from '../types/learnNativelyLevel';
import { JLPTLevels } from '../types/WanikaniJLPT';

interface JLPTTableProps {
  seasonData: LNTvSeasonData[];
}

const TableWatched: React.FC<JLPTTableProps> = ({ seasonData }) => {
  const jlptLevelCounters: { [key in JLPTLevels]: number } = {
    N1: 0,
    N2: 0,
    N3: 0,
    N4: 0,
    N5: 0,
  };

  let totalHours = 0;

  // Classify each show to its JLPT level using its difficulty rating and increment the JLPT counter
  seasonData.forEach((season) => {
    const difficultyLevel = season['Difficulty Level']
    const hours = parseInt(season["Total Minutes Watched"]) / 60;

    if (!isNaN(Number(difficultyLevel)) && !isNaN(hours)) {
      const jlptLevel = getJLPTLevelFromLN(Number(difficultyLevel));
      if (jlptLevel) {
        jlptLevelCounters[jlptLevel] += hours;
        totalHours += hours;
      }
    }
  });

  const jlptData = Object.keys(jlptLevelCounters).map((level) => ({
    level,
    hours: jlptLevelCounters[level as JLPTLevels],
    percentage: ((jlptLevelCounters[level as JLPTLevels] / totalHours) * 100).toFixed(2),
  }));

  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th className="py-2">JLPT Level</th>
          <th className="py-2">Hours Watched</th>
          <th className="py-2">Percentage</th>
        </tr>
      </thead>
      <tbody>
        {jlptData.map((data) => (
          <tr key={data.level}>
            <td className="py-2">{data.level}</td>
            <td className="py-2">{data.hours.toFixed(2)}</td>
            <td className="py-2">{data.percentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableWatched;

