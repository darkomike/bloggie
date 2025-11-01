import { NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { emailService } from '@/lib/resend/email-service';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save to Firestore via contactService
    const contactService = (await import('@/lib/firebase/contact-service')).default;
    const contact = await contactService.createContact({
      name,
      email,
      message: `${subject}\n${message}`,
    });
    if (!contact) {
      return NextResponse.json(
        { error: 'Failed to save contact message.' },
        { status: 500 }
      );
    }

    // Send notification to admin
    await emailService.sendContactFormNotification({
      name,
      email,
      subject,
      message,
    });

    // Send auto-reply to user
    await emailService.sendContactFormAutoReply(email, name);

    return NextResponse.json({
      message: 'Thank you for your message. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
