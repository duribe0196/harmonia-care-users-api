import { VerifyAuthChallengeResponseTriggerEvent, APIGatewayEvent, Context } from "aws-lambda";
import { handleCognitoTriggerEvents, handleHttpRequests } from "./handlers";

export const handler = async (event: VerifyAuthChallengeResponseTriggerEvent, context: Context): Promise<any> => {
  if (event.triggerSource) {
    return handleCognitoTriggerEvents(event, context);
  } else {
    return handleHttpRequests(event as unknown as APIGatewayEvent, context);
  }
};
