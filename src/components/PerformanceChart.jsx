import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ newResult }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Load existing history from localStorage
    const history = JSON.parse(localStorage.getItem('quizmaster_history') || '[]');

    // Add the new result to the history
    // We check newResult.topic to ensure we only add it once when the results page loads
    if (newResult.topic) {
      const newEntry = {
        name: `Quiz ${history.length + 1}`, // e.g., "Quiz 1", "Quiz 2"
        topic: newResult.topic,
        score: newResult.percentage,
        date: new Date().toLocaleDateString()
      };
      
      // Prevent adding duplicate results on page re-render
      if (!history.some(h => h.date === newEntry.date && h.topic === newEntry.topic && h.score === newEntry.score)) {
        history.push(newEntry);
        localStorage.setItem('quizmaster_history', JSON.stringify(history));
      }
    }
    
    setChartData(history);
  }, [newResult]);

  if (chartData.length < 2) {
    return (
      <div className="performance-placeholder">
        <div className="placeholder-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <h3 className="placeholder-title">Your Progress Chart</h3>
        <p className="placeholder-text">Complete one more quiz to see your performance over time!</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}: ${payload[0].payload.topic}`}</p>
          <p className="tooltip-score">{`Score: ${payload[0].value}%`}</p>
          <p className="tooltip-date">{`Date: ${payload[0].payload.date}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-chart-container">
       <div className="chart-header">
        <i className="fas fa-chart-line"></i>
        <h3>Performance Over Time</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;