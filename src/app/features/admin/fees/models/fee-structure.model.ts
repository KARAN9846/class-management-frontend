export interface FeeStructure {
  id: number;
  academicYearId: number;
  academicYearName: string;
  classId: number;
  className: string;
  feeAmount: number;
  isActive: boolean;
}

export interface CreateFeeStructureRequest {
  academicYearId: number;
  classId: number;
  feeAmount: number;
}

export interface UpdateFeeStructureRequest {
  feeAmount: number;
}

export interface UpdateFeeStructureStatusRequest {
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}