import {
  MilitaryProps,
  MilitaryRole,
  UpdateMilitaryProfileProps,
} from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import {
  duplicatedKeyError,
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "../helpers";
import { MilitaryRankRepository, MilitaryRepository } from "../repositories";

type Dependencies = {
  idValidator: IdValidator;
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
};

export class MilitaryValidator {
  private readonly idValidator: IdValidator;
  private readonly militaryRankRepository: MilitaryRankRepository;
  private readonly militaryRepository: MilitaryRepository;

  private id: string;
  private militaryRankId: string;
  private rg: number;
  private name: string;
  private role: MilitaryRole;
  private password: string;

  constructor(dependencies: Dependencies) {
    this.idValidator = dependencies.idValidator;
    this.militaryRankRepository = dependencies.militaryRankRepository;
    this.militaryRepository = dependencies.militaryRepository;

    this.id = "";
    this.militaryRankId = "";
    this.rg = 0;
    this.name = "";
    this.role = "Usuário";
    this.password = "";
  }

  private setId = (id: string): void => {
    this.id = id;
  };

  private setMilitaryRankId = (militaryRankId: string): void => {
    this.militaryRankId = militaryRankId;
  };

  private setRg = (rg: number): void => {
    this.rg = rg;
  };

  private setName = (name: string): void => {
    this.name = name;
  };

  private setRole = (role: MilitaryRole): void => {
    this.role = role;
  };

  private setPassword = (password: string): void => {
    this.password = password;
  };

  private readonly checkMilitaryRankId = async (): Promise<void> => {
    if (!this.militaryRankId) {
      throw missingParamError("posto/graduação");
    }

    const isValid = this.idValidator.isValid(this.militaryRankId);
    if (!isValid) {
      throw invalidParamError("posto/graduação");
    }

    const registered = await this.militaryRankRepository.getById(
      this.militaryRankId
    );
    if (!registered) {
      throw unregisteredFieldIdError("posto/graduação");
    }
  };

  private checkRg = async (): Promise<void> => {
    if (!this.rg) {
      throw missingParamError("RG");
    }

    const alreadyRegistered = await this.militaryRepository.getByRg(this.rg);
    if (alreadyRegistered) {
      throw duplicatedKeyError("RG");
    }
  };

  private checkName = (): void => {
    if (!this.name) {
      throw missingParamError("nome");
    }
  };

  private checkRole = (): void => {
    if (!this.role) {
      throw missingParamError("função");
    }

    if (
      this.role !== "Usuário" &&
      this.role !== "Administrador" &&
      this.role !== "ACA"
    ) {
      throw invalidParamError("função");
    }
  };

  private checkPassword = (): void => {
    if (!this.password) {
      throw missingParamError("senha");
    }

    if (this.password.length < 8) {
      throw invalidParamError("senha");
    }
  };

  private readonly checkId = async (): Promise<void> => {
    if (!this.id) {
      throw missingParamError("ID");
    }

    const isValid = this.idValidator.isValid(this.id);
    if (!isValid) {
      throw invalidParamError("ID");
    }

    const alreadyRegistered = await this.militaryRepository.getById(this.id);
    if (!alreadyRegistered) {
      throw unregisteredFieldIdError("militar");
    }
  };

  public readonly validateAddProps = async (
    props: MilitaryProps
  ): Promise<void> => {
    this.setMilitaryRankId(props.militaryRankId);
    this.setRg(props.rg);
    this.setName(props.name);
    this.setRole(props.role);
    this.setPassword(props.password);

    await this.checkMilitaryRankId();
    await this.checkRg();
    this.checkName();
    this.checkRole();
    this.checkPassword();
  };

  public readonly validateId = async (id: string): Promise<void> => {
    this.setId(id);

    await this.checkId();
  };

  public readonly validateNewProfile = async (
    props: UpdateMilitaryProfileProps
  ) => {
    this.setId(props.id);
    this.setMilitaryRankId(props.militaryRankId);
    this.setRg(props.rg);
    this.setName(props.name);

    await this.checkId();
    await this.checkMilitaryRankId();
    await this.checkRg();
  };
}
