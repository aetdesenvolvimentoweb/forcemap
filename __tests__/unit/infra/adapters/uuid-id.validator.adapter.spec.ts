import { InvalidParamError } from "@application/errors";
import { UUIDIdValidatorAdapter } from "@infra/adapters";

describe("UUIDIdValidatorAdapter", () => {
  let validator: UUIDIdValidatorAdapter;

  beforeEach(() => {
    validator = new UUIDIdValidatorAdapter();
  });

  it("should not throw for valid UUID v4", async () => {
    const validUuid = "f47ac10b-58cc-4a56-8e2a-6b0bafc6b8f8";
    await expect(validator.validate(validUuid)).resolves.toBeUndefined();
  });

  it("should throw InvalidParamError for invalid UUID", async () => {
    const invalidUuid = "invalid-uuid";
    await expect(validator.validate(invalidUuid)).rejects.toThrow(
      InvalidParamError,
    );
  });

  it("should throw InvalidParamError for empty string", async () => {
    await expect(validator.validate("")).rejects.toThrow(InvalidParamError);
  });

  it("should throw InvalidParamError for UUID v1 format", async () => {
    const uuidV1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    await expect(validator.validate(uuidV1)).rejects.toThrow(InvalidParamError);
  });

  it("should throw InvalidParamError for UUID v3 format", async () => {
    const uuidV3 = "f47ac10b-58cc-3372-a567-0e02b2c3d479";
    await expect(validator.validate(uuidV3)).rejects.toThrow(InvalidParamError);
  });

  it("should throw InvalidParamError for UUID v5 format", async () => {
    const uuidV5 = "987fbc97-4bed-5078-9f07-9141ba07c9f3";
    await expect(validator.validate(uuidV5)).rejects.toThrow(InvalidParamError);
  });
});
