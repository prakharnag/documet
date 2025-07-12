import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

export async function PUT(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { action, displayName, password } = await req.json();

    switch (action) {
      case 'updateProfile':
        if (!displayName) {
          return NextResponse.json({ error: 'Display name is required.' }, { status: 400 });
        }
        
        await user.update({ displayName });
        return NextResponse.json({ success: true, message: 'Profile updated successfully.' });

      case 'updatePassword':
        if (!password || password.length < 6) {
          return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }
        
        await user.update({ password });
        return NextResponse.json({ success: true, message: 'Password updated successfully.' });

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    await user.delete();
    return NextResponse.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account.' }, { status: 500 });
  }
}