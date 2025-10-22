import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const TopicSelection = ({ pdfAnalysis, setCurrentQuiz }) => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    if (!pdfAnalysis?.topics) {
      navigate('/');
    } else {
      setFilteredTopics(pdfAnalysis.topics);
    }
  }, [pdfAnalysis, navigate]);

  useEffect(() => {
    if (!pdfAnalysis?.topics) return;
    if (searchTerm.trim() === '') {
      setFilteredTopics(pdfAnalysis.topics);
    } else {
      const filtered = pdfAnalysis.topics.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchTerm, pdfAnalysis?.topics]);

  const handleGenerateQuiz = async () => {
    if (!selectedTopic) {
      alert('Please select a topic.');
      return;
    }
    setIsLoading(true);
    try {
      const wrongQuestions = JSON.parse(localStorage.getItem('quizmaster_wrong_questions') || '[]');
      const reviewQuestions = wrongQuestions.slice(0, 3); // Take up to 3 review questions
      const newQuestionCount = questionCount - reviewQuestions.length;
      
      let newQuestions = [];
      if (newQuestionCount > 0) {
        // CORRECTED: Send uploadedFileName instead of the old geminiFileName
        const response = await axios.post('/api/generate-quiz', {
          topic: selectedTopic.title,
          questionCount: newQuestionCount,
          uploadedFileName: pdfAnalysis.uploadedFileName,
        });
        newQuestions = response.data.quiz.questions;
      }

      const finalQuizQuestions = shuffleArray([...newQuestions, ...reviewQuestions]);
      setCurrentQuiz({ topic: selectedTopic.title, questions: finalQuizQuestions });
      navigate('/quiz');
    } catch (error) {
        const errorDetail = error.response?.data?.details || 'Please check the server logs.';
        alert(`Failed to generate quiz. ${errorDetail}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pdfAnalysis?.topics) return null;

  return (
    <div className="topic-selection-page">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Create Your Quiz</h1>
            <p className="page-subtitle">Select a topic and customize your quiz experience</p>
          </div>

          <div className="quiz-builder">
            <div className="builder-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="step-number">1</span>
                  <h2>Choose Your Topic</h2>
                </div>
                <div className="topic-stats">
                  <span className="total-topics">{pdfAnalysis.topics.length} topics found</span>
                  {searchTerm && (
                    <span className="filtered-topics">{filteredTopics.length} matching</span>
                  )}
                </div>
              </div>

              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="topics-grid">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, index) => (
                    <div
                      key={index}
                      className={`topic-card ${selectedTopic?.title === topic.title ? 'selected' : ''}`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <div className="topic-card-header">
                          <input
                            type="radio"
                            name="topic"
                            className='topic-radio'
                            value={topic.title}
                            checked={selectedTopic?.title === topic.title}
                            onChange={() => setSelectedTopic(topic)}
                            style={{width: '18px', height: '18px', cursor: 'pointer'}}
                          />
                        <div className="topic-icon">
                          <i className="fas fa-book"></i>
                        </div>
                      </div>
                      <div className="topic-card-content">
                        <h3 className="topic-title">{topic.title}</h3>
                        <p className="topic-desc">{topic.description}</p>
                      </div>
                      {selectedTopic?.title === topic.title && (
                        <div className="selected-indicator">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <i className="fas fa-search"></i>
                    <h3>No topics found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>

            <div className="builder-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="step-number">2</span>
                  <h2>Quiz Settings</h2>
                </div>
              </div>

              <div className="settings-card">
                <div className="setting-group">
                  <label className="setting-label">Number of Questions</label>
                  <div className="question-count-selector">
                    {[5, 10, 15, 20].map(count => (
                      <button
                        key={count}
                        className={`count-btn ${questionCount === count ? 'active' : ''}`}
                        onClick={() => setQuestionCount(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="generate-section">
              <button 
                className={`generate-btn ${selectedTopic ? 'ready' : 'disabled'}`}
                onClick={handleGenerateQuiz} 
                disabled={!selectedTopic || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Generate Quiz
                  </>
                )}
              </button>
              {selectedTopic && (
                <p className="generate-hint">
                  Ready to create a {questionCount}-question quiz about "{selectedTopic.title}"
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopicSelection;