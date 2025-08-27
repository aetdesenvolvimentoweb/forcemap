import {
  LoggerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "src/application/protocols";
import { MilitaryRankInputDTOValidator } from "src/application/validators";
import { MilitaryRankRepository } from "src/domain/repositories";

export const makeMilitaryRankInputDTOValidator = (
  logger: LoggerProtocol,
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRankInputDTOValidatorProtocol => {
  return new MilitaryRankInputDTOValidator({
    logger,
    militaryRankRepository,
  });
};
