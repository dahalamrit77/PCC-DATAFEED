/**
 * Events API
 * RTK Query endpoints for patient events
 */

import { baseApi } from '../../../shared/api/baseApi';
import type { PatientEvent } from '../../../types/patient.types';

export interface GetEventsParams {
  patientId?: number;
  eventType?: string;
  limit?: number;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<PatientEvent[], GetEventsParams | void>({
      query: (params) => ({
        url: '/events',
        params,
      }),
      /**
       * Normalize raw Events API responses into our PatientEvent shape.
       * The backend may return PascalCase keys (EventType, Timestamp, etc.)
       * so we defensively map both naming styles.
       */
      transformResponse: (response: unknown): PatientEvent[] => {
        if (!Array.isArray(response)) {
          return [];
        }

        const normalized = (response as any[]).map((item) => {
          const event: PatientEvent = {
            eventId:
              item.eventId ??
              item.EventId ??
              item.MessageId ??
              String(item.id ?? ''),
            eventType: item.eventType ?? item.EventType ?? '',
            patientId: item.patientId ?? item.PatientId ?? 0,
            patientName: item.patientName ?? item.PatientName ?? '',
            timestamp: item.timestamp ?? item.Timestamp ?? item.CreatedAt ?? '',
            room: item.room ?? item.Room ?? null,
            previousRoom: item.previousRoom ?? item.PreviousRoom ?? null,
            origin: item.origin ?? item.Origin ?? null,
            originType: item.originType ?? item.OriginType ?? null,
            destination: item.destination ?? item.Destination ?? null,
            destinationType:
              item.destinationType ?? item.DestinationType ?? null,
            facility: item.facility ?? item.Facility ?? null,
            previousFacility:
              item.previousFacility ?? item.PreviousFacility ?? null,
            previousProvider:
              item.previousProvider ?? item.PreviousProvider ?? null,
            currentProvider:
              item.currentProvider ?? item.CurrentProvider ?? null,
          };

          return event;
        });

        // Sort by timestamp (most recent first)
        return normalized.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
      providesTags: ['Event'],
    }),
    getPatientEvents: builder.query<PatientEvent[], { patientId: number; limit?: number }>({
      query: ({ patientId, limit }) => ({
        url: '/events',
        params: { patientId, limit },
      }),
      /**
       * Normalize raw Events API responses into our PatientEvent shape.
       * Uses the same normalization logic as getEvents to handle PascalCase keys.
       */
      transformResponse: (response: unknown): PatientEvent[] => {
        if (!Array.isArray(response)) {
          return [];
        }

        const normalized = (response as any[]).map((item) => {
          const event: PatientEvent = {
            eventId:
              item.eventId ??
              item.EventId ??
              item.MessageId ??
              String(item.id ?? ''),
            eventType: item.eventType ?? item.EventType ?? '',
            patientId: item.patientId ?? item.PatientId ?? 0,
            patientName: item.patientName ?? item.PatientName ?? '',
            timestamp: item.timestamp ?? item.Timestamp ?? item.CreatedAt ?? '',
            room: item.room ?? item.Room ?? null,
            previousRoom: item.previousRoom ?? item.PreviousRoom ?? null,
            origin: item.origin ?? item.Origin ?? null,
            originType: item.originType ?? item.OriginType ?? null,
            destination: item.destination ?? item.Destination ?? null,
            destinationType:
              item.destinationType ?? item.DestinationType ?? null,
            facility: item.facility ?? item.Facility ?? null,
            previousFacility:
              item.previousFacility ?? item.PreviousFacility ?? null,
            previousProvider:
              item.previousProvider ?? item.PreviousProvider ?? null,
            currentProvider:
              item.currentProvider ?? item.CurrentProvider ?? null,
          };

          return event;
        });

        // Sort by timestamp (most recent first)
        return normalized.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
      providesTags: (result, error, { patientId }) => [
        { type: 'Event', id: patientId },
      ],
    }),
  }),
});

export const { useGetEventsQuery, useGetPatientEventsQuery } = eventsApi;
