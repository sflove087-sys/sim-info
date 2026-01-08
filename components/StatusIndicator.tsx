
import React from 'react';

interface StatusStepProps {
  iconClass: string;
  text: string;
  status: 'done' | 'active' | 'pending';
}

const StatusStep: React.FC<StatusStepProps> = ({ iconClass, text, status }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'done':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-200 text-gray-500';
    }
  };

  const getTextColor = () => {
    switch (status) {
        case 'done':
          return 'text-green-600';
        case 'active':
          return 'text-blue-700';
        default:
          return 'text-gray-600';
    }
  }

  return (
    <div className="flex flex-col items-center text-center w-28 md:w-32">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-xl transition-all duration-300 ${getStatusClasses()}`}>
        <i className={`fas ${iconClass}`}></i>
      </div>
      <div className={`text-sm font-bold transition-all duration-300 ${getTextColor()}`}>{text}</div>
    </div>
  );
};

const StatusIndicator: React.FC = () => {
  // This is a static representation for UI purposes. A real app might pass props to control the state.
  return (
    <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-8">
      <StatusStep iconClass="fa-user-check" text="ব্যক্তিগত তথ্য" status="done" />
      <StatusStep iconClass="fa-id-card" text="NID স্ক্যান" status="active" />
      <StatusStep iconClass="fa-check-circle" text="নিশ্চিতকরণ" status="pending" />
    </div>
  );
};

export default StatusIndicator;
