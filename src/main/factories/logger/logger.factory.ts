import { LoggerProtocol } from "../../../application/protocols";
import { PinoLoggerAdapter } from "../../../infra/adapters";

export const makeLogger = (): LoggerProtocol => {
  return new PinoLoggerAdapter();
};
