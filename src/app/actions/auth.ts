'use server';

import { cookies } from 'next/headers';

const API_URL = 'http://localhost:5000';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Registration failed' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function verifyEmail(data: { email: string; otp: string }) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Verification failed' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function resendOTP(data: { email: string }) {
  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to resend OTP' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Login failed' };
    }

    // Store token in cookies if provided
    if (result.data?.access_token) {
      cookies().set('auth-token', result.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function forgotPassword(data: { email: string }) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to send reset OTP' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function resetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Password reset failed' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function demoLogin() {
  try {
    const response = await fetch(`${API_URL}/auth/demo-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Demo login failed' };
    }

    // Store token if provided
    if (result.data?.access_token) {
      cookies().set('auth-token', result.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function getCurrentUser() {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to get user' };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function logout() {
  cookies().delete('auth-token');
  return { success: true };
}
