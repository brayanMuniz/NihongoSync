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
    <table>
      <thead>
        <tr>
          <th>WaniKani</th>
          <th>N4</th>
          <th>N3</th>
          <th>N2</th>
          <th>N1</th>
          <th>Anime</th>
        </tr>
      </thead>
      <tbody>
        {levelsToDisplay.map((level, index) => (
          <tr key={level}>
            <td>{level}</td>
            <td>{wanikaniJLPTData.N4[level - 1] !== null ? `${wanikaniJLPTData.N4[level - 1]}%` : '---'}</td>
            <td>{wanikaniJLPTData.N3[level - 1] !== null ? `${wanikaniJLPTData.N3[level - 1]}%` : '---'}</td>
            <td>{wanikaniJLPTData.N2[level - 1] !== null ? `${wanikaniJLPTData.N2[level - 1]}%` : '---'}</td>
            <td>{wanikaniJLPTData.N1[level - 1] !== null ? `${wanikaniJLPTData.N1[level - 1]}%` : '---'}</td>
            <td>---</td>
          </tr>
        ))}
      </tbody>
    </table>

  );
}

export default LeveltoJLPTTable;


