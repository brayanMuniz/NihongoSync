import axios from 'axios';
import TimePicker from 'react-time-picker';
import React, { useEffect, useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi'; // Importing an icon from react-icons
import { Tooltip } from 'react-tooltip'

import WanikaniReviewChart from './WanikaniReviewChart';
import 'react-tooltip/dist/react-tooltip.css'

import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';


interface Props {
  wanikaniApiKey: string
  wanikaniUserName: string
  wanikaniID: string
}

const WanikaniReviews: React.FC<Props> = ({ wanikaniApiKey, wanikaniUserName, wanikaniID }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState<string>('');
  const [reviewTime, setReviewTime] = useState<string | null>('10:00');

  const handleTimeChange = (newValue: string | null) => {
    setReviewTime(newValue);
    console.log(newValue)
  };

  useEffect(() => {
    let userToken = localStorage.getItem('authToken')
    if (userToken) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSignIn = async () => {
    try {
      const response = await axios.post('/login', { username_or_email: email ? email : wanikaniUserName, password });
      if (response.status === 200) {
        console.log(response.data)
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignUp = async () => {
    const submitData = { email: email, username: wanikaniUserName, password: password, wanikani_api_key: wanikaniApiKey, wanikani_id: wanikaniID, review_start_time: reviewTime }
    try {
      const response = await axios.post('/createuser', submitData);
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Sign-up error:', error);
    }
  };

  return (
    <div className="">
      {isAuthenticated ? (
        <WanikaniReviewChart />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">

          <h2 className="text-2xl mb-4">
            {isSignIn ? 'Sign In' : 'Sign Up'}
            <FiHelpCircle
              data-tooltip-id="help-tooltip"
              data-tooltip-content="This is not your Wanikani account, this is a separate account that will use your Wanikani API key to store how many reviews you've done"
              className="inline-block text-gray-500 ml-2 cursor-pointer"
            />
            <Tooltip id="help-tooltip" />
          </h2>

          <input
            type="text"
            placeholder="Email for recovery. Can leave empty"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 p-2 border rounded text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-2 border rounded text-black"
          />



          <div>
            <p>Time you start your reviews</p>
            <TimePicker onChange={handleTimeChange} value={reviewTime} />
          </div>

          {isSignIn ? (
            <button onClick={handleSignIn} className="px-4 py-2 bg-green-500 text-white rounded">
              Sign In
            </button>
          ) : (
            <button onClick={handleSignUp} className="px-4 py-2 bg-green-500 text-white rounded">
              Sign Up
            </button>
          )}

          <p className="mt-4">
            {isSignIn ? (
              <span>
                Don't have an account?{' '}
                <span className="text-blue-500 cursor-pointer" onClick={() => setIsSignIn(false)}>
                  Sign Up
                </span>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <span className="text-blue-500 cursor-pointer" onClick={() => setIsSignIn(true)}>
                  Sign In
                </span>
              </span>
            )}
          </p>

        </div>
      )}
    </div>
  );

};

export default WanikaniReviews;

