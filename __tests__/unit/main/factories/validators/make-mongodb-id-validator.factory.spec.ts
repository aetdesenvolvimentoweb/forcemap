import { MongoDbIdValidatorAdapter } from "@infra/adapters";
import { makeMongoDbIdValidator } from "@main/factories";

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
