// File: src/services/coverage.service.ts
import { apiClient } from './api';
import type { Coverage } from '../types/patient.types';

interface CoverageResponse {
  data: Coverage[];
}

export const coverageService = {
  /**
   * Fetches insurance coverage for a patient.
   * Endpoint matches the pattern: GET /coverage?patientId=123
   */
  async getPatientCoverage(patientId: number): Promise<Coverage | null> {
    try {
      const response = await apiClient.get<CoverageResponse>('/coverage', {
        params: { patientId }
      });

      // Your JSON shows 'data' is an array. We take the first active coverage record.
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data[0];
      }
      
      return null;
    } catch (error) {
      console.warn(`[CoverageService] No coverage found for patient ${patientId}`, error);
      return null; // Return null safely so UI shows "No Insurance" instead of crashing
    }
  }
};