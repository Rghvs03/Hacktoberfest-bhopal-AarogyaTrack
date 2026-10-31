import { localDb, LocalConsultation, LocalPatient, SyncOutboxItem } from './db';
export type { LocalConsultation, LocalPatient, SyncOutboxItem };

const API_BASE = (import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE.replace(/\/$/, '') : '') + '/api/v1';

export interface DoctorUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const api = {
  // Auth state
  getToken(): string | null {
    return localStorage.getItem('aarogya_token');
  },

  setAuth(token: string, user: DoctorUser) {
    localStorage.setItem('aarogya_token', token);
    localStorage.setItem('aarogya_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('aarogya_token');
    localStorage.removeItem('aarogya_user');
  },

  getCurrentUser(): DoctorUser | null {
    const raw = localStorage.getItem('aarogya_user');
    return raw ? JSON.parse(raw) : null;
  },

  async headers(): Promise<HeadersInit> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Auth API
  async login(email: string, password: string): Promise<{ token: string; user: DoctorUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    this.setAuth(data.token, data.user);
    return data;
  },

  // Patients API with offline cache
  async getPatients(search?: string): Promise<LocalPatient[]> {
    if (navigator.onLine) {
      try {
        const url = search ? `${API_BASE}/patients?q=${encodeURIComponent(search)}` : `${API_BASE}/patients`;
        const res = await fetch(url, { headers: await this.headers() });
        if (res.ok) {
          const remotePatients: LocalPatient[] = await res.json();
          // Cache in Dexie
          await localDb.patients.bulkPut(remotePatients);
          return remotePatients;
        }
      } catch (err) {
        console.warn('Network request failed, falling back to local Dexie cache', err);
      }
    }

    // Offline / fallback to Dexie
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      return await localDb.patients
        .filter((p) => p.fullName.toLowerCase().includes(s) || p.patientCode.toLowerCase().includes(s) || p.village.toLowerCase().includes(s))
        .toArray();
    }
    return await localDb.patients.toArray();
  },

