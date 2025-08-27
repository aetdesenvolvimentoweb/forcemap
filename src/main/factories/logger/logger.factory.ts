import { LoggerProtocol } from "src/application/protocols";
import { PinoLoggerAdapter } from "src/infra/adapters";

export const makeLogger = (): LoggerProtocol => {
  return new PinoLoggerAdapter();
};
