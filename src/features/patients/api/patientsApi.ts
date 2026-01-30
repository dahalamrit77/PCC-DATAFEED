/**
 * Patients API
 * RTK Query endpoints for patient data
 */

import { baseApi } from '@shared/api/baseApi';
import type { Patient } from '../../../types/patient.types';
import type { ApiResponse } from '@shared/types';

export interface GetPatientsParams {
  patientId?: string;
  patientStatus?: string;
}

/**
 * Paginated patients API response shape.
 * The backend returns:
 * {
 *   data: Patient[];
 *   hasMore: boolean;
 *   totalCount: number;
 * }
 */
export interface PatientsPageResponse {
  data: Patient[];
  hasMore: boolean;
  totalCount: number;
}

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Existing patients query used in several places (e.g. dashboard).
     * This continues to return a flat array of patients for backwards compatibility.
     * If the backend adds pagination metadata (hasMore, totalCount), it is ignored here.
     */
    getPatients: builder.query<Patient[], GetPatientsParams | void>({
      query: (params) => {
        if (!params) {
          return { url: '/patients' };
        }
        return {
          url: '/patients',
          params: params as Record<string, unknown>,
        };
      },
      transformResponse: (response: ApiResponse<Patient[]> | PatientsPageResponse) => {
        // Support both the simple ApiResponse<Patient[]> shape and the
        // paginated shape { data: Patient[]; hasMore; totalCount }.
        if (Array.isArray((response as PatientsPageResponse).data)) {
          return (response as PatientsPageResponse).data;
        }
        if (
          (response as ApiResponse<Patient[]>)?.data &&
          Array.isArray((response as ApiResponse<Patient[]>).data)
        ) {
          return (response as ApiResponse<Patient[]>).data;
        }
        return [];
      },
      providesTags: ['Patient'],
    }),

    /**
     * Paginated patients query used by PatientsIndexPage for table pagination.
     * This exposes the pagination metadata (hasMore, totalCount) to the UI.
     */
    getPatientsPage: builder.query<
      PatientsPageResponse,
      { pageNumber: number; patientStatus?: string; facilityId?: number | null }
    >({
      query: ({ pageNumber, patientStatus, facilityId }) => {
        const params: Record<string, unknown> = { pageNumber };
        if (patientStatus && patientStatus !== 'all') {
          const statusMap: Record<string, string> = {
            active: 'current',
            new: 'new',
            discharged: 'discharged',
          };
          params.patientStatus = statusMap[patientStatus] || patientStatus;
        }
        if (facilityId != null && facilityId !== undefined) {
          params.facilityId = facilityId;
        }
        return {
          url: '/patients',
          params,
        };
      },
      transformResponse: (response: PatientsPageResponse | ApiResponse<Patient[]>) => {
        // Handle the backend shape:
        // { data: Patient[]; hasMore: boolean; totalCount: number }
        if (Array.isArray((response as PatientsPageResponse).data)) {
          const page = response as PatientsPageResponse;
          return {
            data: page.data ?? [],
            hasMore: Boolean(page.hasMore),
            totalCount:
              typeof page.totalCount === 'number'
                ? page.totalCount
                : page.data?.length ?? 0,
          };
        }

        // Fallback to legacy ApiResponse<Patient[]> without pagination metadata.
        const legacy = response as ApiResponse<Patient[]>;
        const data = Array.isArray(legacy.data) ? legacy.data : [];
        return {
          data,
          hasMore: false,
          totalCount: data.length,
        };
      },
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query<Patient, string>({
      query: (id) => ({
        url: '/patients',
        params: { patientId: id },
      }),
      transformResponse: (response: ApiResponse<Patient[]> | PatientsPageResponse) => {
        // Support both the legacy ApiResponse<Patient[]> and paginated shapes.
        if (Array.isArray((response as PatientsPageResponse).data)) {
          const data = (response as PatientsPageResponse).data;
          if (data.length > 0) return data[0];
        }

        const legacy = response as ApiResponse<Patient[]>;
        if (legacy?.data && Array.isArray(legacy.data) && legacy.data.length > 0) {
          return legacy.data[0];
        }

        throw new Error('Patient not found');
      },
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientsPageQuery,
  useGetPatientByIdQuery,
} = patientsApi;
