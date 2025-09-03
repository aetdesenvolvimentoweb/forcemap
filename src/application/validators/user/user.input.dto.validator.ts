import { UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import {
  DuplicatedKeyError,
  EntityNotFoundError,
  InvalidParamError,
} from "../../errors";
import {
  IdValidatorProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";
import { ValidationPatterns } from "../common";

interface UserInputDTOValidatorProps {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  idValidator: IdValidatorProtocol;
}

export class UserInputDTOValidator implements UserInputDTOValidatorProtocol {
  constructor(private readonly props: UserInputDTOValidatorProps) {}

  private readonly validateMilitaryIdPresence = (militaryId: string): void => {
    ValidationPatterns.validatePresence(militaryId, "Militar");
  };

  private readonly validateUserRolePresence = (role: UserRole): void => {
    ValidationPatterns.validatePresence(role, "Função");
  };

  private readonly validatePasswordPresence = (password: string): void => {
    ValidationPatterns.validatePresence(password, "Senha");
  };

  private readonly validateUserRoleRange = (role: UserRole): void => {
    if (!Object.values(UserRole).includes(role)) {
      throw new InvalidParamError("Função", "valor inválido");
    }
  };

  private readonly validatePasswordFormat = (password: string): void => {
    // Valida tamanho mínimo
    if (password.length < 8) {
      throw new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres");
    }

    // Valida se tem pelo menos 1 maiúscula
    if (!/[A-Z]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 letra maiúscula",
      );
    }

    // Valida se tem pelo menos 1 minúscula
    if (!/[a-z]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 letra minúscula",
      );
    }

    // Valida se tem pelo menos 1 número
    if (!/[0-9]/.test(password)) {
      throw new InvalidParamError("Senha", "deve conter pelo menos 1 número");
    }

    // Valida se tem pelo menos 1 caractere especial
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 caractere especial",
      );
    }
  };
  private readonly validateMilitaryIdUniqueness = async (
    militaryId: string,
    idToIgnore?: string,
  ): Promise<void> => {
    const existingUser =
      await this.props.userRepository.findByMilitaryId(militaryId);
    if (existingUser && (!idToIgnore || existingUser.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Militar");
    }
  };

  private readonly validateRequiredFields = (data: UserInputDTO): void => {
    this.validateMilitaryIdPresence(data.militaryId);
    this.validateUserRolePresence(data.role);
    this.validatePasswordPresence(data.password);
  };

  private readonly validateBusinessRules = async (
    data: UserInputDTO,
  ): Promise<void> => {
    const { idValidator, militaryRepository } = this.props;

    idValidator.validate(data.militaryId);
    const military = await militaryRepository.findById(data.militaryId);

    if (!military) {
      throw new EntityNotFoundError("Militar");
    }

    this.validateUserRoleRange(data.role);
    this.validatePasswordFormat(data.password);
  };

  private readonly validateUniqueness = async (
    data: UserInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    await this.validateMilitaryIdUniqueness(data.militaryId, idToIgnore);
  };

  /**
   * Valida para create (idToIgnore não informado) ou update (idToIgnore informado)
   */
  public readonly validate = async (
    data: UserInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    await this.validateBusinessRules(data);
    await this.validateUniqueness(data, idToIgnore);
  };
}
