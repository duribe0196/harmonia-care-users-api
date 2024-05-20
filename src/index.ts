import { handleCognitoTriggerEvents, handleHttpRequests } from "./handlers";

export const handler = async (event: any, context: any): Promise<any> => {
  if (event.triggerSource) {
    return handleCognitoTriggerEvents(event, context);
  } else {
    return handleHttpRequests(event, context);
  }
};
