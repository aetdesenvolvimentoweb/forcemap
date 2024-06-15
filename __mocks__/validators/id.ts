import { IdValidator } from "@/backend/domain/usecases";

export class IdValidatorStub implements IdValidator {
  isValid = (id: string): boolean => true;
}
