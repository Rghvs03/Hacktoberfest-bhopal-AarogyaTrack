import React, { useEffect, useState } from 'react';
import { api, LocalPatient, LocalConsultation } from '../api';
import { RxSlipPrint } from './RxSlipPrint';
import { PatientFileSkeleton, AiSummarySkeleton } from './Skeletons';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Sparkles,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
  onOpenNewConsultation: () => void;
  refreshTrigger: number;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patientId,
  onBack,
  onOpenNewConsultation,
  refreshTrigger,
}) => {
  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'visits' | 'ai'>('trends');
  const [vitalMetric, setVitalMetric] = useState<'bp' | 'glucose' | 'hr' | 'spo2'>('bp');
  const [expandedRxSlipId, setExpandedRxSlipId] = useState<string | null>(null);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientData, vitalsData] = await Promise.all([
        api.getPatientById(patientId),
        api.getVitalsTimeline(patientId),
      ]);
      setPatient(patientData);
      setTimeline(vitalsData);
    } catch (e) {
      console.error('Failed to load patient detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId, refreshTrigger]);

  const handleGenerateGeminiSummary = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await api.generateGeminiSummary(patientId);
      setAiSummary(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI summary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleReviewSummary = async (status: 'APPROVED' | 'REJECTED') => {
    if (!aiSummary?.summaryId) return;
    try {
      await api.reviewSummary(aiSummary.summaryId, status);
      setAiSummary({ ...aiSummary, reviewStatus: status });
    } catch (e) {
      console.error('Failed to update review status', e);
    }
  };

  if (loading || !patient) {
    return <PatientFileSkeleton />;
  }

  const consultations = patient.consultations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Directory</span>
        </button>

        <button
          onClick={onOpenNewConsultation}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-clinical-700 text-white font-medium text-xs hover:bg-clinical-800 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Visit</span>
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="card-clinical p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.fullName}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-clinical-50 text-clinical-800 border border-clinical-200 font-semibold">
                {patient.patientCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 font-medium">
              <span>{patient.age ? `${patient.age} years` : 'Age Unspecified'} • {patient.gender}</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {patient.village}
              </span>
              {patient.contactNumber && <span>📞 {patient.contactNumber}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <span className="block text-[10px] uppercase font-mono text-slate-400 font-semibold">Total Visits</span>
              <span className="text-lg font-bold text-slate-800">{consultations.length}</span>
            </div>
          </div>
        </div>

        {/* Baseline & Allergies row */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block font-mono text-[10px] mb-1">
              Baseline Chronic History
            </span>
            <p className="text-slate-800 font-medium">{patient.medicalHistory || 'No prior chronic conditions recorded'}</p>
          </div>

          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block font-mono text-[10px] mb-1">
              Allergies & Contraindications
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${
              patient.allergies && patient.allergies.toLowerCase() !== 'none' && !patient.allergies.toLowerCase().includes('nkda')
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <ShieldAlert className="w-3 h-3" />
              {patient.allergies || 'NKDA (No Known Drug Allergies)'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-paper-border flex items-center gap-2">
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'trends'
              ? 'border-clinical-700 text-clinical-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Longitudinal Vitals & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'visits'
              ? 'border-clinical-700 text-clinical-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Consultation History ({consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'ai'
              ? 'border-clinical-700 text-clinical-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-clinical-600" />
          <span>Clinical AI Review</span>
        </button>
      </div>

      {/* TAB 1: Longitudinal Trends */}
      {activeTab === 'trends' && (
        <div className="card-clinical p-6 bg-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Longitudinal Physiological Trajectory</h2>
              <p className="text-xs text-slate-500">Track vital changes across periodic visits with deterministic source tracking</p>
            </div>

            {/* Metric Selector Toggles */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
              <button
                onClick={() => setVitalMetric('bp')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  vitalMetric === 'bp' ? 'bg-white text-clinical-800 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blood Pressure
              </button>
              <button
                onClick={() => setVitalMetric('glucose')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  vitalMetric === 'glucose' ? 'bg-white text-clinical-800 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blood Glucose
              </button>
              <button
                onClick={() => setVitalMetric('hr')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  vitalMetric === 'hr' ? 'bg-white text-clinical-800 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Heart Rate
              </button>
              <button
                onClick={() => setVitalMetric('spo2')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  vitalMetric === 'spo2' ? 'bg-white text-clinical-800 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SpO2
              </button>
            </div>
          </div>

          {timeline.length < 2 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
              <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Need At Least 2 Recorded Visits for Longitudinal Trends</p>
              <p className="text-xs text-slate-400 mt-1">Record another clinical visit to unlock multi-visit trend analysis</p>
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickMargin={8} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} tickMargin={8} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {vitalMetric === 'bp' && (
                    <>
                      <ReferenceLine y={140} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Stage 2 Threshold (140)', fill: '#EF4444', fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="systolicBP"
                        name="Systolic BP (mmHg)"
                        stroke="#0F766E"
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                        dot={{ r: 4, fill: '#0F766E' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolicBP"
                        name="Diastolic BP (mmHg)"
                        stroke="#0EA5E9"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#0EA5E9' }}
                      />
                    </>
                  )}

                  {vitalMetric === 'glucose' && (
                    <Line
                      type="monotone"
                      dataKey="bloodGlucose"
                      name="Blood Glucose (mg/dL)"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#F59E0B' }}
                    />
                  )}

                  {vitalMetric === 'hr' && (
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart Rate (bpm)"
                      stroke="#E11D48"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#E11D48' }}
                    />
                  )}

                  {vitalMetric === 'spo2' && (
                    <Line
                      type="monotone"
                      dataKey="oxygenSaturation"
                      name="SpO2 (%)"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Clinical Context Footnote */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              Measurement trends reflect actual recorded readings from prior mobile health camps. Charts are observational aids; diagnoses and treatment decisions remain the sole responsibility of the attending clinician.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Consultation History */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="card-clinical p-8 text-center text-slate-500">
              No consultations recorded yet. Click "Record New Visit" to capture the first clinical encounter.
            </div>
          ) : (
            consultations.map((c: any, index: number) => {
              const v = c.vitals?.[0];
              const dateStr = new Date(c.consultationDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={c.id} className="card-clinical p-5 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-clinical-100 text-clinical-800 text-xs font-bold flex items-center justify-center">
                        #{consultations.length - index}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{dateStr}</span>
                      {c.rawRxPadNotes && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clinical-50 text-clinical-800 border border-clinical-200 font-semibold">
                          📝 Smart Rx Pad
                        </span>
                      )}
                      {c.isOfflineCreated && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          Captured Offline
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        {c.doctor?.name || 'Attending Physician'}
                      </span>
                      <RxSlipPrint consultation={c} patient={patient} />
                    </div>
                  </div>

                  {/* Vitals Ribbon (Only displayed if vitals were actually recorded!) */}
                  {v && (v.systolicBP || v.bloodGlucose || v.heartRate) && (
                    <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono">
                      {v.systolicBP && (
                        <span className="font-semibold text-clinical-800">
                          BP: {v.systolicBP}/{v.diastolicBP} mmHg
                        </span>
                      )}
                      {v.bloodGlucose && (
                        <span className="text-amber-700">
                          Glucose: {v.bloodGlucose} mg/dL ({v.glucoseContext || 'RBS'})
                        </span>
                      )}
                      {v.heartRate && <span className="text-rose-700">HR: {v.heartRate} bpm</span>}
                      {v.oxygenSaturation && <span className="text-emerald-700">SpO2: {v.oxygenSaturation}%</span>}
                      {v.temperature && <span className="text-slate-700">Temp: {v.temperature}°F</span>}
                    </div>
                  )}

                  {/* SOAP Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Chief Complaints</span>
                      <p className="text-slate-600">{c.chiefComplaints}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Assessment (Diagnosis)</span>
                      <p className="text-slate-900 font-semibold">{c.clinicianAssessment}</p>
                    </div>

                    {c.observations && (
                      <div className="md:col-span-2">
                        <span className="font-bold text-slate-700 block mb-0.5">Observations & Exam</span>
                        <p className="text-slate-600">{c.observations}</p>
                      </div>
                    )}

                    <div className="md:col-span-2 p-3 rounded-lg bg-clinical-50/40 border border-clinical-100">
                      <span className="font-bold text-clinical-900 block mb-0.5">Treatment Plan & Prescription</span>
                      <p className="text-clinical-950 font-medium">{c.treatmentPlan}</p>
                    </div>
                  </div>

                  {/* Original Rx Pad Accordion Toggle */}
                  {c.rawRxPadNotes && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExpandedRxSlipId(expandedRxSlipId === c.id ? null : c.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-clinical-800 hover:text-clinical-900 bg-clinical-50/70 hover:bg-clinical-100 px-2.5 py-1 rounded border border-clinical-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-clinical-700" />
                        <span>{expandedRxSlipId === c.id ? 'Hide Original Rx Slip' : "View Doctor's Original Rx Slip"}</span>
                      </button>

                      {expandedRxSlipId === c.id && (
                        <div className="mt-2.5 p-4 rounded-xl border-2 border-slate-300 bg-[#FCFDFD] shadow-inner font-mono text-xs text-slate-800 space-y-2">
                          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5 text-slate-400">
                            <span className="font-serif italic font-bold text-clinical-900 text-sm">Rx • Doctor's Physical Slip Copy</span>
                            <span className="text-[10px]">{dateStr}</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed font-normal">
                            {c.rawRxPadNotes}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: AI Clinical Insights (Google Gemini + Groq) */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="card-clinical p-6 bg-gradient-to-r from-clinical-900 to-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-clinical-700/80 text-clinical-100 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Gemini 1.5 Clinical Analysis</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Longitudinal Health Review & Gaps Detection
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uses Google Gemini to synthesize this patient's complete cross-visit trajectory, detect trends, identify unperformed lab screenings, and present an assistive draft for clinician sign-off.
              </p>

              <button
                onClick={handleGenerateGeminiSummary}
                disabled={aiLoading}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-clinical-900 font-semibold text-xs hover:bg-slate-100 shadow disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-clinical-700" />
                <span>{aiLoading ? 'Synthesizing with Google Gemini...' : 'Generate Longitudinal Summary'}</span>
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {aiError}
            </div>
          )}

          {/* AI Synthesis Skeleton Loader */}
          {aiLoading && <AiSummarySkeleton />}

          {/* AI Structured Output */}
          {!aiLoading && aiSummary && (
            <div className="card-clinical p-6 bg-white space-y-5 border-l-4 border-l-clinical-700">
              {/* Header & Verification Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Longitudinal Clinical Synthesis</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      aiSummary.reviewStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {aiSummary.reviewStatus === 'APPROVED' ? '✓ Clinician Approved' : 'Draft • Pending Clinician Review'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Synthesized from {aiSummary.sourceConsultationIds?.length || 0} historical visits</p>
                </div>

                {/* Review Actions */}
                {aiSummary.reviewStatus !== 'APPROVED' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewSummary('APPROVED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve AI Draft</span>
                    </button>
                    <button
                      onClick={() => handleReviewSummary('REJECTED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                  1. Clinical Overview
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {aiSummary.overview}
                </p>
              </div>

              {/* Measurement Trends */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">
                  2. Traceable Vital Trends
                </h4>
                <div className="space-y-2">
                  {aiSummary.measurementTrends?.map((t: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-clinical-900">{t.measurement}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Dates: {t.sourceDates?.join(', ')}
                        </span>
                      </div>
                      <p className="text-slate-700">{t.observation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Information / Care Gaps */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  3. Identified Gaps & Missing Screenings
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  {aiSummary.missingInformation?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Clinician Action Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">
                  4. Recommended Clinician Verification Items
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  {aiSummary.clinicianReviewItems?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Regulatory & Safety Disclaimer */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <strong>Assistive AI Notice:</strong> {aiSummary.disclaimer || 'Assistive draft generated by Google Gemini. Requires clinician review.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

