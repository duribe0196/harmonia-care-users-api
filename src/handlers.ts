import {
  APIGatewayEvent,
  Context,
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from "aws-lambda";
import {
  defineAuthChallenge,
  createAuthChallenge,
  verifyAuthChallenge,
} from "./cognito";
import initiateAuth from "./http/initiate-auth";
import completeAuth from "./http/complete-auth";
import refreshSession from "./http/refresh-session";
import getUserInfo from "./http/get-user-info";
import signOut from "./http/sign-out";
import { getNotFoundResponse } from "./utils";

type CognitoTriggerEvent =
  | VerifyAuthChallengeResponseTriggerEvent
  | DefineAuthChallengeTriggerEvent
  | CreateAuthChallengeTriggerEvent;

export const handleCognitoTriggerEvents = async (
  event: CognitoTriggerEvent,
  context: any,
) => {
  console.log(
    `handleCognitoTriggerEvents - Received cognito trigger ${event.triggerSource}`,
  );
  switch (event.triggerSource) {
    case "DefineAuthChallenge_Authentication":
      return defineAuthChallenge(event, context);
    case "CreateAuthChallenge_Authentication":
      return await createAuthChallenge(event, context);
    case "VerifyAuthChallengeResponse_Authentication":
      return await verifyAuthChallenge(event, context);
    default:
      break;
  }
};

export const handleHttpRequests = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  const httpMethod = event.httpMethod;
  const path = event.path;
  console.log(
    `handleHttpRequests - Received method ${httpMethod} in the path ${path}`,
  );
  // Attempt to parse the request body if present
  let requestBody;
  if (event.body) {
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid JSON format in request body.",
        }),
      };
    }
  }

  const resource = `${httpMethod}-${path}`;
  switch (resource) {
    case "POST-/users/send-otp":
      if (requestBody && requestBody.username) {
        return await initiateAuth(requestBody.username, context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Send OTP: Please verify the inputs",
          }),
        };
      }
    case "POST-/users/verify-otp":
      if (
        requestBody &&
        requestBody.username &&
        requestBody.otp &&
        requestBody.session
      ) {
        return await completeAuth(
          requestBody.username,
          requestBody.otp,
          requestBody.session,
          context,
        );
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Verify OTP: Please verify the inputs",
          }),
        };
      }

    case "POST-/users/refresh-session":
      if (requestBody && requestBody.refreshToken) {
        return await refreshSession(requestBody.refreshToken, context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Refresh session: Please verify the inputs",
          }),
        };
      }

    case "POST-/users/sign-out":
      if (requestBody && requestBody.accessToken) {
        return await signOut(requestBody.accessToken, context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Sign Out: Please verify the inputs",
          }),
        };
      }

    case "GET-/users/get-user-info":
      console.log(JSON.stringify(event));
      if (event.headers["Authorization"]) {
        return await getUserInfo(event.headers["Authorization"], context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Get User Info: Please verify the inputs",
          }),
        };
      }

    default:
      getNotFoundResponse(path, httpMethod);
  }

  return getNotFoundResponse(path, httpMethod);
};
