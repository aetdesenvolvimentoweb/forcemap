import {
  LoggerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../../application/protocols";
import { MilitaryRankInputDTOValidator } from "../../../application/validators";
import { MilitaryRankRepository } from "../../../domain/repositories";

export const makeMilitaryRankInputDTOValidator = (
  logger: LoggerProtocol,
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRankInputDTOValidatorProtocol => {
  return new MilitaryRankInputDTOValidator({
    logger,
    militaryRankRepository,
  });
};
