import React from "react";

const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <div className="progress-wrapper">
      <div className="progress-bar-container">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="progress-step-wrapper">
              <div
                className={`progress-step ${
                  isActive ? "active" : isCompleted ? "completed" : ""
                }`}
              >
                {isCompleted ? <span>✓</span> : <span>{stepNumber}</span>}
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`progress-line ${
                    isCompleted ? "completed" : ""
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-labels">
        <div className="progress-label">
          <p className="label-text">Details</p>
        </div>
        <div className="progress-label">
          <p className="label-text">Pricing</p>
        </div>
        <div className="progress-label">
          <p className="label-text">Photos</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
