const fs = require('fs');
const content = `import 'server-only';
export const serverEnv = {
  REGION: "ap-south-2",
  ACCESS_KEY_ID: "${process.env.MY_AWS_ACCESS_KEY_ID || ''}",
  SECRET_ACCESS_KEY: "${process.env.MY_AWS_SECRET_ACCESS_KEY || ''}",
  DYNAMODB_TABLE: "wanderlynx-labs-prod-WanderlynxTableTable-zvdwmtau",
  META_TOKEN: "${process.env.WHATSAPP_ACCESS_TOKEN || ''}",
  META_BIZ_ID: "${process.env.WHATSAPP_BUSINESS_ID || ''}",
  META_PHONE_ID: "${process.env.WHATSAPP_PHONE_NUMBER_ID || ''}"
};`;
fs.writeFileSync('src/lib/server-env.ts', content);
console.log('✅ Secure server secrets injected.');
