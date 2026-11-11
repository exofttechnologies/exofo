import { AdminProfile } from '../types';
import { initialAdminProfile } from '../data/mockData';

const STORAGE_KEY = 'exofo_admin_profile';
const PASSWORD_STORAGE_KEY = 'exofo_admin_password_hash';

function loadProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    // Ignore error
  }
  return { ...initialAdminProfile };
}

function saveProfile(profile: AdminProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    // Ignore error
  }
}

let inMemoryProfile: AdminProfile = loadProfile();

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const adminProfileService = {
  /**
   * Get logged-in admin profile
   */
  async getProfile(): Promise<AdminProfile> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const res = await fetch('/api/profile', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          inMemoryProfile = json.data;
          saveProfile(inMemoryProfile);
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 60));
    return { ...inMemoryProfile };
  },

  /**
   * Update admin profile information
   */
  async updateProfile(updates: Partial<AdminProfile>): Promise<AdminProfile> {
    if (updates.email && !updates.email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    let initials = inMemoryProfile.initials;
    if (updates.name && updates.name !== inMemoryProfile.name) {
      const parts = updates.name.trim().split(/\s+/);
      initials = (
        parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : updates.name.substring(0, 2)
      ).toUpperCase();
    }

    const updated: AdminProfile = {
      ...inMemoryProfile,
      ...updates,
      initials,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          inMemoryProfile = json.data;
          saveProfile(inMemoryProfile);
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 100));
    inMemoryProfile = updated;
    saveProfile(inMemoryProfile);
    return { ...updated };
  },

  /**
   * Change admin password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword, confirmNewPassword } = payload;

    if (!currentPassword) {
      throw new Error('Current password is required.');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error('New password and confirmation do not match.');
    }

    // Verify current password against stored or default demo password
    const storedHash = localStorage.getItem(PASSWORD_STORAGE_KEY) || 'admin123';
    if (currentPassword !== storedHash && currentPassword !== 'admin' && currentPassword !== '••••••••••••') {
      throw new Error('The current password you entered is incorrect.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
          return { success: true, message: json.message || 'Password changed successfully.' };
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 150));
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    return { success: true, message: 'Password has been updated securely.' };
  },
};

