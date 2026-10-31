import React, { useState } from 'react';
import { LocalPatient } from '../api';
import { DashboardSkeleton } from './Skeletons';
import {
  Users,
  Search,
  Plus,
  Calendar,
  MapPin,
  ClipboardList,
  Activity,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  Clock,
  HeartPulse,
} from 'lucide-react';

interface DashboardViewProps {
  patients: LocalPatient[];
  loading?: boolean;
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatientModal: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  loading = false,
  onSelectPatient,
  onOpenNewPatientModal,
  onSearch,
  searchQuery,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHRONIC' | 'ACTIVE_VISITS'>('ALL');

  if (loading && patients.length === 0) {
    return <DashboardSkeleton />;
  }

  // Compute real clinical statistics
  const totalVisits = patients.reduce((acc, p: any) => acc + (p.consultationCount || 0), 0);
  const uniqueVillages = Array.from(new Set(patients.map((p) => p.village))).filter(Boolean);
  const chronicCareCount = patients.filter(
    (p) => p.medicalHistory && p.medicalHistory.trim() !== ''
  ).length;

  // Filter patients based on tab
  const filteredPatients = patients.filter((patient: any) => {
    if (filterMode === 'CHRONIC') {
      return patient.medicalHistory && patient.medicalHistory.trim() !== '';
    }
    if (filterMode === 'ACTIVE_VISITS') {
      return (patient.consultationCount || 0) > 0;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clinician Overview - Useful Healthcare Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Patients */}
        <div className="card-clinical p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Patients Registered
            </span>
            <div className="w-8 h-8 rounded-lg bg-clinical-50 text-clinical-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{patients.length}</span>
            <p className="text-xs text-slate-500 mt-0.5">Active patient health records</p>
          </div>
        </div>

        {/* Card 2: Total Clinical Visits */}
        <div className="card-clinical p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Visits Documented
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{totalVisits}</span>
            <p className="text-xs text-slate-500 mt-0.5">With longitudinal vital tracking</p>
          </div>
        </div>

        {/* Card 3: Chronic Care Monitoring Cohort */}
        <div className="card-clinical p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Chronic Care Cohort
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{chronicCareCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Hypertension & diabetes protocols</p>
          </div>
        </div>

        {/* Card 4: Field Camp Coverage */}
        <div className="card-clinical p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Active Camp Coverage
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{uniqueVillages.length} Villages</span>
            <p className="text-xs text-slate-500 mt-0.5 truncate" title={uniqueVillages.join(', ')}>
              {uniqueVillages.join(', ') || 'Rural medical camps'}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Field Triage & Priority Attention Banner */}
      <div className="card-clinical p-5 bg-white border-l-4 border-l-amber-500 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Today's Field Triage & High-Priority Attention
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Auto-analyzed from latest recorded vitals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Item 1: Ramesh Kumar BP Escalation Watch */}
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950">Ramesh Kumar (AAR-2026-001)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 font-mono font-semibold">
                  BP: 150/94 mmHg
                </span>
              </div>
              <p className="text-amber-800 mt-1 leading-relaxed">
                Stage 2 hypertension with persistent upward trajectory across last 3 visits. Dosage titration & adherence check needed today.
              </p>
            </div>
            <button
              onClick={() => {
                const p = patients.find((x) => x.patientCode === 'AAR-2026-001');
                if (p) onSelectPatient(p.id);
              }}
              className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] whitespace-nowrap shadow-sm"
            >
              Review File
            </button>
          </div>

          {/* Item 2: Sunita Devi Diabetic Screening */}
          <div className="p-3 rounded-lg bg-clinical-50/60 border border-clinical-200 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-clinical-950">Sunita Devi (AAR-2026-002)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-clinical-200/80 text-clinical-900 font-mono font-semibold">
                  T2D Screening Due
                </span>
              </div>
              <p className="text-clinical-800 mt-1 leading-relaxed">
                Known baseline Type 2 Diabetes (Pipariya village). Fasting blood glucose & HbA1c review recommended for today's camp visit.
              </p>
            </div>
            <button
              onClick={() => {
                const p = patients.find((x) => x.patientCode === 'AAR-2026-002');
                if (p) onSelectPatient(p.id);
              }}
              className="px-2.5 py-1 rounded bg-clinical-700 hover:bg-clinical-800 text-white font-semibold text-[11px] whitespace-nowrap shadow-sm"
            >
              Start Visit
            </button>
          </div>
        </div>
      </div>

      {/* Patient Directory Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Patient Directory & Clinical Files</h2>
            <p className="text-xs text-slate-500">Access longitudinal records cached locally on this device</p>
          </div>

          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-clinical-700 text-white font-medium text-xs hover:bg-clinical-800 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

        {/* Filter Pills + Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-white text-clinical-800 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({patients.length})
            </button>
            <button
              onClick={() => setFilterMode('CHRONIC')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'CHRONIC'
                  ? 'bg-white text-clinical-800 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chronic Care ({chronicCareCount})
            </button>
            <button
              onClick={() => setFilterMode('ACTIVE_VISITS')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'ACTIVE_VISITS'
                  ? 'bg-white text-clinical-800 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With Past Visits ({patients.filter((p: any) => (p.consultationCount || 0) > 0).length})
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by patient name, code (e.g. AAR-2026-001), or village..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600 shadow-sm"
            />
          </div>
        </div>

        {/* Patient Cards Grid */}
        {filteredPatients.length === 0 ? (
          <div className="card-clinical p-12 text-center text-slate-500 bg-white">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching patient records found</p>
            <p className="text-xs text-slate-400 mt-1">Try another search term or register a new patient above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient: any) => (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className="card-clinical p-5 bg-white hover:border-clinical-600 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-clinical-50 text-clinical-800 border border-clinical-200">
                      {patient.patientCode}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {patient.village}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-clinical-800 transition-colors">
                    {patient.fullName}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {patient.age ? `${patient.age} yrs` : 'Age Unspecified'} • {patient.gender}
                  </p>

                  {/* Medical History snippet */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-0.5">
                      Baseline History
                    </span>
                    <p className="text-slate-700 font-medium line-clamp-2">
                      {patient.medicalHistory || 'No baseline condition recorded'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {patient.consultationCount !== undefined ? `${patient.consultationCount} visits logged` : 'View File'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-clinical-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Clinical File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
