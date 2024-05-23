import User, { UserRole } from "../db/models/user";
import { VerifyAuthChallengeResponseTriggerEvent } from "aws-lambda";
import connectDB from "../db";

export default async function verifyAuthChallenge(
  event: VerifyAuthChallengeResponseTriggerEvent,
  context: any,
) {
  console.log(
    `verifyAuthChallenge - Handling Cognito trigger VerifyAuthChallengeResponse_Authentication ${JSON.stringify(event)}`,
  );
  await connectDB();
  // Retrieve the user's answer and the correct answer from the private challenge parameters
  const userAnswer = event.request.challengeAnswer;
  const correctAnswer = event.request.privateChallengeParameters
    ? event.request.privateChallengeParameters.answer
    : "INVALID";

  // Verify the user's answer and save new user
  const isCorrectAnswer = userAnswer === correctAnswer;
  if (isCorrectAnswer) {
    const { sub, email } = event.request.userAttributes;
    try {
      const userFound = await User.findOne({ email });
      if (!userFound) {
        const newUser = new User({ sub, email, role: UserRole.USER });
        await newUser.save();
      }
    } catch (error) {
      console.error(error);
    }
  }
  event.response.answerCorrect = isCorrectAnswer;
  return event;
}