  async createPatient(patientData: Omit<LocalPatient, 'id' | 'patientCode' | 'updatedAt'>): Promise<LocalPatient> {
    if (navigator.onLine) {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: await this.headers(),
        body: JSON.stringify(patientData),
      });
      if (res.ok) {
        const created: LocalPatient = await res.json();
        await localDb.patients.put(created);
        return created;
      }
    }

    // Offline patient creation
    const offlineId = crypto.randomUUID();
    const count = await localDb.patients.count();
    const localPatient: LocalPatient = {
      ...patientData,
      id: offlineId,
      patientCode: `AAR-OFFLINE-${count + 1}`,
      updatedAt: new Date().toISOString(),
    };
    await localDb.patients.put(localPatient);
    return localPatient;
  },

  async getPatientById(id: string): Promise<any> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/patients/${id}`, { headers: await this.headers() });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Network failed for patient detail, reading local database', err);
      }
    }

    const patient = await localDb.patients.get(id);
    const consultations = await localDb.consultations.where('patientId').equals(id).reverse().sortBy('consultationDate');
    return {
      ...patient,
      consultations,
    };
  },

  // Consultations & Offline Sync Flow
  async createConsultation(consultation: LocalConsultation): Promise<LocalConsultation> {
    // 1. Always write to local Dexie first (Zero data loss guarantee!)
    await localDb.consultations.put(consultation);

    // 2. If offline, add to Sync Outbox
    if (!navigator.onLine) {
      const outboxItem: SyncOutboxItem = {
        clientOperationId: crypto.randomUUID(),
        entityType: 'CONSULTATION',
        payload: consultation,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      await localDb.syncOutbox.put(outboxItem);
      return consultation;
    }

    // 3. Online: Send to backend
    try {
      const res = await fetch(`${API_BASE}/consultations`, {
        method: 'POST',
        headers: await this.headers(),
        body: JSON.stringify(consultation),
      });

      if (!res.ok) {
        throw new Error('Server rejected consultation');
      }

      return await res.json();
    } catch (err) {
      console.warn('Failed to post online, queueing into offline outbox', err);
      const outboxItem: SyncOutboxItem = {
        clientOperationId: crypto.randomUUID(),
        entityType: 'CONSULTATION',
        payload: consultation,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      await localDb.syncOutbox.put(outboxItem);
      return consultation;
    }
  },

  async getVitalsTimeline(patientId: string): Promise<any[]> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/consultations/patient/${patientId}/vitals-timeline`, {
          headers: await this.headers(),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Network error on vitals timeline', e);
      }
    }

    // Fallback: build timeline from local consultations
    const consultations = await localDb.consultations.where('patientId').equals(patientId).sortBy('consultationDate');
    return consultations.map((c) => ({
      consultationId: c.id,
      date: new Date(c.consultationDate).toISOString().split('T')[0],
      systolicBP: c.vitals?.systolicBP ?? null,
      diastolicBP: c.vitals?.diastolicBP ?? null,
      bloodGlucose: c.vitals?.bloodGlucose ?? null,
      glucoseContext: c.vitals?.glucoseContext ?? null,
      heartRate: c.vitals?.heartRate ?? null,
      temperature: c.vitals?.temperature ?? null,
      oxygenSaturation: c.vitals?.oxygenSaturation ?? null,
    }));
  },

  // Synchronize outbox
  async syncOutbox(): Promise<{ totalProcessed: number; successCount: number }> {
    const pending = await localDb.syncOutbox.where('status').equals('PENDING').toArray();
    if (pending.length === 0) return { totalProcessed: 0, successCount: 0 };

    const operations = pending.map((item) => ({
      clientOperationId: item.clientOperationId,
      entityType: item.entityType,
      payload: item.payload,
    }));

    try {
      const res = await fetch(`${API_BASE}/sync/batch`, {
        method: 'POST',
        headers: await this.headers(),
        body: JSON.stringify({ operations }),
      });

      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      // Mark local outbox items as SYNCED
      for (const item of pending) {
        item.status = 'SYNCED';
        await localDb.syncOutbox.put(item);
      }

      return { totalProcessed: operations.length, successCount: data.successCount };
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  },

  async getPendingCount(): Promise<number> {
    return await localDb.syncOutbox.where('status').equals('PENDING').count();
  },

  // AI Engines
  async generateGeminiSummary(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/patients/${patientId}/summary`, {
      method: 'POST',
      headers: await this.headers(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate AI summary');
    }
    return await res.json();
  },

  async structureVisitWithGroq(rawNotes: string, vitalsText?: string): Promise<any> {
    // If offline, use instant intelligent local parsing without needing cloud network!
    if (!navigator.onLine) {
      return this.localOfflineStructure(rawNotes, vitalsText);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/structure-visit`, {
        method: 'POST',
        headers: await this.headers(),
        body: JSON.stringify({ rawNotes, vitalsText }),
      });
      if (!res.ok) {
        return this.localOfflineStructure(rawNotes, vitalsText);
      }
      return await res.json();
    } catch (err) {
      console.warn('Network error reaching Groq, using local offline structuring fallback');
      return this.localOfflineStructure(rawNotes, vitalsText);
    }
  },

  localOfflineStructure(rawNotes: string, vitalsText?: string) {
    const text = rawNotes.trim();
    if (!text) {
      return {
        chiefComplaints: 'Routine medical examination and follow-up',
        observations: vitalsText || 'General appearance stable',
        clinicianAssessment: 'General health checkup',
        treatmentPlan: 'Maintain healthy diet and hydration.',
      };
    }

    const lower = text.toLowerCase();
    const parts = text.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);

    // 1. Extract complaints (fever, headache, cough, pain, dizziness, duration)
    const complaintParts: string[] = [];
    const planParts: string[] = [];
    const diagnosisParts: string[] = [];

    for (const part of parts) {
      const pLower = part.toLowerCase();
      // Treatment / Medication keywords
      if (
        pLower.startsWith('start ') ||
        pLower.startsWith('give ') ||
        pLower.startsWith('tab ') ||
        pLower.startsWith('cap ') ||
        pLower.startsWith('rx ') ||
        pLower.includes('mg') ||
        pLower.includes('review') ||
        pLower.includes('follow up') ||
        pLower.includes('dolo') ||
        pLower.includes('paracetamol') ||
        pLower.includes('telmisartan') ||
        pLower.includes('amlodipine') ||
        pLower.includes('metformin') ||
        pLower.includes('antibiotic')
      ) {
        planParts.push(part);
      } else {
        complaintParts.push(part);
      }
    }

    // Infer Clinical Assessment (Diagnosis)
    if (lower.includes('fever')) {
      diagnosisParts.push('Acute Febrile Illness (Fever)');
    }
    if (lower.includes('headache')) {
      diagnosisParts.push('Tension-type headache');
    }
    if (lower.includes('bp') || lower.includes('hypertension')) {
      diagnosisParts.push('Elevated Blood Pressure under observation');
    }
    if (lower.includes('cough') || lower.includes('cold')) {
      diagnosisParts.push('Upper Respiratory Tract Infection (URTI)');
    }
    if (lower.includes('sugar') || lower.includes('diabetes')) {
      diagnosisParts.push('Type 2 Diabetes Mellitus review');
    }
    if (diagnosisParts.length === 0) {
      diagnosisParts.push('Symptomatic clinical evaluation');
    }

    // Chief Complaints formatting
    const formattedComplaints = complaintParts.length > 0 
      ? complaintParts.join(', ')
      : text;

    // Treatment Plan formatting
    const formattedPlan = planParts.length > 0
      ? planParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('. ') + '. Advised adequate hydration and rest.'
      : 'Advised lifestyle modification and symptom monitoring. Follow-up as scheduled.';

    // Observations
    const cleanVitals = vitalsText && !vitalsText.includes('--/--')
      ? vitalsText
      : lower.includes('fever') ? 'Patient febrile on palpation, ambulatory, conscious.' : 'General physical condition stable.';

    return {
      chiefComplaints: formattedComplaints.charAt(0).toUpperCase() + formattedComplaints.slice(1),
      observations: cleanVitals,
      clinicianAssessment: diagnosisParts.join('; '),
      treatmentPlan: formattedPlan,
    };
  },

  async reviewSummary(summaryId: string, status: 'APPROVED' | 'REJECTED'): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/summaries/${summaryId}/review`, {
      method: 'PATCH',
      headers: await this.headers(),
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },
};
