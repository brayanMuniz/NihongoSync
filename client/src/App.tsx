import { FormEvent, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [wanikaniApiKey, setWanikaniApiKey] = useState("")
  const [message, setMessage] = useState("");

  const handleWanikaniApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault()

    // Check if the API key is already stored in localStorage
    const storedApiKey = localStorage.getItem("wanikaniApiKey");
    if (storedApiKey) {
      setMessage("Waninaki API key stored");
      return;
    }

    // If its not stored, make the api call to level and store api key and level data
    let wanikaniLevelsUrl: string = "https://api.wanikani.com/v2/level_progressions"
    try {
      const response = await axios.get(wanikaniLevelsUrl, {
        headers: {
          Authorization: `Bearer ${wanikaniApiKey}`
        }
      });

      // If the response is successful, store the API key and user data in localStorage
      if (response.status === 200) {
        localStorage.setItem("wanikaniApiKey", wanikaniApiKey);
        localStorage.setItem("userWanikaniLevelData", JSON.stringify(response.data));
        setMessage("API key is valid and data has been stored.");
      } else {
        setMessage("Invalid API key.");
      }
    } catch (error) {
      setMessage("Invalid API key.");
    }

  }

  return (
    <div className="App">

      <form onSubmit={handleWanikaniApiKeySubmit}>
        <label>Wanikani API Key:
        </label>
        <input type={"text"} value={wanikaniApiKey} onChange={(e) => setWanikaniApiKey(e.target.value)} />
        <button type='submit' > Submit </button>
      </form>

      {message && <p>{message}</p>}



    </div>
  );
}

export default App;
