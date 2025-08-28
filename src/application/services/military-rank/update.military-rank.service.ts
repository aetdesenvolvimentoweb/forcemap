import { MilitaryRankInputDTO } from "src/domain/dtos";

import { MilitaryRankRepository } from "../../../domain/repositories";
import { UpdateMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  LoggerProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../protocols";

interface UpdateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  IdSanitizer: IdSanitizerProtocol;
  DataSanitizer: MilitaryRankInputDTOSanitizerProtocol;
  IdValidator: IdValidatorProtocol;
  DataValidator: MilitaryRankInputDTOValidatorProtocol;
  logger: LoggerProtocol;
}

export class UpdateMilitaryRankService implements UpdateMilitaryRankUseCase {
  private readonly logger: LoggerProtocol;
  private readonly props: UpdateMilitaryRankServiceProps;

  constructor(props: UpdateMilitaryRankServiceProps) {
    this.props = props;
    this.logger = props.logger;
  }

  public readonly update = async (
    id: string,
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    const {
      militaryRankRepository,
      IdSanitizer,
      DataSanitizer,
      IdValidator,
      DataValidator,
    } = this.props;
    this.logger.info("UpdateMilitaryRankService.update called", {
      input: { id, data },
    });

    try {
      const sanitizedId = IdSanitizer.sanitize(id);
      this.logger.info("Sanitized ID", { sanitizedId });
      await IdValidator.validate(sanitizedId);
      const sanitizedData = DataSanitizer.sanitize(data);
      await DataValidator.validate(sanitizedData);
      this.logger.info("Validation passed", { sanitizedId, sanitizedData });

      await militaryRankRepository.update(sanitizedId, sanitizedData);
      this.logger.info("Military rank updated successfully", { sanitizedId });
    } catch (error) {
      this.logger.error("Error updating military rank", { input: id, error });
      throw error;
    }
  };
}
