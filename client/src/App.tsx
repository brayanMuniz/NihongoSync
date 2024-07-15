import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { UserWanikaniLevel } from './types/UserWanikaniLevel';
import WanikaniJLPTOverview from './components/WanikaniJLPTOverview';

function App() {
  const [dataReady, setDataReady] = useState(false)
  const [wanikaniApiKey, setWanikaniApiKey] = useState("")
  const [userWanikaniLevel, setUserWanikaniLevel] = useState<UserWanikaniLevel | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if the API key is already stored in localStorage
    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    const storedUserWanikaniLevelData = localStorage.getItem("userWanikaniLevelData");

    if (storedApiKey && storedUserWanikaniLevelData != null) {
      setWanikaniApiKey(storedApiKey);
      setUserWanikaniLevel(JSON.parse(storedUserWanikaniLevelData));
    }
  }, []);

  // NOTE: We need this second useEffect because state updates (setWanikaniApiKey and setUserWanikaniLevel) 
  // do not immediately reflect within the same render cycle
  useEffect(() => {
    if (wanikaniApiKey && userWanikaniLevel) {
      console.log(wanikaniApiKey, userWanikaniLevel)
      setDataReady(true);
    }
  }, [wanikaniApiKey, userWanikaniLevel]);

  const handleWanikaniApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault()

    // Check if the API key is already stored in localStorage
    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    if (storedApiKey) {
      setMessage("Waninaki API key stored");
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
        setMessage("API key is valid and data has been stored.");
      } else {
        setMessage("Invalid API key.");
      }
    } catch (error) {
      console.log(error)
      setMessage("Invalid API key.");
    }

  }

  return (
    <div className="App">
      {dataReady ? (
        userWanikaniLevel ? (
          <WanikaniJLPTOverview userWanikaniLevel={userWanikaniLevel} />
        ) : null
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
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );

}

export default App;
