/**
 * JWT Utility
 * Helper functions to decode JWT tokens (without verification)
 * Note: This only decodes the token, it does NOT verify the signature.
 * For production, you should verify the token signature on the backend.
 */

export interface JWTPayload {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
  role_id?: number;
  facilities?: number[];
  facId?: number;
  iat?: number; // Issued at
  exp?: number; // Expiration
  [key: string]: unknown; // Allow other claims
}

/**
 * Decode JWT token without verification
 * Extracts the payload from a JWT token
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format: token does not have 3 parts');
      return null;
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract role from JWT payload
 * Handles both string role and numeric role_id
 */
export function extractRoleFromJWT(payload: JWTPayload): string | null {
  // Try role first (string)
  if (payload.role) {
    return payload.role;
  }
  
  // Try role_id (number) and map to role name
  if (payload.role_id) {
    const roleIdMapping: Record<number, string> = {
      1: 'Super Admin',
      2: 'Admin',
      4: 'User',
    };
    return roleIdMapping[payload.role_id] || null;
  }
  
  return null;
}

/**
 * Extract facilities from JWT payload
 * Handles both array and single facility ID
 */
export function extractFacilitiesFromJWT(payload: JWTPayload): number[] {
  // Try facilities array
  if (Array.isArray(payload.facilities)) {
    return payload.facilities;
  }
  
  // Try single facId
  if (typeof payload.facId === 'number') {
    return [payload.facId];
  }
  
  return [];
}

/**
 * Check if a JWT token is expired.
 * Returns true if token is invalid or expired.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    // Missing payload or exp claim -> treat as expired for safety
    return true;
  }

  // exp is in seconds; Date.now() is milliseconds
  const expirationMs = payload.exp * 1000;
  const now = Date.now();

  // Add small buffer (5 seconds) to account for clock skew
  return now >= expirationMs - 5000;
}

/**
 * Check if token exists and is not expired.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}
