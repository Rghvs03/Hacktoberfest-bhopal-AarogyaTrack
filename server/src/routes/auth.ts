import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { config } from '../config';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['DOCTOR', 'NURSE', 'ADMIN']).optional().default('DOCTOR'),
});

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid input', details: parse.error.issues });
      return;
    }

    const { email, password } = parse.data;
    let user = await prisma.user.findUnique({ where: { email } });

    // Auto-create demo doctor if not present for seamless hackathon testing
    if (!user && (email === 'dr.sharma@aarogya.in' || email === 'demo@aarogya.in')) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: email.startsWith('dr') ? 'Dr. Priya Sharma, MD' : 'Dr. Aarav Patel',
          passwordHash,
          role: 'DOCTOR',
        },
      });
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
      },
    }).catch(() => {});

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// Register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation failed', details: parse.error.issues });
      return;
    }

    const { email, name, password, role } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Current User Me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user?.id) {
    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user.id,
        action: 'LOGOUT',
        entityType: 'USER',
        entityId: req.user.id,
      },
    }).catch(() => {});
  }
  res.json({ message: 'Signed out successfully.' });
});

export default router;

