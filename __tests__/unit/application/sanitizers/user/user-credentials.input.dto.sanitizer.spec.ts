import { UserCredentialsInputDTOSanitizer } from "../../../../../src/application/sanitizers";
import { UserCredentialsInputDTO } from "../../../../../src/domain/dtos";

describe("UserCredentialsInputDTOSanitizer", () => {
  let sut: UserCredentialsInputDTOSanitizer;

  beforeEach(() => {
    sut = new UserCredentialsInputDTOSanitizer();
  });

  describe("constructor", () => {
    it("should create instance", () => {
      expect(sut).toBeInstanceOf(UserCredentialsInputDTOSanitizer);
      expect(sut.sanitize).toBeDefined();
    });
  });

  describe("sanitize", () => {
    it("should sanitize all fields in login input data", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "  MyPass@123  ",
      };

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        rg: 12345,
        password: "MyPass@123",
      });
    });

    it("should sanitize RG when it's a string number", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: "98765" as any,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(98765);
      expect(typeof result.rg).toBe("number");
    });

    it("should sanitize RG when it's a string decimal", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: "12345.0" as any,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(12345);
    });

    it("should keep RG as number when already a number", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 54321,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(54321);
      expect(typeof result.rg).toBe("number");
    });

    it("should handle RG as zero", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 0,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(0);
    });

    it("should handle negative RG", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: -123,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(-123);
    });

    it("should handle NaN RG from parseFloat", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: "not-a-number" as any,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBeNaN();
    });

    it("should handle float RG correctly", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 123.45,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(123.45);
    });

    it("should sanitize password by trimming whitespace", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "   MyPassword@123   ",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPassword@123");
    });

    it("should sanitize password by removing control characters", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "MyPass@123\u0001\u0002\u001f\u007f",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPass@123");
    });

    it("should sanitize password by removing null bytes", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "MyPass@123\u0000test",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPass@123test");
    });

    it("should preserve special characters in password", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "MyP@ss#123!$%^&*()_+-=[]{}|;':\",./<>?",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyP@ss#123!$%^&*()_+-=[]{}|;':\",./<>?");
    });

    it("should handle empty password", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("");
    });

    it("should handle null password", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: null as any,
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(null);
    });

    it("should handle undefined password", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: undefined as any,
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(undefined);
    });

    it("should handle non-string password", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: 12345 as any,
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(12345);
    });

    it("should handle complex sanitization scenario", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: "9876.5" as any,
        password: "  MyP@ss#123\u0001\u0000test  ",
      };

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        rg: 9876.5,
        password: "MyP@ss#123test",
      });
    });

    it("should preserve object structure", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "ValidPass@123",
      };

      const result = sut.sanitize(inputData);

      expect(result).toHaveProperty("rg");
      expect(result).toHaveProperty("password");
      expect(Object.keys(result)).toHaveLength(2);
    });

    it("should not modify original input data", () => {
      const originalData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "  Original Password  ",
      };

      const inputData = { ...originalData };

      sut.sanitize(inputData);

      expect(originalData.password).toBe("  Original Password  ");
      expect(originalData.rg).toBe(12345);
    });

    it("should handle multiple calls consistently", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: "54321" as any,
        password: "  TestPass@123  ",
      };

      const result1 = sut.sanitize(inputData);
      const result2 = sut.sanitize(inputData);
      const result3 = sut.sanitize(inputData);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should remove only dangerous control characters but preserve valid characters", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "Pass@123\ttab\nnewline\rcarriage",
      };

      const result = sut.sanitize(inputData);

      // Tab, newline, and carriage return should be removed (they are in range \u0000-\u001f)
      expect(result.password).toBe("Pass@123tabnewlinecarriage");
    });

    it("should handle password with only whitespace", () => {
      const inputData: UserCredentialsInputDTO = {
        rg: 12345,
        password: "   \t\n\r   ",
      };

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("");
    });

    it("should handle RG conversion edge cases", () => {
      const testCases = [
        { input: "123.456" as any, expected: 123.456 },
        { input: "0" as any, expected: 0 },
        { input: "999999" as any, expected: 999999 },
        { input: "" as any, expected: NaN },
        { input: "abc" as any, expected: NaN },
        { input: null as any, expected: null },
        { input: undefined as any, expected: undefined },
      ];

      testCases.forEach(({ input, expected }) => {
        const inputData: UserCredentialsInputDTO = {
          rg: input,
          password: "ValidPass@123",
        };

        const result = sut.sanitize(inputData);

        if (typeof expected === "number" && isNaN(expected)) {
          expect(result.rg).toBeNaN();
        } else if (expected === null) {
          expect(result.rg).toBe(null);
        } else if (expected === undefined) {
          expect(result.rg).toBe(undefined);
        } else {
          expect(result.rg).toBe(expected);
        }
      });
    });
  });
});
