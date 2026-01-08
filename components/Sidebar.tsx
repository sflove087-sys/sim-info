
import React from 'react';

interface InfoBlockProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ icon, title, children }) => (
  <div className="mb-8">
    <h3 className="flex items-center text-lg font-bold font-display text-[var(--color-primary)] mb-3">
      <i className={`fas ${icon} w-8 text-center text-xl mr-2 text-[var(--color-secondary)]`}></i>
      <span>{title}</span>
    </h3>
    <div className="text-gray-600 font-sans text-sm space-y-2 pl-10">
      {children}
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="sticky top-8 bg-white p-6 rounded-2xl shadow-lg border-t-4 border-[var(--color-secondary)]">
      <h2 className="text-2xl font-bold font-display text-[var(--color-primary)] mb-6 border-b pb-4">
        সহায়িকা ও নির্দেশনা
      </h2>

      <InfoBlock icon="fa-rocket" title="কিভাবে আবেদন করবেন?">
        <p><strong>ধাপ ১:</strong> NID কার্ডের উভয় পাশের ছবি আপলোড করুন।</p>
        <p><strong>ধাপ ২:</strong> 'অটোফিল করুন' বাটনে ক্লিক করে তথ্য আনুন।</p>
        <p><strong>ধাপ ৩:</strong> সকল তথ্য যাচাই করে প্রয়োজনীয় সংশোধন করুন।</p>
        <p><strong>ধাপ ৪:</strong> 'আবেদন জমা দিন' বাটনে ক্লিক করুন।</p>
      </InfoBlock>

      <InfoBlock icon="fa-lightbulb" title="ভালো ছবির জন্য টিপস">
        <p>• পর্যাপ্ত আলোতে, ঝাপসা মুক্ত ছবি তুলুন।</p>
        <p>• ছবিতে যেন কোনো কিছুর ছায়া না পড়ে।</p>
        <p>• NID কার্ডের চারটি কোণাই যেন ছবিতে স্পষ্ট থাকে।</p>
        <p>• গ্রাহকের ছবিতে মুখমণ্ডল পরিষ্কারভাবে দেখা যেতে হবে।</p>
      </InfoBlock>
      
      <InfoBlock icon="fa-shield-halved" title="তথ্যের গোপনীয়তা">
        <p>আপনার সকল ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত এবং গোপন রাখা হবে। এই তথ্য শুধুমাত্র সিম নিবন্ধনের উদ্দেশ্যেই ব্যবহৃত হবে।</p>
      </InfoBlock>

      <InfoBlock icon="fa-headset" title="সাহায্যের প্রয়োজন?">
         <p>যেকোনো সমস্যায় আমাদের হেল্পলাইনে যোগাযোগ করুন:</p>
         <p className="font-bold text-[var(--color-primary)]">16000 (টোল-ফ্রি)</p>
      </InfoBlock>
    </aside>
  );
};

export default Sidebar;
