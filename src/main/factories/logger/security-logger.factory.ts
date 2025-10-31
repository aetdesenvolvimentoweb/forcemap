import { SecurityLoggerAdapter } from "../../../infra/adapters";
import { makeGlobalLogger } from "./global-logger.factory";

export const makeSecurityLogger = (): SecurityLoggerAdapter => {
  const logger = makeGlobalLogger();
  return new SecurityLoggerAdapter(logger);
};
