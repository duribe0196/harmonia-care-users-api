import {DynamoDBClient, PutItemCommand, PutItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {getSecrets} from "../secrets";

export const saveEmailOTP = async (email: string, otpCode: string, messageId: string) => {
  try {
    const client: DynamoDBClient = new DynamoDBClient({region: process.env.REGION!});
    console.log(`saveEmailOTP - received request to save otp ${otpCode} for email ${email}`);
    const {DYNAMODB_SECRET_NAME, REGION} = process.env;
    if (!DYNAMODB_SECRET_NAME || !REGION) {
      const errorMessage = "saveEmailOTP - Missing environment variables for DynamoDB configuration.";
      console.error(errorMessage);
      return;
    }
    const dynamodbSecrets = await getSecrets({secretName: DYNAMODB_SECRET_NAME, region: REGION});
    const createdAt = new Date().toISOString();

    const command: PutItemCommand = new PutItemCommand({
      TableName: dynamodbSecrets["otpCodesTableName"],
      Item: {
        email: {S: email},
        OTPCode: {S: otpCode},
        messageId: {S: messageId},
        createdAt: {S: createdAt},
      }
    });

    console.log(`saveEmailOTP - PutItemCommand for OTP ${otpCode} into dynamoDB for email ${email}`);
    const result: PutItemCommandOutput = await client.send(command);
    console.log(`saveEmailOTP - Successfully saved the OTP ${otpCode} for email ${email}`);
    return result;
  } catch (error) {
    const errorMessage = `saveEmailOTP - Error saving OTP for email ${email}: ${(error as any).message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
