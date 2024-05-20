
export default function defineAuthChallenge(event: any, context: any) {
  console.log('defineAuthChallenge - Handling Cognito trigger DefineAuthChallenge_Authentication');
  // Handle define auth challenge logic here
  if (event.request.session.length === 0 || event.request.session.find((challenge: any) => challenge.challengeName === "CUSTOM_CHALLENGE" && !challenge.challengeResult)) {
    // Start the challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  } else if (event.request.session.find((challenge: any) => challenge.challengeName === "CUSTOM_CHALLENGE" && challenge.challengeResult)) {
    // Complete the challenge successfully
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    // Fail the challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }
  console.log('defineAuthChallenge - Handled Cognito trigger DefineAuthChallenge_Authentication');
  return event
}
