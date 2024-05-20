import {SESClient, SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput} from "@aws-sdk/client-ses";

export const sendEmailMessage = async (recipientEmail: string, otpCode: string,) => {
  try {
    const sesClient = new SESClient({region: process.env.REGION!});
    console.log(`sendEmailMessage - received request to send the otp ${otpCode} to the email ${recipientEmail}`);
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Text: {
            Data: `Your code is ${otpCode}`
          }
        },
        Subject: {
          Data: "Verify your email address",
        },
      },
      Source: "aprendewebnodejs@gmail.com", // once we have the domain we can use any@<domain.com>
    };

    console.log(`sendEmailMessage - sending SendEmailCommand to send the email to ${recipientEmail}`);
    const command: SendEmailCommand = new SendEmailCommand(params);
    const response: SendEmailCommandOutput = await sesClient.send(command);
    console.log(`sendEmailMessage - Email verification sent to: ${recipientEmail} - messageId - ${response.MessageId}`);
    return response.MessageId
  } catch (error) {
    console.error("sendEmailMessage - An error occurred", error);
  }
}
