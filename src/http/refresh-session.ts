import {getSecrets} from "../secrets";
import {
  AuthFlowType,
  CognitoIdentityProviderClient, InitiateAuthCommand,
  InitiateAuthCommandInput
} from "@aws-sdk/client-cognito-identity-provider";

export default async function (refreshToken: string, _context: any) {
  console.log(`refresh-session - Creating InitiateAuthCommand request for refresh session`);
  const {COGNITO_SECRET_NAME, REGION} = process.env;
  const cognitoSecrets = await getSecrets({secretName: COGNITO_SECRET_NAME!, region: REGION!});
  const client = new CognitoIdentityProviderClient({region: REGION!});

  const signInParams: InitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
    ClientId: cognitoSecrets["userPoolClientId"],
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  try {
    console.log(`refresh-session - Sending InitiateAuthCommand request for refresh-session`);
    const response = await client.send(new InitiateAuthCommand(signInParams));
    console.log(`refresh-session - Login process started successfully for challenge ${response.ChallengeName}`);
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
        body: JSON.stringify({message: "Refresh session failed."}),
      };
    }
  } catch (error: any) {

  }

}
