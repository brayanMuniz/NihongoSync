import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineController,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

interface ReviewData {
  id: number;
  user_id: number;
  review_date: string;
  due_now: number;
  due_in_24_hours: number;
  review_time: string;
  reviews_done?: number; // Optional for calculated data
}

interface ReviewsDone {
  date: string;
  done: number;
}

const WanikaniReviewChart: React.FC = () => {
  const [reviewsData, setReviewsData] = useState<ReviewsDone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const date = new Date();
        date.setMonth(date.getMonth() - 1); // One month before today

        const monthBefore = date.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0]; // Today's date

        const response = await axios.get('http://localhost:8080/userWanikaniReviews', {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: monthBefore, end_date: endDate }
        });

        setReviewsData(calculateReviewsDone(response.data.data));
      } catch (error) {
        setError('Error fetching reviews data');
        console.error(error); // Log the error for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const calculateReviewsDone = (reviews: ReviewData[]): ReviewsDone[] => {
    let reviewsDone: ReviewsDone[] = [];

    for (let i = 0; i < reviews.length - 1; i++) {
      let done = reviews[i].due_in_24_hours - reviews[i + 1].due_now;

      let review: ReviewsDone = {
        date: reviews[i].review_date,
        done: done < 0 ? 0 : done // Ensure no negative values
      };
      reviewsDone.push(review);
    }

    return reviewsDone;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const chartData = {
    labels: reviewsData.map(review => new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit' }).format(new Date(review.date))),

    datasets: [
      {
        label: 'Reviews Done',
        data: reviewsData.map(review => review.done),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false, // Do not fill the area under the line
        tension: 0.1, // Smooth the line
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reviews Done',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wanikani Reviews Done Over Time',
      },
    },
  };

  return (
    <Line data={chartData} options={chartOptions} />
  );
};

export default WanikaniReviewChart;

