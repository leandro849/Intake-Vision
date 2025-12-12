export enum ValidationStatus {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export interface ValidationResult {
  status: ValidationStatus;
  matchConfidence: string;
  patientName: string;
  insuranceProvider: string;
  referralDetails: string;
  reasoningPoints: string[];
  actionItems: string[];
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}