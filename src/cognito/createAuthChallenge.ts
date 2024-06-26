import { saveUserLogin } from "../services/userService";
import { sendEmailMessage } from "../services/emailService";
import connectDB from "../db";

export default async function createAuthChallenge(event: any, _context: any) {
  console.log(
    "createAuthChallenge - Handling Cognito trigger CreateAuthChallenge_Authentication",
  );
  await connectDB();
  if (
    !event.request.session ||
    event.request.session.length === 0 ||
    !event.request.session.find((challenge: any) => challenge.challengeResult)
  ) {
    // Generate a unique one-time code (OTC) for authentication
    const oneTimeCode = Math.random().toString(10).substr(2, 6);

    console.log(
      `createAuthChallenge - Will send email - new OTP Code ${oneTimeCode} for email ${event.request.userAttributes.email}`,
    );
    const messageId = await sendEmailMessage(
      event.request.userAttributes.email,
      oneTimeCode,
    );
    if (!messageId) {
      const errorMessage = `createAuthChallenge - error sending OTP Code ${oneTimeCode} for email ${event.request.userAttributes.email}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(
      `createAuthChallenge - Saving user login - OTP Code ${oneTimeCode} for email ${event.request.userAttributes.email}`,
    );

    await saveUserLogin(
      event.request.userAttributes.email,
      oneTimeCode,
      messageId,
    );

    console.log(
      `createAuthChallenge - Saved user login - OTP Code ${oneTimeCode} for email ${event.request.userAttributes.email}`,
    );

    // Set the challenge metadata so you can verify it later
    event.response.publicChallengeParameters = {
      // This information will be public to the client (e.g., the app calling Cognito)
      email: event.request.userAttributes.email,
    };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the VerifyAuthChallengeResponse trigger
    console.log(
      "createAuthChallenge - Storing privateChallengeParameters.answer",
    );
    event.response.privateChallengeParameters = {
      answer: oneTimeCode,
    };
  }

  console.log(
    "createAuthChallenge - Handled Cognito trigger CreateAuthChallenge_Authentication",
  );
  return event;
}
