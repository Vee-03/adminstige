import { apiCall, API_ENDPOINTS } from "./api";
import type { ApiResponse } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LogoutResponse {
  message: string;
}

/**
 * Admin login - sends credentials and returns auth token
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  return apiCall(API_ENDPOINTS.ADMIN_LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Admin logout - calls backend logout endpoint to invalidate session
 * This is a best-practice call; the frontend also clears localStorage
 */
export async function adminLogout(): Promise<ApiResponse<LogoutResponse>> {
  try {
    return await apiCall(API_ENDPOINTS.ADMIN_LOGOUT, {
      method: "POST",
    });
  } catch (error) {
    // If logout API fails (e.g., network error), we still want to clear the token locally
    // so the user can log back in. Log the error but don't throw.
    console.warn(
      "Logout API call failed (token will still be cleared locally):",
      error
    );
    return {
      status: 200,
      message: "Logged out (local)",
      data: { message: "Logged out locally" },
    };
  }
}
