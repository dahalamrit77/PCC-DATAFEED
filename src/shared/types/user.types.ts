/**
 * User and Role Types
 * Type definitions for user management and role-based access control
 */

/**
 * User Role Enum
 * Matches backend role_id mapping:
 * 1 = Super Admin
 * 2 = Admin
 * 4 = User
 * Note: Manager role (ID 3) is skipped
 */
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User',
}

/**
 * Role ID to Role Name mapping
 */
export const ROLE_ID_MAPPING = {
  1: UserRole.SUPER_ADMIN,
  2: UserRole.ADMIN,
  // Some environments use role_id = 3 for standard users
  3: UserRole.USER,
  4: UserRole.USER,
} as const;

/**
 * Role Name to Role ID mapping (reverse lookup)
 */
export const ROLE_NAME_TO_ID: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 4,
};

/**
 * Create User Request
 * Matches backend API requirements for /api/createuser
 * Note: Backend expects 'role' as a string ("Super Admin", "Admin", or "User")
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string; // "Super Admin", "Admin", or "User" (backend expects string, not role_id)
  facilities: number[]; // Array of facility IDs
}

/**
 * Create User Response
 * Matches backend API response structure
 */
export interface CreateUserResponse {
  code: string; // e.g., "SUCCESS_USER_CREATED"
  message: string; // e.g., "User created successfully"
  userId: string; // UUID
}

/**
 * User interface (for future use when backend adds user endpoints)
 */
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleId: number;
  facilities: number[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper function to get role ID from role name
 */
export const getRoleId = (role: UserRole): number => {
  return ROLE_NAME_TO_ID[role];
};

/**
 * Helper function to get role name from role ID
 */
export const getRoleName = (roleId: number): UserRole | null => {
  return ROLE_ID_MAPPING[roleId as keyof typeof ROLE_ID_MAPPING] || null;
};
