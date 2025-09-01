import { UUIDIdValidatorAdapter } from "../../../../src/infra/adapters/uuid.id.validator.adapter";
import { InvalidParamError } from "../../../../src/application/errors";

describe("UUIDIdValidatorAdapter", () => {
  let sut: UUIDIdValidatorAdapter;

  beforeEach(() => {
    sut = new UUIDIdValidatorAdapter();
  });

  describe("validate", () => {
    it("should not throw for valid UUID v1", () => {
      const validUuidV1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

      expect(() => sut.validate(validUuidV1)).not.toThrow();
    });

    it("should not throw for valid UUID v4", () => {
      const validUuidV4 = "123e4567-e89b-12d3-a456-426614174000";

      expect(() => sut.validate(validUuidV4)).not.toThrow();
    });

    it("should not throw for valid UUID v5", () => {
      const validUuidV5 = "74738ff5-5367-5958-9aee-98fffdcd1876";

      expect(() => sut.validate(validUuidV5)).not.toThrow();
    });

    it("should not throw for uppercase UUID", () => {
      const uppercaseUuid = "123E4567-E89B-12D3-A456-426614174000";

      expect(() => sut.validate(uppercaseUuid)).not.toThrow();
    });

    it("should not throw for lowercase UUID", () => {
      const lowercaseUuid = "123e4567-e89b-12d3-a456-426614174000";

      expect(() => sut.validate(lowercaseUuid)).not.toThrow();
    });

    it("should not throw for mixed case UUID", () => {
      const mixedCaseUuid = "123E4567-e89B-12d3-A456-426614174000";

      expect(() => sut.validate(mixedCaseUuid)).not.toThrow();
    });

    it("should throw InvalidParamError for empty string", () => {
      const emptyString = "";

      expect(() => sut.validate(emptyString)).toThrow(InvalidParamError);
      expect(() => sut.validate(emptyString)).toThrow(
        "O campo ID é inválido: formato UUID inválido.",
      );
    });

    it("should throw InvalidParamError for invalid format without hyphens", () => {
      const invalidUuid = "123e4567e89b12d3a456426614174000";

      expect(() => sut.validate(invalidUuid)).toThrow(InvalidParamError);
      expect(() => sut.validate(invalidUuid)).toThrow(
        "O campo ID é inválido: formato UUID inválido.",
      );
    });

    it("should throw InvalidParamError for too short UUID", () => {
      const tooShortUuid = "123e4567-e89b-12d3-a456";

      expect(() => sut.validate(tooShortUuid)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for too long UUID", () => {
      const tooLongUuid = "123e4567-e89b-12d3-a456-426614174000-extra";

      expect(() => sut.validate(tooLongUuid)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID with invalid characters", () => {
      const invalidCharsUuid = "123g4567-e89b-12d3-a456-426614174000";

      expect(() => sut.validate(invalidCharsUuid)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID with wrong hyphen positions", () => {
      const wrongHyphensUuid = "123e4-567e89b-12d3a456-426614174000";

      expect(() => sut.validate(wrongHyphensUuid)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID v0 (invalid version)", () => {
      const uuidV0 = "123e4567-e89b-02d3-a456-426614174000";

      expect(() => sut.validate(uuidV0)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID v6 (invalid version)", () => {
      const uuidV6 = "123e4567-e89b-62d3-a456-426614174000";

      expect(() => sut.validate(uuidV6)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID with invalid variant", () => {
      const invalidVariantUuid = "123e4567-e89b-12d3-1456-426614174000";

      expect(() => sut.validate(invalidVariantUuid)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for null input", () => {
      expect(() => sut.validate(null as any)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for undefined input", () => {
      expect(() => sut.validate(undefined as any)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for numeric input", () => {
      expect(() => sut.validate(123 as any)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for object input", () => {
      expect(() => sut.validate({} as any)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for array input", () => {
      expect(() => sut.validate([] as any)).toThrow(InvalidParamError);
    });

    it("should handle whitespace around UUID", () => {
      const uuidWithWhitespace = " 123e4567-e89b-12d3-a456-426614174000 ";

      expect(() => sut.validate(uuidWithWhitespace)).toThrow(InvalidParamError);
    });

    it("should throw InvalidParamError for UUID with special characters", () => {
      const specialCharsUuid = "123e4567@e89b#12d3$a456%426614174000";

      expect(() => sut.validate(specialCharsUuid)).toThrow(InvalidParamError);
    });

    it("should validate multiple valid UUIDs independently", () => {
      const validUuids = [
        "123e4567-e89b-12d3-a456-426614174000",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "74738ff5-5367-5958-9aee-98fffdcd1876",
      ];

      validUuids.forEach((uuid) => {
        expect(() => sut.validate(uuid)).not.toThrow();
      });
    });

    it("should throw InvalidParamError for all invalid UUIDs", () => {
      const invalidUuids = [
        "",
        "invalid",
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3-a456-426614174000-extra",
        "123g4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-02d3-a456-426614174000", // v0
        "123e4567-e89b-62d3-a456-426614174000", // v6
      ];

      invalidUuids.forEach((uuid) => {
        expect(() => sut.validate(uuid)).toThrow(InvalidParamError);
      });
    });

    it("should throw error with correct error message", () => {
      const invalidUuid = "invalid-uuid";

      try {
        sut.validate(invalidUuid);
        fail("Should have thrown InvalidParamError");
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidParamError);
        expect((error as InvalidParamError).message).toBe(
          "O campo ID é inválido: formato UUID inválido.",
        );
        expect((error as InvalidParamError).statusCode).toBe(422);
      }
    });

    it("should validate UUID with all valid variant bits", () => {
      const validVariants = [
        "123e4567-e89b-12d3-8456-426614174000", // 8
        "123e4567-e89b-12d3-9456-426614174000", // 9
        "123e4567-e89b-12d3-a456-426614174000", // a
        "123e4567-e89b-12d3-b456-426614174000", // b
      ];

      validVariants.forEach((uuid) => {
        expect(() => sut.validate(uuid)).not.toThrow();
      });
    });

    it("should validate all valid UUID versions", () => {
      const validVersions = [
        "123e4567-e89b-12d3-a456-426614174000", // v1
        "123e4567-e89b-22d3-a456-426614174000", // v2
        "123e4567-e89b-32d3-a456-426614174000", // v3
        "123e4567-e89b-42d3-a456-426614174000", // v4
        "123e4567-e89b-52d3-a456-426614174000", // v5
      ];

      validVersions.forEach((uuid) => {
        expect(() => sut.validate(uuid)).not.toThrow();
      });
    });
  });
});
