import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = {
    AWS_REGION: !!process.env.MY_AWS_REGION,
    AWS_ACCESS_KEY_ID: !!process.env.MY_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.MY_AWS_SECRET_ACCESS_KEY,
    DYNAMODB_TABLE_NAME: !!process.env.WANDERLYNX_TABLE_NAME || !!process.env.DYNAMODB_TABLE_NAME, // Check both
    WHATSAPP_ACCESS_TOKEN: !!process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_BUSINESS_ID: !!process.env.WHATSAPP_BUSINESS_ID,
    WHATSAPP_PHONE_NUMBER_ID: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment_audit: envVars,
    message: "Diagnostic check complete. Presence (true/false) indicated for critical secrets."
  });
}
