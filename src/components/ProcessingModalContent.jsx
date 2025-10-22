import React from 'react';

const ProcessingModalContent = ({ uploadStage, uploadProgress }) => {
  return (
    // The CSS now targets this class to style the modal
    <div className="upload-progress-container in-modal">
      <div className="upload-progress-header">
        <div className="upload-spinner">
          <div className="spinner-ring"></div>
        </div>
        <h3 className="upload-title">Processing Your PDF</h3>
        <p className="upload-stage">{uploadStage}</p>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        <div className="progress-text">{Math.round(uploadProgress)}%</div>
      </div>
      
      <div className="upload-steps">
        <div className={`step ${uploadProgress >= 5 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-file-shield"></i></div>
          <span>Validate</span>
        </div>
        <div className={`step ${uploadProgress >= 20 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-satellite-dish"></i></div>
          <span>Upload</span>
        </div>
        <div className={`step ${uploadProgress >= 30 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-atom"></i></div>
          <span>Process</span>
        </div>
        <div className={`step ${uploadProgress >= 50 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-brain"></i></div>
          <span>AI Analysis</span>
        </div>
        <div className={`step ${uploadProgress >= 85 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-file-lines"></i></div>
          <span>Extract</span>
        </div>
        <div className={`step ${uploadProgress === 100 ? 'active' : ''}`}>
          <div className="step-icon"><i className="fas fa-flag-checkered"></i></div>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModalContent;