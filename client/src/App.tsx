import { FormEvent, useEffect, useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import './App.css';
import { createDefaultWanikaniLevel, UserWanikaniLevel } from './types/UserWanikaniLevel';
import { LNTvSeasonData } from './types/learnNativelyLevel';
import Dashboard from './components/Dashboard';

function App() {
  const [dataReady, setDataReady] = useState(false)
  const [wanikaniApiKey, setWanikaniApiKey] = useState("")
  const [userWanikaniLevel, setUserWanikaniLevel] = useState<UserWanikaniLevel>(createDefaultWanikaniLevel());
  const [seasonData, setSeasonData] = useState<LNTvSeasonData[]>([])

  useEffect(() => {
    // Check if the API key is already stored in localStorage
    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    const storedUserWanikaniLevelData = localStorage.getItem("userWanikaniLevelData");
    const storedSeasonData = localStorage.getItem("seasonData")

    if (storedApiKey && storedUserWanikaniLevelData != null) {
      setWanikaniApiKey(storedApiKey);
      setUserWanikaniLevel(JSON.parse(storedUserWanikaniLevelData));
    }

    if (storedSeasonData != null) {
      console.log(seasonData)
      setSeasonData(JSON.parse(storedSeasonData))
    }
  }, []);

  // NOTE: We need this second useEffect because state updates (setWanikaniApiKey and setUserWanikaniLevel) 
  // do not immediately reflect within the same render cycle
  useEffect(() => {
    if (wanikaniApiKey && userWanikaniLevel && seasonData) {
      setDataReady(true);
    }
  }, [wanikaniApiKey, userWanikaniLevel, seasonData]);

  const handleWanikaniApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault()

    // Check if the API key is already stored in localStorage
    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    if (storedApiKey) {
      return;
    }

    // If its not stored, make the api call to level and store api key and level data
    try {
      let wanikaniLevelsUrl: string = "https://api.wanikani.com/v2/level_progressions"
      const response = await axios.get(wanikaniLevelsUrl, {
        headers: {
          Authorization: `Bearer ${wanikaniApiKey}`
        }
      });

      // If the response is successful, store the API key and user data in localStorage
      if (response.status === 200) {
        const responseData = response.data.data;
        localStorage.setItem("wanikaniApiKey", wanikaniApiKey);
        localStorage.setItem("userWanikaniLevelData", JSON.stringify(responseData));
        setWanikaniApiKey(wanikaniApiKey)
        setUserWanikaniLevel(responseData)
        setDataReady(true)
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
          localStorage.setItem("seasonData", JSON.stringify(results.data))
        },
        header: true
      });
    }
  }

  return (
    <div className="App">
      {dataReady ? (
        <Dashboard initialUserWanikaniLevel={userWanikaniLevel} initialSeasonData={seasonData} wanikaniApiKey={wanikaniApiKey} />
      ) : (

        <div>

          <form onSubmit={handleWanikaniApiKeySubmit}>
            <label>Wanikani API Key:</label>
            <input
              type="text"
              value={wanikaniApiKey}
              onChange={(e) => setWanikaniApiKey(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ marginTop: '20px' }}
          />

        </div>
      )}
    </div>
  );

}

export default App;
