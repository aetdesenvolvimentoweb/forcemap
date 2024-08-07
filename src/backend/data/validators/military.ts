import {
  MilitaryProps,
  MilitaryRole,
  UpdateMilitaryPasswordProps,
  UpdateMilitaryProfileProps,
  UpdateMilitaryRoleProps,
} from "@/backend/domain/entities";
import { HashCompare, IdValidator } from "@/backend/domain/usecases";
import {
  duplicatedKeyError,
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "../helpers";
import { MilitaryRankRepository, MilitaryRepository } from "../repositories";

type Dependencies = {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  idValidator: IdValidator;
  hashCompare: HashCompare;
};

export class MilitaryValidator {
  private readonly militaryRankRepository: MilitaryRankRepository;
  private readonly militaryRepository: MilitaryRepository;
  private readonly idValidator: IdValidator;
  private readonly hashCompare: HashCompare;

  private id: string;
  private militaryRankId: string;
  private rg: number;
  private name: string;
  private role: MilitaryRole;
  private password: string;
  private newPassword: string;

  constructor(dependencies: Dependencies) {
    this.militaryRankRepository = dependencies.militaryRankRepository;
    this.militaryRepository = dependencies.militaryRepository;
    this.idValidator = dependencies.idValidator;
    this.hashCompare = dependencies.hashCompare;

    this.id = "";
    this.militaryRankId = "";
    this.rg = 0;
    this.name = "";
    this.role = "Usuário";
    this.password = "";
    this.newPassword = "";
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

  private setNewPassword = (newPassword: string): void => {
    this.newPassword = newPassword;
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
    if (
      alreadyRegistered &&
      (!this.id || (this.id && alreadyRegistered.id !== this.id))
    ) {
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

  private checkPassword = async (
    operation: "add" | "update"
  ): Promise<void> => {
    if (!this.password) {
      throw missingParamError(operation === "add" ? "senha" : "senha atual");
    }

    if (this.password.length < 8) {
      throw invalidParamError(operation === "add" ? "senha" : "senha atual");
    }

    if (operation === "update") {
      const hashedPassword: string =
        await this.militaryRepository.getHashedPassword(this.id);

      const match = await this.hashCompare.compare(
        this.password,
        hashedPassword
      );

      if (!match) {
        throw invalidParamError("senha atual");
      }

      if (!this.newPassword) {
        throw missingParamError("nova senha");
      }

      if (this.newPassword.length < 8) {
        throw invalidParamError("nova senha");
      }
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
    await this.checkPassword("add");
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
    this.checkName();
  };

  public readonly validateNewRole = async (props: UpdateMilitaryRoleProps) => {
    this.setId(props.id);
    this.setRole(props.newRole);

    await this.checkId();
    this.checkRole();
  };

  public readonly validateNewPassword = async (
    props: UpdateMilitaryPasswordProps
  ) => {
    this.setId(props.id);
    this.setPassword(props.currentPassword);
    this.setNewPassword(props.newPassword);

    await this.checkId();
    await this.checkPassword("update");
  };
}
