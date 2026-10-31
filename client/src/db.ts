import Dexie, { type Table } from 'dexie';

export interface LocalPatient {
  id: string;
  patientCode: string;
  fullName: string;
  age?: number | null;
  gender: string;
  village: string;
  contactNumber?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  updatedAt: string;
}

export interface LocalConsultation {
  id: string; // UUID generated client-side
  patientId: string;
  consultationDate: string;
  chiefComplaints: string;
  observations?: string | null;
  clinicianAssessment: string;
  treatmentPlan: string;
  followUpDate?: string | null;
  rawRxPadNotes?: string | null;
  isOfflineCreated: boolean;
  vitals?: {
    systolicBP?: number | null;
    diastolicBP?: number | null;
    bloodGlucose?: number | null;
    glucoseContext?: string | null;
    heartRate?: number | null;
    temperature?: number | null;
    oxygenSaturation?: number | null;
  };
}

export interface SyncOutboxItem {
  clientOperationId: string;
  entityType: 'CONSULTATION';
  payload: LocalConsultation;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: string;
  errorMessage?: string;
}

export class AarogyaDatabase extends Dexie {
  patients!: Table<LocalPatient, string>;
  consultations!: Table<LocalConsultation, string>;
  syncOutbox!: Table<SyncOutboxItem, string>;

  constructor() {
    super('AarogyaTrackDB');
    this.version(1).stores({
      patients: 'id, patientCode, fullName, village',
      consultations: 'id, patientId, consultationDate',
      syncOutbox: 'clientOperationId, status, createdAt',
    });
  }
}

export const localDb = new AarogyaDatabase();

