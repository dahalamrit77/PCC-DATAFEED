import { apiClient } from './api';
import type { Facility } from '../types/facility.types';

export const facilityService = {
  /**
   * Fetches all facilities.
   * Endpoint: GET /facilities
   */
  async getFacilities(): Promise<Facility[]> {
    try {
      const response = await apiClient.get('/facilities');

      // Handle different response structures
      let facilities: Facility[] = [];
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        facilities = response.data;
      } 
      // Check if response.data is an object with facId (single facility)
      else if (response.data && typeof response.data === 'object' && 'facId' in response.data) {
        facilities = [response.data as Facility];
      }
      // Check if response itself is an array (direct array response)
      else if (Array.isArray(response)) {
        facilities = response;
      }
      // Check if response.data.data exists (nested structure)
      else if (response.data?.data && Array.isArray(response.data.data)) {
        facilities = response.data.data;
      }

      // Debug logging
      console.log('[FacilityService] Raw response:', response);
      console.log('[FacilityService] Parsed facilities:', facilities.length);

      // Filter to only active facilities and sort by name
      const filteredFacilities = facilities
        .filter((facility) => facility && facility.active !== false)
        .sort((a, b) => a.facilityName.localeCompare(b.facilityName));

      console.log('[FacilityService] Active facilities:', filteredFacilities.length);
      return filteredFacilities;
    } catch (error) {
      console.error('[FacilityService] Error fetching facilities:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('[FacilityService] Response status:', axiosError.response?.status);
        console.error('[FacilityService] Response data:', axiosError.response?.data);
      }
      return [];
    }
  },
};



