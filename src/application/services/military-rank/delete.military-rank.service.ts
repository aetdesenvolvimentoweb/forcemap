import { MilitaryRankRepository } from "../../../domain/repositories";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  LoggerProtocol,
} from "../../protocols";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
  logger: LoggerProtocol;
}

export class DeleteMilitaryRankService implements DeleteMilitaryRankUseCase {
  private readonly logger: LoggerProtocol;
  private readonly props: DeleteMilitaryRankServiceProps;

  constructor(props: DeleteMilitaryRankServiceProps) {
    this.props = props;
    this.logger = props.logger;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;
    this.logger.info("DeleteMilitaryRankService.delete called", {
      input: id,
    });

    try {
      const sanitizedId = sanitizer.sanitize(id);
      this.logger.info("Sanitized ID", { sanitizedId });
      await validator.validate(sanitizedId);
      this.logger.info("Validation passed", { sanitizedId });
      await militaryRankRepository.delete(sanitizedId);
      this.logger.info("Military rank deleted successfully", { sanitizedId });
    } catch (error) {
      this.logger.error("Error deleting military rank", { input: id, error });
      throw error;
    }
  };
}
