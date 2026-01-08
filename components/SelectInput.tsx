
import React from 'react';

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
  isError?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ id, label, value, onChange, options, required = false, isError = false }) => {
  const errorClasses = 'border-red-500 ring-red-200';
  const normalClasses = 'border-gray-200 focus:border-[var(--color-primary)] focus:ring-[var(--color-secondary)]';
  
  return (
    <div className="font-sans">
      <label htmlFor={id} className="block mb-2 font-bold text-gray-700 text-base font-display">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`appearance-none w-full p-4 border-2 bg-white rounded-xl transition duration-300 focus:outline-none focus:ring-2 ${isError ? errorClasses : normalClasses}`}
        >
          <option value="">-- জেলা নির্বাচন করুন --</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    </div>
  );
};

export default SelectInput;
