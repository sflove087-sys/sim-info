
import React, { useState, useCallback } from 'react';

interface UploadAreaProps {
  id: string;
  title: string;
  description: string;
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  acceptedFormats?: string;
  isPhoto?: boolean;
  isError?: boolean;
  showCardOutline?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ id, title, description, onFileSelect, maxSizeMB = 5, acceptedFormats = "image/jpeg, image/png, application/pdf", isPhoto = false, isError = false, showCardOutline = false}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const baseClasses = "border-3 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center items-center";
  const photoClasses = isPhoto ? "border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100" : "border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100";
  const draggingClasses = isPhoto ? "border-green-600 bg-green-200" : "border-blue-600 bg-blue-200";
  const errorClasses = "border-red-500 bg-red-50";

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`ফাইলের সাইজ ${maxSizeMB}MB এর বেশি হতে পারবে না।`);
      return;
    }
    
    if (!acceptedFormats.split(', ').includes(selectedFile.type)) {
        // A simple check, might need to be more robust for real-world scenarios
        // alert(`Invalid file type. Please upload one of: ${acceptedFormats}`);
        // return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const onAreaClick = () => fileInputRef.current?.click();

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);
  
  const iconClass = isPhoto ? 'fas fa-user-circle' : 'fas fa-id-card';
  const iconColor = isPhoto ? 'text-green-500' : 'text-blue-500';

  return (
    <div
      onClick={onAreaClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`${baseClasses} ${isError ? errorClasses : isDragging ? draggingClasses : photoClasses}`}
    >
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        accept={acceptedFormats}
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        className="hidden"
      />
      {file ? (
        <div className="text-green-700">
            <i className="fas fa-check-circle text-5xl mb-4"></i>
            <h3 className="font-bold text-lg">আপলোড সম্পন্ন</h3>
            <p className="text-sm break-all">{file.name}</p>
            <small className="text-xs">সাইজ: {(file.size / 1024 / 1024).toFixed(2)} MB</small>
        </div>
      ) : (
        <>
          {showCardOutline ? (
            <div className="w-4/5 text-gray-400 mb-3 pointer-events-none">
              <div className="border-2 border-dashed border-current rounded-lg p-2" style={{ aspectRatio: '85.6 / 54' }}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                   <i className="fas fa-camera text-2xl mb-1"></i>
                   <span className="text-xs font-semibold">কার্ড এখানে রাখুন</span>
                </div>
              </div>
            </div>
          ) : (
             <i className={`${iconClass} text-5xl mb-4 ${iconColor}`}></i>
          )}
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
          <small className="text-gray-500 mt-2">সর্বোচ্চ সাইজ: {maxSizeMB}MB</small>
        </>
      )}
    </div>
  );
};

export default UploadArea;
