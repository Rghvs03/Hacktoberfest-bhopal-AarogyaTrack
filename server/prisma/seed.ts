import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AarogyaTrack demo database with synthetic records...');

  // 1. Create Demo Doctor
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.sharma@aarogya.in' },
    update: {},
    create: {
      email: 'dr.sharma@aarogya.in',
      name: 'Dr. Priya Sharma, MD',
      passwordHash: doctorPassword,
      role: 'DOCTOR',
    },
  });

  console.log(`👨‍⚕️ Demo Doctor: ${doctor.name} (${doctor.email})`);

  // 2. Patient 1: Ramesh Kumar (Longitudinal Hypertension Trajectory)
  const patient1 = await prisma.patient.upsert({
    where: { patientCode: 'AAR-2026-001' },
    update: {},
    create: {
      patientCode: 'AAR-2026-001',
      fullName: 'Ramesh Kumar',
      age: 58,
      gender: 'MALE',
      village: 'Rampur Kalan',
      contactNumber: '+91 98260 11234',
      medicalHistory: 'Primary Essential Hypertension (diagnosed 2023), Mild Dyslipidemia',
      allergies: 'No known drug allergies (NKDA)',
      createdBy: doctor.id,
    },
  });

  // Consultations for Ramesh Kumar (3 Visits spaced out)
  const visit1Date = new Date();
  visit1Date.setMonth(visit1Date.getMonth() - 5);

  const visit2Date = new Date();
  visit2Date.setMonth(visit2Date.getMonth() - 3);

  const visit3Date = new Date();
  visit3Date.setMonth(visit3Date.getMonth() - 1);

  // Visit 1
  await prisma.consultation.upsert({
    where: { id: 'c1111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: 'c1111111-1111-1111-1111-111111111111',
      patientId: patient1.id,
      doctorId: doctor.id,
      consultationDate: visit1Date,
      chiefComplaints: 'Routine bi-annual screening at mobile village health camp. Mild evening fatigue.',
      observations: 'Chest clear bilaterally, S1/S2 normal, no peripheral edema. Pulse regular.',
      clinicianAssessment: 'Stage 1 Essential Hypertension under initial lifestyle modification.',
      treatmentPlan: 'Tab Telmisartan 40mg OD morning. Dietary sodium reduction, daily 30m brisk walking.',
      followUpDate: visit2Date,
      vitals: {
        create: {
          systolicBP: 132,
          diastolicBP: 84,
          bloodGlucose: 108,
          glucoseContext: 'FASTING',
          heartRate: 72,
          temperature: 98.4,
          oxygenSaturation: 98,
        },
      },
    },
  });

  // Visit 2
  await prisma.consultation.upsert({
    where: { id: 'c2222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: 'c2222222-2222-2222-2222-222222222222',
      patientId: patient1.id,
      doctorId: doctor.id,
      consultationDate: visit2Date,
      chiefComplaints: 'Follow-up visit. Reports occasional morning headaches and visual tiredness.',
      observations: 'No pedal edema. Fundus normal. Patient admitted to skipping medication on alternate weeks.',
      clinicianAssessment: 'Sub-optimally controlled hypertension with medication non-adherence.',
      treatmentPlan: 'Reinforced compliance importance. Continue Telmisartan 40mg OD. Pill box reminder advised.',
      followUpDate: visit3Date,
      vitals: {
        create: {
          systolicBP: 142,
          diastolicBP: 90,
          bloodGlucose: 122,
          glucoseContext: 'RANDOM',
          heartRate: 76,
          temperature: 98.6,
          oxygenSaturation: 97,
        },
      },
    },
  });

  // Visit 3
  await prisma.consultation.upsert({
    where: { id: 'c3333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: 'c3333333-3333-3333-3333-333333333333',
      patientId: patient1.id,
      doctorId: doctor.id,
      consultationDate: visit3Date,
      chiefComplaints: 'Occasional exertional breathlessness on carrying farm loads. Persistent borderline BP readings.',
      observations: 'Mild bilateral ankle puffiness. Heart sounds normal.',
      clinicianAssessment: 'Hypertension Stage 2 — Escalation of pharmacological therapy indicated.',
      treatmentPlan: 'Add Tab Amlodipine 5mg OD with Telmisartan 40mg. Advise fasting lipid and kidney function profile at district hospital.',
      followUpDate: new Date(),
      vitals: {
        create: {
          systolicBP: 150,
          diastolicBP: 94,
          bloodGlucose: 135,
          glucoseContext: 'RANDOM',
          heartRate: 82,
          temperature: 98.5,
          oxygenSaturation: 97,
        },
      },
    },
  });

  // 3. Patient 2: Sunita Devi (Type 2 Diabetes)
  await prisma.patient.upsert({
    where: { patientCode: 'AAR-2026-002' },
    update: {},
    create: {
      patientCode: 'AAR-2026-002',
      fullName: 'Sunita Devi',
      age: 46,
      gender: 'FEMALE',
      village: 'Pipariya',
      contactNumber: '+91 97550 44521',
      medicalHistory: 'Type 2 Diabetes Mellitus (detected 2024)',
      allergies: 'Sulfa drugs (rash)',
      createdBy: doctor.id,
    },
  });

  // 4. Patient 3: Aarav Sharma (Pediatric Bronchitis)
  await prisma.patient.upsert({
    where: { patientCode: 'AAR-2026-003' },
    update: {},
    create: {
      patientCode: 'AAR-2026-003',
      fullName: 'Aarav Sharma',
      age: 11,
      gender: 'MALE',
      village: 'Sehore Camp',
      medicalHistory: 'Seasonal allergic bronchitis',
      allergies: 'None',
      createdBy: doctor.id,
    },
  });

  console.log('✅ Demo database seeded successfully with 3 patients and longitudinal consultations.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

