/**
 * Coverage API
 * RTK Query endpoints for patient coverage/insurance data
 */

import { baseApi } from '../../../shared/api/baseApi';
import type { Coverage } from '../../../types/patient.types';
import type { ApiResponse } from '../../../shared/types';

export const coverageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatientCoverage: builder.query<Coverage | null, number>({
      query: (patientId) => ({
        url: '/coverage',
        params: { patientId },
      }),
      transformResponse: (response: ApiResponse<Coverage[]>) => {
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data[0];
        }
        return null;
      },
      providesTags: (result, error, patientId) => [
        { type: 'Coverage', id: patientId },
      ],
    }),
    getMultiplePatientCoverage: builder.query<Record<number, Coverage | null>, number[]>({
      queryFn: async (patientIds, _queryApi, _extraOptions, baseQuery) => {
        // Fetch coverage for multiple patients in parallel
        const coveragePromises = patientIds.map(async (patientId) => {
          try {
            const result = await baseQuery({
              url: '/coverage',
              params: { patientId },
            });
            
            if (result.data) {
              const response = result.data as ApiResponse<Coverage[]>;
              const coverage = response?.data && Array.isArray(response.data) && response.data.length > 0
                ? response.data[0]
                : null;
              return { patientId, coverage };
            }
            return { patientId, coverage: null };
          } catch {
            return { patientId, coverage: null };
          }
        });

        const results = await Promise.all(coveragePromises);
        const coverageMap: Record<number, Coverage | null> = {};
        results.forEach(({ patientId, coverage }) => {
          coverageMap[patientId] = coverage;
        });

        return { data: coverageMap };
      },
      providesTags: (result) =>
        result
          ? Object.keys(result).map((patientId) => ({
              type: 'Coverage' as const,
              id: parseInt(patientId, 10),
            }))
          : ['Coverage'],
    }),
  }),
});

export const {
  useGetPatientCoverageQuery,
  useGetMultiplePatientCoverageQuery,
} = coverageApi;
