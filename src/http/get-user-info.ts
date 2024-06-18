import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

export default async function (token: string, _context: any) {
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No token provided" }),
    };
  }

  try {
    const { REGION } = process.env;
    const client = new CognitoIdentityProviderClient({ region: REGION! });

    const input: GetUserCommandInput = {
      AccessToken: token,
    };
    const command = new GetUserCommand(input);
    const userData = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(userData),
    };
  } catch (error) {
    console.error("get user info - something went wrong", error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid token" }),
    };
  }
}
