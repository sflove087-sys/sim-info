
import React, { useRef, useState, useEffect } from 'react';
import type { FormData } from '../types';

// html2canvas is loaded from CDN, declare it to satisfy TypeScript
declare const html2canvas: any;

interface SimInfoCardProps {
  formData: FormData;
  customerPhoto: File | null;
  applicationId: string;
  onReset: () => void;
}

const SimInfoCard: React.FC<SimInfoCardProps> = ({ formData, customerPhoto, applicationId, onReset }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const hologramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customerPhoto) {
      const url = URL.createObjectURL(customerPhoto);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [customerPhoto]);
  
  useEffect(() => {
    const hologram = hologramRef.current;
    if (!hologram) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hologram.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = rect;
      const rotateX = (y / height - 0.5) * -25;
      const rotateY = (x / width - 0.5) * 25;
      hologram.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
        hologram.style.transform = 'perspective(500px) rotateX(0) rotateY(0)';
    };

    hologram.addEventListener('mousemove', handleMouseMove);
    hologram.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hologram.removeEventListener('mousemove', handleMouseMove);
      hologram.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current || typeof html2canvas === 'undefined') {
        alert("Download feature is not available right now. Please try again later.");
        return;
    }
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(cardRef.current, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: null,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `SIM_Info_Card_${applicationId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to download card:", error);
        alert("কার্ড ডাউনলোড করতে ব্যর্থ হয়েছে।");
    } finally {
        setIsDownloading(false);
    }
  };

  const qrData = `ApplicationID: ${applicationId}, Name: ${formData.customerName}, NID: ${formData.nidNumber}`;
  
  const InfoField = ({ label, value, isMono = false, className = '' }: { label: string, value: string | undefined, isMono?: boolean, className?: string }) => (
    <div className={className}>
        <p className="text-blue-900/70 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <p className={`font-semibold text-gray-900 text-sm md:text-base leading-tight ${isMono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
    </div>
  );
  
  const backgroundSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 400">
        <defs>
            <pattern id="p" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="scale(1) rotate(45)">
                <path d="M50 0 L50 100 M0 50 L100 50" stroke="rgba(200, 220, 255, 0.3)" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="1.5" fill="rgba(200, 220, 255, 0.5)"/>
            </pattern>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
                <stop offset="100%" stop-color="#eef4ff" stop-opacity="1"/>
            </radialGradient>
        </defs>
        <rect width="800" height="400" fill="url(#grad)" />
        <rect width="800" height="400" fill="url(#p)" />
    </svg>`;


  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-6 rounded-lg shadow-lg text-center mb-8 max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-2">অভিনন্দন! আপনার আবেদন সফলভাবে জমা হয়েছে।</h2>
            <p>আপনার আবেদন নম্বর: <strong className="font-mono bg-green-200 px-2 py-1 rounded">{applicationId}</strong>। অনুগ্রহ করে ভবিষ্যতের রেফারেন্সের জন্য এই নম্বরটি সংরক্ষণ করুন।</p>
            <p className="mt-2">আপনি নীচের তথ্য কার্ডটি ডাউনলোড করে রাখতে পারেন।</p>
        </div>

        <div 
          ref={cardRef} 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-xl border border-gray-200 overflow-hidden relative font-sans"
        >
          <div 
            className="absolute inset-0 opacity-80"
            style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(backgroundSvg)}")` }}
          ></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-100 opacity-20 text-8xl pointer-events-none">
            <i className="fas fa-shield-halved"></i>
          </div>
          
          <div className="relative p-5 sm:p-6">
            <header className="flex justify-between items-center pb-3 border-b-2 border-amber-500/50">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-blue-900">বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন</h3>
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-wide">BANGLADESH TELECOMMUNICATION REGULATORY COMMISSION</p>
              </div>
              <div className="text-blue-900">
                <i className="fas fa-tower-broadcast text-3xl sm:text-4xl opacity-70"></i>
              </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4">
              <div className="md:col-span-1 flex flex-col items-center">
                {photoUrl && (
                  <img 
                    src={photoUrl} 
                    alt="Customer" 
                    className="w-full h-auto object-cover rounded-md border-2 border-gray-300 shadow-md bg-gray-200 mb-3" 
                    style={{ aspectRatio: '3/4' }} 
                  />
                )}
                <div className="w-14 h-10 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md shadow-inner-md border border-amber-600/50 flex items-center justify-center mx-auto">
                    <div className="w-12 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm grid grid-cols-2 gap-px p-px">
                        <span className="bg-amber-200/50 block"></span><span className="bg-amber-200/50 block"></span>
                        <span className="bg-amber-200/50 block"></span><span className="bg-amber-200/50 block"></span>
                    </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2.5 mt-4 md:mt-0">
                <div>
                  <p className="text-blue-800/70 text-[10px] font-bold uppercase tracking-wider">নাম / Name</p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{formData.customerName}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <InfoField label="পিতার নাম" value={formData.fatherName} />
                  <InfoField label="মাতার নাম" value={formData.motherName} />
                  <InfoField label="জন্ম তারিখ" value={formData.dateOfBirth} />
                  <InfoField label="মোবাইল নম্বর" value={formData.mobileNumber} />
                </div>
                <InfoField label="ঠিকানা" value={`${formData.village}, ${formData.postOffice}, ${formData.upazila}, ${formData.district}`} />
                <InfoField label="জাতীয় পরিচয়পত্র নম্বর / NID" value={formData.nidNumber} isMono={true}/>
              </div>
            </main>
            
            <footer className="mt-4 pt-3 border-t-2 border-amber-500/50 flex flex-wrap items-end justify-center sm:justify-between gap-4">
                <div 
                    ref={hologramRef} 
                    className="w-16 h-16 rounded-full flex items-center justify-center relative transition-transform duration-100"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute inset-0 rounded-full opacity-50" style={{background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)'}}></div>
                    <i className="fas fa-shield-halved text-4xl text-white/80" style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}></i>
                </div>
                <div className="flex items-center gap-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}&bgcolor=FFFFFF&color=1E3A8A&qzone=1`} 
                      alt="QR Code" 
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1 rounded-sm border"
                    />
                    <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-gray-500">Application ID</p>
                        <p className="font-mono text-base sm:text-lg tracking-wider text-blue-900">{applicationId}</p>
                         <div className="font-bold text-center text-green-600 flex items-center justify-end gap-1">
                            <i className="fas fa-check-circle text-xs"></i>
                            <p className="text-[10px]">VERIFIED</p>
                        </div>
                    </div>
                </div>
            </footer>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
             <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-gradient-to-r from-green-600 to-teal-500 text-white py-3 px-8 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 hover:from-green-500 hover:to-teal-400 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60 disabled:cursor-wait">
                {isDownloading ? <><i className="fas fa-spinner fa-spin mr-2"></i>ডাউনলোড হচ্ছে...</> : <><i className="fas fa-download mr-2"></i>কার্ড ডাউনলোড করুন</>}
            </button>
            <button
                onClick={onReset}
                className="bg-gray-700 text-white py-3 px-8 text-lg font-bold rounded-lg shadow-lg transition-all duration-300 hover:bg-gray-600 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-300">
                <i className="fas fa-plus-circle mr-2"></i>নতুন নিবন্ধন করুন
            </button>
        </div>
    </div>
  );
};

export default SimInfoCard;
