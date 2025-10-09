import { SecurityLoggerAdapter } from "../../../infra/adapters";

export const makeSecurityLogger = (): SecurityLoggerAdapter => {
  return new SecurityLoggerAdapter();
};
