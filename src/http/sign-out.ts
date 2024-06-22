import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
  GlobalSignOutCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

export default async function (accessToken: string, _context: any) {
  console.log(
    `sign-out - Creating GlobalSignOutCommand request for sign out the user`,
  );
  const { REGION } = process.env;
  const client = new CognitoIdentityProviderClient({ region: REGION! });
  const signInParams: GlobalSignOutCommandInput = {
    AccessToken: accessToken,
  };

  try {
    console.log(
      `sign-out - Sending GlobalSignOutCommand request for sign out the user`,
    );
    const response = await client.send(new GlobalSignOutCommand(signInParams));
    if (response.$metadata) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OK" }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Sign out failed." }),
      };
    }
  } catch (error: any) {
    console.error("Error refresh-session", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Sign out failed." }),
    };
  }
}
