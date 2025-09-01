import { MilitaryRankIdRegisteredValidatorProtocol } from "../../../../application/protocols";
import { MilitaryRankIdRegisteredValidator } from "../../../../application/validators";
import { MilitaryRankRepository } from "../../../../domain/repositories";

export const makeMilitaryRankIdRegisteredValidator = (
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRankIdRegisteredValidatorProtocol => {
  return new MilitaryRankIdRegisteredValidator({
    militaryRankRepository,
  });
};
