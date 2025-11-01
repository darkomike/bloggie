import { NextResponse } from 'next/server';

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

    // Check if already subscribed and add via newsletterService
    const newsletterService = (await import('@/lib/firebase/newsletter-service')).default;
    const allSubscribers = await newsletterService.getAllSubscribers();
    if (allSubscribers.some(sub => sub.email === email)) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }
    const subscriber = await newsletterService.subscribe(email);
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Failed to subscribe.' },
        { status: 500 }
      );
    }

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
