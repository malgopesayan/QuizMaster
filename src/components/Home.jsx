import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import Modal from './Modal'; // Import the modal component
import ProcessingModalContent from './ProcessingModalContent'; // Import the modal's content

const Home = ({ setPdfAnalysis, pdfAnalysis }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('Initializing...');

    try {
      setUploadStage('Validating PDF file...');
      setUploadProgress(5);
      await new Promise(resolve => setTimeout(resolve, 300));

      setUploadStage('Uploading to server...');
      setUploadProgress(10);
      const formData = new FormData();
      formData.append('pdf', file);

      setUploadStage('Server processing file...');
      setUploadProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUploadStage('Uploading to AI service...');
      setUploadProgress(35);
      await new Promise(resolve => setTimeout(resolve, 800));

      setUploadStage('AI analyzing document...');
      setUploadProgress(50);

      const response = await axios.post('/api/upload-and-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadPercent = Math.round((progressEvent.loaded * 15) / progressEvent.total);
            setUploadProgress(35 + uploadPercent);
          }
        },
      });

      setUploadStage('Processing results...');
      setUploadProgress(85);
      await new Promise(resolve => setTimeout(resolve, 600));

      setUploadStage('Finalizing analysis...');
      setUploadProgress(95);
      await new Promise(resolve => setTimeout(resolve, 400));

      if (response.data.success) {
        setPdfAnalysis({
          topics: response.data.topics,
          uploadedFileName: response.data.uploadedFileName,
        });
        
        setUploadStage('Analysis complete!');
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        showToast(`PDF analyzed! Found ${response.data.topics.length} topics.`, 'success');
        navigate('/topics');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorDetail = error.response?.data?.details || 'An unknown error occurred.';
      showToast(`Failed to analyze PDF: ${errorDetail}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleStartQuiz = () => {
    if (pdfAnalysis?.topics) {
      navigate('/topics');
    } else {
      showToast('Please upload a PDF first.', 'warning');
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <div className="welcome-section text-center mb-6">
            <h1 className="title text-center mb-4" style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI-Powered PDF Quizzes
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform any PDF into an interactive quiz. Our AI analyzes your document and generates relevant topics and questions for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="icon icon-lg icon-purple mx-auto mb-4"><i className="fas fa-cloud-upload-alt"></i></div>
                <h2 className="title mb-2 text-purple">Upload & Analyze PDF</h2>
                <p className="text-gray-600 mb-6">Let our AI read your PDF and generate topics automatically.</p>
                {/* The button is now always visible, but disabled during upload */}
                <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <i className="fas fa-upload"></i> Choose PDF File
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="icon icon-lg icon-blue mx-auto mb-4"><i className="fas fa-play"></i></div>
                <h2 className="title mb-2 text-blue">Start Quiz</h2>
                <p className="text-gray-600 mb-6">If you have an active session, you can jump right back in.</p>
                <button className="btn btn-secondary btn-lg" onClick={handleStartQuiz} disabled={!pdfAnalysis?.topics || isUploading}>
                  <i className="fas fa-play"></i> Go to Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* This renders the modal ONLY when 'isUploading' is true */}
      <Modal isOpen={isUploading}>
        <ProcessingModalContent 
          uploadStage={uploadStage} 
          uploadProgress={uploadProgress} 
        />
      </Modal>

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'} toast-icon`}></i>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;