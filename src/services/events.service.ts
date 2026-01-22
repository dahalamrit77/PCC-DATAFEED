import { apiClient } from './api';
import type { PatientEvent } from '../types/patient.types';

// Backward compatibility alias
type Event = PatientEvent;

export interface GetEventsParams {
  patientId?: number;
  eventType?: string;
  limit?: number;
}

export const eventsService = {
  /**
   * Fetches recent events.
   * Endpoint: GET /events?patientId={patientId}&eventType={eventType}
   * 
   * @param params - Optional filters for events
   * @returns Array of events, sorted by timestamp (most recent first)
   */
  async getEvents(params?: GetEventsParams): Promise<Event[]> {
    try {
      const response = await apiClient.get<Event[]>('/events', { params });

      if (Array.isArray(response.data)) {
        // Sort by timestamp (most recent first)
        return response.data.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      
      return [];
    } catch (error) {
      console.warn('[EventsService] Error fetching events', error);
      return []; // Return empty array safely so UI can handle gracefully
    }
  },

  /**
   * Fetches events for a specific patient.
   * Convenience method that wraps getEvents with patientId filter.
   */
  async getPatientEvents(patientId: number, limit?: number): Promise<Event[]> {
    return this.getEvents({ patientId, limit });
  }
};

