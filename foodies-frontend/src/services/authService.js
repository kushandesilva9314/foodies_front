const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Register new user — Step 1
 */
export const registerUser = async ({ name, email, password, mobile }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, mobile }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Verify OTP — Step 2
 */
export const verifyOTP = async ({ email, otp }) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async ({ email }) => {
  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async ({ email, password, rememberMe }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Forgot password — Send OTP
 */
export const forgotPassword = async ({ email }) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset code');
    }

    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Verify reset OTP
 */
export const verifyResetOTP = async ({ email, otp }) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async ({ email, resetToken, newPassword }) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetToken, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Resend reset OTP
 */
export const resendResetOTP = async ({ email }) => {
  try {
    const response = await fetch(`${API_URL}/auth/resend-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend reset code');
    }

    return data;
  } catch (error) {
    console.error('Resend reset OTP error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async () => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
  });

  const data = await response.json();

  if (!response.ok) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    throw new Error(data.message || 'Session expired');
  }

  // Only store accessToken — no more refreshToken in localStorage
  localStorage.setItem("token", data.data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.data.user));

  return data;
};

export const logoutUser = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("sessionActive");
  }
};

/**
 * Update profile (name, mobile, profile photo)
 * If the mobile number changes, the backend resets is_mobile_verified to false.
 */
export const updateProfile = async ({ name, mobile, profilePhoto, removePhoto }) => {
  try {
    const { authPutFormData } = await import('./apiService');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);

    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }
    if (removePhoto) {
      formData.append('removePhoto', 'true');
    }

    const data = await authPutFormData('/auth/profile', formData);

    // Keep localStorage in sync so navbar / other components reflect the change
    if (data?.data?.user) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Sign out from ALL devices (deletes every refresh token for this user,
 * including the current device's). Clears local session afterwards.
 */
export const logoutAllDevices = async () => {
  try {
    const { authPost } = await import('./apiService');
    await authPost('/auth/logout-all', {});
  } catch (error) {
    console.error('Logout all devices error:', error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("sessionActive");
  }
};

/**
 * Change password for the logged-in user (requires current password)
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const { authPut } = await import('./apiService');
    const data = await authPut('/auth/change-password', { currentPassword, newPassword });
    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Tell the backend the Firebase phone verification succeeded
 * and mark is_mobile_verified = true in the DB
 */
export const verifyMobileOtp = async (firebaseToken) => {
  try {
    const { authPost } = await import('./apiService');
    const data = await authPost('/auth/verify-mobile-otp', { firebaseToken });

    // Keep localStorage in sync
    if (data?.data?.user) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data.data.user }));
    }

    return data;
  } catch (error) {
    console.error('Verify mobile OTP error:', error);
    throw error;
  }
};

export const updatePreferences = async ({ mobile_notifications, email_notifications, browser_notifications }) => {
  try {
    const { authPut } = await import('./apiService');
    const data = await authPut('/auth/preferences', {
      mobile_notifications,
      email_notifications,
      browser_notifications,
    });

    if (data?.data?.user) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data.data.user }));
    }
    return data;
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

export const deleteAccount = async (recaptchaToken) => {
  try {
    const { authDelete } = await import('./apiService');
    return await authDelete('/auth/account', { recaptchaToken });
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};