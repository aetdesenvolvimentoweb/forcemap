import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { ListAllMilitaryRankUseCase } from "../../../domain/use-cases";
import { LoggerProtocol } from "../../protocols";

interface ListAllMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  logger: LoggerProtocol;
}

export class ListAllMilitaryRankService implements ListAllMilitaryRankUseCase {
  private readonly logger: LoggerProtocol;
  private readonly props: ListAllMilitaryRankServiceProps;

  constructor(props: ListAllMilitaryRankServiceProps) {
    this.props = props;
    this.logger = props.logger;
  }

  public readonly listAll = async (): Promise<MilitaryRank[]> => {
    const { militaryRankRepository } = this.props;
    this.logger.info("ListAllMilitaryRankService.listAll called");
    try {
      const militaryRanks = await militaryRankRepository.listAll();
      this.logger.info("ListAllMilitaryRankService.listAll successful", {
        militaryRanks,
      });
      return militaryRanks;
    } catch (error) {
      this.logger.error("Error listing all military ranks", { error });
      throw error;
    }
  };
}
