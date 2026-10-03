
export interface BoardMedium {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardMediumRequest {
  name: string;
}

export interface UpdateBoardMediumRequest {
  name: string;
}

export interface BoardMediumPageResponse {
  content: BoardMedium[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}