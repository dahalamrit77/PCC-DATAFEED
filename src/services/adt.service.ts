import { apiClient } from './api';
import type { AdtRecord } from '../types/patient.types';

interface AdtApiResponse {
  data: AdtRecord[];
}

export const adtService = {
  /**
   * Fetches ADT (Admission, Discharge, Transfer) records for a patient.
   * Endpoint: GET /adt?patientId={patientId}
   */
  async getPatientAdtRecords(patientId: number): Promise<AdtRecord[]> {
    try {
      const response = await apiClient.get<AdtApiResponse>('/adt', {
        params: { patientId }
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Filter out cancelled records and sort by effective date (most recent first)
        return response.data.data
          .filter(record => !record.isCancelledRecord)
          .sort((a, b) => 
            new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime()
          );
      }
      
      return [];
    } catch (error) {
      console.warn(`[AdtService] No ADT records found for patient ${patientId}`, error);
      return []; // Return empty array safely so UI can handle gracefully
    }
  }
};

