import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'businessType'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const businessTypeLabels: Record<string, string> = {
      'full-service': 'Full Service Restaurant',
      'quick-service': 'Quick Service Restaurant',
      'bar-nightclub': 'Bar / Nightclub',
      'other': 'Other Business'
    };

    const businessTypeLabel = businessTypeLabels[formData.businessType] || formData.businessType;

    const emailContent = `
New Demo Request Received

CONTACT INFORMATION:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

BUSINESS INFORMATION:
Business Name: ${formData.businessName}
Business Type: ${businessTypeLabel}
${formData.monthlyRevenue ? `Monthly Revenue: ${formData.monthlyRevenue}\n` : ''}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

Action Required: Please contact this lead within 2 hours.
    `;

    console.log('='.repeat(60));
    console.log('NEW DEMO REQUEST RECEIVED');
    console.log('='.repeat(60));
    console.log(emailContent);
    console.log('='.repeat(60));

    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789_your_api_key_here') {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'Toast Capital Demo Requests <info@toastcapital.com>',
          to: 'info@toastcapital.com',
          subject: `🎯 NEW DEMO REQUEST: ${formData.firstName} ${formData.lastName} - ${formData.businessName}`,
          text: emailContent,
          replyTo: formData.email,
        });

        await resend.emails.send({
          from: 'Toast Capital <info@toastcapital.com>',
          to: formData.email,
          subject: `Welcome ${formData.firstName}! Your Toast Capital Demo Request`,
          text: `Hi ${formData.firstName},\n\nThank you for your interest in Toast Capital!\n\nWe've received your demo request for ${formData.businessName}. A funding specialist will reach out to you within 24 hours.\n\nQuestions? Call us at (305) 515-7319.\n\nBest regards,\nThe Toast Capital Team`,
        });
      }
    } catch (emailError: any) {
      console.error('Email error:', emailError?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully',
      requestId: `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    });
  } catch (error) {
    console.error('Error processing demo request:', error);
    return NextResponse.json(
      { error: 'Failed to process demo request. Please try again.' },
      { status: 500 }
    );
  }
}
