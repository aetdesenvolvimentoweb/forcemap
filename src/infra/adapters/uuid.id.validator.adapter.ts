import { InvalidParamError } from "../../application/errors";
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

  public validate = (id: string): void => {
    const { logger } = this.props;

    logger.info(`Validating ID: ${id}`);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(id);

    if (!isValid) {
      logger.error(`Invalid ID format: ${id}`);
      throw new InvalidParamError("ID", "formato UUID inválido");
    }

    logger.info(`ID ${id} is valid`);
  };
}
