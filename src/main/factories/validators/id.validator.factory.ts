import {
  IdValidatorProtocol,
  LoggerProtocol,
} from "../../../application/protocols";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { UUIDIdValidatorAdapter } from "../../../infra/adapters";

export const makeIdValidator = (
  logger: LoggerProtocol,
  militaryRankRepository: MilitaryRankRepository,
): IdValidatorProtocol => {
  return new UUIDIdValidatorAdapter({
    logger,
    militaryRankRepository,
  });
};
