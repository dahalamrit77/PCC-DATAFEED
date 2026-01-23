/**
 * Events API
 * RTK Query endpoints for patient events
 */

import { baseApi } from '@shared/api/baseApi';
import type { PatientEvent } from '../../../types/patient.types';

export interface GetEventsParams {
  patientId?: number;
  eventType?: string;
  limit?: number;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<PatientEvent[], GetEventsParams | void>({
      query: (params) => {
        if (!params) {
          return { url: '/events' };
        }
        return {
          url: '/events',
          params: params as Record<string, unknown>,
        };
      },
      /**
       * Normalize raw Events API responses into our PatientEvent shape.
       * The backend may return PascalCase keys (EventType, Timestamp, etc.)
       * so we defensively map both naming styles.
       */
      transformResponse: (response: unknown): PatientEvent[] => {
        if (!Array.isArray(response)) {
          return [];
        }

        const normalized = (response as unknown[]).map((item: unknown) => {
          const rawItem = item as Record<string, unknown>;
          const event: PatientEvent = {
            eventId:
              (rawItem.eventId as string | undefined) ??
              (rawItem.EventId as string | undefined) ??
              (rawItem.MessageId as string | undefined) ??
              String((rawItem.id as number | string | undefined) ?? ''),
            eventType: (rawItem.eventType as string | undefined) ?? (rawItem.EventType as string | undefined) ?? '',
            patientId: (rawItem.patientId as number | undefined) ?? (rawItem.PatientId as number | undefined) ?? 0,
            patientName: (rawItem.patientName as string | undefined) ?? (rawItem.PatientName as string | undefined) ?? '',
            timestamp: (rawItem.timestamp as string | undefined) ?? (rawItem.Timestamp as string | undefined) ?? (rawItem.CreatedAt as string | undefined) ?? '',
            room: (rawItem.room as string | undefined) ?? (rawItem.Room as string | undefined) ?? null,
            previousRoom: (rawItem.previousRoom as string | undefined) ?? (rawItem.PreviousRoom as string | undefined) ?? null,
            origin: (rawItem.origin as string | undefined) ?? (rawItem.Origin as string | undefined) ?? null,
            originType: (rawItem.originType as string | undefined) ?? (rawItem.OriginType as string | undefined) ?? null,
            destination: (rawItem.destination as string | undefined) ?? (rawItem.Destination as string | undefined) ?? null,
            destinationType:
              (rawItem.destinationType as string | undefined) ?? (rawItem.DestinationType as string | undefined) ?? null,
            facility: (rawItem.facility as string | number | undefined) ?? (rawItem.Facility as string | number | undefined) ?? null,
            previousFacility:
              (rawItem.previousFacility as string | number | undefined) ?? (rawItem.PreviousFacility as string | number | undefined) ?? null,
            previousProvider:
              (rawItem.previousProvider as string | undefined) ?? (rawItem.PreviousProvider as string | undefined) ?? null,
            currentProvider:
              (rawItem.currentProvider as string | undefined) ?? (rawItem.CurrentProvider as string | undefined) ?? null,
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

        const normalized = (response as unknown[]).map((item: unknown) => {
          const rawItem = item as Record<string, unknown>;
          const event: PatientEvent = {
            eventId:
              (rawItem.eventId as string | undefined) ??
              (rawItem.EventId as string | undefined) ??
              (rawItem.MessageId as string | undefined) ??
              String((rawItem.id as number | string | undefined) ?? ''),
            eventType: (rawItem.eventType as string | undefined) ?? (rawItem.EventType as string | undefined) ?? '',
            patientId: (rawItem.patientId as number | undefined) ?? (rawItem.PatientId as number | undefined) ?? 0,
            patientName: (rawItem.patientName as string | undefined) ?? (rawItem.PatientName as string | undefined) ?? '',
            timestamp: (rawItem.timestamp as string | undefined) ?? (rawItem.Timestamp as string | undefined) ?? (rawItem.CreatedAt as string | undefined) ?? '',
            room: (rawItem.room as string | undefined) ?? (rawItem.Room as string | undefined) ?? null,
            previousRoom: (rawItem.previousRoom as string | undefined) ?? (rawItem.PreviousRoom as string | undefined) ?? null,
            origin: (rawItem.origin as string | undefined) ?? (rawItem.Origin as string | undefined) ?? null,
            originType: (rawItem.originType as string | undefined) ?? (rawItem.OriginType as string | undefined) ?? null,
            destination: (rawItem.destination as string | undefined) ?? (rawItem.Destination as string | undefined) ?? null,
            destinationType:
              (rawItem.destinationType as string | undefined) ?? (rawItem.DestinationType as string | undefined) ?? null,
            facility: (rawItem.facility as string | number | undefined) ?? (rawItem.Facility as string | number | undefined) ?? null,
            previousFacility:
              (rawItem.previousFacility as string | number | undefined) ?? (rawItem.PreviousFacility as string | number | undefined) ?? null,
            previousProvider:
              (rawItem.previousProvider as string | undefined) ?? (rawItem.PreviousProvider as string | undefined) ?? null,
            currentProvider:
              (rawItem.currentProvider as string | undefined) ?? (rawItem.CurrentProvider as string | undefined) ?? null,
          };

          return event;
        });

        // Sort by timestamp (most recent first)
        return normalized.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
      providesTags: (_result, _error, { patientId }) => [
        { type: 'Event', id: patientId },
      ],
    }),
  }),
});

export const { useGetEventsQuery, useGetPatientEventsQuery } = eventsApi;
