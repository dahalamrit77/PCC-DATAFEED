import { apiClient } from './api';
import { coverageService } from './coverage.service';
import { adtService } from './adt.service';
import { eventsService } from './events.service';
import { enrichPatientData } from './patient.adapter';
// Using type-only imports to satisfy 'verbatimModuleSyntax'
import type { Patient, PatientDetail } from '../types/patient.types';

interface PccApiResponse<T> {
  data: T;
}

export interface GetPatientsParams {
  patientId?: string;
  patientStatus?: string;
}

export const patientService = {
  /**
   * Fetch list of patients.
   */
  async getPatients(params?: GetPatientsParams): Promise<Patient[]> {
    try {
      const response = await apiClient.get<PccApiResponse<Patient[]>>('/patients', { params });
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching patient census:', error);
      throw error;
    }
  },

  /**
   * OPTIMIZED FETCH:
   * 1. Fetches ONLY the specific patient (using patientId param).
   * 2. Fetches Coverage.
   * 3. Fetches ADT records.
   * 4. Fetches Recent Events.
   * 5. Merges them all.
   * 
   * Performance improvement: Only fetches one patient instead of all patients.
   */
  async getPatientDetails(id: string): Promise<PatientDetail | null> {
    try {
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        console.warn(`[patientService] Invalid patient ID: ${id}`);
        return null;
      }
      
      // OPTIMIZATION: Fetch only the specific patient instead of all patients
      const patientList = await this.getPatients({ patientId: id });

      if (!patientList || patientList.length === 0) {
        console.warn(`[patientService] Patient ${id} not found.`);
        return null;
      }

      const patient = patientList[0];

      // Fetch enrichment data in parallel (coverage, ADT, events)
      // Use Promise.allSettled to handle individual failures gracefully
      const [coverageResult, adtResult, eventsResult] = await Promise.allSettled([
        coverageService.getPatientCoverage(numericId),
        adtService.getPatientAdtRecords(numericId),
        eventsService.getPatientEvents(numericId, 10)
      ]);

      // Extract data from settled promises, defaulting to null on failure
      const coverageData = coverageResult.status === 'fulfilled' ? coverageResult.value : null;
      const adtRecords = adtResult.status === 'fulfilled' ? adtResult.value : [];
      const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];

      // Log warnings for failed requests but don't fail the whole operation
      if (coverageResult.status === 'rejected') {
        console.warn(`[patientService] Failed to fetch coverage for patient ${id}:`, coverageResult.reason);
      }
      if (adtResult.status === 'rejected') {
        console.warn(`[patientService] Failed to fetch ADT records for patient ${id}:`, adtResult.reason);
      }
      if (eventsResult.status === 'rejected') {
        console.warn(`[patientService] Failed to fetch events for patient ${id}:`, eventsResult.reason);
      }

      return enrichPatientData(patient, coverageData, adtRecords, events);
    } catch (error) {
      console.error('Error fetching full patient profile:', error);
      throw error;
    }
  }
};