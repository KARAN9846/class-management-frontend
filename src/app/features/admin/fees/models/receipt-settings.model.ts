export interface ReceiptSettings {

  id: number;

  institutionName: string;
  institutionTagline: string | null;
  institutionAddress: string | null;
  institutionPhone: string | null;
  institutionEmail: string | null;
  institutionWebsite: string | null;

  receiptTitle: string;

  logoPath: string | null;

  signaturePath: string | null;
  signatureName: string | null;
  signatureDesignation: string | null;

  stampPath: string | null;
  badgePath: string | null;

  footerText: string | null;

  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;

  primaryColor: string;
  accentColor: string;
  backgroundColor: string;

  createdAt: string;
  updatedAt: string;
}


export interface UpdateReceiptSettingsRequest {

  institutionName: string;
  institutionTagline?: string | null;
  institutionAddress?: string | null;
  institutionPhone?: string | null;
  institutionEmail?: string | null;
  institutionWebsite?: string | null;

  receiptTitle: string;

  footerText?: string | null;

  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;

  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
}