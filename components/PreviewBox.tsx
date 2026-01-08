
import React, { useState, useEffect } from 'react';

interface PreviewBoxProps {
  file: File;
  title: string;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ file, title }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) return null;
  
  const isPdf = file.type === 'application/pdf';

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-4 bg-white text-center shadow-sm">
      <h4 className="font-bold font-display text-[var(--color-primary)] mb-3">{title}</h4>
      <div className={`w-full h-48 flex items-center justify-center rounded-lg overflow-hidden ${isPdf ? 'bg-gray-100' : ''}`}>
          <img 
            src={isPdf ? 'https://cdn-icons-png.flaticon.com/512/337/337946.png' : previewUrl} 
            alt={`${title} preview`} 
            className={`max-w-full max-h-full object-contain ${isPdf ? 'w-20 h-20' : ''}`} 
          />
      </div>
    </div>
  );
};

export default PreviewBox;
