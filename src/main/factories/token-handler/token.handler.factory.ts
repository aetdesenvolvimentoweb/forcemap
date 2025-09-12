import { TokenHandlerProtocol } from "../../../application/protocols";
import { JsonWebTokenHandlerAdapter } from "../../../infra/adapters";

export const makeTokenHandler = (): TokenHandlerProtocol => {
  return new JsonWebTokenHandlerAdapter();
};
