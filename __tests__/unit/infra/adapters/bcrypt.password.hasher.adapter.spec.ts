import * as bcrypt from "bcrypt";

import { BcryptPasswordHasherAdapter } from "../../../../src/infra/adapters";

// Mock bcrypt module
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("BcryptPasswordHasherAdapter", () => {
  let sut: BcryptPasswordHasherAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new BcryptPasswordHasherAdapter();
  });

  describe("constructor", () => {
    it("should create adapter with default salt rounds", () => {
      const adapter = new BcryptPasswordHasherAdapter();

      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(BcryptPasswordHasherAdapter);
    });

    it("should create adapter with provided salt rounds", () => {
      const customSaltRounds = 10;
      const adapter = new BcryptPasswordHasherAdapter(customSaltRounds);

      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(BcryptPasswordHasherAdapter);
    });

    it("should use custom salt rounds when provided", async () => {
      const customSaltRounds = 8;
      const adapter = new BcryptPasswordHasherAdapter(customSaltRounds);
      const plainPassword = "test123";
      const expectedHash = "$2b$08$hashedPassword123";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      await adapter.hash(plainPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        plainPassword,
        customSaltRounds,
      );
    });

    it("should use default salt rounds (12) when not provided", async () => {
      const adapter = new BcryptPasswordHasherAdapter();
      const plainPassword = "test123";
      const expectedHash = "$2b$12$hashedPassword123";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      await adapter.hash(plainPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
    });
  });

  describe("hash", () => {
    it("should hash plain password successfully", async () => {
      const plainPassword = "myPassword123";
      const expectedHash = "$2b$12$hashedPassword123";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      const result = await sut.hash(plainPassword);

      expect(result).toBe(expectedHash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(mockedBcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("should handle empty password", async () => {
      const emptyPassword = "";
      const expectedHash = "$2b$12$emptyPasswordHash";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      const result = await sut.hash(emptyPassword);

      expect(result).toBe(expectedHash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(emptyPassword, 12);
    });

    it("should handle long password", async () => {
      const longPassword = "a".repeat(200);
      const expectedHash = "$2b$12$longPasswordHash";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      const result = await sut.hash(longPassword);

      expect(result).toBe(expectedHash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(longPassword, 12);
    });

    it("should handle password with special characters", async () => {
      const specialPassword = "!@#$%^&*()_+{}|:<>?[]\\;',./`~";
      const expectedHash = "$2b$12$specialPasswordHash";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      const result = await sut.hash(specialPassword);

      expect(result).toBe(expectedHash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(specialPassword, 12);
    });

    it("should handle password with unicode characters", async () => {
      const unicodePassword = "パスワード123🔒";
      const expectedHash = "$2b$12$unicodePasswordHash";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(expectedHash);

      const result = await sut.hash(unicodePassword);

      expect(result).toBe(expectedHash);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(unicodePassword, 12);
    });

    it("should propagate bcrypt errors", async () => {
      const plainPassword = "test123";
      const bcryptError = new Error("Bcrypt hash error");

      (mockedBcrypt.hash as jest.Mock).mockRejectedValueOnce(bcryptError);

      await expect(sut.hash(plainPassword)).rejects.toThrow(
        "Bcrypt hash error",
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
    });

    it("should handle multiple hash operations", async () => {
      const passwords = ["password1", "password2", "password3"];
      const hashes = ["$2b$12$hash1", "$2b$12$hash2", "$2b$12$hash3"];

      (mockedBcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(hashes[0])
        .mockResolvedValueOnce(hashes[1])
        .mockResolvedValueOnce(hashes[2]);

      const results = await Promise.all(passwords.map((pwd) => sut.hash(pwd)));

      expect(results).toEqual(hashes);
      expect(mockedBcrypt.hash).toHaveBeenCalledTimes(3);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(1, passwords[0], 12);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(2, passwords[1], 12);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(3, passwords[2], 12);
    });

    it("should use correct salt rounds for different instances", async () => {
      const adapter8 = new BcryptPasswordHasherAdapter(8);
      const adapter14 = new BcryptPasswordHasherAdapter(14);
      const plainPassword = "test123";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("$2b$hash");

      await adapter8.hash(plainPassword);
      await adapter14.hash(plainPassword);

      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(1, plainPassword, 8);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(2, plainPassword, 14);
    });
  });

  describe("compare", () => {
    it("should compare plain password with hash successfully when they match", async () => {
      const plainPassword = "myPassword123";
      const hashedPassword = "$2b$12$hashedPassword123";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await sut.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it("should compare plain password with hash successfully when they don't match", async () => {
      const plainPassword = "myPassword123";
      const hashedPassword = "$2b$12$differentHashedPassword";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await sut.compare(plainPassword, hashedPassword);

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
    });

    it("should handle empty plain password", async () => {
      const emptyPassword = "";
      const hashedPassword = "$2b$12$hashedPassword123";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await sut.compare(emptyPassword, hashedPassword);

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        emptyPassword,
        hashedPassword,
      );
    });

    it("should handle empty hash", async () => {
      const plainPassword = "myPassword123";
      const emptyHash = "";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await sut.compare(plainPassword, emptyHash);

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        emptyHash,
      );
    });

    it("should handle special characters in plain password", async () => {
      const specialPassword = "!@#$%^&*()_+{}|:<>?[]\\;',./`~";
      const hashedPassword = "$2b$12$hashedSpecialPassword";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await sut.compare(specialPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        specialPassword,
        hashedPassword,
      );
    });

    it("should handle unicode characters in plain password", async () => {
      const unicodePassword = "パスワード123🔒";
      const hashedPassword = "$2b$12$hashedUnicodePassword";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await sut.compare(unicodePassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        unicodePassword,
        hashedPassword,
      );
    });

    it("should propagate bcrypt compare errors", async () => {
      const plainPassword = "test123";
      const hashedPassword = "$2b$12$hashedPassword";
      const bcryptError = new Error("Bcrypt compare error");

      (mockedBcrypt.compare as jest.Mock).mockRejectedValueOnce(bcryptError);

      await expect(sut.compare(plainPassword, hashedPassword)).rejects.toThrow(
        "Bcrypt compare error",
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
    });

    it("should handle multiple compare operations", async () => {
      const testCases = [
        { plain: "password1", hash: "$2b$12$hash1", expected: true },
        { plain: "password2", hash: "$2b$12$hash2", expected: false },
        { plain: "password3", hash: "$2b$12$hash3", expected: true },
      ];

      (mockedBcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(testCases[0].expected)
        .mockResolvedValueOnce(testCases[1].expected)
        .mockResolvedValueOnce(testCases[2].expected);

      const results = await Promise.all(
        testCases.map(({ plain, hash }) => sut.compare(plain, hash)),
      );

      expect(results).toEqual([true, false, true]);
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(3);
      testCases.forEach((testCase, index) => {
        expect(mockedBcrypt.compare).toHaveBeenNthCalledWith(
          index + 1,
          testCase.plain,
          testCase.hash,
        );
      });
    });
  });

  describe("integration scenarios", () => {
    it("should work with hash and compare together", async () => {
      const plainPassword = "integrationTest123";
      const hashedPassword = "$2b$12$integrationHashedPassword";

      // First hash the password
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);
      const hashResult = await sut.hash(plainPassword);

      // Then compare it
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      const compareResult = await sut.compare(plainPassword, hashResult);

      expect(hashResult).toBe(hashedPassword);
      expect(compareResult).toBe(true);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
    });

    it("should handle different passwords with different adapters", async () => {
      const adapter10 = new BcryptPasswordHasherAdapter(10);
      const adapter14 = new BcryptPasswordHasherAdapter(14);

      const password1 = "password1";
      const password2 = "password2";
      const hash1 = "$2b$10$hash1";
      const hash2 = "$2b$14$hash2";

      (mockedBcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(hash1)
        .mockResolvedValueOnce(hash2);

      (mockedBcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      // Hash with different adapters
      const result1 = await adapter10.hash(password1);
      const result2 = await adapter14.hash(password2);

      // Compare with same adapters
      const compare1 = await adapter10.compare(password1, result1);
      const compare2 = await adapter14.compare(password2, result2);

      expect(result1).toBe(hash1);
      expect(result2).toBe(hash2);
      expect(compare1).toBe(true);
      expect(compare2).toBe(true);

      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(1, password1, 10);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(2, password2, 14);
    });

    it("should handle concurrent hash and compare operations", async () => {
      const passwords = ["concurrent1", "concurrent2", "concurrent3"];
      const hashes = ["$2b$12$hash1", "$2b$12$hash2", "$2b$12$hash3"];

      (mockedBcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(hashes[0])
        .mockResolvedValueOnce(hashes[1])
        .mockResolvedValueOnce(hashes[2]);

      (mockedBcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      // Concurrent hash operations
      const hashPromises = passwords.map((pwd) => sut.hash(pwd));
      const hashResults = await Promise.all(hashPromises);

      // Concurrent compare operations
      const comparePromises = passwords.map((pwd, index) =>
        sut.compare(pwd, hashResults[index]),
      );
      const compareResults = await Promise.all(comparePromises);

      expect(hashResults).toEqual(hashes);
      expect(compareResults).toEqual([true, false, true]);
      expect(mockedBcrypt.hash).toHaveBeenCalledTimes(3);
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(3);
    });

    it("should maintain adapter independence", async () => {
      const adapter1 = new BcryptPasswordHasherAdapter(8);
      const adapter2 = new BcryptPasswordHasherAdapter(12);
      const password = "testPassword";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("$2b$hash");

      await adapter1.hash(password);
      await adapter2.hash(password);

      // Each adapter should use its own salt rounds
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(1, password, 8);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(2, password, 12);
    });
  });

  describe("edge cases", () => {
    it("should handle extreme salt rounds", async () => {
      const minAdapter = new BcryptPasswordHasherAdapter(1);
      const maxAdapter = new BcryptPasswordHasherAdapter(20);
      const password = "test";

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("$2b$hash");

      await minAdapter.hash(password);
      await maxAdapter.hash(password);

      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(1, password, 1);
      expect(mockedBcrypt.hash).toHaveBeenNthCalledWith(2, password, 20);
    });

    it("should handle whitespace in passwords", async () => {
      const plainPassword = "  password with spaces  ";
      const hashedPassword = "$2b$12$hashedSpacedPassword";

      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await sut.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
    });
  });
});
