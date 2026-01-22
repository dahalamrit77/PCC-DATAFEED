/**
 * Secure storage abstraction for authentication tokens
 * Provides a centralized way to manage localStorage with type safety
 */

const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const SELECTED_FACILITY_KEY = 'selected_facility_id';
const USER_ROLE_KEY = 'user_role';
const USER_FACILITIES_KEY = 'user_facilities';
const USER_FIRST_NAME_KEY = 'user_first_name';
const USER_LAST_NAME_KEY = 'user_last_name';

export const storage = {
  /**
   * Get authentication token from storage
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Set authentication token in storage
   */
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Remove authentication token from storage
   */
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get user email from storage
   */
  getUserEmail: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_EMAIL_KEY);
  },

  /**
   * Set user email in storage
   */
  setUserEmail: (email: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_EMAIL_KEY, email);
  },

  /**
   * Remove user email from storage
   */
  removeUserEmail: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_EMAIL_KEY);
  },

  /**
   * Get selected facility ID from storage
   */
  getSelectedFacilityId: (): number | null => {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(SELECTED_FACILITY_KEY);
    return value ? parseInt(value, 10) : null;
  },

  /**
   * Set selected facility ID in storage
   */
  setSelectedFacilityId: (facilityId: number): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SELECTED_FACILITY_KEY, facilityId.toString());
  },

  /**
   * Remove selected facility ID from storage
   */
  removeSelectedFacilityId: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SELECTED_FACILITY_KEY);
  },

  /**
   * Get user role from storage
   */
  getUserRole: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_ROLE_KEY);
  },

  /**
   * Set user role in storage
   */
  setUserRole: (role: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_ROLE_KEY, role);
  },

  /**
   * Remove user role from storage
   */
  removeUserRole: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_ROLE_KEY);
  },

  /**
   * Get user facilities from storage
   */
  getUserFacilities: (): number[] | null => {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(USER_FACILITIES_KEY);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Set user facilities in storage
   */
  setUserFacilities: (facilities: number[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(facilities));
  },

  /**
   * Remove user facilities from storage
   */
  removeUserFacilities: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_FACILITIES_KEY);
  },

  /**
   * Get user first name from storage
   */
  getUserFirstName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_FIRST_NAME_KEY);
  },

  /**
   * Set user first name in storage
   */
  setUserFirstName: (firstName: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_FIRST_NAME_KEY, firstName);
  },

  /**
   * Remove user first name from storage
   */
  removeUserFirstName: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_FIRST_NAME_KEY);
  },

  /**
   * Get user last name from storage
   */
  getUserLastName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_LAST_NAME_KEY);
  },

  /**
   * Set user last name in storage
   */
  setUserLastName: (lastName: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_LAST_NAME_KEY, lastName);
  },

  /**
   * Remove user last name from storage
   */
  removeUserLastName: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_LAST_NAME_KEY);
  },

  /**
   * Clear all authentication-related storage
   */
  clearAuth: (): void => {
    storage.removeToken();
    storage.removeUserEmail();
    storage.removeUserRole();
    storage.removeUserFacilities();
    storage.removeUserFirstName();
    storage.removeUserLastName();
  },

  /**
   * Clear all storage
   */
  clearAll: (): void => {
    storage.clearAuth();
    storage.removeSelectedFacilityId();
  },
};
