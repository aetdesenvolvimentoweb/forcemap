import { FindByIdUserController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdUserService } from "../../services";

export const makeFindByIdUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdUserService = makeFindByIdUserService();

  return new FindByIdUserController({
    findByIdUserService,
    logger,
  });
};
