import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db, users, User } from '@/lib/db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'member';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify the payload has the expected properties
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'admin' && payload.role !== 'member')
    ) {
      console.error('Invalid token payload structure');
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as ('admin' | 'member')
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user || null;
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  await cookieStore.delete('auth-token');
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

// Require auth middleware helper
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Require admin middleware helper
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
