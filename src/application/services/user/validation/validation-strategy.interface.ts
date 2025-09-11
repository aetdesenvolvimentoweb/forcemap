import { UpdateUserInputDTO, UserInputDTO } from "../../../../domain/dtos";
import { UserRole } from "../../../../domain/entities";

export interface ValidationStrategy {
  validate(data: unknown, ...args: unknown[]): Promise<void> | void;
}

export interface IUserCreationValidationStrategy extends ValidationStrategy {
  validate(data: UserInputDTO, requestingUserRole?: UserRole): Promise<void>;
}

export interface IUserPasswordUpdateValidationStrategy
  extends ValidationStrategy {
  validate(id: string, data: UpdateUserInputDTO): Promise<void>;
}

export interface IUserRoleUpdateValidationStrategy extends ValidationStrategy {
  validate(id: string, role: UserRole): Promise<void>;
}

export interface IUserDeletionValidationStrategy extends ValidationStrategy {
  validate(id: string): Promise<void>;
}
