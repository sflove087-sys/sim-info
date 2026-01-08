
import React, { useRef, useState, useEffect } from 'react';
import type { FormData } from '../types';

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
      const rotateX = (y / height - 0.5) * -30;
      const rotateY = (x / width - 0.5) * 30;
      hologram.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = () => {
      hologram.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    };
    hologram.addEventListener('mousemove', handleMouseMove);
    hologram.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      hologram.removeEventListener('mousemove', handleMouseMove);
      hologram.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current || typeof html2canvas === 'undefined') return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 1.0);
      link.download = `SIM_Card_${applicationId}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const qrData = `ID: ${applicationId}\nName: ${formData.customerName}\nNID: ${formData.nidNumber}`;

  const InfoField = ({ label, value, isMono = false }: { label: string; value?: string; isMono?: boolean }) => (
    <div>
      <p className="text-teal-800/80 text-[10px] font-bold uppercase tracking-widest font-sans">{label}</p>
      <p className={`font-semibold text-primary text-base leading-tight ${isMono ? 'font-mono' : 'font-display'}`}>{value || 'N/A'}</p>
    </div>
  );

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="rgba(0, 77, 64, 0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/><rect width="100%" height="100%" fill="linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(230, 245, 241, 0.9))"/></svg>`;
  
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 font-sans">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-6 rounded-2xl shadow-lg text-center mb-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold font-display mb-2">আবেদন সফল হয়েছে!</h2>
        <p className="text-lg">আপনার আবেদন নম্বর: <strong className="font-mono bg-green-200 px-2 py-1 rounded">{applicationId}</strong></p>
      </div>

      <div ref={cardRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border-2 border-gray-100 overflow-hidden relative">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(bgSvg)}")` }}></div>
        <div className="relative p-6 sm:p-8">
          <header className="flex justify-between items-center pb-4 border-b-2 border-secondary/50">
            <div>
              <h3 className="text-lg font-bold text-primary font-display">ডিজিটাল সিম নিবন্ধন কার্ড</h3>
              <p className="text-xs text-gray-500 font-sans tracking-wide">DIGITAL SIM REGISTRATION CARD</p>
            </div>
            <i className="fas fa-tower-broadcast text-4xl text-primary opacity-60"></i>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1 flex flex-col items-center space-y-4">
              {photoUrl && <img src={photoUrl} alt="Customer" className="w-full aspect-[3/4] object-cover rounded-xl border-2 border-gray-200 shadow-md bg-gray-100" />}
              <div className="w-16 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-inner border border-yellow-600/50 flex items-center justify-center">
                <div className="w-14 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded grid grid-cols-2 gap-px p-px"><span className="bg-yellow-200/50"></span><span className="bg-yellow-200/50"></span><span className="bg-yellow-200/50"></span><span className="bg-yellow-200/50"></span></div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <p className="text-teal-800/80 text-xs font-bold uppercase tracking-wider font-sans">নাম / Name</p>
                <h2 className="text-3xl font-bold text-primary font-display leading-tight">{formData.customerName}</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <InfoField label="পিতার নাম" value={formData.fatherName} />
                <InfoField label="মাতার নাম" value={formData.motherName} />
                <InfoField label="জন্ম তারিখ" value={formData.dateOfBirth} />
                <InfoField label="মোবাইল নম্বর" value={formData.mobileNumber} />
              </div>
              <InfoField label="ঠিকানা" value={`${formData.village}, ${formData.postOffice}, ${formData.upazila}, ${formData.district}`} />
              <InfoField label="জাতীয় পরিচয়পত্র নম্বর" value={formData.nidNumber} isMono={true} />
            </div>
          </main>

          <footer className="mt-6 pt-4 border-t-2 border-secondary/50 flex flex-wrap items-center justify-between gap-4">
            <div ref={hologramRef} className="w-20 h-20 flex items-center justify-center relative transition-transform duration-100" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 opacity-40" style={{background: 'linear-gradient(45deg, #00F260, #0575E6, #fc466b, #3f5efb)'}}></div>
                <svg className="w-16 h-16 text-white/80 relative" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}><path d="M12 2C10.14 2 8.5 3.23 8.06 5.03L3.5 12.54L2.5 12.29C2.28 12.23 2.05 12.28 1.88 12.43C1.67 12.61 1.6 12.88 1.66 13.14L2.73 17.03C2.8 17.29 3.03 17.5 3.3 17.5C3.38 17.5 3.47 17.48 3.55 17.44L9.08 14.68L9.2 14.63L12 6.18V2M15.5 10.5C14.84 10.5 14.22 10.73 13.75 11.12L12 14.64L10.74 18.5L14.5 20.36L14.58 20.4C14.84 20.5 15.13 20.43 15.34 20.24C15.53 20.07 15.63 19.82 15.6 19.56L14.5 14.54L18.44 12.43C18.67 12.32 18.86 12.11 18.94 11.86C19.03 11.61 18.99 11.33 18.84 11.12C18.68 10.9 18.43 10.76 18.16 10.74L15.5 10.5Z"></path></svg>
            </div>
            <div className="flex items-center gap-3">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}&bgcolor=FFFFFF&color=004d40&qzone=1`} alt="QR Code" className="w-20 h-20 bg-white p-1 rounded-md border" />
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-gray-500 font-sans">Application ID</p>
                <p className="font-mono text-xl tracking-wider text-primary">{applicationId}</p>
                <div className="font-bold text-green-600 flex items-center justify-end gap-1.5 mt-1">
                  <i className="fas fa-check-circle text-sm"></i>
                  <p className="text-xs font-sans">VERIFIED</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button onClick={handleDownload} disabled={isDownloading} className="bg-primary text-white py-3 px-8 text-lg font-bold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:bg-teal-800 disabled:opacity-60 disabled:cursor-wait">
          {isDownloading ? <><i className="fas fa-spinner fa-spin mr-2"></i>ডাউনলোড হচ্ছে...</> : <><i className="fas fa-download mr-2"></i>কার্ড ডাউনলোড</>}
        </button>
        <button onClick={onReset} className="bg-gray-700 text-white py-3 px-8 text-lg font-bold rounded-full shadow-lg transition-all duration-300 hover:bg-gray-600 transform hover:-translate-y-1 hover:shadow-xl">
          <i className="fas fa-plus-circle mr-2"></i>নতুন আবেদন
        </button>
      </div>
    </div>
  );
};

export default SimInfoCard;
