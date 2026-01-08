
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

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    nidNumber: '',
    village: '',
    postOffice: '',
    upazila: '',
    district: '',
    mobileNumber: '',
    additionalInfo: '',
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
    if (validationErrors[id]) {
        setValidationErrors(prev => ({ ...prev, [id]: false }));
    }
  }, [validationErrors]);

  const handleAutoFill = async () => {
    if (!frontNid || !backNid) {
      alert('অটোফিল সুবিধা ব্যবহার করতে NID এর ফ্রন্ট ও ব্যাক সাইড স্ক্যান আপলোড করুন।');
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
          customerName: name || '',
          fatherName: fatherName || '',
          motherName: motherName || '',
          dateOfBirth: dateOfBirth || '',
          nidNumber: nidNumber || '',
          village: addressParts[0] || '',
          postOffice: addressParts[1] || '',
          upazila: addressParts[2] || '',
        }));

        alert('স্ক্যান থেকে তথ্য সফলভাবে পড়া হয়েছে এবং ফরম পূরণ করা হয়েছে!\n\nদয়া করে সব তথ্য যাচাই করুন এবং প্রয়োজনে সংশোধন করুন।');
      } else {
        throw new Error("Could not extract information from the images.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to auto-fill form. Please fill the form manually.");
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

    requiredFields.forEach(field => {
        if (!formData[field].trim()) {
            errors[field] = true;
        }
    });

    if (!frontNid) errors.frontNid = true;
    if (!backNid) errors.backNid = true;
    if (!customerPhoto) errors.customerPhoto = true;

    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
        alert('দুঃখিত, অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন এবং ফাইল আপলোড করুন।');
        return;
    }
    
    const newApplicationId = 'SIM-' + Math.floor(100000 + Math.random() * 900000);
    setApplicationId(newApplicationId);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      customerName: '', fatherName: '', motherName: '', dateOfBirth: '',
      nidNumber: '', village: '', postOffice: '', upazila: '', district: '',
      mobileNumber: '', additionalInfo: '',
    });
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

    // Clear previous file state
    const tempStateClearers: Record<typeof target, (p: null) => void> = {
      frontNid: setFrontNid,
      backNid: setBackNid,
      customerPhoto: setCustomerPhoto,
    };
    tempStateClearers[target](null);

    // For customer photo, go directly to manual crop
    if (target === 'customerPhoto') {
      showManualCropper(file, target);
      return;
    }
    
    // For NID, try to auto-crop first
    setIsProcessing(true);
    try {
        const croppedFile = await detectAndCropNid(file);
        if (croppedFile) {
            handleCropComplete(croppedFile, target);
        } else {
            // Fallback to manual crop if auto-crop fails
            alert('স্বয়ংক্রিয়ভাবে কার্ড সনাক্ত করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি ক্রপ করুন।');
            showManualCropper(file, target);
        }
    } catch (error) {
        console.error("Auto-cropping failed:", error);
        alert("কার্ড ক্রপ করার সময় একটি ত্রুটি ঘটেছে।");
        showManualCropper(file, target); // Fallback on error
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCropComplete = (croppedFile: File, targetOverride?: 'frontNid' | 'backNid' | 'customerPhoto') => {
    const finalTarget = targetOverride || croppingTarget;
    switch(finalTarget) {
      case 'frontNid': setFrontNid(croppedFile); break;
      case 'backNid': setBackNid(croppedFile); break;
      case 'customerPhoto': setCustomerPhoto(croppedFile); break;
    }
    setImageToCrop(null);
    setCroppingTarget(null);
  };
  
  const handleCropCancel = () => {
    setImageToCrop(null);
    setCroppingTarget(null);
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 p-6 bg-gradient-to-r from-blue-900 to-blue-600 text-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-blue-500 text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl">
              <i className="fas fa-sim-card"></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-shadow-sm">সিম নিবন্ধন ফরম</h1>
              <p className="text-base md:text-lg opacity-95 max-w-2xl mx-auto mt-2">জাতীয় পরিচয়পত্র (NID) এর ফ্রন্ট ও ব্যাক সাইড স্ক্যান সহ গ্রাহক তথ্য সংগ্রহ</p>
            </div>
          </div>
        </header>

        {imageToCrop && croppingTarget && (
          <ImageCropper 
            src={imageToCrop}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspect={croppingTarget === 'customerPhoto' ? 3 / 4 : 85.6 / 54}
            cropShape={croppingTarget === 'customerPhoto' ? 'round' : 'rect'}
            title={croppingTarget === 'customerPhoto' ? 'ছবি ক্রপ করুন' : 'NID কার্ড ক্রপ করুন'}
          />
        )}

        {isSubmitted ? (
            <SimInfoCard
                formData={formData}
                customerPhoto={customerPhoto}
                applicationId={applicationId}
                onReset={handleReset}
            />
        ) : (
            <>
                <StatusIndicator />
                
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-5 rounded-xl mb-8 border-l-4 border-blue-600 text-base sm:text-lg">
                    <p className="flex items-start gap-4">
                        <i className="fas fa-info-circle text-blue-600 mt-1 text-xl"></i>
                        <span>অনুগ্রহ করে NID কার্ডের স্পষ্ট ফ্রন্ট ও ব্যাক সাইড স্ক্যান আপলোড করুন। "অটোফিল করুন" বাটনে ক্লিক করে স্ক্যান থেকে তথ্য স্বয়ংক্রিয়ভাবে পূরণ করুন অথবা ম্যানুয়ালি ফরমটি পূরণ করুন।</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">
                  <FormSection title="গ্রাহকের ব্যক্তিগত তথ্য" iconClass="fa-user-circle">
                    <FormInput id="customerName" label="গ্রাহকের পূর্ণ নাম" value={formData.customerName} onChange={handleInputChange} placeholder="আপনার পূর্ণ নাম বাংলায় লিখুন" required isError={validationErrors.customerName} />
                    <FormInput id="fatherName" label="পিতার নাম" value={formData.fatherName} onChange={handleInputChange} placeholder="পিতার পূর্ণ নাম বাংলায় লিখুন" required isError={validationErrors.fatherName} />
                    <FormInput id="motherName" label="মাতার নাম" value={formData.motherName} onChange={handleInputChange} placeholder="মাতার পূর্ণ নাম বাংলায় লিখুন" required isError={validationErrors.motherName} />
                    <FormInput id="dateOfBirth" label="জন্ম তারিখ" value={formData.dateOfBirth} onChange={handleInputChange} type="date" required isError={validationErrors.dateOfBirth} />
                    <FormInput id="nidNumber" label="জাতীয় পরিচয়পত্র নম্বর" value={formData.nidNumber} onChange={handleInputChange} placeholder="১০ বা ১৭ ডিজিটের NID নম্বর লিখুন" required isError={validationErrors.nidNumber} />
                  </FormSection>

                  <FormSection title="গ্রাহকের ঠিকানা তথ্য" iconClass="fa-home">
                    <FormInput id="village" label="গ্রাম/মহল্লা" value={formData.village} onChange={handleInputChange} placeholder="গ্রাম/মহল্লার নাম লিখুন" required isError={validationErrors.village} />
                    <FormInput id="postOffice" label="ডাকঘর" value={formData.postOffice} onChange={handleInputChange} placeholder="ডাকঘরের নাম লিখুন" required isError={validationErrors.postOffice} />
                    <FormInput id="upazila" label="উপজেলা/থানা" value={formData.upazila} onChange={handleInputChange} placeholder="উপজেলা/থানার নাম লিখুন" required isError={validationErrors.upazila} />
                    <SelectInput id="district" label="জেলা" value={formData.district} onChange={handleInputChange} options={DISTRICTS} required isError={validationErrors.district} />
                    <FormInput id="mobileNumber" label="মোবাইল নম্বর" value={formData.mobileNumber} onChange={handleInputChange} type="tel" placeholder="01XXXXXXXXX ফরম্যাটে লিখুন" required isError={validationErrors.mobileNumber} />
                  </FormSection>

                  <FormSection title="NID স্ক্যান আপলোড (ফ্রন্ট ও ব্যাক সাইড)" iconClass="fa-id-card">
                      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md mb-6">
                          <p><i className="fas fa-exclamation-circle mr-2"></i>NID কার্ডের স্পষ্ট স্ক্যান আপলোড করুন। সিস্টেম স্বয়ংক্রিয়ভাবে কার্ডটি ক্রপ করার চেষ্টা করবে।</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <UploadArea id="frontNid" title="ফ্রন্ট সাইড" description="NID এর সামনের দিক" onFileSelect={(file) => handleFileSelect(file, 'frontNid')} isError={validationErrors.frontNid} showCardOutline />
                          <UploadArea id="backNid" title="ব্যাক সাইড" description="NID এর পিছনের দিক" onFileSelect={(file) => handleFileSelect(file, 'backNid')} isError={validationErrors.backNid} showCardOutline />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          {frontNid && <PreviewBox file={frontNid} title="ফ্রন্ট সাইড প্রিভিউ" />}
                          {backNid && <PreviewBox file={backNid} title="ব্যাক সাইড প্রিভিউ" />}
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg mt-6 border-l-4 border-green-500">
                          <h3 className="text-xl font-bold text-green-800 flex items-center gap-3"><i className="fas fa-robot"></i> স্ক্যান থেকে অটোফিল সুবিধা</h3>
                          <p className="text-green-700 mt-2">NID স্ক্যান আপলোড করার পর এই বাটনে ক্লিক করে স্বয়ংক্রিয়ভাবে ফরমটি পূরণ করুন।</p>
                          <button onClick={handleAutoFill} disabled={isProcessing} className="w-full mt-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:from-blue-700 hover:to-blue-500 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                              {isProcessing ? <><i className="fas fa-spinner fa-spin"></i> প্রসেসিং...</> : <><i className="fas fa-magic"></i> স্ক্যান থেকে অটোফিল করুন</>}
                          </button>
                      </div>
                  </FormSection>

                  <FormSection title="গ্রাহকের ছবি আপলোড" iconClass="fa-camera">
                      <UploadArea 
                        id="customerPhoto" 
                        title="গ্রাহকের পাসপোর্ট সাইজ ছবি" 
                        description="সাম্প্রতিক তোলা রঙ্গিন ছবি" 
                        maxSizeMB={2} 
                        acceptedFormats="image/jpeg, image/png" 
                        onFileSelect={(file) => handleFileSelect(file, 'customerPhoto')}
                        isPhoto 
                        isError={validationErrors.customerPhoto}
                      />
                      <div className="mt-6">
                          {customerPhoto && <PreviewBox file={customerPhoto} title="ছবি প্রিভিউ" />}
                      </div>
                      <div className="mt-8">
                          <label htmlFor="additionalInfo" className="block mb-2 font-bold text-gray-700 text-lg">অতিরিক্ত তথ্য (যদি থাকে)</label>
                          <textarea id="additionalInfo" rows={4} value={formData.additionalInfo} onChange={handleInputChange} placeholder="যেকোনো অতিরিক্ত তথ্য বা মন্তব্য..." className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"></textarea>
                      </div>
                  </FormSection>
                </div>

                <button onClick={handleSubmit} className="w-full sm:w-auto block mx-auto bg-gradient-to-r from-blue-900 to-blue-600 text-white py-3 px-10 text-lg sm:py-4 sm:px-12 sm:text-xl font-bold rounded-lg shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-500 transform hover:-translate-y-1.5 focus:outline-none focus:ring-4 focus:ring-blue-300">
                    <i className="fas fa-paper-plane mr-3"></i> সব তথ্য জমা দিন
                </button>
            </>
        )}

        <footer className="text-center mt-12 pt-6 border-t-2 border-gray-300 text-gray-600">
            <p>© 2024 - বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি)</p>
            <p className="mt-2 text-sm">সকল তথ্য গোপন রাখা হবে এবং শুধুমাত্র সিম নিবন্ধনের কাজে ব্যবহার করা হবে</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
