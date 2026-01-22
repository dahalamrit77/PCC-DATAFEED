/**
 * Patient Details Hook
 * Fetches patient details with all enrichment data in parallel
 */

import { useGetPatientByIdQuery } from '../api/patientsApi';
import { useGetPatientCoverageQuery } from '../api/coverageApi';
import { useGetPatientAdtRecordsQuery } from '../api/adtApi';
import { useGetPatientEventsQuery } from '../api/eventsApi';
import { enrichPatientData } from '../../../services/patient.adapter';
import type { PatientDetail, PatientEvent } from '../../../types/patient.types';

export const usePatientDetails = (patientId: string) => {
  const numericId = parseInt(patientId, 10);
  const isValidId = !isNaN(numericId);

  // Fetch all data in parallel using RTK Query
  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = useGetPatientByIdQuery(patientId, { skip: !isValidId });

  const {
    data: coverage,
    isLoading: isLoadingCoverage,
  } = useGetPatientCoverageQuery(numericId, { skip: !isValidId });

  const {
    data: adtRecords = [],
    isLoading: isLoadingAdt,
  } = useGetPatientAdtRecordsQuery(numericId, { skip: !isValidId });

  const {
    data: events = [],
    isLoading: isLoadingEvents,
  } = useGetPatientEventsQuery(
    { patientId: numericId, limit: 10 },
    { skip: !isValidId }
  );

  const isLoading =
    isLoadingPatient || isLoadingCoverage || isLoadingAdt || isLoadingEvents;

  // Enrich patient data when all data is available
  const patientDetail: PatientDetail | null =
    patient && !isLoading
      ? enrichPatientData(patient, coverage || null, adtRecords, events)
      : null;

  return {
    patient: patientDetail,
    isLoading,
    error: patientError,
  };
};
