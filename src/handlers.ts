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

export const handleHttpRequests = (
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
        return initiateAuth(requestBody.username, context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Please verify the inputs",
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
        return completeAuth(
          requestBody.username,
          requestBody.otp,
          requestBody.session,
          context,
        );
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Please verify the inputs",
          }),
        };
      }

    case "POST-/users/refresh-session":
      if (requestBody && requestBody.refreshToken) {
        return refreshSession(requestBody.refreshToken, context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Please verify the inputs",
          }),
        };
      }

    case "GET-/users/get-user-info":
      if (event.headers["authorization"]) {
        return getUserInfo(event.headers["authorization"], context);
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Please verify the inputs",
          }),
        };
      }

    default:
      getNotFoundResponse(path, httpMethod);
  }

  return getNotFoundResponse(path, httpMethod);
};
