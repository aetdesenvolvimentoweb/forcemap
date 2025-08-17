import { MongoDbIdValidatorAdapter } from "@infra/adapters/mongodb-id.validator.adapter";
import { InvalidParamError } from "@application/errors";

describe("MongoDbIdValidatorAdapter", () => {
  let adapter: MongoDbIdValidatorAdapter;

  beforeEach(() => {
    adapter = new MongoDbIdValidatorAdapter();
  });

  it("should not throw for valid MongoDB ObjectId", async () => {
    const validId = "507f1f77bcf86cd799439011";
    await expect(adapter.validate(validId)).resolves.toBeUndefined();
  });

  it("should throw InvalidParamError for invalid MongoDB ObjectId", async () => {
    const invalidId = "invalid-id";
    await expect(adapter.validate(invalidId)).rejects.toThrow(
      InvalidParamError,
    );
    await expect(adapter.validate(invalidId)).rejects.toThrow(
      "Inválido para MongoDB",
    );
  });

  it("should throw InvalidParamError for empty string", async () => {
    await expect(adapter.validate("")).rejects.toThrow(InvalidParamError);
  });

  it("should throw InvalidParamError for null string", async () => {
    // @ts-expect-error Testando comportamento com null
    await expect(adapter.validate(null)).rejects.toThrow(InvalidParamError);
  });
});
