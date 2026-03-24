import { DynamoDBClient, ListTablesCommand, DescribeTableCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({
  region: "ap-south-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  },
});

async function run() {
  console.log("Checking DynamoDB for region: ap-south-2...");
  try {
    const list = await client.send(new ListTablesCommand({}));
    console.log("Tables found:", list.TableNames);

    const tableName = "WanderlynxTable";
    if (list.TableNames?.includes(tableName)) {
      console.log(`Verifying table: ${tableName}...`);
      const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log("Table Status:", desc.Table?.TableStatus);
      
      const scan = await client.send(new ScanCommand({ TableName: tableName, Limit: 10 }));
      console.log("Sample items (count):", scan.Items?.length);
    } else {
      console.error(`Error: Table ${tableName} NOT FOUND in list.`);
    }
  } catch (err: any) {
    console.error("AWS Error:", err.message);
    if (err.name === 'UnrecognizedClientException') {
      console.error("Invalid Credentials!");
    }
  }
}

run();
