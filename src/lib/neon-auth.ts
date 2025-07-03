'use server';

import { neon } from '@neondatabase/serverless';

export async function getUserDetails(userId: string | undefined) {
  if (!process.env.NEON_DB_URL) {
    throw new Error('NEON_DB_URL is not set');
  }

  if (!userId) {
    return null;
  }

  const sql = neon(process.env.NEON_DB_URL!);
  const [user] = await sql`SELECT * FROM users WHERE id = ${userId};`;
  return user;
}

// For API routes that need to verify tokens
export async function verifyNeonToken(token: string | undefined) {
  if (!token) return null;
  
  try {
    return await getUserDetails(token);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
