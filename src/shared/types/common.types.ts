/**
 * Common shared types
 * Types used across multiple features
 */

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}
