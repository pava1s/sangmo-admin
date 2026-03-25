import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { serverEnv } from '@/lib/server-env';

export async function GET() {
  const envVars = {
    MY_AWS_REGION: !!serverEnv.REGION,
    MY_AWS_ACCESS_KEY_ID: !!serverEnv.ACCESS_KEY_ID,
    MY_AWS_SECRET_ACCESS_KEY: !!serverEnv.SECRET_ACCESS_KEY,
    DYNAMODB_TABLE_NAME: !!serverEnv.DYNAMODB_TABLE,
    WHATSAPP_ACCESS_TOKEN: !!serverEnv.META_TOKEN,
    WHATSAPP_BUSINESS_ID: !!serverEnv.META_BIZ_ID,
    WHATSAPP_PHONE_NUMBER_ID: !!serverEnv.META_PHONE_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment_audit: envVars,
    message: "Diagnostic check complete. Presence (true/false) indicated for critical secrets."
  });
}
