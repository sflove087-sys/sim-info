
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

// Updated function to generate a cropped image file from a canvas, handling rotation
async function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string,
  rotation = 0
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // The actual crop dimensions on the original image
  const sourceCropWidth = crop.width * scaleX;
  const sourceCropHeight = crop.height * scaleY;
  
  // For 90/270 degree rotation, the output canvas dimensions are swapped
  const isSwapped = (Math.abs(rotation) / 90) % 2 === 1;
  if (isSwapped) {
    canvas.width = sourceCropHeight;
    canvas.height = sourceCropWidth;
  } else {
    canvas.width = sourceCropWidth;
    canvas.height = sourceCropHeight;
  }
  
  // Move origin to the center of the canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);
  // Rotate
  ctx.rotate((rotation * Math.PI) / 180);
  // Move origin back (we translate back by the un-swapped dimensions because we are drawing the original un-rotated image)
  ctx.translate(-sourceCropWidth / 2, -sourceCropHeight / 2);

  // Draw the image. The offsets are negative of the crop's top-left corner on the source image.
  ctx.drawImage(
    image,
    -(crop.x * scaleX),
    -(crop.y * scaleY),
    image.naturalWidth,
    image.naturalHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve(file);
      },
      'image/png',
      1
    );
  });
}


const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel, aspect, cropShape = 'rect', title = "ছবি ক্রপ করুন" }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setRotation(0); // Reset rotation for new image
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handleCrop = async () => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
      try {
        const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, 'cropped_image.png', rotation);
        onCropComplete(croppedImageFile);
      } catch (e) {
        console.error(e);
        alert("Sorry, there was an error cropping the image.");
      }
    } else {
        alert("Please select an area to crop.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-4">আপনার ছবির উপযুক্ত অংশ নির্বাচন করুন এবং প্রয়োজনে ঘোরান।</p>
        <div className="flex justify-center bg-gray-100 p-2 rounded-md">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={cropShape === 'round'}
            minWidth={150}
            minHeight={150 / aspect}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={src}
              onLoad={onImageLoad}
              style={{ maxHeight: '55vh', transform: `rotate(${rotation}deg)` }}
            />
          </ReactCrop>
        </div>
         <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setRotation(r => r - 90)}
            className="bg-gray-200 text-gray-700 py-2 px-4 font-semibold rounded-lg shadow-sm transition-colors duration-300 hover:bg-gray-300"
            title="Rotate Left"
          >
            <i className="fas fa-undo mr-2"></i>বামে ঘোরান
          </button>
           <button
            onClick={() => setRotation(r => r + 90)}
            className="bg-gray-200 text-gray-700 py-2 px-4 font-semibold rounded-lg shadow-sm transition-colors duration-300 hover:bg-gray-300"
            title="Rotate Right"
          >
            <i className="fas fa-redo mr-2"></i>ডানে ঘোরান
          </button>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-6 font-bold rounded-lg shadow-md transition-colors duration-300 hover:bg-gray-600"
          >
            বাতিল
          </button>
          <button
            onClick={handleCrop}
            className="bg-blue-600 text-white py-2 px-6 font-bold rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-700"
          >
            <i className="fas fa-crop-alt mr-2"></i>ক্রপ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
