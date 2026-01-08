
import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropperProps {
  src: string;
  onCropComplete: (file: File) => void;
  onCancel: () => void;
  aspect: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

async function getCroppedImg(image: HTMLImageElement, crop: Crop, fileName: string): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0, 0,
    canvas.width, canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      resolve(new File([blob], fileName, { type: 'image/png' }));
    }, 'image/png', 1);
  });
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel, aspect, cropShape = 'rect', title = "ছবি ক্রপ করুন" }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height);
    setCrop(newCrop);
  }

  const handleCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      try {
        const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, 'cropped_image.png');
        onCropComplete(croppedImageFile);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold font-display text-[var(--color-primary)] mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">আপনার ছবির উপযুক্ত অংশ নির্বাচন করুন।</p>
        <div className="flex justify-center bg-gray-100 p-2 rounded-lg">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={cropShape === 'round'}
            minWidth={150}
            minHeight={150 / aspect}
            ruleOfThirds
            style={{ maxHeight: '60vh' }}
          >
            <img ref={imgRef} alt="Crop preview" src={src} onLoad={onImageLoad} style={{ maxHeight: '60vh' }} />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-6 font-bold rounded-full shadow-sm transition-colors duration-300 hover:bg-gray-300">
            বাতিল
          </button>
          <button onClick={handleCrop} className="bg-[var(--color-secondary)] text-[var(--color-primary)] py-2 px-6 font-bold rounded-full shadow-md transition-colors duration-300 hover:brightness-105">
            <i className="fas fa-crop-alt mr-2"></i>ক্রপ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
