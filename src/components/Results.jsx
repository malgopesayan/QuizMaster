import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

// Enhanced Weak Area Analysis Component - NOW POWERED BY CLAUDE
const WeakAreaAnalysis = ({ wrongQuestionsFromQuiz }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      // Use wrong questions from the current quiz if available
      if (wrongQuestionsFromQuiz.length === 0) {
        setAnalysis("Excellent job! You didn't get any questions wrong in this quiz.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Call the new backend endpoint
        const response = await axios.post('/api/analyze-weak-areas', {
          wrongAnswers: wrongQuestionsFromQuiz
        });
        setAnalysis(response.data.analysis);
      } catch (error) {
        console.error('Failed to fetch weak area analysis:', error);
        setAnalysis('Could not retrieve analysis at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [wrongQuestionsFromQuiz]);

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <i className="fas fa-brain"></i>
        <h3>AI Tutor Analysis (via Claude 3.5)</h3>
      </div>
      {loading ? (
        <div className="loading-analysis">
          <div className="analysis-spinner"></div>
          <p>Claude is analyzing your results...</p>
        </div>
      ) : (
        <p className="analysis-text" style={{ whiteSpace: 'pre-wrap' }}>{analysis}</p>
      )}
    </div>
  );
};


const Results = ({ quizResults }) => {
  const navigate = useNavigate();

  const { correct, incorrect, percentage, topic, total, questions, wrongQuestionsFromQuiz } = useMemo(() => {
    if (!quizResults) return {};
    const correctCount = quizResults.questions.filter(q => q.isCorrect).length;
    const totalCount = quizResults.questions.length;
    const incorrectCount = totalCount - correctCount;
    const percent = Math.round((correctCount / totalCount) * 100);
    const wrongQuestions = quizResults.questions
      .filter(q => !q.isCorrect)
      .map(q => ({ // Send a clean object to the AI
          topic: quizResults.topic,
          question: q.question,
          yourAnswer: q.options[q.userAnswer],
          correctAnswer: q.options[q.correctAnswer]
      }));

    return { 
        ...quizResults, 
        correct: correctCount, 
        incorrect: incorrectCount, 
        percentage: percent, 
        total: totalCount,
        wrongQuestionsFromQuiz: wrongQuestions
    };
  }, [quizResults]);

  useEffect(() => {
    // This effect handles saving wrong answers to localStorage for the Settings page
    if (!quizResults || !questions || !topic) return;
    
    const newWrongQuestions = questions
      .filter(q => !q.isCorrect && q.userAnswer !== null)
      .map(q => ({ ...q, topic: topic }));
    
    let existingWrong = JSON.parse(localStorage.getItem('quizmaster_wrong_questions') || '[]');
    newWrongQuestions.forEach(newQ => {
      if (!existingWrong.some(ewq => ewq.id === newQ.id)) {
        existingWrong.push(newQ);
      }
    });
    localStorage.setItem('quizmaster_wrong_questions', JSON.stringify(existingWrong));

  }, [quizResults, questions, topic]);

  if (!quizResults) {
    useEffect(() => { navigate('/'); }, [navigate]);
    return null;
  }

  return (
    <div className="results-page">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <div className="results-header">
            <h1 className="results-title">Quiz Results</h1>
            <p className="results-subtitle">Topic: {topic}</p>
          </div>

          <div className="results-grid">
            {/* Score Card */}
            <div className="score-card">
                 <div className="score-circle">
                    <div className="score-percentage" style={{ 
                      color: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444' 
                    }}>
                      {percentage}%
                    </div>
                    <div className="score-label">Score</div>
                </div>
                <div className="score-details">
                    <div className="score-stat correct"><i className="fas fa-check-circle"></i><span className="stat-number">{correct}</span><span className="stat-label">Correct</span></div>
                    <div className="score-stat incorrect"><i className="fas fa-times-circle"></i><span className="stat-number">{incorrect}</span><span className="stat-label">Incorrect</span></div>
                    <div className="score-stat total"><i className="fas fa-list"></i><span className="stat-number">{total}</span><span className="stat-label">Total</span></div>
                </div>
            </div>

            {/* Performance Message */}
            <div className="performance-message">
              {/* ... existing message logic ... */}
            </div>
          </div>
          
          {/* Weak Area Analysis - Now powered by the new component */}
          <WeakAreaAnalysis wrongQuestionsFromQuiz={wrongQuestionsFromQuiz} />

          {/* Action Buttons */}
          <div className="results-actions">
            <button onClick={() => navigate('/')} className="action-btn primary"><i className="fas fa-plus"></i> Start New Quiz</button>
            <button onClick={() => navigate('/topics')} className="action-btn secondary"><i className="fas fa-redo"></i> Retry This Topic</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;