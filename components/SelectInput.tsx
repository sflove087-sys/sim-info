
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
  const errorClasses = 'border-red-500 ring-red-500';
  const normalClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  return (
    <div>
      <label htmlFor={id} className="block mb-2 font-bold text-gray-700 text-lg">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border-2 rounded-lg transition duration-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${isError ? errorClasses : normalClasses}`}
      >
        <option value="">জেলা নির্বাচন করুন</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
