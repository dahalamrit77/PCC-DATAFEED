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

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      transformResponse: (response: ApiResponse<Patient[]>) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query<Patient, string>({
      query: (id) => ({
        url: '/patients',
        params: { patientId: id },
      }),
      transformResponse: (response: ApiResponse<Patient[]>) => {
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data[0];
        }
        throw new Error('Patient not found');
      },
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
    }),
  }),
});

export const { useGetPatientsQuery, useGetPatientByIdQuery } = patientsApi;
