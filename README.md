# NihongoSync

NihongoSync is a web application designed to help Japanese language learners track and optimize their immersion experience by leveraging personalized difficulty ratings from various Japanese TV shows. This app integrates with popular language-learning platforms to sync and analyze your learning progress and match it with relevant, engaging content.

## Live Version
Check out the live site [here](https://nihongosync.netlify.app/).

## How It Works

NihongoSync combines data from two key resources:
1. **Learn Natively** - Used to track immersion time while watching Japanese TV shows.
2. **WaniKani** - Tracks kanji and vocabulary progress. This level is then mapped to the difficulty level of TV shows on Learn Natively, helping to ensure content is suited to your current skill.

### Features
- **Immersion Time Tracking**: Log the time you spend watching Japanese content
- **Level Mapping**: Your WaniKani level syncs with the difficulty of Japanese content on Learn Natively, helping you find TV shows that match your proficiency level.
- **Data-Driven Recommendations**: Get personalized recommendations based on your WaniKani progress and immersion time. (*In progress*) 

### Tech Stack
- **Frontend**: Built with React.js 
- **Backend**: 
  - Written in Go.
  - PostgreSQL is used for data storage.
  - *Note:* The backend is currently under development and has not yet been deployed.

## Getting Started

### Prerequisites
- Node.js and npm installed.
- A PostgreSQL database set up for local testing.

### Installation
1. Clone the repository:
   `git clone https://github.com/yourusername/nihongosync.git`
2. Install dependencies for the frontend:
   `cd nihongosync/frontend`
   `npm install`
3. (Optional) If working with the backend locally, ensure Go and PostgreSQL are installed.

### Usage

#### Frontend
To start the React frontend:
`cd frontend`
`npm start`
This will launch the frontend locally at `http://localhost:3000`.

#### Backend
Currently, the backend is in development and will require configuration for Go and PostgreSQL. Once deployed, further instructions will be provided.

## Roadmap
- [ ] Deploy backend server
- [ ] User authentication
- [ ] Enhanced recommendation engine
- [ ] Mobile responsiveness

## Acknowledgments
- Special thanks to [Learn Natively](https://learnnatively.com) and [WaniKani](https://www.wanikani.com/) for providing valuable language-learning resources and APIs that make this project possible.

