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

  previousPaidAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;
}