import 'server-only';
export const serverEnv = {
  REGION: process.env.DYNAMODB_REGION || process.env.AWS_REGION || "ap-south-2",
  ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID || "",
  SECRET_ACCESS_KEY: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE_NAME || "wanderlynx-labs-prod-WanderlynxTableTable-zvdwmtau",
  META_TOKEN: "",
  META_BIZ_ID: "",
  META_PHONE_ID: ""
};