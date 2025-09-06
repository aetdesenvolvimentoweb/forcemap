import { ListAllUserController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllUserService } from "../../services";

export const makeListAllUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllUserService = makeListAllUserService();

  return new ListAllUserController({
    listAllUserService,
    logger,
  });
};
