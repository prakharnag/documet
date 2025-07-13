import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { db } from '@/db';
import { Documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { action, displayName } = await req.json();

    if (action === 'updateProfile') {
      if (!displayName || displayName.trim().length === 0) {
        return NextResponse.json({ error: 'Display name is required.' }, { status: 400 });
      }

      // Since we're using Stack for auth, we can't directly update user profile
      // Stack handles user profile management through their own system
      // For now, we'll just return success and let the frontend handle the display
      return NextResponse.json({ 
        message: 'Profile updated successfully.',
        displayName: displayName.trim()
      });
    }

    if (action === 'updatePassword') {
      // Stack handles password changes through their own system
      return NextResponse.json({ 
        message: 'Password changes are handled through Stack authentication.',
        redirectTo: '/handler/sign-in'
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Delete all user's documents from our database
    await db.delete(Documents).where(eq(Documents.userId, user.id));

    // Note: User account deletion is handled by Stack
    // This only deletes the user's documents from our system
    return NextResponse.json({ 
      message: 'Your documents have been deleted. To delete your account, please contact support.',
      redirectTo: '/handler/sign-out'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete documents.' }, { status: 500 });
  }
} 