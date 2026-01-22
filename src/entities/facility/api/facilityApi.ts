/**
 * Facility API
 * RTK Query endpoints for facility data
 */

import { baseApi } from '../../../shared/api/baseApi';
import type { Facility } from '../types/facility.types';

interface FacilitiesResponse {
  data?: Facility[];
  facilities?: Facility[];
}

export const facilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFacilities: builder.query<Facility[], void>({
      query: () => '/facilities',
      transformResponse: (response: FacilitiesResponse | Facility[]): Facility[] => {
        // Handle different response structures
        let facilities: Facility[] = [];

        if (Array.isArray(response)) {
          facilities = response;
        } else if (response.data && Array.isArray(response.data)) {
          facilities = response.data;
        } else if (response.facilities && Array.isArray(response.facilities)) {
          facilities = response.facilities;
        } else if (
          response &&
          typeof response === 'object' &&
          'facId' in response
        ) {
          facilities = [response as Facility];
        }

        // Filter to only active facilities and sort by name
        return facilities
          .filter((facility) => facility && facility.active !== false)
          .sort((a, b) => a.facilityName.localeCompare(b.facilityName));
      },
      providesTags: ['Facility'],
    }),
  }),
});

export const { useGetFacilitiesQuery } = facilityApi;
