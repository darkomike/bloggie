import { NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { emailService } from '@/lib/resend/email-service';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const q = query(
      collection(db, 'newsletter'),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Add to Firestore
    await addDoc(collection(db, 'newsletter'), {
      email,
      subscribedAt: Timestamp.now(),
      confirmed: true,
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(email);

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
