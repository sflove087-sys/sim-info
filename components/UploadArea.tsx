
import React, { useState, useCallback } from 'react';

interface UploadAreaProps {
  id: string;
  title: string;
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  acceptedFormats?: string;
  isPhoto?: boolean;
  isError?: boolean;
  showCardOutline?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ id, title, onFileSelect, maxSizeMB = 5, acceptedFormats = "image/jpeg, image/png, application/pdf", isPhoto = false, isError = false, showCardOutline = false}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const baseClasses = "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center items-center relative overflow-hidden";
  const themeClasses = isPhoto ? "border-green-300 bg-green-50/50" : "border-teal-200 bg-teal-50/50";
  const hoverClasses = isPhoto ? "hover:border-green-500 hover:bg-green-100/50" : "hover:border-primary hover:bg-teal-100/50";
  const draggingClasses = isPhoto ? "border-green-600 bg-green-200/50 ring-4 ring-green-100" : "border-primary bg-teal-200/50 ring-4 ring-teal-100";
  const errorClasses = "border-red-500 bg-red-50";

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`ফাইলের সাইজ ${maxSizeMB}MB এর বেশি হতে পারবে না।`);
      return;
    }
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const onAreaClick = () => fileInputRef.current?.click();
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  }, []);
  
  const iconClass = isPhoto ? 'fas fa-camera-retro' : 'fas fa-id-card';
  const iconColor = isPhoto ? 'text-green-600' : 'text-primary';

  return (
    <div
      onClick={onAreaClick} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className={`${baseClasses} ${isError ? errorClasses : isDragging ? draggingClasses : `${themeClasses} ${hoverClasses}`}`}
    >
      <input type="file" ref={fileInputRef} accept={acceptedFormats} onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} className="hidden" />
      {file ? (
        <div className="text-green-800 font-sans z-10">
            <i className="fas fa-check-circle text-5xl mb-3 text-green-500"></i>
            <h3 className="font-bold text-base">আপলোড সম্পন্ন</h3>
            <p className="text-xs break-all px-2">{file.name}</p>
        </div>
      ) : (
        <div className="z-10 flex flex-col items-center justify-center">
          {showCardOutline && (
            <div className="w-24 h-16 bg-white/50 border-2 border-dashed border-teal-400 rounded-lg flex items-center justify-center mb-2">
                <i className="fas fa-image text-teal-400 text-2xl"></i>
            </div>
          )}
           {!showCardOutline && <i className={`${iconClass} text-4xl mb-3 ${iconColor}`}></i>}
          <h3 className="font-bold font-display text-lg text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm font-sans mt-1">এখানে ফাইল ছাড়ুন</p>
          <p className="text-xs text-gray-500 font-sans mt-2">(সর্বোচ্চ {maxSizeMB}MB)</p>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
