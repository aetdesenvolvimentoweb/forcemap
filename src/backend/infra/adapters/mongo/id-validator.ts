import { IdValidator } from "@/backend/domain/usecases";
import { ObjectId } from "mongodb";

export class MongoIdValidator implements IdValidator {
  public readonly isValid = (id: string): boolean => {
    return ObjectId.isValid(id);
  };
}
