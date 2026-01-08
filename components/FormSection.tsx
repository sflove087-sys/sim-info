
import React from 'react';

interface FormSectionProps {
  title: string;
  iconClass: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, iconClass, children }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-t-4 border-amber-400">
      <h2 className="text-2xl font-bold font-display text-emerald-900 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-full text-emerald-900 text-xl">
          <i className={`fas ${iconClass}`}></i>
        </div>
        <span>{title}</span>
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
