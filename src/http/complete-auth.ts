import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import { getSecrets } from "../secrets";
import {ChallengeNameType} from "@aws-sdk/client-cognito-identity-provider";


export default async function (username: string, otp: string, session: string, _context: any) {
  console.log(`complete-auth - Received request to RespondToAuthChallengeCommandInput request for ${username}, answer is ${otp}`);
  const {COGNITO_SECRET_NAME, REGION} = process.env;
  const cognitoSecrets = await getSecrets({secretName: COGNITO_SECRET_NAME!, region: REGION!});
  const client = new CognitoIdentityProviderClient({region: REGION!});

  const respondAuthChallengeParams: RespondToAuthChallengeCommandInput = {
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: session,
    ClientId: cognitoSecrets["userPoolClientId"],
    ChallengeResponses: {
      "USERNAME": username, "ANSWER": otp
    }
  };

  try {
    console.log(`complete-auth - Sending RespondToAuthChallengeCommandInput request for ${username}, answer is ${otp}`);
    const response = await client.send(new RespondToAuthChallengeCommand(respondAuthChallengeParams));
    console.log(`complete-auth - Authentication challenge responded for email ${username}, ${response.AuthenticationResult}`);
    if (response.AuthenticationResult) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          accessToken: response.AuthenticationResult.AccessToken,
          idToken: response.AuthenticationResult.IdToken,
          refreshToken: response.AuthenticationResult.RefreshToken,
          expiresIn: response.AuthenticationResult.ExpiresIn,
          tokenType: response.AuthenticationResult.TokenType
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Authentication failed or challenge not yet completed."}),
      };
    }
  } catch (error: any) {
    console.log(
      `complete-auth - Something went wrong trying to respond challenge for username ${username}`
    );
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: error.message}),
    };
  }
}
