/**
 * ADT API
 * RTK Query endpoints for ADT (Admission, Discharge, Transfer) records
 */

import { baseApi } from '@shared/api/baseApi';
import type { AdtRecord } from '../../../types/patient.types';
import type { ApiResponse } from '@shared/types';

export const adtApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatientAdtRecords: builder.query<AdtRecord[], number>({
      query: (patientId) => ({
        url: '/adt',
        params: { patientId },
      }),
      transformResponse: (response: ApiResponse<AdtRecord[]>) => {
        if (response?.data && Array.isArray(response.data)) {
          // Filter out cancelled records and sort by effective date (most recent first)
          return response.data
            .filter((record) => !record.isCancelledRecord)
            .sort(
              (a, b) =>
                new Date(b.effectiveDateTime).getTime() -
                new Date(a.effectiveDateTime).getTime()
            );
        }
        return [];
      },
      providesTags: (_result, _error, patientId) => [
        { type: 'Adt', id: patientId },
      ],
    }),
  }),
});

export const { useGetPatientAdtRecordsQuery } = adtApi;
