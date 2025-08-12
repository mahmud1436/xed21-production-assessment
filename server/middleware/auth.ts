import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { users, adminUsers } from '@shared/schema';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    coins?: number;
  };
}

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authenticateAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Admin access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
}

export function generateUserToken(user: { id: string; email: string; name: string; coins: number }) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
    coins: user.coins,
    type: 'user'
  }, JWT_SECRET, { expiresIn: '7d' });
}

export function generateAdminToken(admin: { id: string; email: string }) {
  return jwt.sign({
    id: admin.id,
    email: admin.email,
    type: 'admin'
  }, JWT_SECRET, { expiresIn: '7d' });
}