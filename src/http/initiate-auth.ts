import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {getSecrets} from "../secrets";


export default async function (username: string, _context: any) {
  console.log(`initiate-auth - Creating InitiateAuthCommandInput request for login process`);
  const {COGNITO_SECRET_NAME, REGION} = process.env;
  const cognitoSecrets = await getSecrets({secretName: COGNITO_SECRET_NAME!, region: REGION!});
  const client = new CognitoIdentityProviderClient({region: REGION!});

  const signInParams: InitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    ClientId: cognitoSecrets["userPoolClientId"],
    AuthParameters: {
      USERNAME: username,
    },
  };

  try {
    console.log(`initiate-auth - Sending InitiateAuthCommand request to username ${username}`);
    const response = await client.send(new InitiateAuthCommand(signInParams));
    console.log(`initiate-auth - Login process started successfully for challenge ${response.ChallengeName}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        challengeName: response.ChallengeName,
        challengeParameters: response.ChallengeParameters,
        session: response.Session
      }),
    };
  } catch (error: any) {
    if (error.message === "User does not exist.") {
      console.log(`initiate-auth - User does not exist, creating new user ${username}`);
      try {
        const createUserParams: AdminCreateUserCommandInput = {
          UserPoolId: cognitoSecrets["userPoolId"],
          Username: username,
          UserAttributes: [
            {
              Name: "email",
              Value: username,
            },
          ],
          MessageAction: "SUPPRESS", // Use this to prevent sending a confirmation email immediately
        };
        await client.send(new AdminCreateUserCommand(createUserParams));
        console.log(`initiate-auth - User created successfully ${username}`);
        const signInParams: InitiateAuthCommandInput = {
          AuthFlow: AuthFlowType.CUSTOM_AUTH,
          ClientId: cognitoSecrets["userPoolClientId"],
          AuthParameters: {
            USERNAME: username,
          },
        };
        const response = await client.send(
          new InitiateAuthCommand(signInParams)
        );
        return {
          statusCode: 200,
          body: JSON.stringify({
            challengeName: response.ChallengeName,
            challengeParameters: response.ChallengeParameters,
            session: response.Session
          }),
        };
      } catch (createError: any) {
        console.log(
          `initiate-auth - Something went wrong trying to create user and sign in ${username}`
        );
        console.error(createError);
        return {
          statusCode: 400,
          body: JSON.stringify({message: createError.message}),
        };
      }
    } else {
      console.log(`initiate-auth - Something went wrong trying to sign in ${username}`);
      console.error(error);
      return {
        statusCode: 400,
        body: JSON.stringify({message: error.message}),
      };
    }
  }
}
