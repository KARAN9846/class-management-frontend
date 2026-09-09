export interface FeePayment {
  id: number;
  studentFeeId: number;

  // Actual amount collected from the student
  amount: number;

  // Payment-level discount
  discountType: string;
  discountValue: number;
  discountAmount: number;

  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  notes: string | null;

  // Payment totals at the time of this payment
  previousPaidAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;

  // Revision information
  status: string;
  revisedFromPaymentId: number | null;
  revisionReason: string | null;
}