import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const createPatientSchema = z.object({
  fullName: z.string().min(2),
  age: z.number().int().positive().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  village: z.string().min(2),
  contactNumber: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
});

// List and search patients
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;

    const whereClause: any = {};
    if (query && query.trim() !== '') {
      const q = query.trim();
      whereClause.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { patientCode: { contains: q, mode: 'insensitive' } },
        { village: { contains: q, mode: 'insensitive' } },
      ];
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { consultations: true } },
        consultations: {
          orderBy: { consultationDate: 'desc' },
          take: 1,
          select: { consultationDate: true },
        },
      },
    });

    res.json(
      patients.map((p: any) => ({
        ...p,
        consultationCount: p._count.consultations,
        latestVisitDate: p.consultations[0]?.consultationDate || null,
      }))
    );
  } catch (error) {
    console.error('Fetch patients error:', error);
    res.status(500).json({ error: 'Failed to retrieve patient registry.' });
  }
});

// Register new patient
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createPatientSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation failed', details: parse.error.issues });
      return;
    }

    // Auto-generate unique human-readable code: AAR-2026-XXXX
    const count = await prisma.patient.count();
    const patientCode = `AAR-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        ...parse.data,
        patientCode,
        createdBy: req.user?.id,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user?.id,
        action: 'CREATE_PATIENT',
        entityType: 'PATIENT',
        entityId: patient.id,
      },
    }).catch(() => {});

    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to register patient.' });
  }
});

// Get patient details by ID
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        consultations: {
          orderBy: { consultationDate: 'desc' },
          include: { vitals: true },
        },
        aiSummaries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to retrieve patient details.' });
  }
});

// Update patient
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient information.' });
  }
});

export default router;
