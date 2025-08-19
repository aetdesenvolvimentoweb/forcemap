import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";

interface SutTypes {
  sut: MilitaryRankInputDTOSanitizer;
}

const makeSut = (): SutTypes => {
  const sut = new MilitaryRankInputDTOSanitizer();

  return {
    sut,
  };
};

describe("MilitaryRankInputDTOSanitizer", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("abbreviation sanitization", () => {
    it("should trim and convert abbreviation to uppercase", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "  cel  ", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("CEL");
    });

    it("should normalize multiple spaces to single space", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "1º   TEN", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1º TEN");
    });

    it("should remove dangerous characters while preserving valid ones", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "1º'TEN;--", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1ºTEN");
    });

    it("should limit abbreviation to 10 characters", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "VERY_LONG_ABBREVIATION", order: 1 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("VERYLONGAB");
      expect(result.abbreviation.length).toBe(10);
    });

    it("should preserve invalid input for validator to handle", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: null, order: 1 } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe(null);
    });
  });

  describe("order sanitization", () => {
    it("should convert string number to integer", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: "5" } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe(5);
      expect(typeof result.order).toBe("number");
    });

    it("should remove decimal places", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: 5.7 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe(5);
    });

    it("should convert negative numbers to positive", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: -3 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe(3);
    });

    it("should preserve non-numeric string when parseFloat returns NaN", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: "abc" } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe("abc");
    });

    it("should preserve invalid input for validator to handle", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "CEL", order: "xyz123" } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.order).toBe("xyz123");
    });

    it("should preserve null and undefined", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDtoNull = { abbreviation: "CEL", order: null } as unknown as {
        abbreviation: string;
        order: number;
      };
      const inputDtoUndefined = {
        abbreviation: "CEL",
        order: undefined,
      } as unknown as {
        abbreviation: string;
        order: number;
      };

      // ACT
      const resultNull = sut.sanitize(inputDtoNull);
      const resultUndefined = sut.sanitize(inputDtoUndefined);

      // ASSERT
      expect(resultNull.order).toBe(null);
      expect(resultUndefined.order).toBe(undefined);
    });
  });

  describe("complete sanitization", () => {
    it("should sanitize both abbreviation and order", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = { abbreviation: "  1º ten  ", order: 5.8 };

      // ACT
      const result = sut.sanitize(inputDto);

      // ASSERT
      expect(result.abbreviation).toBe("1º TEN");
      expect(result.order).toBe(5);
    });
  });
});
