import { makeMongoDbIdValidator } from "@main/factories/validators/make-mongodb-id-validator.factory";
import { MongoDbIdValidatorAdapter } from "@infra/adapters";

describe("makeMongoDbIdValidator", () => {
  it("should return an instance of MongoDbIdValidatorAdapter", () => {
    const validator = makeMongoDbIdValidator();
    expect(validator).toBeInstanceOf(MongoDbIdValidatorAdapter);
  });

  it("should implement IdValidatorProtocol (validate method)", () => {
    const validator = makeMongoDbIdValidator();
    expect(typeof validator.validate).toBe("function");
  });
});
