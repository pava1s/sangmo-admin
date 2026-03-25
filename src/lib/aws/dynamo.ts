import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  },
  maxAttempts: 3
});

export const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "WanderlynxTable";

export const putItem = (item: any) => docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
export const getItem = (pk: string, sk: string) => docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { pk, sk } }));

export const queryByPk = (pk: string) => docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": pk }
}));

export const queryGSI1 = (gsi1pk: string) => docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "gsi1pk = :gsi1pk",
    ExpressionAttributeValues: { ":gsi1pk": gsi1pk }
}));

export const deleteItem = (pk: string, sk: string) => docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { pk, sk } }));

export const scanTable = () => docClient.send(new ScanCommand({ TableName: TABLE_NAME }));

export const updateTenantId = (pk: string, sk: string, tenantId: string) => docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { pk, sk },
    UpdateExpression: "SET tenant_id = :tid",
    ExpressionAttributeValues: { ":tid": tenantId }
}));
