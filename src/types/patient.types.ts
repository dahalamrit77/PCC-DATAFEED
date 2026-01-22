/**
 * Core patient data types
 */

export interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  medicareNumber?: string;
  roomDesc?: string;
  bedDesc?: string;
  patientStatus: 'New' | 'Current' | 'Discharged';
  photoUrl?: string;
  facId?: number; // Facility ID for filtering
  admissionDate?: string; // Admission date
  roomId?: number;
  roomType?: string;
  floorDesc?: string;
  floorId?: number;
  unitId?: number;
}

/**
 * Insurance/Payer related types
 */
export interface Payer {
  payerId?: number;
  payerName: string;
  payerCode?: string;
  payerRank: 'Primary' | 'Secondary' | 'Tertiary';
  payerType?: string;
}

export interface Coverage {
  coverageId?: number;
  patientId: number;
  payers: Payer[];
}

/**
 * ADT (Admission, Discharge, Transfer) record types
 */
export interface AdtRecord {
  adtRecordId: number;
  patientId: number;
  enteredBy: string;
  enteredByPositionId: number;
  actionType: string;
  actionCode: string;
  standardActionType: 'Admission' | 'Discharge' | 'Transfer' | string;
  payerName?: string;
  payerType?: string;
  payerCode?: string;
  admissionType?: string;
  admissionTypeCode?: string;
  admissionSource?: string;
  admissionSourceCode?: string;
  outpatient: boolean;
  bedId?: number;
  bedDesc?: string;
  roomDesc?: string;
  roomId?: number;
  floorDesc?: string;
  floorId?: number;
  unitDesc?: string;
  unitId?: number;
  origin?: string;
  originType?: string;
  destination?: string;
  destinationType?: string;
  dischargeStatus?: string;
  dischargeStatusCode?: string;
  stopBillingDate?: string;
  isCancelledRecord: boolean;
  modifiedDateTime: string;
  effectiveDateTime: string;
  enteredDate: string;
}

/**
 * Patient Event types
 * Note: Named PatientEvent to avoid conflict with DOM Event type
 *
 * This interface represents a normalized shape that we map the raw PCC
 * Events API responses into. The backend may return PascalCase keys like
 * `EventType`, `Timestamp`, `PatientId`, etc. We normalize those into
 * camelCase properties here in the frontend.
 */
export interface PatientEvent {
  eventId: string;
  eventType: 'Admission' | 'Discharge' | 'Transfer' | 'HOA' | 'RoomChange' | 'InsuranceUpdate' | 'Death' | string;
  patientId: number;
  patientName: string;
  timestamp: string;

  // Optional location and facility context for "smart" UI behaviours
  room?: string | null;
  previousRoom?: string | null;
  origin?: string | null;
  originType?: string | null;
  destination?: string | null;
  destinationType?: string | null;
  facility?: string | number | null;
  previousFacility?: string | number | null;

  // Optional payer/provider context for insurance-related events
  previousProvider?: string | null;
  currentProvider?: string | null;
}

// Export as Event for backward compatibility (but prefer PatientEvent)
export type Event = PatientEvent;

/**
 * Enriched patient detail combining all data sources
 */
export interface PatientDetail extends Patient {
  // Coverage data
  activeCoverage: {
    primary?: Payer;
    secondary?: Payer;
    allPayers: Payer[];
  };
  
  // ADT history
  adtHistory?: AdtRecord[];
  
  // Recent events
  recentEvents?: PatientEvent[];
}

