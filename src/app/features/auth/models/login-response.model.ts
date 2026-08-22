export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
  };
  errors: unknown;
}