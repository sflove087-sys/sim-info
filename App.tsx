
import React, { useState, useCallback } from 'react';
import type { FormData } from './types';
import { DISTRICTS } from './constants';
import { extractNidInfo, detectAndCropNid } from './services/geminiService';
import StatusIndicator from './components/StatusIndicator';
import FormSection from './components/FormSection';
import FormInput from './components/FormInput';
import SelectInput from './components/SelectInput';
import UploadArea from './components/UploadArea';
import PreviewBox from './components/PreviewBox';
import SimInfoCard from './components/SimInfoCard';
import ImageCropper from './components/ImageCropper';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    customerName: '', fatherName: '', motherName: '', dateOfBirth: '',
    nidNumber: '', village: '', postOffice: '', upazila: '', district: '',
    mobileNumber: '', additionalInfo: '',
  });

  const [frontNid, setFrontNid] = useState<File | null>(null);
  const [backNid, setBackNid] = useState<File | null>(null);
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingTarget, setCroppingTarget] = useState<'frontNid' | 'backNid' | 'customerPhoto' | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setValidationErrors(prev => ({ ...prev, [id]: false }));
  }, []);

  const handleAutoFill = async () => {
    if (!frontNid || !backNid) {
      alert('অটোফিল করতে NID এর উভয় দিকের ছবি আপলোড করুন।');
      return;
    }
    setIsProcessing(true);
    try {
      const extractedData = await extractNidInfo(frontNid, backNid);
      if (extractedData) {
        const { name, fatherName, motherName, dateOfBirth, nidNumber, address } = extractedData;
        const addressParts = address.split(/,|।/).map(part => part.trim());
        setFormData(prev => ({
          ...prev,
          customerName: name || '', fatherName: fatherName || '', motherName: motherName || '',
          dateOfBirth: dateOfBirth || '', nidNumber: nidNumber || '',
          village: addressParts[0] || '', postOffice: addressParts[1] || '',
          upazila: addressParts[2] || '',
        }));
        alert('তথ্য সফলভাবে পূরণ করা হয়েছে! অনুগ্রহ করে যাচাই করুন।');
      } else {
        throw new Error("Could not extract info.");
      }
    } catch (e) {
      console.error(e);
      alert("স্বয়ংক্রিয়ভাবে তথ্য সংগ্রহ করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি পূরণ করুন।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const errors: Record<string, boolean> = {};
    const requiredFields: (keyof FormData)[] = [
      'customerName', 'fatherName', 'motherName', 'dateOfBirth',
      'nidNumber', 'village', 'postOffice', 'upazila', 'district', 'mobileNumber'
    ];
    requiredFields.forEach(field => !formData[field].trim() && (errors[field] = true));
    if (!frontNid) errors.frontNid = true;
    if (!backNid) errors.backNid = true;
    if (!customerPhoto) errors.customerPhoto = true;
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }
    setApplicationId('SIM-' + Math.floor(100000 + Math.random() * 900000));
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setFormData({ customerName: '', fatherName: '', motherName: '', dateOfBirth: '', nidNumber: '', village: '', postOffice: '', upazila: '', district: '', mobileNumber: '', additionalInfo: '' });
    setFrontNid(null);
    setBackNid(null);
    setCustomerPhoto(null);
    setValidationErrors({});
    setIsSubmitted(false);
    setApplicationId('');
    setImageToCrop(null);
    setCroppingTarget(null);
  };

  const showManualCropper = (file: File, target: 'frontNid' | 'backNid' | 'customerPhoto') => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string);
      setCroppingTarget(target);
    });
    reader.readAsDataURL(file);
  };

  const handleFileSelect = async (file: File | null, target: 'frontNid' | 'backNid' | 'customerPhoto') => {
    if (!file) return;
    const setters = { frontNid: setFrontNid, backNid: setBackNid, customerPhoto: setCustomerPhoto };
    setters[target](null);
    if (target === 'customerPhoto') {
      showManualCropper(file, target);
      return;
    }
    setIsProcessing(true);
    try {
      const croppedFile = await detectAndCropNid(file);
      if (croppedFile) {
        handleCropComplete(croppedFile, target);
      } else {
        alert('স্বয়ংক্রিয়ভাবে কার্ড সনাক্ত করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি ক্রপ করুন।');
        showManualCropper(file, target);
      }
    } catch (error) {
      console.error("Auto-cropping failed:", error);
      alert("কার্ড ক্রপ করার সময় একটি ত্রুটি ঘটেছে।");
      showManualCropper(file, target);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropComplete = (croppedFile: File, targetOverride?: 'frontNid' | 'backNid' | 'customerPhoto') => {
    const finalTarget = targetOverride || croppingTarget;
    if (!finalTarget) return;
    const setters = { frontNid: setFrontNid, backNid: setBackNid, customerPhoto: setCustomerPhoto };
    setters[finalTarget](croppedFile);
    setImageToCrop(null);
    setCroppingTarget(null);
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
    setCroppingTarget(null);
  };

  const currentStep = isSubmitted ? 3 : (frontNid && backNid && customerPhoto) ? 2 : 1;

  return (
    <div className="font-sans min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12">
        <aside className="hidden lg:block lg:col-span-4">
          <Sidebar />
        </aside>

        <main className="lg:col-span-8">
          <header className="text-center mb-10 p-6 bg-primary text-white rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute -top-4 -left-8 text-white/10 text-8xl transform rotate-12">
              <i className="fas fa-sim-card"></i>
            </div>
            <div className="absolute -bottom-8 -right-4 text-white/10 text-9xl transform -rotate-12">
               <i className="fas fa-id-card"></i>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-wide">ডিজিটাল সিম নিবন্ধন</h1>
              <p className="text-base md:text-lg opacity-90 mt-2 font-sans">আপনার জাতীয় পরিচয়পত্র ব্যবহার করে সহজেই নিবন্ধন সম্পন্ন করুন</p>
            </div>
          </header>

          {imageToCrop && croppingTarget && (
            <ImageCropper src={imageToCrop} onCropComplete={handleCropComplete} onCancel={handleCropCancel} aspect={croppingTarget === 'customerPhoto' ? 3 / 4 : 85.6 / 54} cropShape={croppingTarget === 'customerPhoto' ? 'round' : 'rect'} title={croppingTarget === 'customerPhoto' ? 'ছবি ক্রপ করুন' : 'NID কার্ড ক্রপ করুন'} />
          )}

          {isSubmitted ? (
            <SimInfoCard formData={formData} customerPhoto={customerPhoto} applicationId={applicationId} onReset={handleReset} />
          ) : (
            <>
              <StatusIndicator currentStep={currentStep} />
              <div className="bg-yellow-50 p-5 rounded-2xl mb-8 border-l-4 border-secondary text-yellow-900 shadow-md">
                <p className="flex items-start gap-4">
                  <i className="fas fa-info-circle text-secondary mt-1 text-xl"></i>
                  <span className="font-sans">NID কার্ডের ছবি আপলোড করে "অটোফিল করুন" বাটনে চাপ দিন, অথবা ম্যানুয়ালি ফরমটি পূরণ করুন।</span>
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormSection title="ব্যক্তিগত তথ্য" iconClass="fa-user-circle">
                    <FormInput id="customerName" label="পূর্ণ নাম" value={formData.customerName} onChange={handleInputChange} required isError={validationErrors.customerName} />
                    <FormInput id="fatherName" label="পিতার নাম" value={formData.fatherName} onChange={handleInputChange} required isError={validationErrors.fatherName} />
                    <FormInput id="motherName" label="মাতার নাম" value={formData.motherName} onChange={handleInputChange} required isError={validationErrors.motherName} />
                    <FormInput id="dateOfBirth" label="জন্ম তারিখ" value={formData.dateOfBirth} onChange={handleInputChange} type="date" required isError={validationErrors.dateOfBirth} />
                    <FormInput id="nidNumber" label="জাতীয় পরিচয়পত্র নম্বর" value={formData.nidNumber} onChange={handleInputChange} required isError={validationErrors.nidNumber} />
                  </FormSection>
                  <FormSection title="ঠিকানা ও যোগাযোগ" iconClass="fa-map-location-dot">
                    <FormInput id="village" label="গ্রাম/মহল্লা" value={formData.village} onChange={handleInputChange} required isError={validationErrors.village} />
                    <FormInput id="postOffice" label="ডাকঘর" value={formData.postOffice} onChange={handleInputChange} required isError={validationErrors.postOffice} />
                    <FormInput id="upazila" label="উপজেলা/থানা" value={formData.upazila} onChange={handleInputChange} required isError={validationErrors.upazila} />
                    <SelectInput id="district" label="জেলা" value={formData.district} onChange={handleInputChange} options={DISTRICTS} required isError={validationErrors.district} />
                    <FormInput id="mobileNumber" label="মোবাইল নম্বর" value={formData.mobileNumber} onChange={handleInputChange} type="tel" placeholder="01XXXXXXXXX" required isError={validationErrors.mobileNumber} />
                  </FormSection>
                </div>

                <FormSection title="ডকুমেন্ট ও ছবি আপলোড" iconClass="fa-cloud-upload">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <UploadArea id="frontNid" title="NID (ফ্রন্ট)" onFileSelect={(file) => handleFileSelect(file, 'frontNid')} isError={validationErrors.frontNid} showCardOutline />
                    <UploadArea id="backNid" title="NID (ব্যাক)" onFileSelect={(file) => handleFileSelect(file, 'backNid')} isError={validationErrors.backNid} showCardOutline />
                    <UploadArea id="customerPhoto" title="গ্রাহকের ছবি" onFileSelect={(file) => handleFileSelect(file, 'customerPhoto')} isError={validationErrors.customerPhoto} isPhoto />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {frontNid && <PreviewBox file={frontNid} title="ফ্রন্ট সাইড প্রিভিউ" />}
                    {backNid && <PreviewBox file={backNid} title="ব্যাক সাইড প্রিভিউ" />}
                    {customerPhoto && <PreviewBox file={customerPhoto} title="ছবি প্রিভিউ" />}
                  </div>
                   <div className="bg-teal-50 p-6 rounded-2xl mt-6 border-l-4 border-teal-500 text-center">
                    <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-3"><i className="fas fa-robot"></i> স্বয়ংক্রিয় তথ্য পূরণ</h3>
                    <p className="text-teal-800 mt-2 mb-4 font-sans">NID আপলোডের পর এই বাটনে ক্লিক করুন।</p>
                    <button onClick={handleAutoFill} disabled={isProcessing || !frontNid || !backNid} className="w-full sm:w-auto bg-primary text-white py-3 px-8 rounded-full font-bold font-sans flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md">
                      {isProcessing ? <><i className="fas fa-spinner fa-spin"></i> প্রসেসিং...</> : <><i className="fas fa-magic-wand-sparkles"></i> অটোফিল করুন</>}
                    </button>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="additionalInfo" className="block mb-2 font-bold text-gray-700 text-lg">অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
                    <textarea id="additionalInfo" rows={4} value={formData.additionalInfo} onChange={handleInputChange} placeholder="অন্যান্য মন্তব্য..." className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition bg-gray-50 font-sans"></textarea>
                  </div>
                </FormSection>
              </div>

              <div className="text-center mt-12">
                <button onClick={handleSubmit} className="bg-secondary text-primary py-4 px-12 text-xl font-bold font-display tracking-wider rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-yellow-300">
                  <i className="fas fa-paper-plane mr-3"></i> আবেদন জমা দিন
                </button>
              </div>
            </>
          )}

          <footer className="text-center mt-16 pt-8 border-t-2 border-gray-200 text-gray-500 font-sans">
            <p className="font-semibold">© ২০২৪ - ডিজিটাল সিম নিবন্ধন সেবা</p>
            <p className="mt-2 text-sm">বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি) কর্তৃক অনুমোদিত</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
