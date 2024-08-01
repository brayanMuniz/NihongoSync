import axios from 'axios';
import React, { useEffect, useState } from 'react';

import WanikaniReviewChart from './WanikaniReviewChart';

interface Props {
  wanikaniApiKey: string
}

const WanikaniReviews: React.FC<Props> = ({ }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    let userToken = localStorage.getItem('authToken')
    if (userToken) {
      setIsAuthenticated(true)
    }
  }, [])


  const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:8080/login', { username_or_email: username, password });
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
    try {
      const response = await axios.post('http://localhost:8080/createuser', { username, password });
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
          <h2 className="text-2xl mb-4">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-2 border rounded"
          />
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

