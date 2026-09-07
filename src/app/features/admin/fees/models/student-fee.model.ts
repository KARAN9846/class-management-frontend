export interface StudentFee {
  id: number;

  studentId: number;
  studentName: string;
  rollNumber: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  feeStructureId: number;

  originalAmount: number;

  discountType: string;
  discountValue: number;
  discountAmount: number;

  payableAmount: number;
  paidAmount: number;
  remainingAmount: number;

  status: 'PAID' | 'REMAINING' | 'UNPAID';
}