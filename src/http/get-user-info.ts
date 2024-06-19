import { CognitoJwtVerifier } from "aws-jwt-verify";
import { getSecrets } from "../secrets";

export default async function (token: string, _context: any) {
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No token provided" }),
    };
  }

  try {
    const { COGNITO_SECRET_NAME, REGION } = process.env;
    const cognitoSecrets = await getSecrets({
      secretName: COGNITO_SECRET_NAME!,
      region: REGION!,
    });
    const verifier = CognitoJwtVerifier.create({
      userPoolId: cognitoSecrets["userPoolId"],
      tokenUse: "id",
      clientId: cognitoSecrets["userPoolClientId"],
    });

    const payload = await verifier.verify(token, {
      clientId: cognitoSecrets["userPoolClientId"],
      tokenUse: "id",
    });

    return {
      statusCode: 200,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    console.error("get user info - something went wrong", error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid token" }),
    };
  }
}
