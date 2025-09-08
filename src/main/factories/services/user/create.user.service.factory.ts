import { CreateUserService } from "../../../../application/services";
import { makeUserDomainServices } from "./user-domain-services.factory";

export const makeCreateUserService = (): CreateUserService => {
  const dependencies = makeUserDomainServices();
  return new CreateUserService(dependencies);
};
