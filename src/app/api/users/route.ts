import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userId = uuidv4();
    await db.insert(users).values({ 
      id: userId, 
      name, 
      email, 
      password: hashedPassword 
    });
    
    return NextResponse.json({ 
      userId, 
      message: 'User created successfully.' 
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'User ID, current password, and new password are required.' }, { status: 400 });
    }
    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    // Check current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }
    // Update to new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, password } = await req.json();
    if (!userId || !password) {
      return NextResponse.json({ error: 'User ID and password are required.' }, { status: 400 });
    }
    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }
    // Delete user (cascades to resumes via DB schema)
    await db.delete(users).where(eq(users.id, userId));
    return NextResponse.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
} 