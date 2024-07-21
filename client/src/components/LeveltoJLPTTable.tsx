import React from 'react';
import { UserWanikaniLevel } from '../types/UserWanikaniLevel';
import { wanikaniJLPTData } from '../types/WanikaniJLPT';

interface Props {
  userWanikaniLevel: UserWanikaniLevel;
}

const LeveltoJLPTTable: React.FC<Props> = ({ userWanikaniLevel }) => {
  const wanikaniLevel: number = userWanikaniLevel.length
  const startLevel = wanikaniLevel;
  const endLevel = startLevel + 4;

  const levelsToDisplay = wanikaniJLPTData.Level.filter(level => level >= startLevel && level < endLevel);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WaniKani</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N4</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N3</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N2</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N1</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {levelsToDisplay.map((level, index) => (
            <tr key={level} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wanikaniJLPTData.N4[level - 1] !== null ? `${wanikaniJLPTData.N4[level - 1]}%` : '---'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wanikaniJLPTData.N3[level - 1] !== null ? `${wanikaniJLPTData.N3[level - 1]}%` : '---'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wanikaniJLPTData.N2[level - 1] !== null ? `${wanikaniJLPTData.N2[level - 1]}%` : '---'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wanikaniJLPTData.N1[level - 1] !== null ? `${wanikaniJLPTData.N1[level - 1]}%` : '---'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default LeveltoJLPTTable;


