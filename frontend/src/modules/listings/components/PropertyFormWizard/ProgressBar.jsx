import React from "react";

const ProgressBar = ({ currentStep, totalSteps }) => {
  const stepLabels = [
    "Details",
    "Pricing",
    "Photos",
    "Availability",
    "Preview",
  ];

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
        {stepLabels.slice(0, totalSteps).map((label) => (
          <div key={label} className="progress-label">
            <p className="label-text">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;