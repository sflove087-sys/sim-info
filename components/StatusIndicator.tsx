
import React from 'react';

interface StatusStepProps {
  iconClass: string;
  text: string;
  step: number;
  currentStep: number;
}

const StatusStep: React.FC<StatusStepProps> = ({ iconClass, text, step, currentStep }) => {
  const isDone = step < currentStep;
  const isActive = step === currentStep;

  return (
    <div className="flex flex-col items-center text-center w-28 md:w-32 z-10">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 border-4
          ${isDone ? 'bg-primary text-white border-primary' : ''}
          ${isActive ? 'bg-white text-secondary border-secondary shadow-lg shadow-yellow-300' : ''}
          ${!isDone && !isActive ? 'bg-gray-200 text-gray-400 border-gray-200' : ''}`}
      >
        <i className={`fas ${iconClass}`}></i>
      </div>
      <div
        className={`mt-2 font-bold font-display text-sm md:text-base transition-all duration-500
          ${isDone ? 'text-primary' : ''}
          ${isActive ? 'text-secondary' : ''}
          ${!isDone && !isActive ? 'text-gray-500' : ''}`}
      >
        {text}
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  currentStep: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ currentStep }) => {
  const progress = ((currentStep - 1) / 2) * 100;

  return (
    <div className="flex justify-center items-center mb-12">
      <div className="w-full max-w-xl relative flex justify-between items-center">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 transform -translate-y-1/2">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <StatusStep iconClass="fa-file-lines" text="তথ্য পূরণ" step={1} currentStep={currentStep} />
        <StatusStep iconClass="fa-cloud-upload" text="ডকুমেন্ট আপলোড" step={2} currentStep={currentStep} />
        <StatusStep iconClass="fa-check-double" text="নিশ্চিতকরণ" step={3} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default StatusIndicator;
