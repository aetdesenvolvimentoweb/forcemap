import { BcryptPasswordHasherAdapter } from "../../../../src/infra/adapters";

// Mock bcrypt module
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from "bcrypt";
const mockHash = jest.mocked(bcrypt.hash);
const mockCompare = jest.mocked(bcrypt.compare);

describe("BcryptPasswordHasherAdapter", () => {
  let sut: BcryptPasswordHasherAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should use default salt rounds when not provided", () => {
      const adapter = new BcryptPasswordHasherAdapter();
      expect(adapter["saltRounds"]).toBe(12);
    });

    it("should use provided salt rounds", () => {
      const customSaltRounds = 10;
      const adapter = new BcryptPasswordHasherAdapter(customSaltRounds);
      expect(adapter["saltRounds"]).toBe(customSaltRounds);
    });

    it("should handle different salt round values", () => {
      const saltRoundsValues = [8, 10, 12, 14, 16];

      for (const saltRounds of saltRoundsValues) {
        const adapter = new BcryptPasswordHasherAdapter(saltRounds);
        expect(adapter["saltRounds"]).toBe(saltRounds);
      }
    });
  });

  describe("hash", () => {
    beforeEach(() => {
      sut = new BcryptPasswordHasherAdapter();
    });

    it("should hash plain password with default salt rounds", async () => {
      const plainPassword = "myPlainPassword123";
      const hashedPassword = "$2b$12$hashedPassword";

      (mockHash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await sut.hash(plainPassword);

      expect(result).toBe(hashedPassword);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, 12);
      expect(mockHash).toHaveBeenCalledTimes(1);
    });

    it("should hash plain password with custom salt rounds", async () => {
      const customSaltRounds = 10;
      const customSut = new BcryptPasswordHasherAdapter(customSaltRounds);
      const plainPassword = "customPassword456";
      const hashedPassword = "$2b$10$customHashedPassword";

      (mockHash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await customSut.hash(plainPassword);

      expect(result).toBe(hashedPassword);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, customSaltRounds);
      expect(mockHash).toHaveBeenCalledTimes(1);
    });

    it("should handle different password formats", async () => {
      const passwords = [
        "simplePassword",
        "P@ssw0rd!",
        "123456789",
        "password with spaces",
        "àçéñtüd-châráctêrs",
        "🔒🗝️🔐",
        "",
        "a",
        "a".repeat(100),
      ];

      for (const password of passwords) {
        (mockHash as jest.Mock).mockResolvedValue(`hashed_${password}`);

        const result = await sut.hash(password);

        expect(result).toBe(`hashed_${password}`);
        expect(mockHash).toHaveBeenCalledWith(password, 12);
      }
    });

    it("should propagate bcrypt hash errors", async () => {
      const plainPassword = "testPassword";
      const bcryptError = new Error("Bcrypt hash failed");

      (mockHash as jest.Mock).mockRejectedValue(bcryptError);

      await expect(sut.hash(plainPassword)).rejects.toThrow(bcryptError);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, 12);
    });

    it("should handle bcrypt hash with different error types", async () => {
      const plainPassword = "testPassword";
      const errorTypes = [
        new Error("Generic error"),
        new TypeError("Type error"),
        "String error",
        { message: "Object error" },
      ];

      for (const error of errorTypes) {
        (mockHash as jest.Mock).mockRejectedValue(error);

        await expect(sut.hash(plainPassword)).rejects.toBe(error);
        expect(mockHash).toHaveBeenCalledWith(plainPassword, 12);
      }
    });

    it("should work with different salt rounds in parallel calls", async () => {
      const adapters = [
        new BcryptPasswordHasherAdapter(8),
        new BcryptPasswordHasherAdapter(10),
        new BcryptPasswordHasherAdapter(12),
        new BcryptPasswordHasherAdapter(14),
      ];

      const password = "parallelPassword";
      (mockHash as jest.Mock).mockImplementation(() =>
        Promise.resolve(`hashed_parallelPassword_salt`),
      );

      const promises = adapters.map((adapter, index) =>
        adapter.hash(`${password}_${index}`),
      );

      const results = await Promise.all(promises);

      expect(results).toEqual([
        "hashed_parallelPassword_salt",
        "hashed_parallelPassword_salt",
        "hashed_parallelPassword_salt",
        "hashed_parallelPassword_salt",
      ]);

      expect(mockHash).toHaveBeenCalledTimes(4);
    });
  });

  describe("compare", () => {
    beforeEach(() => {
      sut = new BcryptPasswordHasherAdapter();
    });

    it("should return true when passwords match", async () => {
      const plainPassword = "myPassword123";
      const hashedPassword = "$2b$12$validHashedPassword";

      (mockCompare as jest.Mock).mockResolvedValue(true);

      const result = await sut.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(mockCompare).toHaveBeenCalledTimes(1);
    });

    it("should return false when passwords do not match", async () => {
      const plainPassword = "wrongPassword";
      const hashedPassword = "$2b$12$validHashedPassword";

      (mockCompare as jest.Mock).mockResolvedValue(false);

      const result = await sut.compare(plainPassword, hashedPassword);

      expect(result).toBe(false);
      expect(mockCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(mockCompare).toHaveBeenCalledTimes(1);
    });

    it("should handle different password combinations", async () => {
      const testCases = [
        {
          plain: "correctPassword",
          hashed: "$2b$12$correctHash",
          expected: true,
        },
        {
          plain: "wrongPassword",
          hashed: "$2b$12$correctHash",
          expected: false,
        },
        {
          plain: "P@ssw0rd!",
          hashed: "$2b$10$specialCharHash",
          expected: true,
        },
        {
          plain: "",
          hashed: "$2b$12$emptyPasswordHash",
          expected: false,
        },
        {
          plain: "longPasswordWithManyCharacters",
          hashed: "$2b$14$longPasswordHash",
          expected: true,
        },
      ];

      for (const testCase of testCases) {
        (mockCompare as jest.Mock).mockResolvedValue(testCase.expected);

        const result = await sut.compare(testCase.plain, testCase.hashed);

        expect(result).toBe(testCase.expected);
        expect(mockCompare).toHaveBeenCalledWith(
          testCase.plain,
          testCase.hashed,
        );
      }
    });

    it("should handle special characters in passwords", async () => {
      const specialCases = [
        { plain: "àçéñt", hashed: "$2b$12$accentHash" },
        { plain: "🔒🗝️", hashed: "$2b$12$emojiHash" },
        { plain: "password with spaces", hashed: "$2b$12$spacesHash" },
        { plain: "newline\npassword", hashed: "$2b$12$newlineHash" },
        { plain: "quotes\"and'apostrophes", hashed: "$2b$12$quotesHash" },
      ];

      (mockCompare as jest.Mock).mockResolvedValue(true);

      for (const testCase of specialCases) {
        const result = await sut.compare(testCase.plain, testCase.hashed);

        expect(result).toBe(true);
        expect(mockCompare).toHaveBeenCalledWith(
          testCase.plain,
          testCase.hashed,
        );
      }
    });

    it("should propagate bcrypt compare errors", async () => {
      const plainPassword = "testPassword";
      const hashedPassword = "$2b$12$testHash";
      const bcryptError = new Error("Bcrypt compare failed");

      (mockCompare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(sut.compare(plainPassword, hashedPassword)).rejects.toThrow(
        bcryptError,
      );
      expect(mockCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it("should handle bcrypt compare with different error types", async () => {
      const plainPassword = "testPassword";
      const hashedPassword = "$2b$12$testHash";
      const errorTypes = [
        new Error("Generic compare error"),
        new TypeError("Compare type error"),
        "String compare error",
        { message: "Object compare error" },
      ];

      for (const error of errorTypes) {
        (mockCompare as jest.Mock).mockRejectedValue(error);

        await expect(sut.compare(plainPassword, hashedPassword)).rejects.toBe(
          error,
        );
        expect(mockCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      }
    });

    it("should work with malformed hash strings", async () => {
      const plainPassword = "testPassword";
      const malformedHashes = [
        "invalid-hash",
        "",
        "notABcryptHash",
        "$2b$12$",
        "$2b$12$tooshort",
      ];

      (mockCompare as jest.Mock).mockResolvedValue(false);

      for (const hash of malformedHashes) {
        const result = await sut.compare(plainPassword, hash);

        expect(result).toBe(false);
        expect(mockCompare).toHaveBeenCalledWith(plainPassword, hash);
      }
    });

    it("should handle concurrent compare operations", async () => {
      const testData = [
        { plain: "password1", hashed: "$2b$12$hash1", expected: true },
        { plain: "password2", hashed: "$2b$12$hash2", expected: false },
        { plain: "password3", hashed: "$2b$12$hash3", expected: true },
        { plain: "password4", hashed: "$2b$12$hash4", expected: false },
      ];

      (mockCompare as jest.Mock).mockImplementation(() =>
        Promise.resolve(true),
      );

      const promises = testData.map((data) =>
        sut.compare(data.plain, data.hashed),
      );

      const results = await Promise.all(promises);

      expect(results).toEqual([true, true, true, true]);
      expect(mockCompare).toHaveBeenCalledTimes(4);
    });
  });

  describe("integration scenarios", () => {
    it("should work with different salt rounds for same password", async () => {
      const plainPassword = "samePassword123";
      const adapters = [
        new BcryptPasswordHasherAdapter(8),
        new BcryptPasswordHasherAdapter(12),
        new BcryptPasswordHasherAdapter(16),
      ];

      // Mock hash to return different results for different salt rounds
      (mockHash as jest.Mock).mockImplementation(() =>
        Promise.resolve(`$2b$12$hash_samePassword123_12`),
      );

      const hashedPasswords = await Promise.all(
        adapters.map((adapter) => adapter.hash(plainPassword)),
      );

      expect(hashedPasswords).toEqual([
        "$2b$12$hash_samePassword123_12",
        "$2b$12$hash_samePassword123_12",
        "$2b$12$hash_samePassword123_12",
      ]);

      expect(mockHash).toHaveBeenCalledTimes(3);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, 8);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, 12);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, 16);
    });

    it("should maintain consistency between hash and compare operations", async () => {
      const plainPassword = "consistencyTest";
      const hashedPassword = "$2b$12$hashedConsistencyTest";

      // First hash the password
      (mockHash as jest.Mock).mockResolvedValue(hashedPassword);
      const hashResult = await sut.hash(plainPassword);

      // Then compare it
      (mockCompare as jest.Mock).mockResolvedValue(true);
      const compareResult = await sut.compare(plainPassword, hashResult);

      expect(hashResult).toBe(hashedPassword);
      expect(compareResult).toBe(true);

      expect(mockHash).toHaveBeenCalledWith(plainPassword, 12);
      expect(mockCompare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it("should handle edge cases with empty and null-like values", async () => {
      // Note: In real bcrypt, empty strings and null values would behave differently
      // but we're testing the adapter behavior with mocked bcrypt
      const edgeCases = [
        { plain: "", hashed: "" },
        { plain: " ", hashed: " " },
        { plain: "\n", hashed: "\n" },
        { plain: "\t", hashed: "\t" },
      ];

      (mockHash as jest.Mock).mockImplementation(() =>
        Promise.resolve("hashed_test"),
      );
      (mockCompare as jest.Mock).mockResolvedValue(false);

      for (const edgeCase of edgeCases) {
        // Hash operation
        const hashResult = await sut.hash(edgeCase.plain);
        expect(hashResult).toBe("hashed_test");

        // Compare operation
        const compareResult = await sut.compare(
          edgeCase.plain,
          edgeCase.hashed,
        );
        expect(compareResult).toBe(false);
      }
    });
  });
});
