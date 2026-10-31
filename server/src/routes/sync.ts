import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const syncBatchSchema = z.object({
  operations: z.array(
    z.object({
      clientOperationId: z.string().uuid(),
      entityType: z.literal('CONSULTATION'),
      payload: z.object({
        id: z.string().uuid(),
        patientId: z.string().uuid(),
        consultationDate: z.string().datetime().optional(),
        chiefComplaints: z.string(),
        observations: z.string().nullable().optional(),
        clinicianAssessment: z.string(),
        treatmentPlan: z.string(),
        followUpDate: z.string().datetime().nullable().optional(),
        rawRxPadNotes: z.string().nullable().optional(),
        vitals: z.any().optional(),
      }),
    })
  ),
});

// Process offline batch sync
router.post('/batch', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = syncBatchSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Sync payload malformed', details: parse.error.issues });
      return;
    }

    const { operations } = parse.data;
    const results: Array<{ clientOperationId: string; status: 'SUCCESS' | 'ALREADY_EXISTS' | 'FAILED'; error?: string }> = [];

    for (const op of operations) {
      // 1. Check idempotency log
      const existingOp = await prisma.syncOperation.findUnique({
        where: { clientOperationId: op.clientOperationId },
      });

      if (existingOp && existingOp.status === 'SUCCESS') {
        results.push({ clientOperationId: op.clientOperationId, status: 'ALREADY_EXISTS' });
        continue;
      }

      try {
        const { id, patientId, consultationDate, chiefComplaints, observations, clinicianAssessment, treatmentPlan, followUpDate, rawRxPadNotes, vitals } = op.payload;

        // Check if consultation is already saved
        const existingConsultation = await prisma.consultation.findUnique({ where: { id } });
        if (!existingConsultation) {
          await prisma.consultation.create({
            data: {
              id,
              patientId,
              doctorId: req.user?.id || 'offline-sync-doctor',
              consultationDate: consultationDate ? new Date(consultationDate) : new Date(),
              chiefComplaints,
              observations: observations || null,
              clinicianAssessment,
              treatmentPlan,
              followUpDate: followUpDate ? new Date(followUpDate) : null,
              rawRxPadNotes: rawRxPadNotes || null,
              isOfflineCreated: true,
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
          });
        }

        // Record successful sync operation
        await prisma.syncOperation.upsert({
          where: { clientOperationId: op.clientOperationId },
          create: {
            clientOperationId: op.clientOperationId,
            userId: req.user?.id || 'unknown',
            entityType: op.entityType,
            entityId: op.payload.id,
            operation: 'CREATE',
            status: 'SUCCESS',
            processedAt: new Date(),
          },
          update: {
            status: 'SUCCESS',
            processedAt: new Date(),
          },
        });

        results.push({ clientOperationId: op.clientOperationId, status: 'SUCCESS' });
      } catch (itemErr: any) {
        console.error(`Sync error on operation ${op.clientOperationId}:`, itemErr);
        await prisma.syncOperation.upsert({
          where: { clientOperationId: op.clientOperationId },
          create: {
            clientOperationId: op.clientOperationId,
            userId: req.user?.id || 'unknown',
            entityType: op.entityType,
            entityId: op.payload.id,
            operation: 'CREATE',
            status: 'FAILED',
            errorMessage: itemErr.message,
            processedAt: new Date(),
          },
          update: {
            status: 'FAILED',
            errorMessage: itemErr.message,
            processedAt: new Date(),
          },
        });
        results.push({ clientOperationId: op.clientOperationId, status: 'FAILED', error: itemErr.message });
      }
    }

    res.json({
      message: 'Batch synchronization processed.',
      totalReceived: operations.length,
      successCount: results.filter((r) => r.status === 'SUCCESS' || r.status === 'ALREADY_EXISTS').length,
      results,
    });
  } catch (error) {
    console.error('Batch sync endpoint failure:', error);
    res.status(500).json({ error: 'Failed to process sync queue.' });
  }
});

export default router;

