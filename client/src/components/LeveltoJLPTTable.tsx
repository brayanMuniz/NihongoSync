import React from 'react';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import { wanikaniJLPTData, JLPTLevels } from '../types/WanikaniJLPT';

interface Props {
  userWanikaniLevel: UserWanikaniLevel;
  daysOnLevel: number
}

const LeveltoJLPTTable: React.FC<Props> = ({ userWanikaniLevel, daysOnLevel }) => {
  const currentLevel = userWanikaniLevel.length;

  const startLevel = currentLevel;
  const endLevel = startLevel + 4;

  const levelsToDisplay = wanikaniJLPTData.Level.filter(level => level >= startLevel && level < endLevel);

  const calculateMedianTime = () => {
    const times = userWanikaniLevel.map(level => {
      const unlockedAt = new Date(level.data.unlocked_at);
      const passedAt = level.data.passed_at ? new Date(level.data.passed_at) : new Date();
      const diffTime = Math.abs(passedAt.getTime() - unlockedAt.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    times.sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid] : (times[mid - 1] + times[mid]) / 2;
  };

  const medianTime = calculateMedianTime();

  // Function to calculate the estimated date to reach a level
  const calculateEstimatedDate = (level: number) => {
    const daysNeeded = medianTime * (level - currentLevel);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded - daysOnLevel);
    return estimatedDate.toDateString();
  };

  return (
    <div className="overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-lg">
      <div className="text-white text-lg font-semibold mb-4">
        Median Time For Level Up: {medianTime} Days
      </div>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">WaniKani</th>
            {['N3', 'N2', 'N1'].map(level => (
              <th key={level} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">{level}</th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 text-white divide-y divide-gray-700">
          {levelsToDisplay.map((level) => (
            <tr key={level}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{level}</td>
              {(['N3', 'N2', 'N1'] as JLPTLevels[]).map(jlpt => (
                <td key={jlpt} className="px-6 py-4 whitespace-nowrap text-sm">
                  {wanikaniJLPTData[jlpt][level - 1] !== null ? `${wanikaniJLPTData[jlpt][level - 1]}%` : '---'}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {calculateEstimatedDate(level)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


}


export default LeveltoJLPTTable;


