import { DynamoDBClient, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand as DocScan, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.MY_AWS_REGION || "ap-south-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "WanderlynxTable";
const DEFAULT_TENANT = "pavansrinivas64@gmail.com";

async function patchData() {
  console.log(`Starting 302 Patch for Table: ${TABLE_NAME}...`);
  try {
    let lastKey = undefined;
    let count = 0;

    do {
      const scan: any = await docClient.send(new DocScan({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey
      }));

      for (const item of scan.Items || []) {
        if (!item.tenant_id) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { pk: item.pk, sk: item.sk },
            UpdateExpression: "set tenant_id = :t",
            ExpressionAttributeValues: { ":t": DEFAULT_TENANT }
          }));
          count++;
        }
      }

      lastKey = scan.LastEvaluatedKey;
    } while (lastKey);

    console.log(`Successfully patched ${count} items with tenant_id: ${DEFAULT_TENANT}`);
  } catch (error: any) {
    console.error("Migration Error:", error.message);
  }
}

patchData();
