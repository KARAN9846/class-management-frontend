export interface FeeReceipt {
  id: number;
  paymentId: number;
  receiptNumber: string;
  issuedAt: string;

  // Institution
  institutionName: string;
  institutionTagline: string | null;
  institutionAddress: string | null;
  institutionPhone: string | null;
  institutionEmail: string | null;
  institutionWebsite: string | null;

  // Receipt branding
  receiptTitle: string;
  logoPath: string | null;
  signaturePath: string | null;
  signatureName: string | null;
  signatureDesignation: string | null;
  stampPath: string | null;
  badgePath: string | null;
  footerText: string | null;

  // Visibility
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;

  // Colors
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;

  // Student
  studentName: string;
  studentRollNumber: string | null;

  academicYear: string;
  className: string;
  sectionName: string;

  // Fee
  originalFee: number;
  studentDiscount: number;
  payableAmount: number;

  previousPaidAmount: number;
  paymentAmount: number;
  paymentDiscount: number;
  totalPaidAmount: number;
  remainingAmount: number;

  // Payment
paymentMethod: string;
paymentType: string;
notes: string | null;
status: string;

createdAt: string;
}