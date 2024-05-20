export default async function verifyAuthChallenge(event: any, context: any) {
  console.log(`verifyAuthChallenge - Handling Cognito trigger VerifyAuthChallengeResponse_Authentication ${JSON.stringify(event)}`);

  // Retrieve the user's answer and the correct answer from the private challenge parameters
  const userAnswer = event.request.challengeAnswer;
  const correctAnswer = event.request.privateChallengeParameters ? event.request.privateChallengeParameters.answer : 'INVALID';

  // Verify the user's answer
  event.response.answerCorrect = userAnswer === correctAnswer;
  return event;
};
