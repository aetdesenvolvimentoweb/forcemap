import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../application/errors";
import {
  IdValidatorProtocol,
  LoggerProtocol,
} from "../../application/protocols";
import { MilitaryRankRepository } from "../../domain/repositories";

interface UUIDIdValidatorAdapterProps {
  logger: LoggerProtocol;
  militaryRankRepository: MilitaryRankRepository;
}

export class UUIDIdValidatorAdapter implements IdValidatorProtocol {
  constructor(private readonly props: UUIDIdValidatorAdapterProps) {}

  public validate = async (id: string): Promise<void> => {
    const { logger, militaryRankRepository } = this.props;

    logger.info(`Validating ID: ${id}`);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(id);

    if (!isValid) {
      logger.error(`Invalid ID format: ${id}`);
      throw new InvalidParamError("ID", "formato UUID inválido");
    }

    const exists = await militaryRankRepository.findById(id);
    if (!exists) {
      logger.error(`ID not found in repository: ${id}`);
      throw new EntityNotFoundError("Posto/Graduação");
    }

    logger.info(`ID ${id} is valid`);
  };
}
