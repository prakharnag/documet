import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Waitlist } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source = 'landing_page' } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(Waitlist)
      .where(eq(Waitlist.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered for waitlist' },
        { status: 409 }
      );
    }

    // Insert new waitlist entry
    const [newEntry] = await db
      .insert(Waitlist)
      .values({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        source,
      })
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully joined the waitlist!',
        data: {
          id: newEntry.id,
          email: newEntry.email,
          createdAt: newEntry.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const waitlist = await db
      .select()
      .from(Waitlist)
      .where(eq(Waitlist.isActive, true))
      .orderBy(Waitlist.createdAt);

    return NextResponse.json(
      { 
        success: true, 
        count: waitlist.length,
        data: waitlist 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist data.' },
      { status: 500 }
    );
  }
} 