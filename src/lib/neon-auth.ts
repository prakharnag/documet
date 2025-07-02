'use server';

import { neon } from '@neondatabase/serverless';

export async function getUserDetails(userId: string | undefined) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!userId) {
    return null;
  }

  const sql = neon(process.env.DATABASE_URL!);
  const [user] = await sql`SELECT * FROM neon_auth.users_sync WHERE id = ${userId};`;
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
