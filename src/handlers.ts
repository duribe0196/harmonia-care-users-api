import {defineAuthChallenge, createAuthChallenge, verifyAuthChallenge} from "./cognito";
import initiateAuth from "./http/initiate-auth";
import completeAuth from "./http/complete-auth";
import refreshSession from "./http/refresh-session";
import { getNotFoundResponse } from "./utils";

export const handleCognitoTriggerEvents = async (event: any, context: any) => {
  console.log(`handleCognitoTriggerEvents - Received cognito trigger ${event.triggerSource}`);
  switch (event.triggerSource) {
    case "DefineAuthChallenge_Authentication":
      return defineAuthChallenge(event, context);
    case "CreateAuthChallenge_Authentication":
      return await createAuthChallenge(event, context);
    case "VerifyAuthChallengeResponse_Authentication":
      return verifyAuthChallenge(event, context);
    default:
      break;
  }
};

export const handleHttpRequests = (event: any, context: any) => {
  const httpMethod = event.httpMethod;
  const path = event.path;
  console.log(`handleHttpRequests - Received method ${httpMethod} in the path ${path}`);
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
      if (requestBody && requestBody.username && requestBody.otp && requestBody.session) {
        return completeAuth(requestBody.username, requestBody.otp, requestBody.session, context);
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

    default:
      getNotFoundResponse(path, httpMethod);
  }

  return getNotFoundResponse(path, httpMethod);
};
