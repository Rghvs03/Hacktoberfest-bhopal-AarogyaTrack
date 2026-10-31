import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/aiService';

const router = Router();

// Generate Longitudinal Patient Summary (Google Gemini)
router.post('/patients/:patientId/summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        consultations: {
          orderBy: { consultationDate: 'asc' },
          include: { vitals: true },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    if (patient.consultations.length === 0) {
      res.status(400).json({ error: 'Cannot generate longitudinal summary: No prior consultations recorded for this patient.' });
      return;
    }

    // Call Google Gemini
    const summaryData = await AIService.generateGeminiPatientSummary(patient, patient.consultations);

    // Save record with PENDING_REVIEW state
    const saved = await prisma.aISummary.create({
      data: {
        patientId: patient.id,
        generatedBy: 'GOOGLE_GEMINI',
        modelName: 'gemini-1.5-flash',
        overview: summaryData.overview,
        recordedConditions: JSON.stringify(summaryData.recordedConditions),
        measurementTrends: JSON.stringify(summaryData.measurementTrends),
        missingInformation: JSON.stringify(summaryData.missingInformation),
        clinicianReviewItems: JSON.stringify(summaryData.clinicianReviewItems),
        sourceConsultationIds: JSON.stringify(summaryData.sourceConsultationIds),
        reviewStatus: 'PENDING_REVIEW',
      },
    });

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user?.id,
        action: 'AI_SUMMARY_GENERATE',
        entityType: 'AI_SUMMARY',
        entityId: saved.id,
      },
    }).catch(() => {});

    res.json({
      summaryId: saved.id,
      ...summaryData,
      reviewStatus: saved.reviewStatus,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: 'Failed to generate longitudinal AI summary.' });
  }
});

// Real-Time Visit Structuring (Groq)
router.post('/structure-visit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rawNotes, vitalsText } = req.body;
    if (!rawNotes || typeof rawNotes !== 'string') {
      res.status(400).json({ error: 'Raw doctor notes required.' });
      return;
    }

    const structured = await AIService.structureVisitWithGroq(rawNotes, vitalsText);
    res.json(structured);
  } catch (error) {
    console.error('Structure visit error:', error);
    res.status(500).json({ error: 'Failed to structure visit notes.' });
  }
});

// Clinician Review & Sign-off on Summary
router.patch('/summaries/:summaryId/review', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { summaryId } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: "Invalid status. Must be 'APPROVED' or 'REJECTED'." });
      return;
    }

    const updated = await prisma.aISummary.update({
      where: { id: summaryId },
      data: {
        reviewStatus: status,
        reviewedBy: req.user?.name || req.user?.email,
        reviewedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Review summary error:', error);
    res.status(500).json({ error: 'Failed to record clinician review.' });
  }
});

export default router;

