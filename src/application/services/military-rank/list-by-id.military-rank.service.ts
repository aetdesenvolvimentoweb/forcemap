import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  LoggerProtocol,
} from "src/application/protocols";
import { MilitaryRank } from "src/domain/entities";
import { MilitaryRankRepository } from "src/domain/repositories";
import { ListByIdMilitaryRankUseCase } from "src/domain/use-cases";

interface ListByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
  logger: LoggerProtocol;
}

export class ListByIdMilitaryRankService
  implements ListByIdMilitaryRankUseCase
{
  private readonly logger: LoggerProtocol;
  private readonly props: ListByIdMilitaryRankServiceProps;

  constructor(props: ListByIdMilitaryRankServiceProps) {
    this.props = props;
    this.logger = props.logger;
  }

  public readonly listById = async (
    id: string,
  ): Promise<MilitaryRank | null> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;
    this.logger.info("ListByIdMilitaryRankService.listById called", {
      input: id,
    });

    try {
      const sanitizedId = sanitizer.sanitize(id);
      this.logger.info("Sanitized ID", { sanitizedId });
      await validator.validate(sanitizedId);
      this.logger.info("Validation passed", { sanitizedId });
      const militaryRank = await militaryRankRepository.listById(sanitizedId);
      this.logger.info("Military rank retrieved successfully", {
        sanitizedId,
        militaryRank,
      });
      return militaryRank;
    } catch (error) {
      this.logger.error("Error retrieving military rank", { input: id, error });
      throw error;
    }
  };
}
