import { MilitaryInputDTOSanitizer } from "../../../../src/application/sanitizers/military.input.dto.sanitizer";
import { MilitaryInputDTO } from "../../../../src/domain/dtos";
import { IdSanitizerProtocol } from "../../../../src/application/protocols";

describe("MilitaryInputDTOSanitizer", () => {
  let sut: MilitaryInputDTOSanitizer;
  let mockIdSanitizer: jest.Mocked<IdSanitizerProtocol>;

  beforeEach(() => {
    mockIdSanitizer = {
      sanitize: jest.fn(),
    };

    sut = new MilitaryInputDTOSanitizer({
      idSanitizer: mockIdSanitizer,
    });
  });

  describe("constructor", () => {
    it("should create instance with id sanitizer dependency", () => {
      expect(sut).toBeInstanceOf(MilitaryInputDTOSanitizer);
      expect(sut.sanitize).toBeDefined();
    });
  });

  describe("sanitize", () => {
    it("should sanitize all fields in military input data", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "123e4567-e89b-12d3-a456-426614174000",
        name: "  João da Silva  ",
        rg: 12345678,
      };

      const sanitizedId = "sanitized-id";
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        militaryRankId: sanitizedId,
        name: "João da Silva",
        rg: 12345678,
      });
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(
        inputData.militaryRankId,
      );
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should sanitize name by trimming whitespace", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "   Maria Santos   ",
        rg: 98765432,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("Maria Santos");
    });

    it("should sanitize name by replacing multiple spaces with single space", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Carlos    Alberto    Lima",
        rg: 11111111,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("Carlos Alberto Lima");
    });

    it("should sanitize name by removing dangerous characters", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Ana'Maria\"Silva;DROP TABLE users--",
        rg: 22222222,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("AnaMariaSilvaDROP TABLE users");
    });

    it("should sanitize name by removing SQL injection patterns", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Pedro/*comment*/Silva--injection",
        rg: 33333333,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("PedrocommentSilvainjection");
    });

    it("should sanitize name by removing backslashes", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Luis\\Silva\\Santos",
        rg: 44444444,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("LuisSilvaSantos");
    });

    it("should handle empty name", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "",
        rg: 55555555,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe("");
    });

    it("should handle null name", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: null as any,
        rg: 66666666,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe(null);
    });

    it("should handle undefined name", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: undefined as any,
        rg: 77777777,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe(undefined);
    });

    it("should handle non-string name", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: 12345 as any,
        rg: 88888888,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.name).toBe(12345);
    });

    it("should sanitize RG when it's a string number", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Roberto Silva",
        rg: "123456789" as any,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(123456789);
      expect(typeof result.rg).toBe("number");
    });

    it("should sanitize RG when it's a string decimal", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Fernanda Costa",
        rg: "987654321.0" as any,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(987654321);
    });

    it("should keep RG as number when already a number", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Patricia Oliveira",
        rg: 456789123,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(456789123);
      expect(typeof result.rg).toBe("number");
    });

    it("should handle RG as zero", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Zero Test",
        rg: 0,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(0);
    });

    it("should handle negative RG", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Negative Test",
        rg: -123456,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(-123456);
    });

    it("should sanitize militaryRankId using id sanitizer", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: " dirty-id-with-spaces ",
        name: "Test User",
        rg: 12345678,
      };

      const cleanId = "clean-id";
      mockIdSanitizer.sanitize.mockReturnValue(cleanId);

      const result = sut.sanitize(inputData);

      expect(result.militaryRankId).toBe(cleanId);
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(
        " dirty-id-with-spaces ",
      );
    });

    it("should handle complex sanitization scenario", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "  123e4567-e89b-12d3-a456-426614174000  ",
        name: '  José\'Maria  "Silva";  DROP--/*comment*/  ',
        rg: "987654321.5" as any,
      };

      const sanitizedId = "clean-uuid";
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        militaryRankId: sanitizedId,
        name: "JoséMaria Silva DROPcomment",
        rg: 987654321.5,
      });
    });

    it("should preserve object structure", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "id-123",
        name: "Test Name",
        rg: 11111111,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id-123");

      const result = sut.sanitize(inputData);

      expect(result).toHaveProperty("militaryRankId");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("rg");
      expect(Object.keys(result)).toHaveLength(3);
    });

    it("should handle NaN RG from parseFloat", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Invalid RG Test",
        rg: "not-a-number" as any,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBeNaN();
    });

    it("should handle float RG correctly", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "valid-id",
        name: "Float Test",
        rg: 123.45,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.rg).toBe(123.45);
    });

    it("should call id sanitizer exactly once per sanitization", () => {
      const inputData: MilitaryInputDTO = {
        militaryRankId: "test-id",
        name: "Test User",
        rg: 12345678,
      };

      mockIdSanitizer.sanitize.mockReturnValue("clean-id");

      sut.sanitize(inputData);
      sut.sanitize(inputData);
      sut.sanitize(inputData);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(3);
    });

    it("should not modify original input data", () => {
      const originalData: MilitaryInputDTO = {
        militaryRankId: "original-id",
        name: "  Original  Name  ",
        rg: 12345678,
      };

      const inputData = { ...originalData };
      mockIdSanitizer.sanitize.mockReturnValue("clean-id");

      sut.sanitize(inputData);

      expect(originalData.name).toBe("  Original  Name  ");
      expect(originalData.militaryRankId).toBe("original-id");
      expect(originalData.rg).toBe(12345678);
    });
  });
});
