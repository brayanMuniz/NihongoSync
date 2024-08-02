import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 bg-gray-800 text-white text-center mt-4">
      <p>
        All of the TV metadata comes from <a href='https://www.themoviedb.org' className="text-blue-400 underline">The Movie Database</a>. While I am permitted to use the TMDB API, I have not been endorsed or certified by TMDB.
      </p>
    </footer>
  );
};

export default Footer;

