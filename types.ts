
export interface FormData {
  customerName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  nidNumber: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  mobileNumber: string;
  additionalInfo: string;
}

export interface NidInfo {
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nidNumber: string;
  address: string;
}
