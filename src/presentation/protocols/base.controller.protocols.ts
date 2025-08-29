import { LoggerProtocol } from "../../application/protocols";

export interface BaseControllerProps {
  logger: LoggerProtocol;
}

export interface ServiceControllerProps<TService> extends BaseControllerProps {
  service: TService;
}
