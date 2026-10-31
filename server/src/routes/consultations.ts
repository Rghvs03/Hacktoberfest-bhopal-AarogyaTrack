import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const vitalSchema = z.object({
  systolicBP: z.number().nullable().optional(),
  diastolicBP: z.number().nullable().optional(),
  bloodGlucose: z.number().nullable().optional(),
  glucoseContext: z.enum(['FASTING', 'RANDOM', 'POSTPRANDIAL']).nullable().optional(),
  heartRate: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  oxygenSaturation: z.number().nullable().optional(),
});

const createConsultationSchema = z.object({
  id: z.string().uuid(), // Client-generated UUID for offline resilience
  patientId: z.string().uuid(),
  consultationDate: z.string().datetime().optional(),
  chiefComplaints: z.string().min(2),
  observations: z.string().nullable().optional(),
  clinicianAssessment: z.string().min(2),
  treatmentPlan: z.string().min(2),
  followUpDate: z.string().datetime().nullable().optional(),
  rawRxPadNotes: z.string().nullable().optional(),
  isOfflineCreated: z.boolean().optional().default(false),
  vitals: vitalSchema.optional(),
});

// Create consultation (supports online creation & sync)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createConsultationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation failed', details: parse.error.issues });
      return;
    }

    const { id, patientId, consultationDate, chiefComplaints, observations, clinicianAssessment, treatmentPlan, followUpDate, rawRxPadNotes, isOfflineCreated, vitals } = parse.data;

    // Check if consultation ID already exists (idempotency safety)
    const existing = await prisma.consultation.findUnique({ where: { id } });
    if (existing) {
      res.status(200).json({ message: 'Consultation already recorded.', consultation: existing });
      return;
    }

    const doctorId = req.user?.id || 'demo-doctor-id';

    const consultation = await prisma.consultation.create({
      data: {
        id,
        patientId,
        doctorId,
        consultationDate: consultationDate ? new Date(consultationDate) : new Date(),
        chiefComplaints,
        observations: observations || null,
        clinicianAssessment,
        treatmentPlan,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        rawRxPadNotes: rawRxPadNotes || null,
        isOfflineCreated: isOfflineCreated || false,
        vitals: vitals
          ? {
              create: {
                systolicBP: vitals.systolicBP || null,
                diastolicBP: vitals.diastolicBP || null,
                bloodGlucose: vitals.bloodGlucose || null,
                glucoseContext: vitals.glucoseContext || null,
                heartRate: vitals.heartRate || null,
                temperature: vitals.temperature || null,
                oxygenSaturation: vitals.oxygenSaturation || null,
              },
            }
          : undefined,
      },
      include: { vitals: true },
    });

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user?.id,
        action: 'CREATE_CONSULTATION',
        entityType: 'CONSULTATION',
        entityId: consultation.id,
      },
    }).catch(() => {});

    res.status(201).json(consultation);
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ error: 'Failed to record consultation.' });
  }
});

// Get all consultations for a patient
router.get('/patient/:patientId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { consultationDate: 'desc' },
      include: {
        doctor: { select: { name: true, role: true } },
        vitals: true,
      },
    });

    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to retrieve consultations.' });
  }
});

// Get formatted longitudinal vitals for charting
router.get('/patient/:patientId/vitals-timeline', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { consultationDate: 'asc' },
      select: {
        id: true,
        consultationDate: true,
        vitals: true,
      },
    });

    const timeline = consultations.map((c: any) => {
      const v = c.vitals[0];
      return {
        consultationId: c.id,
        date: new Date(c.consultationDate).toISOString().split('T')[0],
        systolicBP: v?.systolicBP ?? null,
        diastolicBP: v?.diastolicBP ?? null,
        bloodGlucose: v?.bloodGlucose ?? null,
        glucoseContext: v?.glucoseContext ?? null,
        heartRate: v?.heartRate ?? null,
        temperature: v?.temperature ?? null,
        oxygenSaturation: v?.oxygenSaturation ?? null,
      };
    });

    res.json(timeline);
  } catch (error) {
    console.error('Get vitals timeline error:', error);
    res.status(500).json({ error: 'Failed to retrieve longitudinal vitals.' });
  }
});

export default router;
