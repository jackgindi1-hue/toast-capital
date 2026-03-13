// SMS utility using Twilio
// To use: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to Netlify env vars

interface SMSOptions {
  to: string;
  message: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Format phone number to E.164 format (required by Twilio)
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export async function sendSMS({ to, message }: SMSOptions): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('⚠️ Twilio not configured - SMS not sent');
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const formattedTo = formatPhoneNumber(to);
    console.log(`📱 Sending SMS to ${formattedTo}...`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ SMS sent! SID: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } else {
      console.error(`❌ SMS failed:`, result.message);
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

export const smsTemplates = {
  newApplicationToTeam: (name: string, businessName: string, amount: string, phone: string) =>
    `NEW APPLICATION RECEIVED\n${name} from ${businessName}\nRequested: ${amount}\nPhone: ${phone}\nReview and follow up ASAP!`,
  
  newApplicationToApplicant: (firstName: string, businessName: string) =>
    `Hi ${firstName}! Thank you for applying with Toast Capital.\nWe've received your application for ${businessName} and a funding specialist will review it shortly.\nNEXT STEP: Please upload your last 3 months of business bank statements to complete your application.\nUpload here: https://toastcapital.com/upload\nQuestions? Call us: (305) 515-7319`,
  
  bankStatementsToTeam: (name: string, businessName: string, fileCount: number) =>
    `BANK STATEMENTS RECEIVED\n${name} from ${businessName} uploaded ${fileCount} bank statement${fileCount > 1 ? 's' : ''}.\nDocuments ready for review!`,
  
  bankStatementsToApplicant: (firstName: string) =>
    `Hi ${firstName}! We've received your bank statements - thank you!\nFINAL STEP: Please complete identity verification to finalize your application. This quick and secure process only takes a few minutes.\nComplete verification here: https://toastcapital.com/dlvc\nQuestions? Call us: (305) 515-7319`,
  
  dlvcToTeam: (name: string, businessName: string) =>
    `APPLICATION COMPLETE\n${name} from ${businessName} has completed all steps:\n- Application submitted\n- Bank statements uploaded\n- Identity verification complete\nReady for final review and funding decision!`,
  
  dlvcToApplicant: (firstName: string) =>
    `Hi ${firstName}! Congratulations - your application is complete!\nWe've received all your documents:\n- Application\n- Bank statements\n- Identity verification\nA funding specialist will contact you shortly to discuss your personalized funding options.\nThank you for choosing Toast Capital!\nQuestions? Call us: (305) 515-7319`,
};
