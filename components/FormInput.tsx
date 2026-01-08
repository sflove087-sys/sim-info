
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
  const errorClasses = 'border-red-500 ring-red-500';
  const normalClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div>
      <label htmlFor={id} className="block mb-2 font-bold text-gray-700 text-lg">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border-2 rounded-lg transition duration-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${isError ? errorClasses : normalClasses}`}
      />
    </div>
  );
};

export default FormInput;
