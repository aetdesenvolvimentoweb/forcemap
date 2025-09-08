import { UpdateUserPasswordService } from "../../../../application/services";
import { makeUserDomainServices } from "./user-domain-services.factory";

export const makeUpdateUserPasswordService = (): UpdateUserPasswordService => {
  const dependencies = makeUserDomainServices();
  return new UpdateUserPasswordService(dependencies);
};
