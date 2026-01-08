
import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isError?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ id, label, value, onChange, type = 'text', placeholder, required = false, isError = false }) => {
  const errorClasses = 'border-red-500 ring-red-200';
  const normalClasses = 'border-gray-200 focus:border-emerald-900 focus:ring-amber-400';

  return (
    <div className="font-sans">
      <label htmlFor={id} className="block mb-2 font-bold text-gray-700 text-base font-display">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-4 border-2 bg-white rounded-xl transition duration-300 focus:outline-none focus:ring-2 ${isError ? errorClasses : normalClasses}`}
      />
    </div>
  );
};

export default FormInput;
