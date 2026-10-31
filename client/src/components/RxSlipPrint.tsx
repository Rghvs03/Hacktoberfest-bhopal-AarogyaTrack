import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

interface RxSlipProps {
  consultation: {
    id: string;
    consultationDate: string | Date;
    chiefComplaints: string;
    clinicianAssessment: string;
    treatmentPlan: string;
    observations?: string;
    followUpSchedule?: string;
    rawRxPadNotes?: string;
    vitals?: Array<{
      systolicBP?: number;
      diastolicBP?: number;
      bloodGlucose?: number;
      heartRate?: number;
      oxygenSaturation?: number;
      temperature?: number;
      glucoseContext?: string;
    }>;
    doctor?: { name?: string };
  };
  patient: {
    fullName: string;
    patientCode: string;
    age?: number | null;
    gender: string;
    village?: string;
    medicalHistory?: string | null;
  };
}

export const RxSlipPrint: React.FC<RxSlipProps> = ({ consultation, patient }) => {
  const slipRef = useRef<HTMLDivElement>(null);

  const dateStr = new Date(consultation.consultationDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const v = consultation.vitals?.[0];
  const hasVitals = v && (v.systolicBP || v.bloodGlucose || v.heartRate);
  const doctorName = consultation.doctor?.name || 'Attending Physician';

  const handlePrint = () => {
    const slipHtml = slipRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank', 'width=794,height=1123');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Rx Slip — ${patient.patientCode} — ${dateStr}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      color: #1e293b;
      background: #fff;
      padding: 0;
    }

    .slip-page {
      width: 210mm;
      min-height: 148mm;
      max-width: 210mm;
      margin: 0 auto;
      padding: 18mm 20mm 14mm 20mm;
      background: #fff;
      position: relative;
    }

    /* Watermark */
    .slip-page::before {
      content: 'AarogyaTrack';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 72pt;
      color: rgba(13, 148, 136, 0.04);
      font-weight: 700;
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
    }

    .rx-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .rx-brand {
      display: flex;
      flex-direction: column;
    }

    .rx-brand-name {
      font-size: 18pt;
      font-weight: 700;
      color: #0d9488;
      letter-spacing: -0.5px;
      line-height: 1;
    }

    .rx-brand-sub {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 2px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .rx-meta {
      text-align: right;
      font-size: 8pt;
      color: #475569;
      line-height: 1.6;
    }

    .rx-meta strong {
      color: #1e293b;
    }

    /* Patient Info Band */
    .patient-band {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 20px;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 14px;
      font-size: 9pt;
    }

    .patient-band .label {
      color: #5eead4;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      display: block;
    }

    .patient-band .value {
      color: #1e293b;
      font-weight: 600;
      font-size: 10pt;
    }

    /* Vitals Row */
    .vitals-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
      padding: 8px 10px;
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    .vital-chip {
      font-size: 8.5pt;
      font-weight: 600;
      color: #0f766e;
      background: #fff;
      border: 1px solid #ccfbf1;
      border-radius: 4px;
      padding: 3px 8px;
    }

    /* Rx Symbol */
    .rx-symbol {
      font-family: 'IM Fell English', 'Times New Roman', serif;
      font-style: italic;
      font-size: 28pt;
      color: #0d9488;
      line-height: 1;
      margin-bottom: 6px;
    }

    /* Clinical Sections */
    .section {
      margin-bottom: 12px;
    }

    .section-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 3px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 2px;
    }

    .section-value {
      font-size: 10pt;
      color: #1e293b;
      line-height: 1.55;
    }

    .section.diagnosis .section-value {
      font-weight: 700;
      font-size: 11pt;
      color: #0f172a;
    }

    .section.treatment .section-value {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 10pt;
      line-height: 1.6;
    }

    /* Follow-up */
    .followup-box {
      margin-top: 14px;
      padding: 8px 12px;
      border: 1.5px dashed #0d9488;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
    }

    .followup-box .fu-label {
      color: #0f766e;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
    }

    .followup-box .fu-value {
      font-weight: 600;
      color: #1e293b;
    }

    /* Original Rx Pad section */
    .pad-section {
      margin-top: 12px;
      padding: 8px 10px;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      background: #fafafa;
    }

    .pad-section-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .pad-section pre {
      font-family: 'Courier New', monospace;
      font-size: 8.5pt;
      color: #475569;
      white-space: pre-wrap;
      line-height: 1.5;
    }

    /* Signature area */
    .signature-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .signature-block {
      text-align: center;
      min-width: 180px;
    }

    .sig-line {
      border-bottom: 1.5px solid #1e293b;
      width: 180px;
      margin-bottom: 4px;
    }

    .sig-name {
      font-size: 9pt;
      font-weight: 700;
      color: #1e293b;
    }

    .sig-role {
      font-size: 7.5pt;
      color: #64748b;
    }

    /* Footer Disclaimer */
    .rx-footer {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 7pt;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .slip-page { width: 100%; padding: 12mm 16mm 10mm 16mm; }
    }
  </style>
</head>
<body>
<div class="slip-page">
  <div class="rx-header">
    <div class="rx-brand">
      <div class="rx-brand-name">AarogyaTrack</div>
      <div class="rx-brand-sub">Rural Health Programme · Village Clinical Slip</div>
    </div>
    <div class="rx-meta">
      <div><strong>Date:</strong> ${dateStr}</div>
      <div><strong>Visit ID:</strong> ${consultation.id.slice(0, 8).toUpperCase()}</div>
      <div><strong>MRN:</strong> ${patient.patientCode}</div>
    </div>
  </div>

  <div class="patient-band">
    <div>
      <span class="label">Patient Name</span>
      <span class="value">${patient.fullName}</span>
    </div>
    <div>
      <span class="label">Village</span>
      <span class="value">${patient.village || '—'}</span>
    </div>
    <div>
      <span class="label">Age / Gender</span>
      <span class="value">${patient.age ? patient.age + ' yrs' : '—'} / ${patient.gender}</span>
    </div>
    <div>
      <span class="label">Known History</span>
      <span class="value">${patient.medicalHistory || 'None recorded'}</span>
    </div>
  </div>

  ${hasVitals ? `
  <div class="vitals-row">
    ${v?.systolicBP ? `<span class="vital-chip">BP: ${v.systolicBP}/${v.diastolicBP} mmHg</span>` : ''}
    ${v?.bloodGlucose ? `<span class="vital-chip">Glucose: ${v.bloodGlucose} mg/dL (${v.glucoseContext || 'RBS'})</span>` : ''}
    ${v?.heartRate ? `<span class="vital-chip">HR: ${v.heartRate} bpm</span>` : ''}
    ${v?.oxygenSaturation ? `<span class="vital-chip">SpO2: ${v.oxygenSaturation}%</span>` : ''}
    ${v?.temperature ? `<span class="vital-chip">Temp: ${v.temperature}°F</span>` : ''}
  </div>
  ` : ''}

  <div class="rx-symbol">℞</div>

  <div class="section">
    <div class="section-label">Chief Complaints</div>
    <div class="section-value">${consultation.chiefComplaints}</div>
  </div>

  ${consultation.observations ? `
  <div class="section">
    <div class="section-label">Clinical Examination &amp; Observations</div>
    <div class="section-value">${consultation.observations}</div>
  </div>
  ` : ''}

  <div class="section diagnosis">
    <div class="section-label">Diagnosis / Clinical Assessment</div>
    <div class="section-value">${consultation.clinicianAssessment}</div>
  </div>

  <div class="section treatment">
    <div class="section-label">Treatment Plan &amp; Prescription</div>
    <div class="section-value">${consultation.treatmentPlan}</div>
  </div>

  ${consultation.followUpSchedule ? `
  <div class="followup-box">
    <span class="fu-label">📅 Follow-up Scheduled</span>
    <span class="fu-value">${consultation.followUpSchedule}</span>
  </div>
  ` : ''}

  ${consultation.rawRxPadNotes ? `
  <div class="pad-section">
    <div class="pad-section-label">📝 Doctor's Original Rx Pad Note (Verbatim)</div>
    <pre>${consultation.rawRxPadNotes}</pre>
  </div>
  ` : ''}

  <div class="signature-row">
    <div class="signature-block">
      <div class="sig-line"></div>
      <div class="sig-name">${doctorName}</div>
      <div class="sig-role">Attending Physician · AarogyaTrack Camp</div>
    </div>
  </div>

  <div class="rx-footer">
    This clinical slip is generated by AarogyaTrack — Village Health Programme. It is an assistive record only and does not replace in-person medical consultation.<br />
    Patient ID: ${patient.patientCode} · Generated: ${new Date().toLocaleString('en-IN')} · For queries, contact your village health worker.
  </div>
</div>
<script>
  window.onload = function() {
    window.print();
    window.onfocus = function() { window.close(); };
  };
</script>
</body>
</html>
    `);

    printWindow.document.close();
  };

  return (
    <>
      {/* Hidden reference div — not actually used for printing, just for React render */}
      <div ref={slipRef} style={{ display: 'none' }} />
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200 transition-colors"
        title="Print / Export Rx Slip"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print Rx Slip</span>
      </button>
    </>
  );
};

