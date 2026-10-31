import React, { useState, useEffect, useRef } from 'react';
import { api, LocalConsultation } from '../api';
import {
  X,
  ClipboardPlus,
  Sparkles,
  HeartPulse,
  Activity,
  Mic,
  MicOff,
  FileEdit,
  SlidersHorizontal,
  CheckCircle2,
  Stethoscope,
  Pencil,
  Clock,
} from 'lucide-react';

interface NewConsultationModalProps {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onCreated: (consultation: LocalConsultation) => void;
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  patientId,
  patientName,
  onClose,
  onCreated,
}) => {
  // Mode selection: PAD (Doctor's Rx Writepad) vs STRUCTURED (Vitals Form)
  const [entryMode, setEntryMode] = useState<'PAD' | 'STRUCTURED'>('PAD');

  // Smart Rx Writepad State
  const [padText, setPadText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Structured Fields State (Auto-populated from Pad or manually entered)
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [observations, setObservations] = useState('');
  const [clinicianAssessment, setClinicianAssessment] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDays, setFollowUpDays] = useState('30');

  // Vitals State (Optional)
  const [systolicBP, setSystolicBP] = useState<number | ''>('');
  const [diastolicBP, setDiastolicBP] = useState<number | ''>('');
  const [bloodGlucose, setBloodGlucose] = useState<number | ''>('');
  const [glucoseContext, setGlucoseContext] = useState<string>('RANDOM');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [temperature, setTemperature] = useState<number | ''>(98.6);
  const [oxygenSaturation, setOxygenSaturation] = useState<number | ''>(98);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-parse Pad text in real-time as the doctor writes or dictates
  useEffect(() => {
    if (entryMode === 'PAD' && padText.trim().length > 5) {
      const parsed = api.localOfflineStructure(padText);
      setChiefComplaints(parsed.chiefComplaints);
      setObservations(parsed.observations);
      setClinicianAssessment(parsed.clinicianAssessment);
      setTreatmentPlan(parsed.treatmentPlan);

      // Detect follow-up days from text
      const lower = padText.toLowerCase();
      if (lower.includes('5 day') || lower.includes('5d')) setFollowUpDays('5');
      else if (lower.includes('10 day') || lower.includes('15 day') || lower.includes('2 week')) setFollowUpDays('15');
      else if (lower.includes('1 month') || lower.includes('4 week') || lower.includes('30 day')) setFollowUpDays('30');
      else if (lower.includes('3 month')) setFollowUpDays('90');
    }
  }, [padText, entryMode]);

  if (!isOpen) return null;

  // Voice Dictation Handler (Web Speech API) with continuous speech buffer
  const toggleVoiceDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is supported natively in Google Chrome and Microsoft Edge. Please use Chrome/Edge or type directly on the pad.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Handles Indian accents and Hinglish terms naturally

      let sessionAccumulatedText = '';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimVoiceText('Listening... Speak your sentence naturally');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            sessionAccumulatedText += (sessionAccumulatedText ? ' ' : '') + transcript.trim();
          } else {
            currentInterim += transcript;
          }
        }
        setInterimVoiceText(currentInterim || sessionAccumulatedText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          setInterimVoiceText('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimVoiceText('');
        if (sessionAccumulatedText.trim()) {
          const cleanSentence = sessionAccumulatedText.trim();
          setPadText((prev) => {
            const formatted = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
            return prev.trim() ? `${prev.trim()}\n• ${formatted}` : `• ${formatted}`;
          });
        }
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
      setInterimVoiceText('');
    }
  };

  // Quick stamps helpers
  const appendStamp = (prefix: string) => {
    setPadText((prev) => (prev.trim() ? `${prev.trim()}\n${prefix} ` : `${prefix} `));
  };

  // Demo Clinical Scenarios
  const loadScenario = (type: 'DERM' | 'FEVER' | 'HYPERTENSION') => {
    if (type === 'DERM') {
      setPadText(
        `• C/o severe itching on scalp and patchy hair loss for 3 weeks\n• O/E: Erythematous scaly annular plaques on crown, dry, no pus\n• Dx: Tinea Capitis (Fungal scalp infection)\n• Rx: Ketoconazole lotion 2% apply alternate days, Tab Fluconazole 150mg 1 tab weekly x 4 weeks\n• Adv: Keep scalp dry, avoid sharing towels or hair combs\n• Review in 1 month`
      );
    } else if (type === 'FEVER') {
      setPadText(
        `• C/o high fever and body ache since 4 days, mild sore throat\n• O/E: Febrile 101.2F, throat congested, bilateral chest clear\n• Dx: Acute Viral Pharyngitis with pyrexia\n• Rx: Tab Paracetamol 650mg TDS x 3 days, warm saline gargles twice daily\n• Adv: Maintain oral hydration with ORS and fresh fluids\n• Review in 5 days`
      );
    } else {
      setPadText(
        `• C/o mild morning headache, persistent elevated BP readings\n• O/E: BP 155/96 mmHg, HR 78 bpm, chest clear\n• Dx: Essential Hypertension Stage 2\n• Rx: Tab Telmisartan 40mg + Amlodipine 5mg OD morning\n• Adv: Reduce dietary salt, 30 min daily brisk walking\n• Review in 1 month`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + parseInt(followUpDays || '30', 10));

      const finalComplaints = chiefComplaints || (entryMode === 'PAD' ? padText : 'Routine examination');
      const finalAssessment = clinicianAssessment || (entryMode === 'PAD' ? 'Clinical evaluation' : 'General checkup');
      const finalPlan = treatmentPlan || (entryMode === 'PAD' ? 'Maintain hydration and review as scheduled.' : 'Standard follow-up');

      const newConsultation: LocalConsultation = {
        id: crypto.randomUUID(), // Client generated UUID for offline resilience
        patientId,
        consultationDate: new Date().toISOString(),
        chiefComplaints: finalComplaints,
        observations: observations || null,
        clinicianAssessment: finalAssessment,
        treatmentPlan: finalPlan,
        followUpDate: followUpDate.toISOString(),
        rawRxPadNotes: entryMode === 'PAD' ? padText : null,
        isOfflineCreated: !navigator.onLine,
        vitals:
          entryMode === 'STRUCTURED' || (systolicBP !== '' || bloodGlucose !== '')
            ? {
                systolicBP: systolicBP === '' ? null : Number(systolicBP),
                diastolicBP: diastolicBP === '' ? null : Number(diastolicBP),
                bloodGlucose: bloodGlucose === '' ? null : Number(bloodGlucose),
                glucoseContext: bloodGlucose !== '' ? glucoseContext : null,
                heartRate: heartRate === '' ? null : Number(heartRate),
                temperature: temperature === '' ? null : Number(temperature),
                oxygenSaturation: oxygenSaturation === '' ? null : Number(oxygenSaturation),
              }
            : undefined,
      };

      const result = await api.createConsultation(newConsultation);
      onCreated(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record consultation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="card-clinical w-full max-w-4xl p-6 bg-white shadow-2xl relative max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-clinical-700 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Clinical Encounter</h2>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-clinical-800">{patientName}</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEntryMode('PAD')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  entryMode === 'PAD'
                    ? 'bg-clinical-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Smart Rx Writepad</span>
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('STRUCTURED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  entryMode === 'STRUCTURED'
                    ? 'bg-clinical-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Structured Form</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* ========================================================
              MODE 1: SMART RX WRITEPAD (Natural Doctor Workflow)
             ======================================================== */}
          {entryMode === 'PAD' && (
            <div className="space-y-4">
              {/* Writepad Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold mr-1">Quick Stamps:</span>
                  <button
                    type="button"
                    onClick={() => appendStamp('• C/o')}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-clinical-50 hover:text-clinical-800"
                  >
                    + Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => appendStamp('• O/E:')}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-clinical-50 hover:text-clinical-800"
                  >
                    + Exam (O/E)
                  </button>
                  <button
                    type="button"
                    onClick={() => appendStamp('• Dx:')}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-clinical-50 hover:text-clinical-800"
                  >
                    + Diagnosis
                  </button>
                  <button
                    type="button"
                    onClick={() => appendStamp('• Rx:')}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-clinical-50 hover:text-clinical-800"
                  >
                    + Medicine
                  </button>
                  <button
                    type="button"
                    onClick={() => appendStamp('• Review in')}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-clinical-50 hover:text-clinical-800"
                  >
                    + Follow-up
                  </button>
                </div>

                {/* Voice Dictation Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-clinical-700 text-white hover:bg-clinical-800'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Stop & Commit Speech' : 'Dictate Note (Mic)'}</span>
                  </button>
                </div>
              </div>

              {/* Live Speech Recognition Bubble (Holds the phrase without duplicating words on the pad!) */}
              {isListening && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 shadow-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-600 animate-bounce flex-shrink-0" />
                    <span className="font-medium">
                      {interimVoiceText ? `Hearing: "${interimVoiceText}"` : 'Listening... Speak complete symptoms naturally'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] whitespace-nowrap ml-2 shadow-sm"
                  >
                    Done Speaking
                  </button>
                </div>
              )}

              {/* Demo 1-Click Fill Scenarios */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-mono text-slate-400">Quick Test Scenarios:</span>
                <button
                  type="button"
                  onClick={() => loadScenario('DERM')}
                  className="px-2 py-1 rounded bg-clinical-50 text-clinical-800 border border-clinical-200 hover:bg-clinical-100 font-medium text-[11px]"
                >
                  ✨ Skin / Hairfall Case
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario('FEVER')}
                  className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium text-[11px]"
                >
                  ✨ Acute Fever & URTI
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario('HYPERTENSION')}
                  className="px-2 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-medium text-[11px]"
                >
                  ✨ Chronic BP Follow-up
                </button>
              </div>

              {/* The Tactile Prescription Paper Pad */}
              <div className="relative rounded-xl border-2 border-slate-300 bg-[#FCFDFD] shadow-inner p-5 space-y-3">
                {/* Pad Header Watermark */}
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-clinical-900 italic">Rx</span>
                    <span className="text-slate-600 font-sans font-semibold">AarogyaTrack Clinical Slip</span>
                  </div>
                  <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                {/* Freeform Writing Area */}
                <textarea
                  rows={8}
                  value={padText}
                  onChange={(e) => setPadText(e.target.value)}
                  placeholder="Doctor's Rx Pad: Write or dictate freely here...
• C/o severe itching on scalp & hairfall x 3 weeks
• O/E: Erythematous scaly circular plaque on scalp, no pus
• Dx: Tinea Capitis (Fungal infection)
• Rx: Ketoconazole lotion 2% OD, Tab Fluconazole 150mg weekly
• Review in 1 month"
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm font-mono text-slate-800 placeholder-slate-400 leading-relaxed resize-y focus:outline-none"
                />
              </div>

              {/* Real-time Extracted Entities Card */}
              {padText.trim().length > 5 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-clinical-700" />
                      Live Extracted Clinical Passport (Auto-Analyzed)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Will save to patient record</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-0.5">
                        Chief Complaints
                      </span>
                      <p className="text-slate-900 font-medium">{chiefComplaints || 'Pending extraction...'}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-mono font-bold text-clinical-700 block mb-0.5">
                        Clinician Diagnosis (Assessment)
                      </span>
                      <p className="text-clinical-950 font-bold">{clinicianAssessment || 'Pending extraction...'}</p>
                    </div>

                    <div className="md:col-span-2 p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-0.5">
                        Prescription & Management Plan
                      </span>
                      <p className="text-slate-900 font-medium">{treatmentPlan || 'Pending extraction...'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              MODE 2: STRUCTURED VITALS FORM (Traditional Form)
             ======================================================== */}
          {entryMode === 'STRUCTURED' && (
            <div className="space-y-5">
              {/* Section 1: Objective Vitals */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    1. Objective Measurements (Vitals)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 138"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 88"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Blood Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 126"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 74"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SpO2 (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 98"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Temp (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-clinical-600"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Glucose Timing Context
                    </label>
                    <select
                      value={glucoseContext}
                      onChange={(e) => setGlucoseContext(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-clinical-600"
                    >
                      <option value="RANDOM">Random (RBS)</option>
                      <option value="FASTING">Fasting (FBS)</option>
                      <option value="POSTPRANDIAL">Post-Prandial (PPBS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical SOAP Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                  <Activity className="w-4 h-4 text-clinical-700" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    2. Clinician Assessment & Plan
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chief Complaints *
                    </label>
                    <input
                      type="text"
                      required
                      value={chiefComplaints}
                      onChange={(e) => setChiefComplaints(e.target.value)}
                      placeholder="e.g. Reports exertional breathlessness, evening ankle puffiness x 2 weeks"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Examination & Observations
                    </label>
                    <textarea
                      rows={2}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="e.g. Mild pedal edema (+), chest clear, S1/S2 heard, abdomen soft."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinician Assessment (Diagnosis) *
                      </label>
                      <input
                        type="text"
                        required
                        value={clinicianAssessment}
                        onChange={(e) => setClinicianAssessment(e.target.value)}
                        placeholder="e.g. Essential Hypertension Stage 2"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Follow-Up Schedule
                      </label>
                      <select
                        value={followUpDays}
                        onChange={(e) => setFollowUpDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600"
                      >
                        <option value="5">In 5 Days (Acute Follow-up)</option>
                        <option value="15">In 2 Weeks (Next Village Camp)</option>
                        <option value="30">In 1 Month (Standard Follow-up)</option>
                        <option value="90">In 3 Months (Quarterly Review)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Treatment Plan & Prescriptions *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      placeholder="e.g. Tab Telmisartan 40mg + Amlodipine 5mg OD morning."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-mono">
              {navigator.onLine ? '🟢 Online Sync Active' : '🟡 Saving to Offline Dexie Outbox'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (entryMode === 'PAD' && !padText.trim())}
                className="px-6 py-2 text-sm font-semibold bg-clinical-700 text-white hover:bg-clinical-800 rounded-lg shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Consultation Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
