
import React, { useState, useEffect } from 'react';

interface PreviewBoxProps {
  file: File;
  title: string;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ file, title }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up the object URL on unmount
      return () => URL.revokeObjectURL(objectUrl);
    } else if (file.type === 'application/pdf') {
      // Use a static URL for a PDF icon
      setPreviewUrl('https://cdn-icons-png.flaticon.com/512/337/337946.png');
    }
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
      <h4 className="font-bold text-blue-800 mb-3">{title}</h4>
      <img 
        src={previewUrl} 
        alt={`${title} preview`} 
        className={`max-w-full h-auto max-h-60 mx-auto rounded-md border border-gray-300 shadow-md object-contain ${file.type === 'application/pdf' ? 'p-8' : ''}`} 
      />
    </div>
  );
};

export default PreviewBox;
