// File: src/services/patient.adapter.ts
import type { Patient, PatientDetail, Coverage, Payer, AdtRecord, PatientEvent } from '../types/patient.types';

/**
 * Merges:
 * 1. Real Patient Data (Name, Room)
 * 2. Real Coverage Data (Payers, Plans)
 * 3. Real ADT History (Admission, Discharge, Transfer records)
 * 4. Real Events (Recent patient events)
 * 5. Mock Clinical Data (Allergies - placeholders for now)
 */
export const enrichPatientData = (
  basicData: Patient, 
  coverageData: Coverage | null,
  adtRecords: AdtRecord[] = [],
  events: PatientEvent[] = []
): PatientDetail => {
  
  // 1. Process Real Financial Data
  let primaryPayer: Payer | undefined;
  let secondaryPayer: Payer | undefined;
  const allPayers = coverageData?.payers || [];

  if (coverageData && coverageData.payers) {
    primaryPayer = coverageData.payers.find(p => p.payerRank === 'Primary');
    secondaryPayer = coverageData.payers.find(p => p.payerRank === 'Secondary');
  }

  return {
    ...basicData,

    // Real Financials
    activeCoverage: {
      primary: primaryPayer,
      secondary: secondaryPayer,
      allPayers: allPayers
    },
    
    // Real ADT History
    adtHistory: adtRecords.length > 0 ? adtRecords : undefined,
    
    // Real Recent Events
    recentEvents: events.length > 0 ? events : undefined,
  };
};