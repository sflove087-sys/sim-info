
import React from 'react';

interface FormSectionProps {
  title: string;
  iconClass: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, iconClass, children }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-4 border-b-2 border-blue-100 flex items-center gap-4">
        <i className={`fas ${iconClass} text-blue-600 text-2xl`}></i>
        <span>{title}</span>
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
