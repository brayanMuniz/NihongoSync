import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';

import { createDefaultWanikaniLevel, UserWanikaniLevel } from './types/UserWanikaniLevel';
import { LNTvSeasonData } from './types/learnNativelyLevel';

import Dashboard from './components/Dashboard';

import './App.css';

function App() {
  const [dataReady, setDataReady] = useState(false)
  const [wanikaniApiKey, setWanikaniApiKey] = useState("")
  const [userWanikaniId, setUserWanikaniId] = useState("")
  const [userWanikaniUserName, setUserWanikaniUserName] = useState("")
  const [userWanikaniLevel, setUserWanikaniLevel] = useState<UserWanikaniLevel>(createDefaultWanikaniLevel());
  const [seasonData, setSeasonData] = useState<LNTvSeasonData[]>([])

  // Intial load with localstorage
  useEffect(() => {
    const usedDemoData = localStorage.getItem("usingDemoData")
    if (usedDemoData != null) {
      localStorage.clear()
      return
    }

    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    const storedUserWanikaniLevelData = localStorage.getItem("userWanikaniLevelData");
    const storedSeasonData = localStorage.getItem("seasonData")
    const storedWanikaniInformation = localStorage.getItem("userWanikaniInformation")

    if (storedSeasonData != null) {
      setSeasonData(JSON.parse(storedSeasonData))
    }

    if (storedWanikaniInformation != null) {
      setUserWanikaniId(JSON.parse(storedWanikaniInformation).id)
      setUserWanikaniUserName(JSON.parse(storedWanikaniInformation).username)
    }

    if (storedApiKey && storedUserWanikaniLevelData != null) {
      setWanikaniApiKey(storedApiKey);
      setUserWanikaniLevel(JSON.parse(storedUserWanikaniLevelData));
      setDataReady(true)
    }
  }, []);

  const handleWanikaniApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault()

    // Get wanikani level
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

    // Get userWanikaniName
    try {

      let wanikaniLevelsUrl: string = "https://api.wanikani.com/v2/user"
      const response = await axios.get(wanikaniLevelsUrl, {
        headers: {
          Authorization: `Bearer ${wanikaniApiKey}`
        }
      });

      if (response.status === 200) {
        const responseData = response.data.data;
        console.log(responseData);
        localStorage.setItem("userWanikaniInformation", JSON.stringify(responseData));
        setUserWanikaniUserName(responseData.username)
        setUserWanikaniId(responseData.id)
      } else {
        return
      }

    } catch (error) {
      console.error(error);
    }
  }

  const handleDemo = async () => {
    localStorage.setItem('usingDemoData', "true")

    await axios.get("./seasonData.json").then((res) => {
      setSeasonData(res.data)
    })

    await axios.get("./tvShows.json").then((res) => {
      console.log(res.data);
      console.log(JSON.stringify(res.data))
      localStorage.setItem('tvShows', JSON.stringify(res.data));
    })

    await axios.get("./userWanikaniLevelData.json").then((res) => {
      setUserWanikaniLevel(res.data)
    })

    setDataReady(true)

  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
      {dataReady ? (
        <Dashboard initialUserWanikaniLevel={userWanikaniLevel} initialSeasonData={seasonData} wanikaniApiKey={wanikaniApiKey} wanikaniUserID={userWanikaniId} wanikaniUserName={userWanikaniUserName} />
      ) : (

        <div className="flex flex-col">
          <button type="button" className="px-4 py-2 bg-sky-800 rounded mb-2 hover:bg-sky-900" onClick={handleDemo}>Show Demo</button>

          <div className="flex flex-col items-center gap-4">
            <form onSubmit={handleWanikaniApiKeySubmit} className="flex flex-col items-center gap-4">
              <label className="text-lg">Wanikani API Key:</label>
              <input
                type="text"
                value={wanikaniApiKey}
                onChange={(e) => setWanikaniApiKey(e.target.value)}
                className="p-2 text-black rounded w-96"
              />
              <button type="submit" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-700">
                Submit
              </button>
            </form>
          </div>


        </div>

      )}
    </div>
  );

}

export default App;
