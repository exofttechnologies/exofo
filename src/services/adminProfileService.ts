import { AdminProfile } from '../types';
import { getApiUrl } from '../config/api';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const adminProfileService = {
  /**
   * Get logged-in admin profile from MongoDB API with localStorage fallback
   */
  async getProfile(): Promise<AdminProfile> {
    try {
      const res = await fetch(getApiUrl('/api/profile'));
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Network or API unavailable, fall back to logged-in user details
    }

    const name = localStorage.getItem('exofo_user_name') || 'Admin';
    const email = localStorage.getItem('exofo_user_email') || 'admin@exofo.internal';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';

    return {
      id: 'admin-1',
      name,
      email,
      phone: '+1 (555) 019-2834',
      designation: 'Company Administrator',
      company: 'Exofo Technologies',
      avatar: '',
      initials,
      accountCreatedAt: 'January 2026',
      unreadNotifications: 2,
    };
  },

  /**
   * Update admin profile information in MongoDB
   */
  async updateProfile(updates: Partial<AdminProfile>): Promise<AdminProfile> {
    if (updates.email && !updates.email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const res = await fetch(getApiUrl('/api/profile'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update profile');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Change admin password via MongoDB API
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword, confirmNewPassword } = payload;

    if (!currentPassword) {
      throw new Error('Current password is required.');
    }
    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters long.');
    }
    if (newPassword !== confirmNewPassword) {
      throw new Error('New password and confirmation do not match.');
    }

    const res = await fetch(getApiUrl('/api/profile/change-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Password update failed.');
    }

    return { success: true, message: json.message || 'Password updated successfully.' };
  },
};
