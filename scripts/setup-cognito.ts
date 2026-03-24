import { CognitoIdentityProviderClient, ListUserPoolsCommand, CreateUserPoolCommand, CreateUserPoolClientCommand, CreateGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import * as dotenv from "dotenv";
dotenv.config();

const client = new CognitoIdentityProviderClient({
  region: process.env.MY_AWS_REGION || "ap-south-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  },
});

async function setupCognito() {
  console.log("Checking Cognito for: WanderlynxUserPool...");
  try {
    const list = await client.send(new ListUserPoolsCommand({ MaxResults: 10 }));
    let userPool = list.UserPools?.find(up => up.Name === "WanderlynxUserPool");

    if (!userPool) {
      console.log("Creating WanderlynxUserPool...");
      const createRes = await client.send(new CreateUserPoolCommand({ 
        PoolName: "WanderlynxUserPool",
        UsernameAttributes: ["email"],
        AutoVerifiedAttributes: ["email"]
      }));
      userPool = createRes.UserPool;
    }

    console.log("User Pool ID:", userPool?.Id);

    // Ensure Groups exist
    const groups = ["Admins", "Organizers"];
    for (const group of groups) {
       try {
         await client.send(new CreateGroupCommand({ UserPoolId: userPool?.Id || "", GroupName: group }));
         console.log(`Created group: ${group}`);
       } catch (e: any) {
         if (e.name === 'GroupExistsException') {
            console.log(`Group already exists: ${group}`);
         } else {
            console.error(`Error creating group ${group}:`, e.message);
         }
       }
    }

    // Create Client
    const clientRes = await client.send(new CreateUserPoolClientCommand({
      UserPoolId: userPool?.Id || "",
      ClientName: "WanderlynxWebClient",
      ExplicitAuthFlows: ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH"]
    }));
    console.log("Client ID:", clientRes.UserPoolClient?.ClientId);

  } catch (err: any) {
    console.error("Cognito Error:", err.message);
  }
}

setupCognito();
